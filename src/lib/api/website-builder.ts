import { request } from './base'

// ── Shapes returned by the backend ────────────────────────────────────────

export type WebsiteStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface Website {
    id: string
    ownerId: string
    name: string
    description: string | null
    themeVars: Record<string, string>
    layout: { navbar?: any; footer?: any }
    pages: Record<string, any>
    status: WebsiteStatus
    publishedSnapshot: any
    subdomain: string
    customDomain: string | null
    domainStatus: 'PENDING' | 'VERIFIED' | 'FAILED'
    publishedAt: string | null
    createdAt: string
    updatedAt: string
}

// ── API surface ───────────────────────────────────────────────────────────

export const websiteBuilderApi = {
    listPageLess: () => request<{ data: Website[] }>(`/owner/website-builder/page-less`),
}
