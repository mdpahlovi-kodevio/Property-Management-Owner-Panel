import {
    Building2,
    CalendarDays,
    Contact,
    Globe,
    Headphones,
    LayoutDashboard,
    PieChart,
    ShieldAlert,
    UserCheck,
    Users,
    type LucideIcon,
} from 'lucide-react'
import type { ModuleKey } from './module'

/**
 * Icon mapping for each module. Keyed by ModuleKey so the type system enforces
 * that every module has an icon. Add a new entry here when you add a module.
 */
export const MODULE_ICONS: Record<ModuleKey, LucideIcon> = {
    dashboard: LayoutDashboard,
    users: Users,
    'property-owners': UserCheck,
    properties: Building2,
    reservations: CalendarDays,
    'website-builder': Globe,
    employees: Contact,
    'role-management': ShieldAlert,
    reports: PieChart,
    support: Headphones,
}
