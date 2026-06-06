import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { Link, useNavigate } from '@tanstack/react-router'
import { BadgeCheckIcon, ChevronsUpDownIcon, LogOutIcon } from 'lucide-react'
import { useState } from 'react'

export function NavUser({
    user,
}: {
    user: {
        name: string
        email: string
        avatar: string
    }
}) {
    const { isMobile } = useSidebar()
    const navigate = useNavigate()
    const [logoutOpen, setLogoutOpen] = useState(false)

    const handleLogout = () => {
        setLogoutOpen(false)
        navigate({ to: '/signin' })
    }

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:p-1!"
                            >
                                <Avatar className="size-8">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.name}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                </div>
                                <ChevronsUpDownIcon className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            side={isMobile ? 'bottom' : 'right'}
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{user.name}</span>
                                        <span className="truncate text-xs">{user.email}</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link to="/settings">
                                        <BadgeCheckIcon />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setLogoutOpen(true)}>
                                <LogOutIcon />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>

            <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
                <AlertDialogContent className="max-w-[400px]">
                    <AlertDialogHeader className="flex flex-col items-center text-center pb-4">
                        <AlertDialogTitle className="text-2xl font-bold tracking-tight mb-2">
                            Are you sure you want to<br />logout?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="hidden">
                            Confirm if you want to sign out of your account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-row gap-3 sm:justify-center mt-2 w-full">
                        <AlertDialogCancel className="w-full sm:w-1/2 m-0 h-11 text-base border-[#24357B] text-[#24357B] hover:bg-[#24357B]/5">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLogout}
                            className="w-full sm:w-1/2 m-0 h-11 text-base bg-[#24357B] hover:bg-[#24357B]/90 text-white"
                        >
                            Yes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
