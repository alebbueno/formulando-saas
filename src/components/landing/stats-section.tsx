"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const stats = [
    {
      value: "50K+",
      label: "Formulários criados",
      suffix: "",
    },
    {
      value: "10M+",
      label: "Respostas coletadas",
      suffix: "",
    },
    {
      value: "99.9%",
      label: "Uptime garantido",
      suffix: "",
    },
    {
      value: "150+",
      label: "Países atendidos",
      suffix: "",
    },
  ]

  return (
    <section ref={sectionRef} className="py-16 lg:py-20 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                "text-center transition-all duration-700 delay-100",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="relative inline-block mb-2">
                <div className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                {/* Decorative element */}
                <div className="absolute -inset-2 bg-purple-100 rounded-lg -z-10 opacity-20" />
              </div>
              <p className="text-sm lg:text-base text-gray-600 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={cn(
          "text-center transition-all duration-700 delay-400",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <p className="text-gray-700 font-medium mb-4">
            Junte-se a milhares de empresas que já confiam no Formulando
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-800 hover:to-purple-700 transition-all hover:shadow-lg hover:scale-105"
          >
            Começar Gratuitamente
          </Link>
        </div>
      </div>
    </section>
  )
}

