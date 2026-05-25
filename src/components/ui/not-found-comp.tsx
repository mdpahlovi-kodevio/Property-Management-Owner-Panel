import { ArrowLeft, Home } from 'lucide-react'
import type { NotFoundRouteProps } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function NotFoundComp(_props: NotFoundRouteProps) {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="max-w-4xl mx-auto text-center space-y-8">
                <div className="relative">
                    <h1 className="text-9xl md:text-[12rem] font-bold bg-linear-to-r from-primary via-primary/50 to-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        404
                    </h1>
                    <div className="absolute inset-0 bg-linear-to-r from-primary via-primary/50 to-primary blur-3xl opacity-20 animate-pulse"></div>
                </div>

                <div className="grid gap-8">
                    <h2 className="text-4xl md:text-5xl">Oops! Page Not Found</h2>
                    <p className="max-w-xl mx-auto md:text-b">
                        The page you're looking for seems to have wandered off into the digital void. Don't worry though, we'll help you
                        find your way back.
                    </p>
                </div>

                <div className="max-w-2xs mx-auto grid gap-4 md:grid-cols-2">
                    <Button onClick={() => window.history.back()}>
                        <ArrowLeft className="size-4" />
                        Go Back
                    </Button>

                    <Button variant="outline" onClick={() => (window.location.href = '/')}>
                        <Home className="size-3.5" />
                        Home Page
                    </Button>
                </div>
            </div>
        </div>
    )
}
