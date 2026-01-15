"use client"

import { WhatsAppConfig } from "@/actions/whatsapp"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageCircle, X, Phone, MessageSquare } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface WhatsAppPreviewProps {
    config: Partial<WhatsAppConfig>
}

export function WhatsAppPreview({ config }: WhatsAppPreviewProps) {
    const [isOpen, setIsOpen] = useState(false)

    // Defaults
    const position = config.position || 'bottom-right'
    const color = config.button_color || '#25D366'
    const text = config.button_text
    const iconType = config.icon_type || 'icon'
    const buttonIcon = config.button_icon || 'whatsapp'
    const avatarUrl = config.avatar_url
    const fields = config.fields_config || [
        { name: "name", label: "Nome", type: "text", placeholder: "Seu nome" },
        { name: "email", label: "Email", type: "email", placeholder: "seu@email.com" },
        { name: "phone", label: "Telefone", type: "tel", placeholder: "(11) 99999-9999" }
    ]

    return (
        <div className="relative border rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/50 h-[600px] w-full shadow-inner flex flex-col">
            {/* Mock Browser Header */}
            <div className="bg-slate-100 dark:bg-slate-800 border-b p-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-white dark:bg-slate-950 rounded-md h-6 mx-4 text-[10px] flex items-center px-3 text-muted-foreground">
                    seu-site.com.br
                </div>
            </div>

            {/* Mock Website Content */}
            <div className="flex-1 p-8 space-y-8 opacity-20 pointer-events-none select-none">
                <div className="h-12 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="space-y-4">
                    <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-4/6 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
                <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>

            {/* WIDGET CONTAINER */}
            <div className={cn(
                "absolute p-6 z-20 flex flex-col items-end gap-4",
                position === 'bottom-right' ? "bottom-0 right-0" : "bottom-0 left-0 items-start"
            )}>

                {/* MODAL */}
                {isOpen && (
                    <div className={cn(
                        "bg-background border shadow-2xl rounded-2xl w-[320px] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300",
                        "flex flex-col mb-4"
                    )}>
                        <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center"
                            style={{ backgroundColor: color }}>
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                <span className="font-semibold text-sm">Fale conosco</span>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 hover:bg-black/10 text-primary-foreground"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="p-4 space-y-4">
                            <p className="text-xs text-muted-foreground">Preencha seus dados para iniciar o atendimento.</p>
                            <div className="space-y-3">
                                {fields.map((field: any, idx: number) => (
                                    <div key={idx} className="space-y-1">
                                        <Label className="text-xs">{field.label}</Label>
                                        <Input
                                            placeholder={field.placeholder || `Digite seu ${field.label.toLowerCase()}`}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                ))}
                            </div>
                            <Button className="w-full h-9 text-xs font-semibold" style={{ backgroundColor: color }}>
                                Iniciar Conversa
                            </Button>
                        </div>
                    </div>
                )}

                {/* FLOATING BUTTON */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "flex items-center gap-2 shadow-xl hover:scale-105 transition-transform active:scale-95 text-white font-medium mb-4 overflow-hidden",
                        text ? "px-4 py-3 rounded-full" : "p-3 rounded-full"
                    )}
                    style={{ backgroundColor: color }}
                >
                    {iconType === 'avatar' && avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover bg-white"
                        />
                    ) : (
                        <>
                            {buttonIcon === 'phone' && <Phone className="w-6 h-6" />}
                            {buttonIcon === 'message' && <MessageSquare className="w-6 h-6" />}
                            {(buttonIcon === 'whatsapp' || !buttonIcon) && (
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                            )}
                        </>
                    )}
                    {text && <span>{text}</span>}
                </button>
            </div>

        </div>
    )
}
