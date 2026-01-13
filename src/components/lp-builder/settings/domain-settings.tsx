"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updateProjectDomain } from "@/app/lp/builder/[id]/actions"
import { Loader2, Check, AlertTriangle, Globe, Copy, Info, Server, Clock } from "lucide-react"

export function DomainSettings({ initialDomain, projectId }: { initialDomain: string | null, projectId: string }) {
    const [domain, setDomain] = useState(initialDomain || "")
    const [loading, setLoading] = useState(false)
    const [savedDomain, setSavedDomain] = useState(initialDomain)
    const [copied, setCopied] = useState<string | null>(null)

    const handleSaveDomain = async () => {
        // Allow saving empty domain to remove it
        if (!domain && !savedDomain) return;

        setLoading(true)
        try {
            const result = await updateProjectDomain(projectId, domain)

            if (result.error) {
                toast.error(result.error)
                return
            }

            setSavedDomain(domain)
            toast.success(domain ? "Domínio configurado com sucesso!" : "Domínio removido com sucesso!")
        } catch (error) {
            toast.error("Erro ao atualizar domínio")
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (text: string, type: 'host' | 'value') => {
        navigator.clipboard.writeText(text)
        setCopied(type)
        toast.success("Copiado para a área de transferência")
        setTimeout(() => setCopied(null), 2000)
    }

    // Determine CNAME host based on domain
    // If domain is "sub.domain.com", Host is "sub"
    // If domain is "domain.com" (root), usually user wants "www" or it's tricky with CNAME on root (needs CNAME flattening/ALIAS)
    // Let's assume subdomain mostly or advise on root.
    const getHostName = (d: string) => {
        const parts = d.split('.')
        if (parts.length > 2) {
            return parts.slice(0, -2).join('.') // "promo.site.com" -> "promo"
        }
        return '@' // Root domain
    }

    const hostName = savedDomain ? getHostName(savedDomain) : ''

    return (
        <div className="space-y-6 py-4">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-slate-900">Domínio Personalizado</h3>
                    <p className="text-sm text-slate-500">
                        Publique sua Landing Page em seu próprio endereço web.
                    </p>
                </div>
                {savedDomain ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100">
                        <Check className="h-3.5 w-3.5" />
                        Ativo
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full border border-slate-200">
                        Não configurado
                    </div>
                )}
            </div>

            <div className="p-1">
                <div className="flex gap-3 items-end">
                    <div className="grid gap-2 flex-1 relative">
                        <Label htmlFor="domain" className="text-xs font-medium text-slate-500 uppercase tracking-wider">Seu Domínio</Label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                id="domain"
                                placeholder="ex: lp.seusite.com.br"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value.toLowerCase())}
                                className="pl-9 font-mono h-11 border-slate-200 focus-visible:ring-indigo-500"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleSaveDomain}
                        disabled={loading || domain === savedDomain}
                        className={`h-11 px-6 font-medium transition-all ${savedDomain && domain !== savedDomain ? "bg-amber-500 hover:bg-amber-600" : ""}`}
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {savedDomain
                            ? (domain !== savedDomain ? "Salvar Alteração" : "Conectado")
                            : "Conectar Domínio"
                        }
                    </Button>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 ml-1">
                    Recomendamos usar um subdomínio (ex: <code>promo.site.com</code>).
                </p>
            </div>

            {savedDomain && (
                <div className="border border-indigo-100 rounded-xl bg-slate-50/50 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-50 to-white px-4 py-3 border-b border-indigo-100 flex items-center gap-2">
                        <Server className="h-4 w-4 text-indigo-500" />
                        <h4 className="text-sm font-semibold text-slate-800">Instruções de DNS</h4>
                    </div>

                    <div className="p-5 space-y-6">
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold font-mono">1</span>
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-700 font-medium">Acesse o painel do seu domínio</p>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Faça login onde você comprou seu domínio (GoDaddy, Registro.br, Hostgator, Cloudflare, etc.) e procure pela zona de <strong>DNS</strong>.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold font-mono">2</span>
                                <div className="space-y-3 w-full">
                                    <p className="text-sm text-slate-700 font-medium">Adicione um registro CNAME</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm group hover:border-indigo-300 transition-colors">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nome (Host)</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600"
                                                    onClick={() => copyToClipboard(hostName, 'host')}
                                                >
                                                    {copied === 'host' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                                </Button>
                                            </div>
                                            <div className="font-mono text-sm text-slate-700 font-semibold select-all break-all">{hostName}</div>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm group hover:border-indigo-300 transition-colors">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Valor (Aponta para)</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600"
                                                    onClick={() => copyToClipboard('cname.vercel-dns.com', 'value')}
                                                >
                                                    {copied === 'value' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                                </Button>
                                            </div>
                                            <div className="font-mono text-sm text-slate-700 font-semibold select-all">cname.vercel-dns.com</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold font-mono">3</span>
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-700 font-medium flex items-center gap-2">
                                        Aguarde a propagação
                                        <span className="inline-flex items-center gap-1 text-[10px] font-normal px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                            <Clock className="h-3 w-3" />
                                            Até 48h
                                        </span>
                                    </p>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Geralmente funciona em minutos, mas pode demorar. Se não funcionar imediatamente, volte mais tarde.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100 text-red-800 text-xs">
                                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold block mb-0.5">Erro "CNAME and other data"?</span>
                                        Isso significa que existe outro registro (Tipo A, TXT, etc.) com o mesmo nome <strong>{hostName}</strong>.
                                        Você precisa <strong>excluir</strong> o registro antigo antes de criar o CNAME.
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100 text-amber-800 text-xs">
                                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold block mb-0.5">Aviso Importante para Cloudflare</span>
                                        Se você usa a Cloudflare, certifique-se de definir o status do proxy para o registro CNAME como <strong>DNS Only</strong> (nuvem cinza), e não Proxy (nuvem laranja).
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

