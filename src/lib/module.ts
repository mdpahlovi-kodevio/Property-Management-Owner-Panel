/**
 * Single source of truth for module identifiers, paths, and permissions.
 *
 * Each entry owns:
 *  - key:         kebab-case key (used for i18n namespaces, API payloads, permission map)
 *  - path:        the URL the module lives at
 *  - permissions: the set of permission keys valid for this module
 *
 * Order in MODULES = order in the sidebar / role matrix / form-module-map.
 *
 * To add a module:
 *   1. Add an entry here (key, path, permissions).
 *   2. Add a translation namespace in each locale:
 *        `<key>.title`, `<key>.description`, `navigation.<key>`.
 *   3. Create a route file at the matching `path` under `src/routes/__main/`.
 *   4. Add an icon for it in `src/lib/module-icons.tsx`.
 *
 * Consumers (all derived — never duplicate the list elsewhere):
 *   - `app-sidebar.tsx`           → sidebar links
 *   - `__main/route.tsx`          → breadcrumb labels
 *   - `form-module-map.tsx`       → role permission matrix
 *   - `permission.tsx`            → hasRoutePermission
 */

// ---------- 1. Canonical permission keys (kebab-case, API-friendly) ----------
export const COMMON_PERMISSIONS = ['create', 'update'] as const

// ---------- 2. Module registry ----------
export const MODULES = {
    dashboard: {
        path: '/',
        permissions: ['stat-cards', 'revenue-overview', 'recent-bookings'],
    },
    users: {
        path: '/users',
        permissions: COMMON_PERMISSIONS,
    },
    'property-owners': {
        path: '/property-owners',
        permissions: COMMON_PERMISSIONS,
    },
    properties: {
        path: '/properties',
        permissions: COMMON_PERMISSIONS,
    },
    reservations: {
        path: '/reservations',
        permissions: COMMON_PERMISSIONS,
    },
    'website-builder': {
        path: '/website-builder',
        permissions: [...COMMON_PERMISSIONS, 'publish'],
    },
    employees: {
        path: '/employees',
        permissions: COMMON_PERMISSIONS,
    },
    'role-management': {
        path: '/role-management',
        permissions: COMMON_PERMISSIONS,
    },
    reports: {
        path: '/reports',
        permissions: ['export'],
    },
    support: {
        path: '/support',
        permissions: [...COMMON_PERMISSIONS, 'reply'],
    },
} as const

// ---------- 3. Types ----------
export type ModuleKey = keyof typeof MODULES
export type ModuleConfig<M extends ModuleKey = ModuleKey> = (typeof MODULES)[M]
export type ModulePath<M extends ModuleKey = ModuleKey> = (typeof MODULES)[M]['path']
export type ModulePermission<M extends ModuleKey = ModuleKey> = (typeof MODULES)[M]['permissions'][number]

// ---------- 4. Iteration / lookup helpers ----------
export const MODULE_KEYS = Object.keys(MODULES) as ModuleKey[]

export const getModule = <M extends ModuleKey>(key: M): (typeof MODULES)[M] => MODULES[key]

export const getModuleByPath = (path: string): ModuleKey | undefined =>
    (MODULE_KEYS as ModuleKey[]).find((key) => MODULES[key].path === path)
