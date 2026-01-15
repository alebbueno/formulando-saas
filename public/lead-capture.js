/**
 * Lead Capture Script
 * 
 * Usage:
 * <script 
 *   src="https://your-domain.com/lead-capture.js" 
 *   data-workspace="YOUR_WORKSPACE_ID" 
 *   data-form-selector="form" (optional, default: "form")
 * ></script>
 */

(function () {
    // Configuration
    const CONFIG = {
        apiEndpoint: 'https://formulando-saas.vercel.app/api/leads/capture', // Replace with dynamic URL if possible or keep generic
        // If served from the app itself, we can use relative path if on same domain, but likely this is on a different domain.
        // For development, we might want to auto-detect.
    };

    // Auto-detect API endpoint if running locally or dev
    const scriptTag = document.currentScript;
    const src = scriptTag ? scriptTag.src : '';
    let baseUrl = '';

    try {
        const url = new URL(src);
        baseUrl = url.origin;
    } catch (e) {
        console.warn('Could not determine base URL from script src. Using default fallback.');
    }

    // Allow overriding via data-api-url (internal use) or default to the origin of the script
    const API_URL = scriptTag.getAttribute('data-api-url') || (baseUrl ? `${baseUrl}/api/leads/capture` : '/api/leads/capture');

    const WORKSPACE_ID = scriptTag.getAttribute('data-workspace');
    const FORM_SELECTOR = scriptTag.getAttribute('data-form-selector') || 'form';

    if (!WORKSPACE_ID) {
        console.error('Lead Capture: Missing data-workspace attribute on script tag.');
        return;
    }

    function init() {
        // Find all forms
        const forms = document.querySelectorAll(FORM_SELECTOR);

        forms.forEach(form => {
            // Check if we already attached to this form
            if (form.dataset.leadCaptureAttached) return;
            form.dataset.leadCaptureAttached = 'true';

            form.addEventListener('submit', (e) => {
                // We do NOT prevent default. We just capture and send.
                // However, if the form submits synchronously (page reload), we need to ensure data is sent.
                // fetch with keepalive: true is the modern solution.

                handleSubmission(form);
            });
        });
    }

    function handleSubmission(form) {
        const formData = new FormData(form);
        const data = {};

        // Extract basic fields
        // We look for common names
        const entries = formData.entries();
        for (const [key, value] of entries) {
            // Simple normalization of keys
            const lowerKey = key.toLowerCase();

            // Map common keys to our expected schema
            if (lowerKey === 'email' || lowerKey.includes('e-mail')) {
                data.email = value;
            } else if (lowerKey === 'name' || lowerKey === 'nome' || lowerKey === 'fullname' || lowerKey === 'full_name') {
                data.name = value;
            } else if (lowerKey === 'phone' || lowerKey === 'telephone' || lowerKey === 'tel' || lowerKey === 'telefone' || lowerKey === 'celular' || lowerKey === 'mobile') {
                data.phone = value;
            } else {
                // Collect other fields
                if (data[key]) {
                    // Handle multi-value fields (like checkboxes)
                    if (Array.isArray(data[key])) {
                        data[key].push(value);
                    } else {
                        data[key] = [data[key], value];
                    }
                } else {
                    data[key] = value;
                }
            }
        }

        // Add context
        data.workspace_id = WORKSPACE_ID;
        data.page_url = window.location.href;
        data.source = 'legacy_form';

        // Validation
        if (!data.email) {
            // Try to find email in "other" fields if not found by name
            for (const key in data) {
                if (typeof data[key] === 'string' && data[key].includes('@') && data[key].includes('.')) {
                    // Crudest email detection ever, but helpful fallback? 
                    // No, better to stick to explicit fields to avoid garbage.
                    // User requirement: "Se não houver email, o lead não é enviado."
                }
            }
        }

        if (!data.email) {
            console.warn('Lead Capture: No email field detected. Lead not sent.');
            return;
        }

        // Send data
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            keepalive: true, // Critical for forms that navigate
        }).catch(err => {
            console.error('Lead Capture Error:', err);
        });
    }

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
