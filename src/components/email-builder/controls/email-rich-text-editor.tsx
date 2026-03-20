"use client"

import React, { useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import FontFamily from "@tiptap/extension-font-family"
import { Extension } from "@tiptap/core"
import { useEffect } from "react"

import { cn } from "@/lib/utils"
import { 
    Bold, Italic, Underline as UnderlineIcon, 
    AlignLeft, AlignCenter, AlignRight, 
    Link as LinkIcon, Unlink, Palette, 
    Check, X, ChevronDown, ExternalLink, Variable 
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { EMAIL_SAFE_FONTS, MERGE_TAGS } from "../constants"

// Custom FontSize extension to output inline styles
const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return {
            types: ['textStyle'],
        }
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: (element: HTMLElement) => element.style.fontSize.replace('px', ''),
                        renderHTML: (attributes: Record<string, any>) => {
                            if (!attributes.fontSize) return {}
                            return { style: `font-size: ${attributes.fontSize}px` }
                        },
                    },
                },
            },
        ]
    },
    addCommands() {
        return {
            setFontSize: (fontSize: string) => ({ chain }: any) => {
                return chain().setMark('textStyle', { fontSize }).run()
            },
        }
    },
})

// Custom Color extension to output inline styles
const Color = Extension.create({
    name: 'color',
    addOptions() {
        return {
            types: ['textStyle'],
        }
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    color: {
                        default: null,
                        parseHTML: (element: HTMLElement) => element.style.color,
                        renderHTML: (attributes: Record<string, any>) => {
                            if (!attributes.color) return {}
                            return { style: `color: ${attributes.color}` }
                        },
                    },
                },
            },
        ]
    },
    addCommands() {
        return {
            setColor: (color: string) => ({ chain }: any) => {
                return chain().setMark('textStyle', { color }).run()
            },
            unsetColor: () => ({ chain }: any) => {
                return chain().setMark('textStyle', { color: null }).run()
            },
        }
    },
})

// Custom TextAlign to use inline styles instead of classes (critical for email)
const CustomTextAlign = TextAlign.extend({
    addAttributes() {
        return {
            textAlign: {
                default: 'left',
                parseHTML: (element: HTMLElement) => element.style.textAlign || 'left',
                renderHTML: (attributes: Record<string, any>) => {
                    if (attributes.textAlign === 'left') return {}
                    return { style: `text-align: ${attributes.textAlign}` }
                },
            },
        }
    },
})

interface EmailRichTextEditorProps {
    content: string
    onChange: (content: string) => void
    editable?: boolean
    className?: string
    editorProps?: any
}

const FONT_SIZES = ["12", "14", "16", "18", "20", "24", "30", "36", "48"]
const PRESET_COLORS = [
    "#000000", "#475569", "#64748b", "#94a3b8", "#f8fafc",
    "#ef4444", "#f97316", "#f59e0b", "#10b981", "#3b82f6", 
    "#6366f1", "#8b5cf6", "#d946ef"
]

