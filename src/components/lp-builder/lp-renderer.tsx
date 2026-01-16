"use client"

import React from "react"
import { LPElement } from "./types"
import { cn } from "@/lib/utils"
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Github, Mail, Globe } from "lucide-react"
import { EmbeddedForm } from "./embedded-form"

interface LPRendererProps {
    elements: LPElement[]
    className?: string
}

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

        if (cssRules.length === 0) return null

        const finalCSS = cssRules.join('\n')

        console.log('🎨 LPRenderer generating responsive CSS:', {
            elementId: element.id.slice(0, 8),
            elementType: element.type,
            hasResponsiveStyles: !!element.responsiveStyles,
            mobileStyles: element.responsiveStyles?.mobile,
            tabletStyles: element.responsiveStyles?.tablet,
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
                        className={`w-full min-h-[100px] p-4 ${uniqueClass}`}
                        style={baseStyle}
                    >
                        {renderChildren()}
                    </section>
                </>
            )

        case 'container':
            return (
                <>
                    {generateResponsiveCSS()}
                    <div
                        className={`mx-auto w-full max-w-7xl min-h-[50px] p-2 ${uniqueClass}`}
                        style={baseStyle}
                    >
                        {renderChildren()}
                    </div>
                </>
            )

        case 'heading':
            return (
                <>
                    {generateResponsiveCSS()}
                    <h1
                        className={`text-4xl font-bold ${uniqueClass}`}
                        style={baseStyle}
                    >
                        {element.content}
                    </h1>
                </>
            )

        case 'text':
            return (
                <>
                    {generateResponsiveCSS()}
                    <p
                        className={`text-base ${uniqueClass}`}
                        style={baseStyle}
                    >
                        {element.content}
                    </p>
                </>
            )

        case 'button':
            return (
                <>
                    {generateResponsiveCSS()}
                    <button
                        className={`px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 ${uniqueClass}`}
                        style={baseStyle}
                        onClick={() => {
                            if (element.url) {
                                window.open(element.url, '_blank')
                            }
                        }}
                    >
                        {element.content}
                    </button>
                </>
            )

        case 'image':
            return (
                <>
                    {generateResponsiveCSS()}
                    <img
                        src={element.url}
                        alt={element.properties?.alt || "Image"}
                        className={`max-w-full h-auto ${uniqueClass}`}
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
                        className={`min-h-[100px] ${uniqueClass}`}
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
                        className={`prose prose-sm sm:prose-base max-w-none ${uniqueClass}`}
                        style={baseStyle}
                        dangerouslySetInnerHTML={{ __html: element.content || '' }}
                    />
                </>
            )

        default:
            return null
    }
}

export function LPRenderer({ elements, className }: LPRendererProps) {
    return (
        <div className={cn("w-full", className)}>
            {elements.map(element => (
                <RenderElement key={element.id} element={element} />
            ))}
        </div>
    )
}
