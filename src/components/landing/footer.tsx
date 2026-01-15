"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Linkedin, Twitter, Youtube, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 flex items-center justify-center transition-all group-hover:scale-110">
                <img 
                  src="/icon-formulando.svg" 
                  alt="Formulando" 
                  className="w-full h-full"
                />
              </div>
              <span className="text-lg font-bold font-brand" style={{ color: '#8831d2' }}>
                formulando.
              </span>
            </Link>
            <p className="text-gray-600 text-sm mb-6 max-w-md leading-relaxed">
              Plataforma poderosa que ajuda você a criar formulários profissionais,
              páginas de captura e pesquisas interativas com facilidade.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-gray-600" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 text-gray-600" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4 text-gray-600" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 text-gray-600" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Empresa</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#sobre"
                  className="text-sm text-gray-600 hover:text-purple-700 transition-colors flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Sobre Nós
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="#carreiras"
                  className="text-sm text-gray-600 hover:text-purple-700 transition-colors flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Carreiras
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="#contato"
                  className="text-sm text-gray-600 hover:text-purple-700 transition-colors flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Contato
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="#blog"
                  className="text-sm text-gray-600 hover:text-purple-700 transition-colors flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Blog
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Produto</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#recursos"
                  className="text-sm text-gray-600 hover:text-purple-700 transition-colors flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Recursos
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="#precos"
                  className="text-sm text-gray-600 hover:text-purple-700 transition-colors flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Preços
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="#templates"
                  className="text-sm text-gray-600 hover:text-purple-700 transition-colors flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Templates
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="#integracoes"
                  className="text-sm text-gray-600 hover:text-purple-700 transition-colors flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Integrações
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Recursos</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#ajuda"
                  className="text-sm text-gray-600 hover:text-purple-700 transition-colors flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Central de Ajuda
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="#documentacao"
                  className="text-sm text-gray-600 hover:text-purple-700 transition-colors flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Documentação
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="#api"
                  className="text-sm text-gray-600 hover:text-purple-700 transition-colors flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    API
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="#comunidade"
                  className="text-sm text-gray-600 hover:text-purple-700 transition-colors flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Comunidade
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="max-w-md">
            <h3 className="font-semibold text-gray-900 mb-2">
              Assine nossa newsletter
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Fique por dentro das nossas últimas novidades e ofertas.
            </p>
            <form className="flex gap-2">
              <Input
                type="email"
                placeholder="Seu e-mail"
                className="flex-1 bg-white border-2 focus:border-purple-500"
              />
              <Button
                type="submit"
                className={cn(
                  "bg-gradient-to-r from-purple-700 to-purple-500",
                  "hover:from-purple-800 hover:to-purple-600",
                  "text-white border-0 shadow-lg shadow-purple-500/25",
                  "hover:shadow-purple-500/40 hover:scale-105 transition-all"
                )}
              >
                Assinar
              </Button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} Formulando. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <Link
                href="#privacidade"
                className="text-sm text-gray-600 hover:text-purple-700 transition-colors"
              >
                Política de Privacidade
              </Link>
              <Link
                href="#termos"
                className="text-sm text-gray-600 hover:text-purple-700 transition-colors"
              >
                Termos de Serviço
              </Link>
              <Link
                href="#cookies"
                className="text-sm text-gray-600 hover:text-purple-700 transition-colors"
              >
                Política de Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

