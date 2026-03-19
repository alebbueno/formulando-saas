"use client"

import { useState, useEffect, useCallback } from "react"
import { EmailHistoryTable } from "@/components/emails/email-history-table"
import { getEmailLogs } from "@/actions/email-logs"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HistoryClientWrapperProps {
    workspaceId: string
    initialData: {
        logs: any[]
        count: number
        totalPages: number
    }
}

export function HistoryClientWrapper({ workspaceId, initialData }: HistoryClientWrapperProps) {
    const [logs, setLogs] = useState(initialData.logs)
    const [count, setCount] = useState(initialData.count)
    const [totalPages, setTotalPages] = useState(initialData.totalPages)
    const [currentPage, setCurrentPage] = useState(1)
    const [isLoading, setIsLoading] = useState(false)

    const fetchLogs = useCallback(async (page: number) => {
        setIsLoading(true)
        try {
            const result = await getEmailLogs(workspaceId, page)
            if (result.success && result.logs) {
                setLogs(result.logs)
                setCount(result.count)
                setTotalPages(result.totalPages)
            }
        } catch (error) {
            console.error("Error fetching logs:", error)
        } finally {
            setIsLoading(false)
        }
    }, [workspaceId])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        fetchLogs(page)
    }

    const handleRefresh = () => {
        fetchLogs(currentPage)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    Atualizar
                </Button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-muted/5 rounded-lg border border-dashed">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-sm text-muted-foreground animate-pulse">Carregando histórico...</p>
                </div>
            ) : (
                <EmailHistoryTable 
                    logs={logs}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    )
}
