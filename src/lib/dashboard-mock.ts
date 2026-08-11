// Placeholder dashboard data — swap for the /owner/overview API when the
// dashboard is wired to real metrics.

export type DashboardTimeframe = '7months' | '3months' | '12months'

/** Mock monthly booking counts for the dashboard chart. */
export const CHART_DATA_OPTIONS: Record<DashboardTimeframe, { name: string; booking: number }[]> = {
    '7months': [
        { name: 'Jan', booking: 4500 },
        { name: 'Feb', booking: 4800 },
        { name: 'Mar', booking: 8000 },
        { name: 'Apr', booking: 5200 },
        { name: 'May', booking: 8200 },
        { name: 'Jun', booking: 6500 },
        { name: 'Jul', booking: 10500 },
    ],
    '3months': [
        { name: 'May', booking: 8200 },
        { name: 'Jun', booking: 6500 },
        { name: 'Jul', booking: 10500 },
    ],
    '12months': [
        { name: 'Aug', booking: 3800 },
        { name: 'Sep', booking: 4200 },
        { name: 'Oct', booking: 5000 },
        { name: 'Nov', booking: 5500 },
        { name: 'Dec', booking: 7200 },
        { name: 'Jan', booking: 4500 },
        { name: 'Feb', booking: 4800 },
        { name: 'Mar', booking: 8000 },
        { name: 'Apr', booking: 5200 },
        { name: 'May', booking: 8200 },
        { name: 'Jun', booking: 6500 },
        { name: 'Jul', booking: 10500 },
    ],
}

/** Mock returning/new user split for the donut. */
export const USER_SPLIT_DATA = [
    {
        name: 'Returning User',
        value: 70,
        color: '#1E3A8A',
    },
    {
        name: 'New User',
        value: 30,
        color: '#D97706',
    },
]
