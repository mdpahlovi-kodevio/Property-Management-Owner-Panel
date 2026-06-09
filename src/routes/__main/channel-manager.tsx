import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/__main/channel-manager')({
    component: ChannelManagerComponent,
})

const CHANNELS = [
    {
        id: 'airbnb',
        name: 'Airbnb',
        logoUrl: '/logos/airbnb.svg',
    },
    {
        id: 'booking',
        name: 'Booking.com',
        logoUrl: '/logos/booking.svg',
    },
    {
        id: 'vrbo',
        name: 'Vrbo',
        logoUrl: null, // We'll use stylized text for Vrbo
    },
    {
        id: 'expedia',
        name: 'Expedia',
        logoUrl: '/logos/expedia.svg',
    },
]

function ChannelManagerComponent() {
    return (
        <>
            <PageHeader
                title="Channel Manager"
                description="Manage your payments"
            />


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
                {CHANNELS.map((channel) => (
                    <div
                        key={channel.id}
                        className="bg-card border rounded-lg p-4 flex flex-col items-center justify-between shadow-sm h-52 transition-all hover:shadow-md"
                    >
                        <div className="flex-1 flex items-center justify-center w-full px-6">
                            {channel.logoUrl ? (
                                <img
                                    src={channel.logoUrl}
                                    alt={`${channel.name} logo`}
                                    className="max-h-12 w-full object-contain"
                                />
                            ) : (
                                <span className="text-[#00255c] font-black text-4xl tracking-tighter italic pr-2">
                                    Vrbo
                                </span>
                            )}
                        </div>
                        <Button
                            className="w-full bg-[#243E8B] hover:bg-[#1D3270] text-white mt-4 font-medium"
                        >
                            Connect
                        </Button>
                    </div>
                ))}
            </div>

        </>
    )
}
