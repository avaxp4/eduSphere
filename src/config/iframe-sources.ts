export interface IframeSource {
    name: string;
    urlPattern: RegExp | string;
    description?: string;
    examples?: string[];
}

export const ALLOWED_IFRAME_SOURCES: IframeSource[] = [
    {
        name: 'Google Maps',
        urlPattern: /^https:\/\/www\.google\.com\/maps\/embed(\?.*)?$/,
        description: 'خرائط جوجل المضمنة'
    },
    {
        name: 'Google Forms',
        urlPattern: /^https:\/\/docs\.google\.com\/forms\/d\/e\/[^/]+\/viewform(\?.*)?$/,
        description: 'نماذج جوجل المضمنة'
    },
    {
        name: 'Google Drive (Presentations, Documents, Sheets)',
        urlPattern: /^https:\/\/docs\.google\.com\/(presentation|document|spreadsheets)\/d\/[^/]+\/(preview|edit|pub)(\?.*)?$/,
        description: 'عروض ومستندات جوجل المضمنة',
    },
    {
        name: 'YouTube Embed',
        urlPattern: /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]{11}(\?.*)?$/,
        description: 'فيديوهات يوتيوب المضمنة',
    }
];

export function isValidIframeUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
        return false;
    }

    return ALLOWED_IFRAME_SOURCES.some(source => {
        if (typeof source.urlPattern === 'string') {
            return url.includes(source.urlPattern);
        }
        return source.urlPattern.test(url);
    });
}

export function getIframeSourceInfo(url: string): IframeSource | null {
    const source = ALLOWED_IFRAME_SOURCES.find(s => {
        if (typeof s.urlPattern === 'string') {
            return url.includes(s.urlPattern);
        }
        return s.urlPattern.test(url);
    });

    return source || null;
}

export function getAllowedSourceNames(): string[] {
    return ALLOWED_IFRAME_SOURCES.map(s => s.name);
}

