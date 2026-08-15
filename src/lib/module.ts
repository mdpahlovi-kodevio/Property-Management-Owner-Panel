/**
 * Single source of truth for module identifiers, paths, and permissions.
 *
 * Each entry owns:
 *  - key:         kebab-case key (used for i18n namespaces, API payloads, permission map)
 *  - path:        the URL the module lives at
 *  - permissions: the set of permission keys valid for this module
 *  - compact:     whether the module is surfaced in compact (owner oversight) mode
 *  - hiddenWhen:  optional predicate (receives the current user) that hides the module
 *                 from sidebar/permission matrix when it returns true
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

import type { Session } from '@/lib/api'

// ---------- 1. Canonical permission keys (kebab-case, API-friendly) ----------
export const COMMON_PERMISSIONS = ['create', 'update'] as const

// ---------- 2. Module registry ----------
type ModuleEntry = {
    path: string
    permissions: readonly string[]
    compact: boolean
    hiddenWhen?: (user: Session['user']) => boolean
}

export const MODULES: { [K in string]: ModuleEntry } = {
    dashboard: {
        path: '/',
        permissions: ['stat-cards', 'revenue-overview', 'recent-bookings'],
        compact: true,
    },
    analytics: {
        path: '/analytics',
        permissions: ['view'],
        compact: true,
    },
    reservations: {
        path: '/reservations',
        permissions: COMMON_PERMISSIONS,
        compact: true,
    },
    calendar: {
        path: '/calendar',
        permissions: COMMON_PERMISSIONS,
        compact: true,
    },
    inbox: {
        path: '/inbox',
        permissions: COMMON_PERMISSIONS,
        compact: true,
    },
    properties: {
        path: '/property',
        permissions: COMMON_PERMISSIONS,
        compact: false,
    },
    users: {
        path: '/user-management',
        permissions: COMMON_PERMISSIONS,
        compact: false,
    },
    payments: {
        path: '/payments',
        permissions: COMMON_PERMISSIONS,
        compact: true,
    },
    'channel-manager': {
        path: '/channel-manager',
        permissions: COMMON_PERMISSIONS,
        compact: false,
    },
    employees: {
        path: '/employees',
        permissions: COMMON_PERMISSIONS,
        compact: false,
    },
    'role-management': {
        path: '/role-management',
        permissions: COMMON_PERMISSIONS,
        compact: false,
    },
    managers: {
        path: '/manager',
        permissions: COMMON_PERMISSIONS,
        compact: false,
        hiddenWhen: (user) => user.isManager === true,
    },
    reviews: {
        path: '/reviews',
        permissions: COMMON_PERMISSIONS,
        compact: true,
    },
    reports: {
        path: '/reports',
        permissions: ['export'],
        compact: true,
    },
    support: {
        path: '/support',
        permissions: COMMON_PERMISSIONS,
        compact: true,
    },
    guestSupport: {
        path: '/guest-support',
        permissions: COMMON_PERMISSIONS,
        compact: false,
    },
} as const

// ---------- 3. Types ----------
export type ModuleKey = keyof typeof MODULES
export type ModuleConfig<M extends ModuleKey = ModuleKey> = (typeof MODULES)[M]
export type ModulePath<M extends ModuleKey = ModuleKey> = (typeof MODULES)[M]['path']
export type ModulePermission<M extends ModuleKey = ModuleKey> = (typeof MODULES)[M]['permissions'][number]

// ---------- 4. Iteration / lookup helpers ----------
export const MODULE_KEYS = Object.keys(MODULES)

/** Modules surfaced in compact ("owner oversight") mode. */
export const COMPACT_MODULE_KEYS = MODULE_KEYS.filter((key) => MODULES[key].compact)

/** Returns true when the module should be hidden for the given user. */
export const isModuleHidden = (key: ModuleKey, user: Session['user']): boolean => MODULES[key].hiddenWhen?.(user) ?? false

export const getModule = <M extends ModuleKey>(key: M): (typeof MODULES)[M] => MODULES[key]

export const getModuleByPath = (path: string): ModuleKey | undefined => MODULE_KEYS.find((key) => MODULES[key].path === path)
