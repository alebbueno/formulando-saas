"use client"

import React, { useState, useEffect } from "react"
import { useLPBuilder } from "./context/lp-builder-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Code, Smartphone, Tablet, Monitor, Save, RotateCcw, RotateCw, Loader2, Check, Globe, Link2, Upload, ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { LPElement } from "./types"
import { togglePublish } from "@/app/lp/builder/[id]/actions"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { DialogDescription } from "@/components/ui/dialog"
import { GeneralSettings } from "./settings/general-settings"
import { DomainSettings } from "./settings/domain-settings"
import { Settings } from "lucide-react"

function generateHTML(elements: LPElement[]): string {
    return elements.map(el => {
        const styleString = Object.entries(el.styles || {})
            .map(([k, v]) => `${k.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}: ${v}`)
            .join('; ')

        const styleAttr = styleString ? ` style="${styleString}"` : ""
        let childrenHTML = ""

        if (el.children) {
            childrenHTML = generateHTML(el.children)
        }

        switch (el.type) {
            case 'section':
                return `<section class="w-full min-h-[100px] p-4"${styleAttr}>${childrenHTML}</section>`
            case 'container':
                return `<div class="mx-auto w-full max-w-7xl min-h-[50px] p-2"${styleAttr}>${childrenHTML}</div>`
            case 'heading':
                return `<h1 class="text-4xl font-bold"${styleAttr}>${el.content}</h1>`
            case 'text':
                return `<p class="text-base"${styleAttr}>${el.content}</p>`
            case 'button':
                return `<button class="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"${styleAttr}>${el.content}</button>`
            case 'image':
                return `<img src="${el.url}" alt="Image" class="max-w-full h-auto"${styleAttr} />`
            case 'form':
                return `<div class="p-4 border rounded bg-slate-50"${styleAttr}><!-- Form Embedded: ${el.properties?.formId} --></div>`
            default:
                return `<!-- Unknown element ${el.type} -->`
        }
    }).join('\n')
}

export function BuilderToolbar() {
    const { elements, setMode, mode, saveLP, isSaving, lastSaved, isPublished, setIsPublished, slug, setSlug, projectId, previewDevice, setPreviewDevice, lpName, setLpName, customDomain, settings, setSettings } = useLPBuilder()
    const [showSaved, setShowSaved] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false)
    const [showCopied, setShowCopied] = useState(false)

    const handleSettingsChange = (key: string, value: any) => {
        setSettings((prev: any) => ({
            ...prev,
            [key]: value
        }))
    }

    const htmlCode = generateHTML(elements)

    const handleSave = async () => {
        const result = await saveLP()

        if (result.success) {
            setShowSaved(true)
            setTimeout(() => setShowSaved(false), 2000)
            console.log('✅ Landing Page salva com sucesso!')
        } else {
            console.error('❌ Erro ao salvar:', result.error)
            alert(`Erro ao salvar: ${result.error || 'Tente novamente'}`)
        }
    }

    // Keyboard shortcut Ctrl+S / Cmd+S
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault()
                handleSave()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [elements]) // Re-attach when elements change to capture latest state

    return (
        <div className="border-b bg-white p-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.location.href = '/dashboard'}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-slate-200" />
                    <Input
                        value={lpName}
                        onChange={(e) => setLpName(e.target.value)}
                        className="h-8 w-64 font-medium bg-transparent border-transparent hover:border-slate-200 focus:border-primary focus:bg-white transition-all"
                        placeholder="Nome da Landing Page"
                    />
                    <div className="w-px h-6 bg-slate-200" />
                    <div className="flex items-center text-sm border border-transparent hover:border-slate-200 rounded-md px-2 bg-transparent hover:bg-white transition-all h-8 group focus-within:bg-white focus-within:border-primary">
                        <span className="text-muted-foreground whitespace-nowrap select-none text-xs">/lp/</span>
                        <Input
                            value={slug || ''}
                            onChange={(e) => setSlug(e.target.value)}
                            className="h-6 w-32 border-none bg-transparent p-0 focus-visible:ring-0 text-xs font-mono text-slate-600"
                            placeholder="slug-da-pagina"
                        />
                    </div>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8 ml-2">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Configurações da Página</DialogTitle>
                            <DialogDescription>
                                Gerencie as configurações da sua Landing Page.
                            </DialogDescription>
                        </DialogHeader>
                        <Tabs defaultValue="general" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="general">Geral</TabsTrigger>
                                <TabsTrigger value="domain">Domínio</TabsTrigger>
                            </TabsList>
                            <TabsContent value="general">
                                <GeneralSettings settings={settings} onSettingsChange={handleSettingsChange} />
                            </TabsContent>
                            <TabsContent value="domain">
                                <DomainSettings initialDomain={customDomain} projectId={projectId || ''} />
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>

                <div className="flex items-center border rounded-md bg-muted/20 p-1">
                    <Button
                        variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => {
                            console.log('🖥️ Switching to desktop')
                            setPreviewDevice('desktop')
                        }}
                    >
                        <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={previewDevice === 'tablet' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => {
                            console.log('📱 Switching to tablet')
                            setPreviewDevice('tablet')
                        }}
                    >
                        <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => {
                            console.log('📱 Switching to mobile')
                            setPreviewDevice('mobile')
                        }}
                    >
                        <Smartphone className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => { }}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Undo
                </Button>
                <Button variant="outline" size="sm" onClick={() => { }}>
                    <RotateCw className="h-4 w-4 mr-2" />
                    Redo
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Code className="h-4 w-4 mr-2" />
                            Code View
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>HTML Code</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-auto border rounded-md">
                            <SyntaxHighlighter language="html" style={vscDarkPlus} showLineNumbers wrapLines>
                                {htmlCode}
                            </SyntaxHighlighter>
                        </div>
                    </DialogContent>
                </Dialog>


                {isPublished && slug && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const publicUrl = `${window.location.origin}/lp/${slug}`
                            window.open(publicUrl, '_blank')
                        }}
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                    </Button>
                )}
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : showSaved ? (
                        <Check className="h-4 w-4 mr-2" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSaving ? 'Salvando...' : showSaved ? 'Salvo!' : 'Salvar'}
                </Button>
                {lastSaved && !isSaving && !showSaved && (
                    <span className="text-xs text-muted-foreground">
                        Salvo {new Date(lastSaved).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
                <Button
                    variant={isPublished ? "default" : "outline"}
                    size="sm"
                    onClick={async () => {
                        if (!projectId) return
                        setIsPublishing(true)
                        const result = await togglePublish(projectId, !isPublished)
                        if (result.success) {
                            setIsPublished(result.isPublished || false)
                            console.log(result.isPublished ? '✅ LP publicada!' : '✅ LP despublicada!')
                        } else {
                            alert(`Erro: ${result.error}`)
                        }
                        setIsPublishing(false)
                    }}
                    disabled={isPublishing}
                >
                    {isPublishing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Globe className="h-4 w-4 mr-2" />
                    )}
                    {isPublished ? 'Publicado' : 'Publicar'}
                </Button>
                {isPublished && slug && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            const publicUrl = `${window.location.origin}/lp/${slug}`
                            navigator.clipboard.writeText(publicUrl)
                            setShowCopied(true)
                            setTimeout(() => setShowCopied(false), 2000)
                        }}
                    >
                        {showCopied ? (
                            <Check className="h-4 w-4 mr-2" />
                        ) : (
                            <Link2 className="h-4 w-4 mr-2" />
                        )}
                        {showCopied ? 'Copiado!' : 'Copiar Link'}
                    </Button>
                )}
            </div>
        </div >
    )
}
