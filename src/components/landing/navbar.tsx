"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Menu, X, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
              {/* Produto Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all">
                    Produto
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="#recursos" className="cursor-pointer">
                      Recursos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="#templates" className="cursor-pointer">
                      Templates
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="#integracoes" className="cursor-pointer">
                      Integrações
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Recursos Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all">
                    Recursos
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="#blog" className="cursor-pointer">
                      Blog
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="#documentacao" className="cursor-pointer">
                      Documentação
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="#ajuda" className="cursor-pointer">
                      Central de Ajuda
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href="#empresa"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all"
              >
                Empresa
              </Link>
              
              <Link
                href="#precos"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all"
              >
                Preços
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
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
                  href="#recursos"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Recursos
                </Link>
                <Link
                  href="#solucoes"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Soluções
                </Link>
                <Link
                  href="#templates"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Templates
                </Link>
                <Link
                  href="#empresa"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Empresa
                </Link>
                <Link
                  href="#precos"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Preços
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}

