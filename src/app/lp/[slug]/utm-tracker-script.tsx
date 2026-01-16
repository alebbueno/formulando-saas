"use client"

import { useEffect } from "react"
import { captureUTMParameters } from "@/lib/utm-tracker"

/**
 * Client component that captures UTM parameters on page load
 * Should be included in landing pages to track campaign attribution
 */
export function UTMTrackerScript() {
    useEffect(() => {
        // Capture UTM parameters when page loads
        captureUTMParameters()
    }, [])

    return null
}
