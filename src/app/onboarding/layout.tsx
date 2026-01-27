"use client"

import Image from "next/image"
import Link from "next/link"
import { OnboardingProvider } from "@/context/onboarding-context"

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <OnboardingProvider>
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-4xl">
                    <div className="absolute top-8 left-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 flex items-center justify-center">
                                <Image
                                    src="/icon-formulando.svg"
                                    alt="Formulando"
                                    width={32}
                                    height={32}
                                />
                            </div>
                            <span className="text-xl font-bold font-brand text-brand">
                                formulando.
                            </span>
                        </Link>
                    </div>
                    {children}
                </div>
            </div>
        </OnboardingProvider>
    )
}
