export type Payment = {
    id: number
    userName: string
    property: string
    amount: string
    method: string
    channel: string
    status: 'Paid' | 'Pending' | 'Failed'
}

export let PAYMENTS: Payment[] = [
    { id: 1, userName: 'Jane Cooper', property: 'Ocean Breeze Villa', amount: '$240', method: 'Stripe', channel: 'Airbnb', status: 'Paid' },
    { id: 2, userName: 'Wade Warren', property: 'Sunset Paradise Resort', amount: '$80', method: 'Card', channel: 'Airbnb', status: 'Paid' },
    { id: 3, userName: 'Esther Howard', property: 'Palm Horizon Retreat', amount: '$300', method: 'Cash', channel: 'Airbnb', status: 'Paid' },
    { id: 4, userName: 'Leslie Alexander', property: 'Blue Lagoon Suites', amount: '$80', method: 'Stripe', channel: 'Airbnb', status: 'Paid' },
    { id: 5, userName: 'Jenny Wilson', property: 'Coral Bay Residence', amount: '$300', method: 'Stripe', channel: 'Airbnb', status: 'Paid' },
    { id: 6, userName: 'Guy Hawkins', property: 'Golden Sands Resort', amount: '$800', method: 'Stripe', channel: 'Airbnb', status: 'Pending' },
    { id: 7, userName: 'Robert Fox', property: 'Ocean Breeze Villa', amount: '$240', method: 'Cash', channel: 'Airbnb', status: 'Pending' },
    { id: 8, userName: 'Kristin Watson', property: 'Sunset Paradise Resort', amount: '$100', method: 'Cash', channel: 'Airbnb', status: 'Failed' },
    { id: 9, userName: 'Jacob Jones', property: 'Palm Horizon Retreat', amount: '$150', method: 'Card', channel: 'Airbnb', status: 'Paid' },
    { id: 10, userName: 'Bessie Cooper', property: 'Blue Lagoon Suites', amount: '$700', method: 'Card', channel: 'Airbnb', status: 'Paid' },
    { id: 11, userName: 'Albert Flores', property: 'Coral Bay Residence', amount: '$600', method: 'Card', channel: 'Airbnb', status: 'Paid' },
    { id: 12, userName: 'Dianne Russell', property: 'Golden Sands Resort', amount: '$500', method: 'Card', channel: 'Airbnb', status: 'Failed' },
    { id: 13, userName: 'Eleanor Pena', property: 'Ocean Breeze Villa', amount: '$200', method: 'Card', channel: 'Airbnb', status: 'Failed' },
]

export function getPaymentById(id: number): Payment | undefined {
    return PAYMENTS.find((p) => p.id === id)
}
