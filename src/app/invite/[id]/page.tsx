import { getInvitation, acceptInvitation } from "@/actions/invitations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Building2, ArrowRight, Loader2 } from "lucide-react"
import { redirect } from "next/navigation"
import Image from "next/image"
import { InvitationForm } from "./invitation-form"

export default async function InvitePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const invitation = await getInvitation(id)

    if (!invitation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20">
                <Card className="w-full max-w-md border-border/50 shadow-lg">
                    <CardHeader className="text-center space-y-4 pb-10 pt-10">
                        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                            <span className="text-2xl">❌</span>
                        </div>
                        <CardTitle className="text-2xl">Convite Inválido</CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                            Este convite não existe ou já foi utilizado.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    if (invitation.status === 'accepted') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20">
                <Card className="w-full max-w-md border-border/50 shadow-lg">
                    <CardHeader className="text-center space-y-4 pb-10 pt-10">
                        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-500">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <CardTitle className="text-2xl">Convite já aceito</CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                            Você já faz parte deste time.
                        </CardDescription>
                        <div className="pt-4">
                            <Button asChild className="w-full bg-primary hover:bg-primary/90">
                                <a href="/dashboard">Ir para o Dashboard</a>
                            </Button>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-4 relative overflow-hidden">
            {/* Background elements to match branding */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -z-10" />

            <div className="mb-8 flex flex-col items-center gap-2">
                <div className="h-10 w-10 flex items-center justify-center shrink-0">
                    <Image
                        src="/icon-formulando.svg"
                        alt="Formulando Logo"
                        width={40}
                        height={40}
                        className="object-contain"
                    />
                </div>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                    Formulando
                </h1>
            </div>

            <Card className="w-full max-w-md border-border/50 shadow-xl bg-background/80 backdrop-blur-sm">
                <CardHeader className="space-y-1 text-center pb-8">
                    <CardTitle className="text-2xl font-bold">Convite para colaborar</CardTitle>
                    <CardDescription className="text-base">
                        Você foi convidado para participar de <span className="font-semibold text-foreground">{invitation.workspaces.length} workspace{invitation.workspaces.length !== 1 && 's'}</span>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-muted/50 rounded-lg p-4 border border-border/50 space-y-3">
                        <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Workspaces</div>
                        {invitation.workspaces.map((ws: any) => (
                            <div key={ws.id} className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                    <Building2 className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-medium text-sm">{ws.name}</span>
                            </div>
                        ))}
                    </div>

                    <InvitationForm invitation={invitation} />
                </CardContent>
            </Card>

            <p className="mt-6 text-xs text-center text-muted-foreground max-w-sm">
                Ao aceitar, você concorda com nossos Termos de Serviço e Política de Privacidade.
            </p>
        </div>
    )
}
