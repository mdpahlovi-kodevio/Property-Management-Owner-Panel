import type { Session } from '@/lib/api/auth'
import { redirect } from '@tanstack/react-router'
import type { ModuleKey } from './module'
import { getModuleByPath, MODULES } from './module'

/** 'stat-cards' -> 'Stat Cards'. Used for permission checkbox labels. */
export const formatPermission = (key: string): string =>
    key
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')

/** Resolves the ModuleKey associated with a given path, handling segments. */
export const getModuleKeyFromPath = (path: string): ModuleKey | undefined => {
    const cleanPath = path.split('?')[0].replace(/\/$/, '') || '/'

    // Segment-based matching for standard modules
    const segments = cleanPath.split('/').filter(Boolean)
    for (let i = segments.length; i > 0; i--) {
        const prefixPath = '/' + segments.slice(0, i).join('/')
        const key = getModuleByPath(prefixPath)
        if (key) {
            return key
        }
    }

    // Only match dashboard if path is exactly '/'
    if (cleanPath === '/') {
        return 'dashboard'
    }

    return undefined
}

/** Check if the user has access to a specific route based on their module permissions. */
export const hasRoutePermission = (user: Session['user'], path: string): boolean => {
    // Super Admin (isDefault) bypasses all permission checks
    if (user?.isDefault) {
        return true
    }

    const moduleKey = getModuleKeyFromPath(path)
    if (!moduleKey) {
        // If the path doesn't map to any registered module, it is publicly/generally accessible
        return true
    }

    const userPermissions = user?.permissions
    if (!Array.isArray(userPermissions)) {
        return false
    }

    return userPermissions.some((p: any) => p && typeof p === 'object' && p.module === moduleKey)
}

/** Enforces route permission constraints, redirecting unauthorized users. */
export const checkRoutePermission = (user: Session['user'], path: string) => {
    if (!hasRoutePermission(user, path)) {
        // Find the first module key they do have access to
        const firstAllowedModule = user?.permissions?.find((p: any) => p && typeof p === 'object' && p.module)?.module

        if (firstAllowedModule && MODULES[firstAllowedModule as ModuleKey]) {
            throw redirect({ to: MODULES[firstAllowedModule as ModuleKey].path })
        }

        throw redirect({ to: '/settings' })
    }
}