export function EmailRichTextEditor({ content, onChange, editable = true, className, editorProps: customEditorProps }: EmailRichTextEditorProps) {
    const [linkUrl, setLinkUrl] = useState("")
    const [isEditingLink, setIsEditingLink] = useState(false)

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { 
                    class: 'text-indigo-600 underline cursor-pointer',
                },
            }),
            Underline,
            CustomTextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
            }),
            TextStyle,
            FontFamily,
            FontSize,
            Color,
        ],
        content: content,
        editable: editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: cn(
                    "focus:outline-none max-w-none w-full",
                    "min-h-[20px]",
                    className
                ),
            },
            handlePaste: (view, event, slice) => {
                // Let the default paste handler work, but ensure it's not blocked
                return false
            },
            ...customEditorProps
        },
    })
    
    useEffect(() => {
        if (!editor || editor.isDestroyed) return
        
        if (editor.isEditable !== editable) {
            editor.setEditable(editable)
        }
        
        if (editable) {
            // Use a tiny timeout to ensure the DOM is ready for focus
            const timer = setTimeout(() => {
                if (!editor.isFocused) editor.commands.focus('end')
            }, 10)
            return () => clearTimeout(timer)
        }
    }, [editor, editable])

    if (!editor) return null

    const openLinkEditor = () => {
        setLinkUrl(editor.getAttributes('link').href || "")
        setIsEditingLink(true)
    }

    const saveLink = () => {
        if (linkUrl === "") {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
        }
        setIsEditingLink(false)
        setLinkUrl("")
    }

    return (
        <div className="relative w-full group/editor">
            {editable && (
                <BubbleMenu editor={editor} className="flex flex-col rounded-md border bg-white shadow-xl overflow-hidden z-[9999]">
                    {isEditingLink ? (
                        <div className="flex items-center p-1 bg-white gap-1 animate-in slide-in-from-top-1 duration-200">
                            <Input 
                                placeholder="https://exemplo.com"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                className="h-7 w-[200px] text-xs focus-visible:ring-1"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveLink()
                                    if (e.key === 'Escape') setIsEditingLink(false)
                                }}
                            />
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={saveLink}>
                                <Check size={14} />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => setIsEditingLink(false)}>
                                <X size={14} />
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Top Row: Formatting & Alignment & Link */}
                            <div className="flex items-center p-1 bg-white gap-0.5 border-b">
                                <button
                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                    className={cn("p-1.5 rounded-sm hover:bg-slate-100 transition-colors", editor.isActive('bold') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600')}
                                    title="Negrito"
                                >
                                    <Bold size={14} />
                                </button>
                                <button
                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                    className={cn("p-1.5 rounded-sm hover:bg-slate-100 transition-colors", editor.isActive('italic') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600')}
                                    title="Itálico"
                                >
                                    <Italic size={14} />
                                </button>
                                <button
                                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                                    className={cn("p-1.5 rounded-sm hover:bg-slate-100 transition-colors", editor.isActive('underline') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600')}
                                    title="Sublinhado"
                                >
                                    <UnderlineIcon size={14} />
                                </button>

                                <div className="w-[1px] h-4 bg-slate-200 mx-1" />

                                <button
                                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                                    className={cn("p-1.5 rounded-sm hover:bg-slate-100 transition-colors", editor.isActive({ textAlign: 'left' }) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600')}
                                    title="Alinhar à Esquerda"
                                >
                                    <AlignLeft size={14} />
                                </button>
                                <button
                                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                                    className={cn("p-1.5 rounded-sm hover:bg-slate-100 transition-colors", editor.isActive({ textAlign: 'center' }) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600')}
                                    title="Centralizar"
                                >
                                    <AlignCenter size={14} />
                                </button>
                                <button
                                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                                    className={cn("p-1.5 rounded-sm hover:bg-slate-100 transition-colors", editor.isActive({ textAlign: 'right' }) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600')}
                                    title="Alinhar à Direita"
                                >
                                    <AlignRight size={14} />
                                </button>

                                <div className="w-[1px] h-4 bg-slate-200 mx-1" />

                                <button
                                    onClick={openLinkEditor}
                                    className={cn("p-1.5 rounded-sm hover:bg-slate-100 transition-colors", editor.isActive('link') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600')}
                                    title="Inserir Link"
                                >
                                    <LinkIcon size={14} />
                                </button>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            className="p-1.5 rounded-sm hover:bg-slate-100 transition-colors text-slate-600"
                                            title="Tags Dinâmicas (Merge Tags)"
                                        >
                                            <Variable size={14} />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48 p-0 z-[10001]" side="top">
                                        <div className="flex flex-col max-h-60 overflow-y-auto">
                                            <div className="px-3 py-2 border-b bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                                Inserir Variável
                                            </div>
                                            {MERGE_TAGS.map(tag => (
                                                <button
                                                    key={tag.value}
                                                    className="px-3 py-2 text-left text-xs hover:bg-slate-100 transition-colors flex items-center justify-between group"
                                                    onClick={() => {
                                                        editor.chain().focus().insertContent(tag.value).run()
                                                    }}
                                                >
                                                    <span>{tag.label}</span>
                                                    <span className="text-[10px] text-slate-400 group-hover:text-indigo-500 font-mono">{tag.value}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            className={cn("p-1.5 rounded-sm hover:bg-slate-100 transition-colors", editor.getAttributes('textStyle').color ? 'text-indigo-600' : 'text-slate-600')}
                                            title="Cor do Texto"
                                        >
                                            <Palette size={14} />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-2 grid grid-cols-5 gap-1 z-[10001]" side="top">
                                        {PRESET_COLORS.map(color => (
                                            <button
                                                key={color}
                                                className="w-6 h-6 rounded-sm border border-slate-200 hover:scale-110 transition-transform"
                                                style={{ backgroundColor: color }}
                                                onClick={() => {
                                                    editor.chain().focus().setColor(color).run()
                                                }}
                                            />
                                        ))}
                                        <button
                                            className="w-6 h-6 rounded-sm border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                                            title="Remover Cor"
                                            onClick={() => editor.chain().focus().unsetColor().run()}
                                        >
                                            <X size={10} />
                                        </button>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Bottom Row: Font Family & Size */}
                            <div className="flex items-center p-1 bg-slate-50 gap-0.5">
                                <Select
                                    value={editor.getAttributes('textStyle').fontFamily || 'Arial, \"Helvetica Neue\", Helvetica, sans-serif'}
                                    onValueChange={(value) => editor.chain().focus().setFontFamily(value).run()}
                                >
                                    <SelectTrigger className="h-7 w-[130px] text-[10px] border-none bg-transparent focus:ring-0">
                                        <SelectValue placeholder="Fonte" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[10000]">
                                        {EMAIL_SAFE_FONTS.map(f => (
                                            <SelectItem key={f.value} value={f.value} className="text-[10px]">{f.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="w-[1px] h-4 bg-slate-200 mx-1" />

                                <Select
                                    value={editor.getAttributes('textStyle').fontSize || '16'}
                                    onValueChange={(value) => editor.chain().focus().setFontSize(value).run()}
                                >
                                    <SelectTrigger className="h-7 w-[60px] text-[10px] border-none bg-transparent focus:ring-0">
                                        <SelectValue placeholder="Tam." />
                                    </SelectTrigger>
                                    <SelectContent className="z-[10000]">
                                        {FONT_SIZES.map(size => (
                                            <SelectItem key={size} value={size} className="text-[10px]">{size}px</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                </BubbleMenu>
            )}

            <EditorContent editor={editor} />
        </div>
    )
}
