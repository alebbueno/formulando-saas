"use client"

import React from "react"
import { LPElement } from "./types"
import { cn } from "@/lib/utils"
import { useLPBuilder } from "./context/lp-builder-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDroppable } from "@dnd-kit/core"
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Github, Globe, Mail, ChevronUp, ChevronDown, Copy, Trash2, GripVertical } from "lucide-react"
import * as Icons from "lucide-react"
import { EmbeddedForm } from "./embedded-form"
import { RichTextEditor } from "./rich-text-editor"

// Element Toolbar Component
const ElementToolbar = ({ element }: { element: LPElement }) => {
    const { removeElement, moveElementDirection, duplicateElement, setSelectedElement } = useLPBuilder()

    return (
        <div
            className="absolute -top-10 right-0 h-9 bg-white border shadow-md rounded-md flex items-center gap-0.5 px-1 z-50 animate-in fade-in zoom-in-95 duration-100"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center px-1 text-[10px] font-mono text-muted-foreground border-r mr-1 select-none">
                {element.type}
            </div>

            {moveElementDirection && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => moveElementDirection(element.id, 'up')}
                        title="Mover para cima"
                    >
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => moveElementDirection(element.id, 'down')}
                        title="Mover para baixo"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                </>
            )}

            {duplicateElement && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => duplicateElement(element.id)}
                    title="Clonar elemento"
                >
                    <Copy className="h-3.5 w-3.5" />
                </Button>
            )}

            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => {
                    removeElement(element.id)
                    setSelectedElement(null)
                }}
                title="Deletar elemento"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </Button>
        </div>
    )
}

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

// Helper to merge refs
function useMergeRefs<T = any>(...refs: (React.MutableRefObject<T> | React.LegacyRef<T>)[]) {
    return React.useCallback(
        (current: T | null) => {
            refs.forEach((ref) => {
                if (typeof ref === 'function') {
                    ref(current)
                } else if (ref != null) {
                    (ref as React.MutableRefObject<T | null>).current = current
                }
            })
        },
        [refs]
    )
}

