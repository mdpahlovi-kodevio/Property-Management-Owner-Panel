import {
    Calendar1,
    CircleCheck,
    CreditCard,
    FileText,
    Headphones,
    House,
    IdCardLanyard,
    LayoutDashboard,
    MessageCircleMore,
    ShieldUser,
    Star,
    User,
    type LucideIcon,
} from 'lucide-react'
import type { ModuleKey } from './module'

/**
 * Icon mapping for each module. Keyed by ModuleKey so the type system enforces
 * that every module has an icon. Add a new entry here when you add a module.
 */
export const MODULE_ICONS: Record<ModuleKey, LucideIcon> = {
    dashboard: LayoutDashboard,
    reservations: CircleCheck,
    calendar: Calendar1,
    inbox: MessageCircleMore,
    properties: House,
    users: User,
    payments: CreditCard,
    'channel-manager': CircleCheck,
    employees: IdCardLanyard,
    'role-management': ShieldUser,
    reviews: Star,
    reports: FileText,
    support: Headphones,
}
