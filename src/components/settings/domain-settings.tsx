"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useWorkspace } from "@/context/workspace-context"
import { getDomains } from "@/actions/domain-actions"
import { DomainList } from "@/components/dashboard/domains/domain-list"
import { AddDomainModal } from "@/components/dashboard/domains/add-domain-modal"
import { Globe, Plus } from "lucide-react"

export function DomainSettings({ minimal = false }: { minimal?: boolean }) {
    const { activeWorkspace } = useWorkspace()
    const [domains, setDomains] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    const fetchDomains = async () => {
        if (!activeWorkspace?.id) return
        setIsLoading(true)
        const result = await getDomains(activeWorkspace.id)
        if (result.success) {
            setDomains(result.data || [])
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchDomains()
    }, [activeWorkspace?.id])

    return (
        <div className="space-y-6">
            {!minimal && (
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium">Domínios de E-mail</h3>
                        <p className="text-sm text-muted-foreground">
                            Configure domínios personalizados para enviar e-mails com sua própria identidade.
                        </p>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Domínio
                    </Button>
                </div>
            )}

            {minimal ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Seus Domínios</h4>
                        <Button size="sm" variant="outline" onClick={() => setIsAddModalOpen(true)}>
                            <Plus className="mr-2 h-3 w-3" />
                            Novo
                        </Button>
                    </div>
                    <DomainList 
                        domains={domains} 
                        isLoading={isLoading} 
                        onRefresh={fetchDomains} 
                    />
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" />
                            <CardTitle>Seus Domínios</CardTitle>
                        </div>
                        <CardDescription>
                            Gerencie os domínios conectados ao seu workspace.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DomainList 
                            domains={domains} 
                            isLoading={isLoading} 
                            onRefresh={fetchDomains} 
                        />
                    </CardContent>
                </Card>
            )}

            <AddDomainModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSuccess={fetchDomains}
                workspaceId={activeWorkspace?.id || ""}
            />
        </div>
    )
}
