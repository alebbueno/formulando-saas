export type LPElementType =
    | 'section'
    | 'container'
    | '2-col'
    | '3-col'
    | 'column'
    | 'heading'
    | 'text'
    | 'button'
    | 'image'
    | 'form'
    | 'video'
    | 'social'
    | 'custom-html'
    | 'rich-text';

export interface LPElement {
    id: string;
    type: LPElementType;
    styles?: Record<string, any>; // CSS properties or custom style object
    content?: string; // for text/heading
    url?: string; // for images/links
    children?: LPElement[]; // for containers/sections
    properties?: Record<string, any>; // extra props (e.g. formId)
    responsiveStyles?: {
        mobile?: Record<string, any>;
        tablet?: Record<string, any>;
        desktop?: Record<string, any>;
    };
}

export type LPDesignerMode = 'builder' | 'preview';