export function CanvasElement({ element }: { element: LPElement }) {
    const { addElement, selectedElement, setSelectedElement, previewDevice, mode, updateElement } = useLPBuilder()

    // 1. Sortable Logic (Being dragged / Layout position)
    const {
        attributes,
        listeners,
        setNodeRef: setSortableRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: element.id,
        data: {
            type: element.type,
            elementId: element.id,
            isContainer: element.type === 'container' || element.type === 'section' || element.type === 'column',
            elementId: element.id,
            sortable: true,
        }
    })

    // 2. Droppable Logic (Receiving drops - Nesting)
    // Only for containers
    const { isOver, setNodeRef: setDroppableRef } = useDroppable({
        id: element.id + "-drop-zone",
        data: {
            isContainer: element.type === 'container' || element.type === 'section' || element.type === 'column',
            elementId: element.id
        },
        disabled: element.type !== 'container' && element.type !== 'section' && element.type !== 'column'
    })

    // Merge refs if it's a container (needs both). If not, just sortable.
    const setRefs = useMergeRefs(setSortableRef, setDroppableRef)

    const isSelected = selectedElement?.id === element.id

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedElement(element)
    }

    // Merge base styles with responsive styles based on current device
    // Using useMemo to ensure recalculation when previewDevice changes
    const responsiveStyles = React.useMemo(() => {
        const baseStyles = element.styles || {}
        const deviceStyles = element.responsiveStyles?.[previewDevice] || {}

        const merged = {
            ...baseStyles,
            ...deviceStyles
        }

        // Debug: Log when responsive styles are applied
        if (element.responsiveStyles && Object.keys(element.responsiveStyles).length > 0) {
            console.log('📱 Canvas Element Responsive Styles:', {
                elementType: element.type,
                elementId: element.id.slice(0, 8),
                currentDevice: previewDevice,
                hasResponsiveStyles: !!element.responsiveStyles,
                availableDevices: Object.keys(element.responsiveStyles),
                baseStyles,
                deviceStyles,
                merged
            })
        }

        // Remove default dashed border if not in builder mode
        if (mode !== 'builder') {
            const newStyles = { ...merged }

            // Check shorthand border
            if (newStyles.border?.includes('dashed')) {
                delete newStyles.border
            }

            // Check individual properties
            if (newStyles.borderStyle === 'dashed' || newStyles.borderStyle?.includes('dashed')) {
                delete newStyles.borderStyle
                delete newStyles.borderWidth
                delete newStyles.borderColor
            }

            return newStyles
        }

        return merged
    }, [element.styles, element.responsiveStyles, previewDevice, element.id, element.type, mode])

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        ...responsiveStyles // Apply merged responsive styles
    } as React.CSSProperties

    // Common props
    const commonProps = {
        ref: (element.type === 'container' || element.type === 'section') ? setRefs : setSortableRef,
        ...attributes,
        ...listeners,
        onClick: handleClick,
        className: cn(
            "relative transition-all box-border outline-none group",
            isSelected && "ring-2 ring-primary z-20", // Higher Z for selected
            isOver && "bg-primary/10 ring-2 ring-primary/50",
            !isSelected && !isOver && "hover:ring-1 hover:ring-primary/30",
            isDragging && "opacity-50",
        ),
        style: style
    }

    // Children Rendering
    const childrenRenderer = (
        <React.Fragment>
            {/* Selection Handle */}
            {/* Selection Handle / Toolbar */}
            {isSelected && mode === 'builder' ? (
                <ElementToolbar element={element} />
            ) : (
                <div
                    className={cn(
                        "absolute -top-6 left-0 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-t-md cursor-pointer z-[60]",
                        "opacity-0 group-hover:opacity-100 transition-opacity",
                        mode === 'preview' && "hidden"
                    )}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation()
                        setSelectedElement(element)
                    }}
                >
                    {element.type}
                </div>
            )}

            <SortableContext items={element.children?.map(c => c.id) || []} strategy={verticalListSortingStrategy}>
                {element.children?.map(child => (
                    <CanvasElement key={child.id} element={child} />
                ))}
            </SortableContext>
        </React.Fragment>
    )

    // Render based on type
    if (element.type === 'section') {
        const isEmpty = !element.children || element.children.length === 0
        return (
            <section
                id={element.properties?.anchorId || undefined}
                {...commonProps}
                className={cn(
                    commonProps.className,
                    "min-h-[150px] transition-all",
                    mode === 'builder' && "border-2 border-dashed rounded-md", // Conditional border
                    mode === 'builder' && (isOver ? "border-primary bg-primary/5" : "border-slate-300 bg-white"),
                    isEmpty && mode === 'builder' && "flex items-center justify-center"
                )}
            >
                {isEmpty && !isOver && mode === 'builder' && (
                    <div className="text-slate-400 text-sm pointer-events-none">
                        Arraste componentes aqui
                    </div>
                )}
                {childrenRenderer}
            </section>
        )
    }

    if (element.type === 'container') {
        const isEmpty = !element.children || element.children.length === 0
        return (
            <div
                id={element.properties?.anchorId || undefined}
                {...commonProps}
                className={cn(
                    commonProps.className,
                    "min-h-[100px] transition-all",
                    mode === 'builder' && "border-2 border-dashed rounded",
                    mode === 'builder' && (isOver ? "border-primary bg-primary/10" : "border-slate-300 bg-slate-50"),
                    isEmpty && mode === 'builder' && "flex items-center justify-center"
                )}
            >
                {isEmpty && !isOver && mode === 'builder' && (
                    <div className="text-slate-400 text-sm pointer-events-none">
                        Arraste componentes aqui
                    </div>
                )}
                {childrenRenderer}
            </div>
        )
    }

    if (element.type === '2-col') {
        const isEmpty = !element.children || element.children.length === 0
        return (
            <div
                {...commonProps}
                className={cn(
                    commonProps.className,
                    "min-h-[100px] transition-all flex flex-col md:flex-row gap-4",
                    mode === 'builder' && "border border-dashed border-slate-300 rounded p-2",
                    isEmpty && mode === 'builder' && "items-center justify-center bg-slate-50"
                )}
            >
                {isEmpty && !isOver && mode === 'builder' && (
                    <div className="text-slate-400 text-xs pointer-events-none">
                        2 Colunas
                    </div>
                )}
                {childrenRenderer}
            </div>
        )
    }

    if (element.type === '3-col') {
        const isEmpty = !element.children || element.children.length === 0
        return (
            <div
                {...commonProps}
                className={cn(
                    commonProps.className,
                    "min-h-[100px] transition-all grid grid-cols-1 md:grid-cols-3 gap-4",
                    mode === 'builder' && "border border-dashed border-slate-300 rounded p-2",
                    isEmpty && mode === 'builder' && "items-center justify-center bg-slate-50"
                )}
            >
                {isEmpty && !isOver && mode === 'builder' && (
                    <div className="text-slate-400 text-xs pointer-events-none">
                        3 Colunas
                    </div>
                )}
                {childrenRenderer}
            </div>
        )
    }

    if (element.type === 'column') {
        const isEmpty = !element.children || element.children.length === 0
        return (
            <div
                {...commonProps}
                ref={setRefs} /* Columns are container-like so they need setRefs */
                className={cn(
                    commonProps.className,
                    "min-h-[50px] flex-1 transition-all flex flex-col",
                    mode === 'builder' && "border border-dashed border-slate-200 rounded p-2",
                    isEmpty && mode === 'builder' && "items-center justify-center bg-slate-50"
                )}
            >
                {isEmpty && !isOver && mode === 'builder' && (
                    <div className="text-slate-300 text-[10px] pointer-events-none">
                        Coluna
                    </div>
                )}
                {childrenRenderer}
            </div>
        )
    }

    // For text-based elements, we can keep using commonProps. ref will be setSortableRef (from check above)
    if (element.type === 'heading') {
        const Tag = (element.properties?.tag || 'h2') as any
        const { updateElement } = useLPBuilder()

        return (
            <div
                {...commonProps}
                className={cn(commonProps.className, "relative")}
            >
                <Tag
                    contentEditable={isSelected && mode === 'builder'}
                    suppressContentEditableWarning={true}
                    onBlur={(e: React.FocusEvent<HTMLElement>) => {
                        if (element.content !== e.currentTarget.innerText) {
                            updateElement(element.id, { content: e.currentTarget.innerText })
                        }
                    }}
                    className={cn(
                        "p-2 cursor-text outline-none focus:ring-1 focus:ring-blue-500 rounded transition-colors w-full m-0",
                        !element.content && "min-w-[50px] min-h-[1em] bg-slate-50/50"
                    )}
                    style={{
                        fontWeight: element.styles?.fontWeight || 'bold',
                        fontFamily: element.styles?.fontFamily,
                        color: 'inherit',
                        textAlign: 'inherit',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                    }}
                    data-placeholder="Clique para digitar o título"
                >
                    {element.content}
                </Tag>
                {isSelected && mode === 'builder' && <ElementToolbar element={element} />}
            </div>
        )
    }

    if (element.type === 'text') {
        const Tag = (element.properties?.tag || 'p') as any
        const { updateElement } = useLPBuilder()

        return (
            <div
                {...commonProps}
                className={cn(commonProps.className, "relative")}
            >
                <Tag
                    contentEditable={isSelected && mode === 'builder'}
                    suppressContentEditableWarning={true}
                    onBlur={(e: React.FocusEvent<HTMLElement>) => {
                        if (element.content !== e.currentTarget.innerText) {
                            updateElement(element.id, { content: e.currentTarget.innerText })
                        }
                    }}
                    className={cn(
                        "p-2 cursor-text outline-none focus:ring-1 focus:ring-blue-500 rounded transition-colors w-full m-0",
                        !element.content && "min-w-[50px] min-h-[1em] bg-slate-50/50"
                    )}
                    style={{
                        fontWeight: element.styles?.fontWeight || 'normal',
                        fontFamily: element.styles?.fontFamily,
                        color: 'inherit',
                        textAlign: 'inherit',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                    }}
                    data-placeholder="Clique para digitar o texto"
                >
                    {element.content}
                </Tag>
                {isSelected && mode === 'builder' && <ElementToolbar element={element} />}
            </div>
        )
    }

    if (element.type === 'button') {
        // Hook for hover state
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [isHovered, setIsHovered] = React.useState(false)

        // Merge normal styles with hover styles if hovered
        const finalStyles = {
            ...commonProps.style,
            ...(isHovered ? element.properties?.hoverStyles : {})
        }

        // Font Injection (Simple approach: append link to head if not exists)
        // eslint-disable-next-line react-hooks/rules-of-hooks
        React.useEffect(() => {
            const fontFamily = element.styles?.fontFamily
            if (fontFamily) {
                // Extract font name from string like "'Inter', sans-serif" -> "Inter"
                const match = fontFamily.match(/['"](.*?)['"]/)
                if (match && match[1]) {
                    const fontName = match[1]
                    const linkId = `font-${fontName}`
                    if (!document.getElementById(linkId)) {
                        const link = document.createElement('link')
                        link.id = linkId
                        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@300;400;600;700&display=swap`
                        link.rel = 'stylesheet'
                        document.head.appendChild(link)
                    }
                }
            }
        }, [element.styles?.fontFamily])

        return (
            <a
                {...commonProps}
                href={element.url || "#"}
                onClick={(e) => {
                    e.preventDefault() // Prevent navigation in builder
                    commonProps.onClick(e)
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(commonProps.className, "inline-block text-center px-4 py-2 rounded transition-colors duration-200")}
                style={finalStyles}
            >
                {element.content || "Clique aqui"}
                {isSelected && mode === 'builder' && <ElementToolbar element={element} />}
            </a>
        )
    }

    if (element.type === 'social') {
        const properties = element.properties || {}
        const items = properties.items || [
            { platform: 'instagram', url: '#' },
            { platform: 'facebook', url: '#' }
        ]
        const layout = properties.layout || 'horizontal'
        const gap = properties.gap !== undefined ? properties.gap : 16
        const iconSize = properties.iconSize || 24
        const borderRadius = properties.borderRadius || 4
        const iconColor = properties.iconColor || "#ffffff"
        const backgroundColor = properties.backgroundColor || "#000000"

        // Map platform string to Lucide icon component dynamically?
        // We can import them all and map manually to avoid large bundles issues if needed, or just import commonly used ones at top.
        // For now, I will assume we import necessary ones or use a helper. 
        // Actually, let's map generic icons here.
        // Wait, I need to import them in CanvasElement too.

        return (
            <div
                {...commonProps}
                className={cn(commonProps.className, "flex")}
                style={{
                    ...commonProps.style,
                    flexDirection: layout === 'horizontal' ? 'row' : 'column',
                    gap: `${gap}px`,
                    alignItems: 'center',
                    justifyContent: 'center', // Default center for social icons usually?
                    padding: '10px' // Default padding to be clickable easily
                }}
            >
                {items.map((item: any, idx: number) => {
                    const PlatformIcon = getSocialIcon(item.platform)
                    return (
                        <a
                            key={idx}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                e.preventDefault()
                            }}
                            className="flex items-center justify-center transition-opacity hover:opacity-80"
                            style={{
                                width: `${iconSize + 16}px`, // Padding included in size or extra? User asked for icon size. Background usually is bigger.
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
                {isSelected && mode === 'builder' && <ElementToolbar element={element} />}
            </div>
        )
    }



    if (element.type === 'spacer') {
        const spacerStyle = {
            ...style,
            width: style.width || '100%',
            height: style.height || '50px',
            backgroundColor: style.backgroundColor || 'transparent',
            // Show a visual hint in builder mode if height is 0 or transparent
            ...(mode === 'builder' && (!style.height || style.height === '0px') && {
                minHeight: '20px',
                outline: '1px dashed #ccc',
                opacity: 0.5
            })
        }

        return (
            <div
                ref={setRefs}
                style={spacerStyle}
                {...attributes}
                {...listeners}
                className={cn(
                    "relative group",
                    isSelected && "ring-2 ring-primary ring-offset-2"
                )}
                onClick={handleClick}
            >
                {/* Element Toolbar */}
                {isSelected && mode === 'builder' && <ElementToolbar element={element} />}

                {/* Visual hint for spacer in builder mode */}
                {mode === 'builder' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-muted text-[10px] text-muted-foreground px-1 rounded border">Spacer</div>
                    </div>
                )}
            </div>
        )
    }

    // Icon
    if (element.type === 'icon') {
        const iconName = element.properties?.iconName || 'Star'
        const IconComponent = Icons[iconName as keyof typeof Icons] as any

        if (!IconComponent) return null

        return (
            <div
                {...commonProps}
                className={cn(commonProps.className, "inline-flex items-center justify-center")}
            >
                <IconComponent style={{ width: '1em', height: '1em' }} />
                {isSelected && mode === 'builder' && <ElementToolbar element={element} />}
            </div>
        )
    }

    if (element.type === 'custom-html') {
        return (
            <div
                {...commonProps}
                className={cn(commonProps.className, "p-4 border border-dashed border-yellow-300 bg-yellow-50 rounded min-h-[50px] flex flex-col items-center justify-center text-center")}
                style={commonProps.style} // Should use commonProps.style if finalStyles not defined, but here we don't have hover logic so commonProps.style is fine
            >
                <div className="flex items-center gap-2 text-yellow-700 font-semibold text-sm mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                    HTML Personalizado
                </div>
                <div className="text-xs text-muted-foreground w-full bg-white p-2 rounded border overflow-hidden max-h-[60px] text-left font-mono">
                    {element.content ? (
                        element.content.slice(0, 100) + (element.content.length > 100 ? "..." : "")
                    ) : (
                        <span className="italic text-slate-400">Clique para adicionar código...</span>
                    )}
                </div>
                {/* Overlay to ensure draggable/selectable even if huge content */}
                <div className="absolute inset-0 z-10" />
                {isSelected && mode === 'builder' && <ElementToolbar element={element} />}
            </div>
        )
    }

    if (element.type === 'video') {
        const getYoutubeId = (url: string) => {
            if (!url) return null
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
            const match = url.match(regExp)
            return (match && match[2].length === 11) ? match[2] : null
        }

        const videoId = getYoutubeId(element.url || "")

        return (
            <div
                {...commonProps}
                className={cn(commonProps.className, "relative w-full aspect-video bg-slate-100 flex items-center justify-center overflow-hidden rounded-md border border-slate-200")}
                style={commonProps.style}
            >
                {videoId ? (
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full pointer-events-none" // Disable interaction in builder
                    />
                ) : (
                    <div className="flex flex-col items-center text-muted-foreground p-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="opacity-50"
                        >
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                            <polyline points="11 3 11 11 14 8 17 11 17 3" />
                            <circle cx="12" cy="15" r="1" />
                        </svg>
                        <span className="text-xs mt-2 font-medium">Adicione um link do YouTube</span>
                    </div>
                )}
                {/* Overlay to capture selection clicks */}
                <div className="absolute inset-0 z-10" />
                {isSelected && mode === 'builder' && <ElementToolbar element={element} />}
            </div>
        )
    }

    if (element.type === 'image') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [isResizing, setIsResizing] = React.useState(false)
        const { updateElement } = useLPBuilder()

        const handleResizeStart = (e: React.MouseEvent, direction: 'width' | 'height' | 'both') => {
            e.preventDefault()
            e.stopPropagation()
            setIsResizing(true)

            const startX = e.clientX
            const startY = e.clientY
            const startWidth = (e.target as HTMLElement).closest('.group')?.getBoundingClientRect().width || 0
            const startHeight = (e.target as HTMLElement).closest('.group')?.getBoundingClientRect().height || 0

            const handleMouseMove = (moveEvent: MouseEvent) => {
                const deltaX = moveEvent.clientX - startX
                const deltaY = moveEvent.clientY - startY

                const newStyles: any = {}

                if (direction === 'width' || direction === 'both') {
                    newStyles.width = `${Math.max(50, startWidth + deltaX)}px`
                }
                if (direction === 'height' || direction === 'both') {
                    newStyles.height = `${Math.max(50, startHeight + deltaY)}px`
                }

                if (Object.keys(newStyles).length > 0) {
                    updateElement(element.id, {
                        styles: {
                            ...element.styles,
                            ...newStyles
                        }
                    })
                }
            }

            const handleMouseUp = () => {
                setIsResizing(false)
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        return (
            <div
                {...commonProps}
                className={cn(commonProps.className, isResizing && "ring-2 ring-blue-500 z-50 pointer-events-none-children")}
            >
                <div className="w-full h-full overflow-hidden" style={{ borderRadius: 'inherit' }}>
                    <img
                        src={element.url || "https://placehold.co/600x400?text=Imagem"}
                        alt="LP Image"
                        className="w-full h-full object-cover pointer-events-none"
                    />
                </div>
                {isSelected && mode === 'builder' && (
                    <>
                        <ElementToolbar element={element} />

                        {/* Resize Handles */}
                        {/* Right - Width */}
                        <div
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-white border border-slate-300 rounded cursor-ew-resize flex items-center justify-center z-50 hover:bg-slate-50 transition-colors shadow-sm"
                            style={{ right: '-8px' }}
                            onMouseDown={(e) => handleResizeStart(e, 'width')}
                        >
                            <div className="w-0.5 h-4 bg-slate-300" />
                        </div>

                        {/* Bottom - Height */}
                        <div
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-4 bg-white border border-slate-300 rounded cursor-ns-resize flex items-center justify-center z-50 hover:bg-slate-50 transition-colors shadow-sm"
                            style={{ bottom: '-8px' }}
                            onMouseDown={(e) => handleResizeStart(e, 'height')}
                        >
                            <div className="w-4 h-0.5 bg-slate-300" />
                        </div>

                        {/* Bottom Right - Both */}
                        <div
                            className="absolute bottom-0 right-0 w-4 h-4 bg-white border border-primary rounded-full cursor-nwse-resize z-50 hover:scale-110 transition-transform shadow-md"
                            style={{ bottom: '-6px', right: '-6px' }}
                            onMouseDown={(e) => handleResizeStart(e, 'both')}
                        />
                    </>
                )}
            </div>
        )
    }

    if (element.type === 'form') {
        return (
            <div {...commonProps} className={cn(commonProps.className, "min-h-[100px] bg-white")}>
                {element.properties?.formId ? (
                    <div className={cn("w-full", mode === 'builder' && "pointer-events-none")}>
                        <EmbeddedForm formId={element.properties.formId} />
                    </div>
                ) : (
                    <div className="p-4 border border-dashed rounded bg-slate-50 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[100px]">
                        <p className="font-medium">Formulário</p>
                        <p className="text-xs text-slate-500 mt-1">Selecione um formulário nas propriedades</p>
                    </div>
                )}
                {isSelected && mode === 'builder' && <ElementToolbar element={element} />}
            </div>
        )
    }

    if (element.type === 'rich-text') {
        const { updateElement } = useLPBuilder()
        return (
            <div {...commonProps} className={cn(commonProps.className, "min-h-[100px] p-2 cursor-text")}>
                <div onPointerDown={(e) => e.stopPropagation()} className="cursor-text w-full">
                    <RichTextEditor
                        content={element.content || '<p>Comece a escrever...</p>'}
                        onChange={(content) => {
                            updateElement(element.id, { ...element, content })
                        }}
                        editable={mode === 'builder'}
                    />
                </div>
                {/* Overlay for dragging if not editing? 
                    Actually, we want to be able to click into it to edit. 
                    If we have a drag handle or selection, that might interfere. 
                    Usually, in builder mode, we might want to click to select, then double click to edit, 
                    or just click to edit if selected.
                    For now, passing editable={true} allows immediate editing.
                    Existing elements use `commonProps` which includes listeners for DnD.
                    If we put listeners on the wrapping div, it might capture events.
                    Let's see how it behaves. The DnD kit useSortable might require a handle or specific activation constraints for text inputs.
                 */}
                {isSelected && mode === 'builder' && <ElementToolbar element={element} />}
            </div>
        )
    }

    return <div {...commonProps}>Unknown Type: {element.type}</div>
}
