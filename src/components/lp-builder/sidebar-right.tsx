"use client"

import React, { useState } from "react"
import { useLPBuilder } from "./context/lp-builder-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { SidebarFormProperties } from "./properties/form-properties"
import { ImageUploadProperty } from "./properties/image-upload"
import { SpacingControl, BorderRadiusControl } from "./properties/spacing-control"
import { BackgroundControl } from "./properties/background-control"
import { FlexControl } from "./properties/flex-control"
import { SizeControl } from "./properties/size-control"
import { ColumnsControl } from "./properties/columns-control"
import { ButtonControl } from "./properties/button-control"
import { SocialControl } from "./properties/social-control"
import { VideoControl } from "./properties/video-control"
import { CustomHtmlControl } from "./properties/custom-html-control"
import { IconControl } from "./properties/icon-control"
import { VisibilityControl } from "./properties/visibility-control"
import { Monitor, Tablet, Smartphone, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { ResponsiveStyleProvider } from "./context/responsive-style-context"

type EditingDevice = 'desktop' | 'tablet' | 'mobile'

export function SidebarRight() {
    const { selectedElement, updateElement, removeElement, moveElementDirection } = useLPBuilder()
    const [editingDevice, setEditingDevice] = useState<EditingDevice>('desktop')

    if (!selectedElement) {
        return (
            <div className="w-80 border-l bg-white p-4 h-full overflow-y-auto">
                <div className="text-xs font-semibold uppercase text-muted-foreground mb-4">Propriedades</div>
                <div className="text-sm text-muted-foreground text-center mt-10">
                    Selecione um elemento para editar
                </div>
            </div>
        )
    }

    const handleChange = (key: string, value: any) => {
        updateElement(selectedElement.id, { [key]: value })
    }

    const handleStyleChange = (styleKey: string, value: any) => {
        if (editingDevice === 'desktop') {
            // Desktop styles go to base styles
            updateElement(selectedElement.id, {
                styles: {
                    ...selectedElement.styles,
                    [styleKey]: value
                }
            })
        } else {
            // Mobile/Tablet styles go to responsiveStyles
            const newResponsiveStyles = {
                ...selectedElement.responsiveStyles,
                [editingDevice]: {
                    ...selectedElement.responsiveStyles?.[editingDevice],
                    [styleKey]: value
                }
            }

            console.log('🎨 Updating responsive styles:', {
                device: editingDevice,
                styleKey,
                value,
                before: selectedElement.responsiveStyles,
                after: newResponsiveStyles
            })

            updateElement(selectedElement.id, {
                responsiveStyles: newResponsiveStyles
            })
        }
    }

    // Get current style value considering device inheritance
    const getCurrentStyleValue = (styleKey: string) => {
        if (editingDevice === 'desktop') {
            return selectedElement.styles?.[styleKey] || ''
        }
        // For mobile/tablet, show responsive value if set, otherwise show inherited desktop value
        return selectedElement.responsiveStyles?.[editingDevice]?.[styleKey] || selectedElement.styles?.[styleKey] || ''
    }

    return (
        <div className="w-80 border-l bg-white flex flex-col h-full bg-slate-50/50">
            <div className="p-4 border-b bg-white">
                <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">Editando</div>
                <div className="font-medium capitalize flex items-center justify-between">
                    {selectedElement.type}
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 hover:bg-red-50"
                            onClick={() => removeElement(selectedElement.id)}
                            title="Remover elemento"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Device Selector Tabs */}
            <div className="p-3 border-b bg-white">
                <div className="text-[10px] font-semibold uppercase text-muted-foreground mb-2">Editando Estilos Para</div>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-md">
                    <button
                        onClick={() => setEditingDevice('desktop')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium transition-colors",
                            editingDevice === 'desktop' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Monitor className="h-3.5 w-3.5" />
                        Desktop
                    </button>
                    <button
                        onClick={() => setEditingDevice('tablet')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium transition-colors",
                            editingDevice === 'tablet' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Tablet className="h-3.5 w-3.5" />
                        Tablet
                    </button>
                    <button
                        onClick={() => setEditingDevice('mobile')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium transition-colors",
                            editingDevice === 'mobile' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Smartphone className="h-3.5 w-3.5" />
                        Mobile
                    </button>
                </div>
                {editingDevice !== 'desktop' && (
                    <div className="mt-2 text-[10px] text-muted-foreground bg-blue-50 border border-blue-200 rounded p-2">
                        💡 Valores vazios herdam do Desktop
                    </div>
                )}
            </div>

            <ResponsiveStyleProvider editingDevice={editingDevice}>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Typography Section (Moved to Top) */}
                    {['heading', 'text', 'container', 'section', 'column'].includes(selectedElement.type) && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold uppercase text-muted-foreground">Tipografia</h3>
                            <div className="grid gap-3">
                                {/* Tag Selector (Semantic HTML) - Only for text/heading */}
                                {(selectedElement.type === 'heading' || selectedElement.type === 'text') && (
                                    <div className="space-y-1">
                                        <Label className="text-xs">Tag HTML (SEO)</Label>
                                        <select
                                            className="w-full h-9 px-3 py-1 text-sm rounded-md border border-input bg-background"
                                            value={selectedElement.properties?.tag || (selectedElement.type === 'heading' ? 'h2' : 'p')}
                                            onChange={(e) => {
                                                updateElement(selectedElement.id, {
                                                    properties: { ...selectedElement.properties, tag: e.target.value }
                                                })
                                            }}
                                        >
                                            <option value="h1">H1 (Título Principal)</option>
                                            <option value="h2">H2 (Título Secundário)</option>
                                            <option value="h3">H3 (Subtítulo)</option>
                                            <option value="h4">H4</option>
                                            <option value="h5">H5</option>
                                            <option value="h6">H6</option>
                                            <option value="p">P (Parágrafo)</option>
                                            <option value="span">Span</option>
                                            <option value="div">Div</option>
                                        </select>
                                    </div>
                                )}

                                {/* Font Family */}
                                <div className="space-y-1">
                                    <Label className="text-xs">Fonte</Label>
                                    <select
                                        className="w-full h-9 px-3 py-1 text-sm rounded-md border border-input bg-background"
                                        value={getCurrentStyleValue('fontFamily') || ''}
                                        onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                                    >
                                        <option value="">Padrão</option>
                                        <option value="'Inter', sans-serif">Inter</option>
                                        <option value="'Roboto', sans-serif">Roboto</option>
                                        <option value="'Open Sans', sans-serif">Open Sans</option>
                                        <option value="'Lato', sans-serif">Lato</option>
                                        <option value="'Montserrat', sans-serif">Montserrat</option>
                                        <option value="'Poppins', sans-serif">Poppins</option>
                                        <option value="'Playfair Display', serif">Playfair Display</option>
                                        <option value="'Merriweather', serif">Merriweather</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Font Weight */}
                                    <div className="space-y-1">
                                        <Label className="text-xs">Peso</Label>
                                        <select
                                            className="w-full h-9 px-3 py-1 text-sm rounded-md border border-input bg-background"
                                            value={getCurrentStyleValue('fontWeight') || 'normal'}
                                            onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                                        >
                                            <option value="100">Thin (100)</option>
                                            <option value="300">Light (300)</option>
                                            <option value="400">Normal (400)</option>
                                            <option value="500">Medium (500)</option>
                                            <option value="600">Semi Bold (600)</option>
                                            <option value="700">Bold (700)</option>
                                            <option value="800">Extra Bold (800)</option>
                                            <option value="900">Black (900)</option>
                                        </select>
                                    </div>

                                    {/* Font Size */}
                                    <div className="space-y-1">
                                        <Label className="text-xs">Tamanho</Label>
                                        <Input
                                            className="h-9"
                                            value={getCurrentStyleValue('fontSize')}
                                            onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                                            placeholder="16px"
                                        />
                                    </div>
                                </div>

                                {/* Text Align */}
                                <div className="space-y-1">
                                    <Label className="text-xs">Alinhamento</Label>
                                    <div className="flex bg-slate-100 rounded p-1 gap-1">
                                        {[
                                            { value: 'left', label: 'Esq' },
                                            { value: 'center', label: 'Cen' },
                                            { value: 'right', label: 'Dir' },
                                            { value: 'justify', label: 'Just' }
                                        ].map(align => (
                                            <button
                                                key={align.value}
                                                className={cn(
                                                    "flex-1 py-1 text-xs rounded transition-colors",
                                                    (getCurrentStyleValue('textAlign') || 'left') === align.value
                                                        ? "bg-white shadow text-primary font-medium border"
                                                        : "text-muted-foreground hover:bg-slate-200"
                                                )}
                                                onClick={() => handleStyleChange('textAlign', align.value)}
                                            >
                                                {align.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <Separator />
                        </div>
                    )}

                    {/* Content Section */}
                    {['heading', 'text', 'button'].includes(selectedElement.type) && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-semibold uppercase text-muted-foreground">Conteúdo</h3>
                            <div className="space-y-1">
                                <Label className="text-xs">Texto</Label>
                                <Input
                                    value={selectedElement.content || ''}
                                    onChange={(e) => handleChange('content', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {selectedElement.type === 'image' && (
                        <>
                            <ImageUploadProperty />
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="space-y-1">
                                    <Label className="text-xs">Largura</Label>
                                    <Input
                                        className="h-9"
                                        value={getCurrentStyleValue('width') || ''}
                                        onChange={(e) => handleStyleChange('width', e.target.value)}
                                        placeholder="100% ou 500px"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Altura</Label>
                                    <Input
                                        className="h-9"
                                        value={getCurrentStyleValue('height') || ''}
                                        onChange={(e) => handleStyleChange('height', e.target.value)}
                                        placeholder="Auto ou 300px"
                                    />
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-3 h-8 text-xs"
                                onClick={() => {
                                    handleStyleChange('width', '')
                                    handleStyleChange('height', '')
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74-2.74L3 12" /></svg>
                                Resetar Tamanho
                            </Button>
                        </>
                    )}

                    {selectedElement.type === 'form' && (
                        <SidebarFormProperties />
                    )}

                    {selectedElement.type === 'form' && (
                        <SidebarFormProperties />
                    )}

                    {selectedElement.type === 'button' && (
                        <>
                            <ButtonControl />
                        </>
                    )}


                    {selectedElement.type === 'social' && (
                        <>
                            <SocialControl />
                            <Separator className="my-4" />
                        </>
                    )}

                    {selectedElement.type === 'video' && (
                        <>
                            <VideoControl />
                            <Separator className="my-4" />
                        </>
                    )}

                    {selectedElement.type === 'custom-html' && (
                        <>
                            <CustomHtmlControl />
                            <Separator className="my-4" />
                        </>
                    )}

                    <Separator />

                    {/* Layout Section for Containers */}
                    {['section', 'container', 'column'].includes(selectedElement.type) && (
                        <>
                            <div className="space-y-4">
                                <h3 className="text-xs font-semibold uppercase text-muted-foreground">Layout</h3>

                                {/* Anchor ID Field */}
                                <div className="space-y-1">
                                    <Label className="text-xs">ID da Âncora</Label>
                                    <Input
                                        placeholder="ex: sobre, contato"
                                        value={selectedElement.properties?.anchorId || ''}
                                        onChange={(e) => {
                                            const value = e.target.value
                                            // Sanitize: only allow valid HTML ID characters
                                            const sanitized = value.replace(/[^a-zA-Z0-9_-]/g, '')
                                            updateElement(selectedElement.id, {
                                                properties: {
                                                    ...selectedElement.properties,
                                                    anchorId: sanitized
                                                }
                                            })
                                        }}
                                        className="h-9"
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        Use para navegação com #id. Ex: #sobre
                                    </p>
                                </div>

                                <ColumnsControl />
                                <SizeControl
                                    width={getCurrentStyleValue('width')}
                                    height={getCurrentStyleValue('height')}
                                    onChangeWidth={(val) => handleStyleChange('width', val)}
                                    onChangeHeight={(val) => handleStyleChange('height', val)}
                                />
                                <Separator className="my-4" />
                                <FlexControl />
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Styles Section (Unified) */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold uppercase text-muted-foreground">Estilos</h3>

                        {/* Spacing (Margin & Padding) - Available for all relevant visible elements */}
                        {['section', 'container', 'column', 'button', 'social', 'image', 'video', 'text', 'heading'].includes(selectedElement.type) && (
                            <div className="space-y-4">
                                <SpacingControl type="margin" />
                                <SpacingControl type="padding" />
                            </div>
                        )}

                        <Separator className="my-4" />

                        {/* Decorations (Border Radius) */}
                        {['container', 'column', 'video', 'image', 'button'].includes(selectedElement.type) && (
                            <>
                                <BorderRadiusControl />
                                <Separator className="my-4" />
                            </>
                        )}

                        {/* Background Image Control */}
                        {['section', 'container', 'column'].includes(selectedElement.type) && (
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Background Image</h4>
                                <BackgroundControl />
                                <Separator className="my-4" />
                            </div>
                        )}
                    </div>

                    {/* Spacer Properties */}
                    {selectedElement.type === 'spacer' && (
                        <div className="space-y-6">
                            <h3 className="text-xs font-semibold uppercase text-muted-foreground">Propriedades do Espaçamento</h3>
                            <SizeControl
                                width={getCurrentStyleValue('width')}
                                height={getCurrentStyleValue('height')}
                                onChangeWidth={(val) => handleStyleChange('width', val)}
                                onChangeHeight={(val) => handleStyleChange('height', val)}
                            />
                            <div className="space-y-1">
                                <Label className="text-xs">Cor de Fundo</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        className="w-10 h-10 p-1 cursor-pointer"
                                        value={getCurrentStyleValue('backgroundColor') || '#ffffff'}
                                        onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                                    />
                                    <Input
                                        value={getCurrentStyleValue('backgroundColor')}
                                        onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                                        placeholder="transparent"
                                    />
                                </div>
                            </div>
                            <Separator className="my-4" />
                            <SpacingControl type="margin" />
                        </div>
                    )}

                    {/* Icon Properties */}
                    {selectedElement.type === 'icon' && (
                        <>
                            <IconControl />
                            <Separator className="my-4" />
                        </>
                    )}

                    {/* Generic Typography & Colors (Hide for Button as it has its own) */}
                    {!['button', 'form', 'spacer', 'icon'].includes(selectedElement.type) && (
                        <>
                            <div className="space-y-1">
                                <Label className="text-xs">Background Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        className="w-10 h-10 p-1 cursor-pointer"
                                        value={getCurrentStyleValue('backgroundColor') || '#ffffff'}
                                        onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                                    />
                                    <Input
                                        value={getCurrentStyleValue('backgroundColor')}
                                        onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                                        placeholder="#ffffff"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Text Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        className="w-10 h-10 p-1 cursor-pointer"
                                        value={getCurrentStyleValue('color') || '#000000'}
                                        onChange={(e) => handleStyleChange('color', e.target.value)}
                                    />
                                    <Input
                                        value={getCurrentStyleValue('color')}
                                        onChange={(e) => handleStyleChange('color', e.target.value)}
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>


                        </>
                    )}

                    {/* Visibility Control - Show for all elements */}
                    <Separator className="my-4" />
                    <VisibilityControl />
                </div>
            </ResponsiveStyleProvider>
        </div>
    )
}
