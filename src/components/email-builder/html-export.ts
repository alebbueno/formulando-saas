import { EmailElementInstance } from "./types"
import { EmailElements } from "./elements"

const FONT_STACK = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
const BG_COLOR = '#f8fafc'

/**
 * Renders a single element to email-safe HTML, recursively rendering children and columns.
 */
function renderElement(element: EmailElementInstance): string {
    const def = EmailElements[element.type]
    if (!def) return `<!-- Unknown element type: ${element.type} -->`

    // Section children
    if (element.children && element.children.length > 0) {
        const childrenHtml = element.children.map(renderElement).join('\n')
        const withChildren = { ...element, _childrenHtml: childrenHtml } as any
        return def.toEmailHtml(withChildren)
    }

    // Column layout children (properties.columns: EmailElementInstance[][])
    if (element.properties?.columns && Array.isArray(element.properties.columns)) {
        const colHtmls = (element.properties.columns as EmailElementInstance[][]).map(
            col => col.map(renderElement).join('\n')
        )
        const withCols = { ...element, _colHtmls: colHtmls } as any
        return def.toEmailHtml(withCols)
    }

    return def.toEmailHtml(element)
}

/**
 * Converts an array of EmailElementInstance into a full email-safe HTML document.
 * Embeds the source JSON in an HTML comment for round-trip editing.
 */
export function exportEmailHtml(elements: EmailElementInstance[]): string {
    const blocksHtml = elements.map(renderElement).join('\n')

    // Encode source data for round-trip editing
    const builderData = btoa(unescape(encodeURIComponent(JSON.stringify(elements))))

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" style="font-family: ${FONT_STACK};">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Email</title>
    <!-- email-builder-data: ${builderData} -->
    <style type="text/css">
        body, td, div, p, a, span { font-family: ${FONT_STACK} !important; }
        @media only screen and (max-width: 620px) {
            .email-container { width: 100% !important; max-width: 100% !important; }
            .mobile-stack { display: block !important; width: 100% !important; margin-bottom: 16px !important; padding: 0 !important; }
            .mobile-hidden { display: none !important; }
        }
    </style>
</head>
<body style="width:100% !important;height:100%;margin:0;padding:0;background-color:${BG_COLOR};-webkit-text-size-adjust:none;color:#334155;">

    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;background-color:${BG_COLOR};">
        <tr>
            <td align="center" style="padding:40px 0;">
                <table class="email-container" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="padding:0;">
${blocksHtml}
                        </td>
                    </tr>
                </table>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
                    <tr>
                        <td align="center" style="padding-top:24px;">
                            <p style="margin:0;font-size:12px;color:#94a3b8;">&copy; ${new Date().getFullYear()} {{workspace.name}}. Todos os direitos reservados.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

</body>
</html>`
}

/**
 * Extracts EmailElementInstance[] from an HTML string that was previously
 * exported by exportEmailHtml. Returns null if no builder data is found.
 */
export function extractBuilderDataFromHtml(html: string): EmailElementInstance[] | null {
    const match = html.match(/<!--\s*email-builder-data:\s*([A-Za-z0-9+/=]+)\s*-->/)
    if (!match) return null
    try {
        const json = decodeURIComponent(escape(atob(match[1])))
        return JSON.parse(json) as EmailElementInstance[]
    } catch {
        return null
    }
}
