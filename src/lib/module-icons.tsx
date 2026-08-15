import type { LucideIcon } from 'lucide-react'
import {
    Briefcase,
    Calendar1,
    ChartNoAxesCombined,
    CircleCheck,
    CreditCard,
    FileText,
    Headphones,
    House,
    IdCardLanyard,
    LayoutDashboard,
    MessageCircleMore,
    MessageSquareWarning,
    ShieldUser,
    Star,
    User,
} from 'lucide-react'
import type { ModuleKey } from './module'

/**
 * Icon mapping for each module. Keyed by ModuleKey so the type system enforces
 * that every module has an icon. Add a new entry here when you add a module.
 */
export const MODULE_ICONS: Record<ModuleKey, LucideIcon> = {
    dashboard: LayoutDashboard,
    analytics: ChartNoAxesCombined,
    reservations: CircleCheck,
    calendar: Calendar1,
    inbox: MessageCircleMore,
    properties: House,
    users: User,
    payments: CreditCard,
    'channel-manager': CircleCheck,
    employees: IdCardLanyard,
    'role-management': ShieldUser,
    managers: Briefcase,
    reviews: Star,
    reports: FileText,
    support: Headphones,
    guestSupport: MessageSquareWarning,
}
