import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { LPRenderer } from "@/components/lp-builder/lp-renderer"
import { LPElement } from "@/components/lp-builder/types"
import { Metadata } from "next"

interface LPPublicPageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateMetadata(props: LPPublicPageProps): Promise<Metadata> {
    const params = await props.params
    const { slug } = params
    const supabase = await createClient()

    const { data: landingPage } = await supabase
        .from("landing_pages")
        .select("name, settings")
        .eq("slug", slug)
        .eq("is_published", true)
        .single()

    if (!landingPage) {
        return {
            title: "Landing Page não encontrada"
        }
    }

    const settings = landingPage.settings || {}

    return {
        title: settings.seoTitle || landingPage.name,
        description: settings.seoDescription || `Landing Page: ${landingPage.name}`,
        icons: {
            icon: settings.favicon || '/icon-formulando.png'
        }
    }
}

export default async function LPPublicPage(props: LPPublicPageProps) {
    const params = await props.params
    const { slug } = params
    const supabase = await createClient()

    // Fetch published landing page
    const { data: landingPage, error } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single()

    if (error || !landingPage) {
        notFound()
    }

    const elements = (landingPage.content || []) as LPElement[]
    const settings = landingPage.settings || {}

    return (
        <div className="min-h-screen bg-white">
            {/* Google Analytics */}
            {settings.googleAnalyticsId && (
                <>
                    <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`} />
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.googleAnalyticsId}');
              `,
                        }}
                    />
                </>
            )}

            {/* Facebook Pixel */}
            {settings.facebookPixelId && (
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${settings.facebookPixelId}');
              fbq('track', 'PageView');
            `,
                    }}
                />
            )}

            {/* Custom Scripts */}
            {settings.customHeadScripts && (
                <div dangerouslySetInnerHTML={{ __html: settings.customHeadScripts }} />
            )}

            <LPRenderer elements={elements} />
        </div>
    )
}
