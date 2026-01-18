"use client"

import React from "react"
import { LPElement } from "./types"
import * as Icons from "lucide-react"
import { cn } from "@/lib/utils"
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Github, Mail, Globe } from "lucide-react"
import { EmbeddedForm } from "./embedded-form"

// Helper function to get visibility classes based on device settings
function getVisibilityClasses(element: LPElement): string {
    const visibility = element.properties?.visibility || { desktop: true, mobile: true }

    const classes: string[] = []

    // Both hidden
    if (!visibility.desktop && !visibility.mobile) {
        classes.push('hidden')
    }
    // Desktop hidden, mobile visible
    else if (!visibility.desktop && visibility.mobile) {
        classes.push('md:hidden')
    }
    // Desktop visible, mobile hidden
    else if (visibility.desktop && !visibility.mobile) {
        classes.push('hidden md:block')
    }
    // Both visible = no classes needed

    return classes.join(' ')
}

interface LPRendererProps {
    elements: LPElement[]
    className?: string
}

const GOOGLE_FONTS = [
    "Inter",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Oswald",
    "Raleway",
    "Merriweather",
    "Playfair Display",
    "Nunito"
]

// Helper to get social icon component
const getSocialIcon = (platform: string) => {
    switch (platform) {
        case 'facebook': return Facebook
        case 'instagram': return Instagram
        case 'linkedin': return Linkedin
        case 'twitter': return Twitter
        case 'youtube': return Youtube
        case 'github': return Github
        case 'mail': return Mail
        default: return Globe
    }
}

