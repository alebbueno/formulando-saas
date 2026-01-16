"use client"

import React, { useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import FontFamily from "@tiptap/extension-font-family"
import { Extension } from "@tiptap/core"

import { cn } from "@/lib/utils"
import { Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Link as LinkIcon, Unlink, Quote, Check } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define a custom extension for Font Size since Tiptap doesn't have a default one for pixels easily accessible
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
                        parseHTML: element => element.style.fontSize.replace('px', ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {}
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}px`,
                            }
                        },
                    },
                },
            },
        ]
    },
    addCommands() {
        return {
            setFontSize: (fontSize: string) => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize })
                    .run()
            },
            unsetFontSize: () => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize: null })
                    .removeEmptyTextStyle()
                    .run()
            },
        }
    },
})

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    editable?: boolean
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

const FONT_SIZES = [
    "12", "14", "16", "18", "20", "24", "30", "36", "48", "60", "72"
]

export function RichTextEditor({ content, onChange, editable = true, className }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
                },
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            FontFamily,
            FontSize,
        ],
        content: content,
        editable: editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm sm:prose-base focus:outline-none max-w-none w-full",
                    // Adding specific styles for lists and typography to match "Notion" feel
                    "prose-headings:font-bold prose-headings:text-foreground",
                    "prose-p:text-foreground prose-p:leading-relaxed",
                    "prose-strong:font-bold prose-strong:text-foreground",
                    "prose-ul:list-disc prose-ul:pl-4 prose-ol:list-decimal prose-ol:pl-4",
                    "min-h-[100px]",
                    className
                ),
            },
        },
    })

    // Dynamically load Google Fonts based on selection or usage
    // For simplicity, we can load all offered fonts once, or check if they are used.
    useEffect(() => {
        const linkId = 'rich-text-fonts-loader'
        if (!document.getElementById(linkId)) {
            const link = document.createElement('link')
            link.id = linkId
            link.href = `https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS.join('&family=').replace(/\s/g, '+')}:ital,wght@0,300;0,400;0,700;1,400&display=swap`
            link.rel = 'stylesheet'
            document.head.appendChild(link)
        }
    }, [])

    if (!editor) {
        return null
    }

    // Handlers
    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)

        if (url === null) return
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }

    return (
        <div className="relative w-full">
            {editable && (
                <BubbleMenu editor={editor} className="flex flex-col rounded-md border bg-background shadow-md">
                    {/* Top Row: Formatting & Links & Alignment */}
                    <div className="flex items-center p-1 bg-white dark:bg-zinc-900 gap-0.5 border-b rounded-t-md">

                        {/* Block Type Selector */}
                        <Select
                            value={editor.isActive('heading', { level: 1 }) ? 'h1' :
                                editor.isActive('heading', { level: 2 }) ? 'h2' :
                                    editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'}
                            onValueChange={(value) => {
                                if (value === 'p') editor.chain().focus().setParagraph().run()
                                if (value === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run()
                                if (value === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run()
                                if (value === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run()
                            }}
                        >
                            <SelectTrigger className="h-7 w-[100px] text-xs border-none focus:ring-0">
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent portal={false}>
                                <SelectItem value="p">Parágrafo</SelectItem>
                                <SelectItem value="h1">Título 1</SelectItem>
                                <SelectItem value="h2">Título 2</SelectItem>
                                <SelectItem value="h3">Título 3</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="w-[1px] h-4 bg-border mx-1" />

                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={cn("p-1.5 rounded-sm hover:bg-muted transition-colors", editor.isActive('bold') ? 'bg-muted text-primary' : 'text-muted-foreground')}
                            title="Negrito"
                        >
                            <Bold size={14} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={cn("p-1.5 rounded-sm hover:bg-muted transition-colors", editor.isActive('italic') ? 'bg-muted text-primary' : 'text-muted-foreground')}
                            title="Itálico"
                        >
                            <Italic size={14} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={cn("p-1.5 rounded-sm hover:bg-muted transition-colors", editor.isActive('underline') ? 'bg-muted text-primary' : 'text-muted-foreground')}
                            title="Sublinhado"
                        >
                            <UnderlineIcon size={14} />
                        </button>

                        <div className="w-[1px] h-4 bg-border mx-1" />

                        <button
                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                            className={cn("p-1.5 rounded-sm hover:bg-muted transition-colors", editor.isActive({ textAlign: 'left' }) ? 'bg-muted text-primary' : 'text-muted-foreground')}
                            title="Esquerda"
                        >
                            <AlignLeft size={14} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                            className={cn("p-1.5 rounded-sm hover:bg-muted transition-colors", editor.isActive({ textAlign: 'center' }) ? 'bg-muted text-primary' : 'text-muted-foreground')}
                            title="Centro"
                        >
                            <AlignCenter size={14} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                            className={cn("p-1.5 rounded-sm hover:bg-muted transition-colors", editor.isActive({ textAlign: 'right' }) ? 'bg-muted text-primary' : 'text-muted-foreground')}
                            title="Direita"
                        >
                            <AlignRight size={14} />
                        </button>

                        <div className="w-[1px] h-4 bg-border mx-1" />

                        <button
                            onClick={setLink}
                            className={cn("p-1.5 rounded-sm hover:bg-muted transition-colors", editor.isActive('link') ? 'bg-muted text-primary' : 'text-muted-foreground')}
                            title="Link"
                        >
                            <LinkIcon size={14} />
                        </button>
                    </div>

                    {/* Bottom Row: Font Family & Size & Lists */}
                    <div className="flex items-center p-1 bg-white dark:bg-zinc-900 gap-0.5">
                        {/* Font Family Selector */}
                        <Select
                            value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
                            onValueChange={(value) => {
                                editor.chain().focus().setFontFamily(value).run()
                            }}
                        >
                            <SelectTrigger className="h-7 w-[120px] text-xs border-none focus:ring-0">
                                <SelectValue placeholder="Fonte" />
                            </SelectTrigger>
                            <SelectContent portal={false}>
                                {GOOGLE_FONTS.map(font => (
                                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>{font}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Font Size Selector */}
                        <Select
                            value={editor.getAttributes('textStyle').fontSize || '16'}
                            onValueChange={(value) => {
                                editor.chain().focus().setFontSize(value).run()
                            }}
                        >
                            <SelectTrigger className="h-7 w-[60px] text-xs border-none focus:ring-0">
                                <SelectValue placeholder="Tam." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]" portal={false}>
                                {FONT_SIZES.map(size => (
                                    <SelectItem key={size} value={size}>{size}px</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="w-[1px] h-4 bg-border mx-1" />

                        <button
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={cn("p-1.5 rounded-sm hover:bg-muted transition-colors", editor.isActive('bulletList') ? 'bg-muted text-primary' : 'text-muted-foreground')}
                            title="Lista"
                        >
                            <List size={14} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={cn("p-1.5 rounded-sm hover:bg-muted transition-colors", editor.isActive('orderedList') ? 'bg-muted text-primary' : 'text-muted-foreground')}
                            title="Numeração"
                        >
                            <ListOrdered size={14} />
                        </button>
                    </div>
                </BubbleMenu>
            )}

            <EditorContent editor={editor} />
        </div>
    )
}
