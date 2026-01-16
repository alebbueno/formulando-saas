/**
 * UTM Parameter Tracking Utility
 * 
 * Captures UTM parameters from URL for campaign attribution.
 * Works with all ad platforms: Meta, Google, LinkedIn, TikTok, etc.
 */

export interface UTMData {
    utm_source: string | null
    utm_medium: string | null
    utm_campaign: string | null
    utm_content: string | null
    utm_term: string | null
    landing_page_url: string | null
    referrer: string | null
}

const UTM_STORAGE_KEY = 'utm_data'

/**
 * Captures UTM parameters from current URL and stores in sessionStorage
 * Call this on landing page load
 * 
 * @returns UTM data object or null if no UTM parameters found
 */
export function captureUTMParameters(): UTMData | null {
    if (typeof window === 'undefined') return null

    const params = new URLSearchParams(window.location.search)

    const utmData: UTMData = {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        utm_content: params.get('utm_content'),
        utm_term: params.get('utm_term'),
        landing_page_url: window.location.href,
        referrer: document.referrer || null
    }

    // Only store if at least one UTM parameter exists
    const hasUTMParams = Object.entries(utmData)
        .filter(([key]) => key.startsWith('utm_'))
        .some(([, value]) => value !== null)

    if (hasUTMParams) {
        try {
            sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData))
            console.log('✅ UTM parameters captured:', utmData)
        } catch (error) {
            console.error('Error storing UTM data:', error)
        }
    }

    return utmData
}

/**
 * Retrieves stored UTM parameters from sessionStorage
 * 
 * @returns Stored UTM data or null if none exists
 */
export function getStoredUTMParameters(): UTMData | null {
    if (typeof window === 'undefined') return null

    try {
        const stored = sessionStorage.getItem(UTM_STORAGE_KEY)
        return stored ? JSON.parse(stored) : null
    } catch (error) {
        console.error('Error reading UTM data:', error)
        return null
    }
}

/**
 * Clears stored UTM parameters
 * Call this after successful form submission
 */
export function clearUTMParameters(): void {
    if (typeof window === 'undefined') return

    try {
        sessionStorage.removeItem(UTM_STORAGE_KEY)
        console.log('✅ UTM parameters cleared')
    } catch (error) {
        console.error('Error clearing UTM data:', error)
    }
}