function RenderElement({ element }: { element: LPElement }) {
    // Clone styles to avoid mutating original object and filter out dashed borders
    let baseStyle = { ...(element.styles || {}) } as React.CSSProperties

    // Merge desktop responsive styles into baseStyle (these are the defaults for larger screens)
    if (element.responsiveStyles?.desktop) {
        baseStyle = {
            ...baseStyle,
            ...element.responsiveStyles.desktop
        }
    }

    if (baseStyle.border?.toString().includes('dashed')) {
        delete baseStyle.border
    }
    if (baseStyle.borderStyle?.toString().includes('dashed')) {
        delete baseStyle.borderStyle
        delete baseStyle.borderWidth
        delete baseStyle.borderColor
    }

    const uniqueClass = `lp-el-${element.id}`

    // Generate CSS for responsive styles
    const generateResponsiveCSS = () => {
        if (!element.responsiveStyles) return null

        const cssRules: string[] = []

        // Mobile styles (max-width: 640px)
        if (element.responsiveStyles.mobile) {
            const mobileStyles = Object.entries(element.responsiveStyles.mobile)
                .map(([key, value]) => {
                    // Filter dashed borders from responsive styles too
                    if (key === 'border' && String(value).includes('dashed')) return ''
                    if (key === 'borderStyle' && String(value).includes('dashed')) return ''
                    // Notes: If borderStyle is filtered, we might leave width/color, but standard CSS ignores them if style is none/default, 
                    // or we should filter them too if we could check sibling props easily here. 
                    // For now, filtering the main culprits is likely enough.

                    // Convert camelCase to kebab-case
                    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
                    // Add !important to override inline styles
                    return `${cssKey}: ${value} !important;`
                })
                .filter(Boolean) // Remove empty rules
                .join(' ')

            if (mobileStyles) {
                cssRules.push(`@media (max-width: 640px) { .${uniqueClass} { ${mobileStyles} } }`)
            }
        }

        // Tablet styles (max-width: 1024px, min-width: 641px)
        if (element.responsiveStyles.tablet) {
            const tabletStyles = Object.entries(element.responsiveStyles.tablet)
                .map(([key, value]) => {
                    if (key === 'border' && String(value).includes('dashed')) return ''
                    if (key === 'borderStyle' && String(value).includes('dashed')) return ''

                    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
                    // Add !important to override inline styles
                    return `${cssKey}: ${value} !important;`
                })
                .filter(Boolean) // Remove empty rules
                .join(' ')

            if (tabletStyles) {
                cssRules.push(`@media (min-width: 641px) and (max-width: 1024px) { .${uniqueClass} { ${tabletStyles} } }`)
            }
        }

        // Desktop styles (min-width: 1025px) - only if desktop styles differ from base
        // Desktop styles are already in baseStyle, but we add a media query for explicit override
        if (element.responsiveStyles.desktop) {
            const desktopStyles = Object.entries(element.responsiveStyles.desktop)
                .map(([key, value]) => {
                    if (key === 'border' && String(value).includes('dashed')) return ''
                    if (key === 'borderStyle' && String(value).includes('dashed')) return ''

                    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
                    return `${cssKey}: ${value} !important;`
                })
                .filter(Boolean)
                .join(' ')

            if (desktopStyles) {
                cssRules.push(`@media (min-width: 1025px) { .${uniqueClass} { ${desktopStyles} } }`)
            }
        }

        if (cssRules.length === 0) return null

        const finalCSS = cssRules.join('\n')

        console.log('🎨 LPRenderer generating responsive CSS:', {
            elementId: element.id.slice(0, 8),
            elementType: element.type,
            hasResponsiveStyles: !!element.responsiveStyles,
            mobileStyles: element.responsiveStyles?.mobile,
            tabletStyles: element.responsiveStyles?.tablet,
            desktopStyles: element.responsiveStyles?.desktop,
            cssRules,
            finalCSS
        })

        return (
            <style dangerouslySetInnerHTML={{ __html: finalCSS }} />
        )
    }

    // Render children recursively
    const renderChildren = () => {
        if (!element.children || element.children.length === 0) return null
        return element.children.map(child => (
            <RenderElement key={child.id} element={child} />
        ))
    }

    // Render based on type
    switch (element.type) {
        case 'section':
            return (
                <>
                    {generateResponsiveCSS()}
                    <section
                        id={element.properties?.anchorId || undefined}
                        className={`w-full min-h-[100px] p-4 ${uniqueClass} ${getVisibilityClasses(element)}`}
                        style={baseStyle}
                    >
                        {renderChildren()}
                    </section>
                </>
            )

        case 'container': {
            // Check if custom width or padding is set (ignore 'auto' and empty values)
            const widthValue = element.styles?.width || element.responsiveStyles?.desktop?.width ||
                element.responsiveStyles?.tablet?.width || element.responsiveStyles?.mobile?.width
            const paddingValue = element.styles?.padding || element.responsiveStyles?.desktop?.padding ||
                element.responsiveStyles?.tablet?.padding || element.responsiveStyles?.mobile?.padding

            const hasCustomWidth = widthValue && widthValue !== 'auto' && widthValue.trim() !== ''
            const hasCustomPadding = paddingValue && paddingValue !== 'auto' && paddingValue.trim() !== ''

            // Apply defaults only if not customized
            const containerClasses = cn(
                'mx-auto min-h-[50px]',
                !hasCustomWidth && 'w-full max-w-7xl',
                !hasCustomPadding && 'p-2',
                uniqueClass
            )

            return (
                <>
                    {generateResponsiveCSS()}
                    <div
                        id={element.properties?.anchorId || undefined}
                        className={cn(containerClasses, getVisibilityClasses(element))}
                        style={baseStyle}
                    >
                        {renderChildren()}
                    </div>
                </>
            )
        }

        case '2-col':
            return (
                <>
                    {generateResponsiveCSS()}
                    <div
                        className={cn(`flex flex-col md:flex-row gap-4 w-full ${uniqueClass}`, getVisibilityClasses(element))}
                        style={baseStyle}
                    >
                        {renderChildren()}
                    </div>
                </>
            )

        case '3-col':
            return (
                <>
                    {generateResponsiveCSS()}
                    <div
                        className={cn(`grid grid-cols-1 md:grid-cols-3 gap-4 w-full ${uniqueClass}`, getVisibilityClasses(element))}
                        style={baseStyle}
                    >
                        {renderChildren()}
                    </div>
                </>
            )

        case 'column':
            return (
                <>
                    {generateResponsiveCSS()}
                    <div
                        className={cn(`flex-1 min-h-[20px] ${uniqueClass}`, getVisibilityClasses(element))}
                        style={baseStyle}
                    >
                        {renderChildren()}
                    </div>
                </>
            )

        case 'heading': {
            const Tag = (element.properties?.tag || 'h2') as any
            return (
                <>
                    {generateResponsiveCSS()}
                    <Tag
                        className={cn(uniqueClass, getVisibilityClasses(element))}
                        style={baseStyle}
                    >
                        {element.content}
                    </Tag>
                </>
            )
        }

        case 'text': {
            const Tag = (element.properties?.tag || 'p') as any
            return (
                <>
                    {generateResponsiveCSS()}
                    <Tag
                        className={cn(uniqueClass, getVisibilityClasses(element))}
                        style={baseStyle}
                    >
                        {element.content}
                    </Tag>
                </>
            )
        }

        case 'button': {
            const hoverStyles = element.properties?.hoverStyles || {}
            const openInNewTab = element.properties?.openInNewTab !== false // Default true

            // Generate hover CSS
            const hoverCss = Object.keys(hoverStyles).length > 0 ? `
                .${uniqueClass}:hover {
                    ${Object.entries(hoverStyles).map(([key, value]) => {
                const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
                return `${cssKey}: ${value} !important;`
            }).join(' ')}
                }
            ` : ''

            return (
                <>
                    {generateResponsiveCSS()}
                    {hoverCss && <style dangerouslySetInnerHTML={{ __html: hoverCss }} />}
                    <a
                        href={element.url || '#'}
                        target={openInNewTab ? '_blank' : '_self'}
                        rel={openInNewTab ? 'noopener noreferrer' : undefined}
                        className={cn(`inline-block px-4 py-2 rounded transition-colors ${uniqueClass}`, getVisibilityClasses(element))}
                        style={baseStyle}
                    >
                        {element.content}
                    </a>
                </>
            )
        }

        case 'icon': {
            const iconName = element.properties?.iconName || 'Star'
            const IconComponent = Icons[iconName as keyof typeof Icons] as any

            if (!IconComponent) return null

            return (
                <>
                    {generateResponsiveCSS()}
                    <div
                        className={cn(`inline-flex items-center justify-center ${uniqueClass}`, getVisibilityClasses(element))}
                        style={baseStyle}
                    >
                        <IconComponent style={{ width: '1em', height: '1em' }} />
                    </div>
                </>
            )
        }

        case 'image':
            return (
                <>
                    {generateResponsiveCSS()}
                    <img
                        src={element.url}
                        alt={element.properties?.alt || "Image"}
                        className={cn(`max-w-full h-auto ${uniqueClass}`, getVisibilityClasses(element))}
                        style={baseStyle}
                    />
                </>
            )

        case 'video':
            if (element.url) {
                // Extract YouTube video ID
                const videoId = element.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?\&]v=)|youtu\.be\/)([^"\&?\/\s]{11})/)?.[1]

                if (videoId) {
                    return (
                        <>
                            {generateResponsiveCSS()}
                            <div className={`relative w-full ${uniqueClass}`} style={{ paddingBottom: '56.25%', ...baseStyle }}>
                                <iframe
                                    className="absolute top-0 left-0 w-full h-full"
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    title="YouTube video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </>
                    )
                }
            }
            return (
                <div className="p-4 border-2 border-dashed border-slate-300 rounded text-center text-slate-400">
                    Vídeo não configurado
                </div>
            )

        case 'social':
            const properties = element.properties || {}
            const items = properties.items || [
                { platform: 'facebook', url: '#' }
            ]
            const layout = properties.layout || 'horizontal'
            const gap = properties.gap !== undefined ? properties.gap : 16
            const iconSize = properties.iconSize || 24
            const borderRadius = properties.borderRadius || 4
            const iconColor = properties.iconColor || "#ffffff"
            const backgroundColor = properties.backgroundColor || "#000000"

            return (
                <>
                    {generateResponsiveCSS()}
                    <div
                        className={`flex ${uniqueClass}`}
                        style={{
                            ...baseStyle,
                            flexDirection: layout === 'horizontal' ? 'row' : 'column',
                            gap: `${gap}px`,
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '10px'
                        }}
                    >
                        {items.map((item: any, idx: number) => {
                            const PlatformIcon = getSocialIcon(item.platform)
                            return (
                                <a
                                    key={idx}
                                    href={item.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center transition-opacity hover:opacity-80"
                                    style={{
                                        width: `${iconSize + 16}px`,
                                        height: `${iconSize + 16}px`,
                                        borderRadius: `${borderRadius}px`,
                                        backgroundColor: backgroundColor,
                                        color: iconColor,
                                        fontSize: `${iconSize}px`
                                    }}
                                >
                                    {PlatformIcon ? <PlatformIcon size={iconSize} /> : null}
                                </a>
                            )
                        })}
                    </div>
                </>
            )

        case 'custom-html':
            return (
                <>
                    {generateResponsiveCSS()}
                    <div
                        className={uniqueClass}
                        style={baseStyle}
                        dangerouslySetInnerHTML={{ __html: element.content || '' }}
                    />
                </>
            )

        case 'form':
            return (
                <>
                    {generateResponsiveCSS()}
                    <div
                        className={cn(`min-h-[100px] ${uniqueClass}`, getVisibilityClasses(element))}
                        style={baseStyle}
                    >
                        {element.properties?.formId ? (
                            <EmbeddedForm formId={element.properties.formId} />
                        ) : (
                            <div className="p-4 border border-dashed rounded bg-slate-50 text-center text-muted-foreground">
                                Formulário não configurado
                            </div>
                        )}
                    </div>
                </>
            )

        case 'rich-text':
            return (
                <>
                    {generateResponsiveCSS()}
                    <div
                        className={cn(`prose prose-sm sm:prose-base max-w-none [&_*]:font-[inherit] ${uniqueClass}`, getVisibilityClasses(element))}
                        style={baseStyle}
                        dangerouslySetInnerHTML={{ __html: element.content || '' }}
                    />
                </>
            )

        case 'spacer':
            return (
                <>
                    {generateResponsiveCSS()}
                    <div
                        className={cn(uniqueClass, getVisibilityClasses(element))}
                        style={{
                            width: '100%',
                            height: baseStyle.height || '50px',
                            backgroundColor: baseStyle.backgroundColor || 'transparent',
                            ...baseStyle
                        }}
                    />
                </>
            )

        default:
            return null
    }
}

export function LPRenderer({ elements, className }: LPRendererProps) {
    // Load Google Fonts
    React.useEffect(() => {
        const linkId = 'lp-renderer-fonts-loader'
        if (!document.getElementById(linkId)) {
            const link = document.createElement('link')
            link.id = linkId
            link.href = `https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS.join('&family=').replace(/\s/g, '+')}:ital,wght@0,300;0,400;0,700;1,400&display=swap`
            link.rel = 'stylesheet'
            document.head.appendChild(link)
        }
    }, [])

    return (
        <div className={cn("w-full", className)}>
            {elements.map(element => (
                <RenderElement key={element.id} element={element} />
            ))}
        </div>
    )
}
