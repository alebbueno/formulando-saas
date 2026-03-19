import { EmailElementDefinition, EmailElementType } from "../types"
import { EmailSectionElement } from "./email-section"
import { EmailColumns2Element } from "./email-columns2"
import { EmailColumns3Element } from "./email-columns3"
import { EmailDividerElement } from "./email-divider"
import { EmailSpacerElement } from "./email-spacer"
import { EmailHeadingElement } from "./email-heading"
import { EmailTextElement } from "./email-text"
import { EmailImageElement } from "./email-image"
import { EmailButtonElement } from "./email-button"
import { EmailBulletListElement } from "./email-bullet-list"
import { EmailSocialLinksElement } from "./email-social-links"
import { EmailHeaderElement } from "./email-header"
import { EmailFooterElement } from "./email-footer"
import { EmailBannerElement } from "./email-banner"
import { EmailQuoteElement } from "./email-quote"

export const EmailElements: Record<EmailElementType, EmailElementDefinition> = {
    'email-section': EmailSectionElement,
    'email-columns2': EmailColumns2Element,
    'email-columns3': EmailColumns3Element,
    'email-divider': EmailDividerElement,
    'email-spacer': EmailSpacerElement,
    'email-heading': EmailHeadingElement,
    'email-text': EmailTextElement,
    'email-image': EmailImageElement,
    'email-button': EmailButtonElement,
    'email-bullet-list': EmailBulletListElement,
    'email-social-links': EmailSocialLinksElement,
    'email-header': EmailHeaderElement,
    'email-footer': EmailFooterElement,
    'email-banner': EmailBannerElement,
    'email-quote': EmailQuoteElement,
}
