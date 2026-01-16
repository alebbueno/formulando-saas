import { getInvitation, acceptInvitation } from "@/actions/invitations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Building2, ArrowRight, Loader2 } from "lucide-react"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { InvitationForm } from "./invitation-form"

export default async function InvitePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const invitation = await getInvitation(id)

    if (!invitation) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 relative overflow-hidden px-4">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2" />

                <Card className="w-full max-w-md relative z-10 border-gray-200 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center space-y-4 pb-10 pt-10">
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                            <span className="text-2xl">❌</span>
                        </div>
                        <CardTitle className="text-2xl font-bold">Convite Inválido</CardTitle>
                        <CardDescription className="text-base text-gray-600">
                            Este convite não existe ou já foi utilizado.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    if (invitation.status === 'accepted') {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 relative overflow-hidden px-4">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2" />

                <Card className="w-full max-w-md relative z-10 border-gray-200 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center space-y-4 pb-10 pt-10">
                        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4 text-emerald-600">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Convite já aceito</CardTitle>
                        <CardDescription className="text-base text-gray-600">
                            Você já faz parte deste time.
                        </CardDescription>
                        <div className="pt-4">
                            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                                <a href="/dashboard">Ir para o Dashboard</a>
                            </Button>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 relative overflow-hidden px-4">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2" />

            <div className="w-full max-w-md relative z-10 flex flex-col items-center">
                {/* Logo */}
                <Link href="/" className="mb-8 flex items-center gap-2 group">
                    <div className="w-10 h-10 flex items-center justify-center transition-all group-hover:scale-110">
                        <Image
                            src="/icon-formulando.svg"
                            alt="Formulando"
                            width={40}
                            height={40}
                            className="w-full h-full"
                        />
                    </div>
                    <span className="text-2xl font-bold font-brand" style={{ color: '#8831d2' }}>
                        formulando.
                    </span>
                </Link>

                <Card className="w-full border-gray-200 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="space-y-1 text-center pb-8">
                        <CardTitle className="text-2xl font-bold">Convite para colaborar</CardTitle>
                        <CardDescription className="text-base text-gray-600">
                            Você foi convidado para participar de <span className="font-semibold text-gray-900">{invitation.workspaces.length} workspace{invitation.workspaces.length !== 1 && 's'}</span>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 space-y-3">
                            <div className="text-xs font-semibold uppercase text-purple-600 tracking-wider mb-2">Workspaces</div>
                            {invitation.workspaces.map((ws: any) => (
                                <div key={ws.id} className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-md bg-purple-100 flex items-center justify-center shrink-0">
                                        <Building2 className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <span className="font-medium text-sm text-gray-700">{ws.name}</span>
                                </div>
                            ))}
                        </div>

                        <InvitationForm invitation={invitation} />
                    </CardContent>
                </Card>

                <p className="mt-6 text-xs text-center text-gray-500 max-w-sm">
                    Ao aceitar, você concorda com nossos Termos de Serviço e Política de Privacidade.
                </p>
            </div>
        </div>
    )
}
