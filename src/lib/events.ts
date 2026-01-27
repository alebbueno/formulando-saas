export type EventName =
    | 'onboarding_started'
    | 'post_signup_screen_viewed'
    | 'workspace_usage_selected'
    | 'workspace_name_filled'
    | 'workspace_goal_selected'
    | 'workspace_created'
    | 'first_action_screen_viewed'
    | 'first_action_selected'
    | 'ai_form_suggestion_shown'
    | 'ai_form_accepted'
    | 'ai_form_declined'
    | 'form_published'
    | 'form_link_copied'
    | 'form_embed_copied'
    | 'first_lead_received'
    | 'kanban_viewed_after_lead'
    | 'ai_qualification_prompt_shown'
    | 'ai_qualification_enabled'
    | 'onboarding_checklist_viewed'
    | 'onboarding_completed';

export function trackEvent(eventName: EventName, properties?: Record<string, any>) {
    // In development, we just log to console
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Analytics] ${eventName}`, properties);
    }

    // TODO: Integrate with real analytics provider (Mixpanel, Posthog, etc.)
    // if (window.analytics) window.analytics.track(eventName, properties);
}
