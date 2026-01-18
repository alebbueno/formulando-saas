"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Menu, X, ChevronDown, LayoutDashboard, LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"

export function Navbar() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
    router.refresh()
  }

  const getUserName = () => {
    if (!user) return ""
    // Try to get name from metadata first, fallback to email
    return user.user_metadata?.name || user.email?.split("@")[0] || "Usuário"
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 lg:pt-6">
      <nav
        className={cn(
          "max-w-7xl mx-auto rounded-2xl transition-all duration-300",
          "bg-white/90 backdrop-blur-xl border border-gray-200",
          scrolled
            ? "shadow-lg shadow-gray-200/50"
            : "shadow-md shadow-gray-200/30"
        )}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-8 h-8 flex items-center justify-center transition-all group-hover:scale-110">
                <img
                  src="/icon-formulando.svg"
                  alt="Formulando"
                  className="w-full h-full"
                />
              </div>
              <span className="text-lg font-bold hidden sm:block font-brand" style={{ color: '#8831d2' }}>
                formulando.
              </span>
            </Link>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              <Link
                href="/#funcionalidades"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all"
              >
                Funcionalidades
              </Link>

              <Link
                href="/#automacoes"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all"
              >
                Automações
              </Link>

              <Link
                href="/#integracoes"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all"
              >
                Integrações
              </Link>

              <Link
                href="/precos"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all"
              >
                Preços
              </Link>

              <Link
                href="/faq"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all"
              >
                FAQ
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {!loading && (
                <>
                  {user ? (
                    // User is logged in - show greeting and dropdown menu
                    <div className="flex items-center gap-3">
                      <span className="hidden md:inline text-sm text-gray-700 font-medium">
                        Olá, <span className="text-purple-700 font-semibold">{getUserName()}</span>
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className={cn(
                              "bg-gradient-to-r from-purple-700 to-purple-600",
                              "hover:from-purple-800 hover:to-purple-700",
                              "text-white shadow-md hover:shadow-lg",
                              "transition-all flex items-center gap-2"
                            )}
                          >
                            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">Minha Conta</span>
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/account" className="cursor-pointer flex items-center gap-2">
                              <LayoutDashboard className="w-4 h-4" />
                              Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={handleLogout}
                            className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600"
                          >
                            <LogOut className="w-4 h-4" />
                            Sair
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    // User is not logged in - show login and signup buttons
                    <>
                      <Button
                        variant="ghost"
                        asChild
                        className="hidden sm:flex text-gray-700 hover:text-purple-700 hover:bg-purple-50"
                      >
                        <Link href="/login">Entrar</Link>
                      </Button>
                      <Button
                        asChild
                        className={cn(
                          "bg-transparent border-2 border-purple-600 text-purple-700",
                          "hover:bg-purple-50",
                          "transition-all"
                        )}
                      >
                        <Link href="/signup">Começar Agora</Link>
                      </Button>
                    </>
                  )}
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200 animate-in slide-in-from-top duration-200">
              <div className="flex flex-col gap-2">
                <Link
                  href="/#funcionalidades"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Funcionalidades
                </Link>
                <Link
                  href="/#automacoes"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Automações
                </Link>
                <Link
                  href="/#integracoes"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Integrações
                </Link>
                <Link
                  href="/precos"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Preços
                </Link>
                <Link
                  href="/faq"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </Link>

                {/* Mobile Auth Buttons */}
                {!loading && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    {user ? (
                      <>
                        <div className="px-4 py-3 bg-purple-50 rounded-lg mb-2">
                          <p className="text-xs text-gray-600">Bem-vindo,</p>
                          <p className="text-sm font-semibold text-purple-700">{getUserName()}</p>
                        </div>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors mb-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout()
                            setMobileMenuOpen(false)
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Sair
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors block"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Entrar
                        </Link>
                        <Link
                          href="/signup"
                          className="mt-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-700 to-purple-600 rounded-lg hover:from-purple-800 hover:to-purple-700 transition-all block text-center"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Começar Agora
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}

