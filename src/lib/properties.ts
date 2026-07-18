export type PropertyStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
export type PropertyType =
    | 'HOTEL'
    | 'RESORT'
    | 'BOUTIQUE_HOTEL'
    | 'SERVICED_APARTMENT'
    | 'HOSTEL'
    | 'GUEST_HOUSE'
    | 'VACATION_RENTAL'
    | 'APARTMENT'
    | 'VILLA'
    | 'BED_AND_BREAKFAST'
    | 'MOTEL'
    | 'OTHER'
export type BathroomType = 'PRIVATE' | 'SHARED'
export type BedType = 'KING' | 'QUEEN' | 'DOUBLE' | 'TWIN' | 'SINGLE' | 'BUNK' | 'SOFA_BED' | 'MURPHY' | 'FUTON' | 'ROLLAWAY'
export type RoomTypeStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'

export interface Amenity {
    id: string
    key: string
    name: string
    category: string | null
    icon: string | null
}

export interface PropertyPolicy {
    petsAllowed: boolean
    minimumGuestAge: number
    securityDeposit: number | null
    houseRules: string | null
}

export interface PropertyImage {
    id: string
    url: string
    thumbnail: boolean
    sortOrder: number
}

export interface PropertyAddon {
    id: string
    name: string
    description: string | null
    price: number
    state: 'ACTIVE' | 'INACTIVE'
}

export interface RoomTypeBed {
    id: string
    bedType: BedType
    quantity: number
}

export interface Unit {
    id: string
    roomNumber: string
    floor: string | null
}

export interface RoomTypeImage {
    id: string
    url: string
    thumbnail: boolean
    sortOrder: number
}

export interface RoomType {
    id: string
    name: string
    internalCode: string
    description: string | null
    maxAdults: number
    maxChildren: number
    maxOccupancy: number
    ratePlans: {
        id: string
        code: string
        name: string
        status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
        defaultPrice: number
        defaultMinLOS: number | null
        defaultMaxLOS: number | null
    }[]
    roomSize: number | null
    smokingRoom: boolean
    accessibleRoom: boolean
    bathroomType: BathroomType
    viewType: string | null
    status: RoomTypeStatus
    beds: RoomTypeBed[]
    amenities: { amenity: Amenity }[]
    images: RoomTypeImage[]
    units: Unit[]
}

export interface Property {
    id: string
    name: string
    slug: string
    propertyType: PropertyType
    description: string | null
    status: PropertyStatus
    rating: number
    reviewCount: number
    country: string
    state: string | null
    city: string
    postalCode: string | null
    address1: string
    address2: string | null
    latitude: number | null
    longitude: number | null
    checkInTime: string
    checkOutTime: string
    policy: PropertyPolicy | null
    amenities: { amenity: Amenity }[]
    images: PropertyImage[]
    addons: PropertyAddon[]
    roomTypes: RoomType[]
}

export const PROPERTIES: Property[] = [
    {
        id: 'prop_001',
        name: 'The Azure Cliff Resort',
        slug: 'the-azure-cliff-resort',
        propertyType: 'RESORT',
        description:
            "A clifftop resort perched above Uluwatu's famous surf break, offering panoramic Indian Ocean views, infinity pools, and a world-class spa. Perfect for honeymooners and luxury travellers.",
        status: 'ACTIVE',
        rating: 4.8,
        reviewCount: 312,
        country: 'Indonesia',
        state: 'Bali',
        city: 'Uluwatu',
        postalCode: '80364',
        address1: 'Jl. Labuansait No. 7',
        address2: null,
        latitude: -8.8291,
        longitude: 115.0849,
        checkInTime: '15:00',
        checkOutTime: '12:00',
        policy: {
            petsAllowed: false,
            minimumGuestAge: 12,
            securityDeposit: 200,
            houseRules: 'No smoking anywhere on the property. Quiet hours after 10pm. No outside food in pool areas.',
        },
        amenities: [
            { amenity: { id: 'amen_wifi', key: 'wifi', name: 'WiFi', category: 'connectivity', icon: 'Wifi' } },
            { amenity: { id: 'amen_pool', key: 'pool', name: 'Pool', category: 'wellness', icon: 'SwimmingPool' } },
            { amenity: { id: 'amen_spa', key: 'spa', name: 'Spa', category: 'wellness', icon: 'Sparkles' } },
            { amenity: { id: 'amen_restaurant', key: 'restaurant', name: 'Restaurant', category: 'food', icon: 'UtensilsCrossed' } },
            { amenity: { id: 'amen_bar', key: 'bar', name: 'Bar', category: 'food', icon: 'Wine' } },
            { amenity: { id: 'amen_gym', key: 'gym', name: 'Gym', category: 'wellness', icon: 'Dumbbell' } },
            {
                amenity: {
                    id: 'amen_airport_shuttle',
                    key: 'airport_shuttle',
                    name: 'Airport Shuttle',
                    category: 'service',
                    icon: 'Plane',
                },
            },
            {
                amenity: {
                    id: 'amen_24hr_front_desk',
                    key: '24hr_front_desk',
                    name: '24-hr Front Desk',
                    category: 'service',
                    icon: 'ConciergeBell',
                },
            },
        ],
        images: [
            {
                id: 'img_prop_001_thumb',
                url: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?auto=format&fit=crop&w=1200&q=80',
                thumbnail: true,
                sortOrder: 0,
            },
            {
                id: 'img_prop_001_01',
                url: 'https://images.unsplash.com/photo-1623718649591-311775a30c43?auto=format&fit=crop&w=1200&q=80',
                thumbnail: false,
                sortOrder: 1,
            },
            {
                id: 'img_prop_001_02',
                url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
                thumbnail: false,
                sortOrder: 2,
            },
        ],
        addons: [],
        roomTypes: [
            {
                id: 'rt_001_01',
                name: 'Cliff View King Suite',
                internalCode: 'CLF-KNG-01',
                description: 'Spacious suite with a private plunge pool and unobstructed views of the Indian Ocean.',
                maxAdults: 2,
                maxChildren: 1,
                maxOccupancy: 3,
                ratePlans: [
                    {
                        id: 'rp_001',
                        code: 'BAR',
                        name: 'Standard Rate',
                        status: 'ACTIVE',
                        defaultPrice: 450,
                        defaultMinLOS: null,
                        defaultMaxLOS: null,
                    },
                ],
                roomSize: 72,
                smokingRoom: false,
                accessibleRoom: false,
                bathroomType: 'PRIVATE',
                viewType: 'Ocean View',
                status: 'ACTIVE',
                beds: [{ id: 'bed_001_01_01', bedType: 'KING', quantity: 1 }],
                amenities: [
                    {
                        amenity: {
                            id: 'amen_air_conditioning',
                            key: 'air_conditioning',
                            name: 'Air Conditioning',
                            category: 'room',
                            icon: 'Fan',
                        },
                    },
                    { amenity: { id: 'amen_tv', key: 'tv', name: 'TV', category: 'room', icon: 'Tv' } },
                    { amenity: { id: 'amen_mini_bar', key: 'mini_bar', name: 'Mini Bar', category: 'room', icon: 'Fridge' } },
                    {
                        amenity: {
                            id: 'amen_coffee_machine',
                            key: 'coffee_machine',
                            name: 'Coffee Machine',
                            category: 'room',
                            icon: 'Coffee',
                        },
                    },
                    { amenity: { id: 'amen_balcony', key: 'balcony', name: 'Balcony', category: 'room', icon: 'DoorOpen' } },
                    { amenity: { id: 'amen_safe', key: 'safe', name: 'Safe', category: 'room', icon: 'ShieldCheck' } },
                    { amenity: { id: 'amen_bathtub', key: 'bathtub', name: 'Bathtub', category: 'room', icon: 'Bath' } },
                ],
                images: [
                    {
                        id: 'rti_001_01_thumb',
                        url: 'https://images.unsplash.com/photo-1630587148265-761cbd139043?auto=format&fit=crop&w=1200&q=80',
                        thumbnail: true,
                        sortOrder: 0,
                    },
                ],
                units: [
                    { id: 'unit_001_01_01', roomNumber: '301', floor: '3' },
                    { id: 'unit_001_01_02', roomNumber: '302', floor: '3' },
                    { id: 'unit_001_01_03', roomNumber: '401', floor: '4' },
                ],
            },
        ],
    },

    {
        id: 'prop_002',
        name: 'Nomad House Dhaka',
        slug: 'nomad-house-dhaka',
        propertyType: 'SERVICED_APARTMENT',
        description:
            'Modern co-living and short-stay serviced apartments in the heart of Gulshan, designed for remote workers and business travellers. Fast internet, flexible check-in, and rooftop workspace.',
        status: 'ACTIVE',
        rating: 4.5,
        reviewCount: 87,
        country: 'Bangladesh',
        state: 'Dhaka Division',
        city: 'Dhaka',
        postalCode: '1212',
        address1: 'House 14, Road 48',
        address2: 'Gulshan-2',
        latitude: 23.7937,
        longitude: 90.4066,
        checkInTime: '13:00',
        checkOutTime: '11:00',
        policy: {
            petsAllowed: false,
            minimumGuestAge: 18,
            securityDeposit: 50,
            houseRules: 'No smoking indoors. Guests must show ID at check-in. Quiet hours 11pm–7am.',
        },
        amenities: [
            { amenity: { id: 'amen_wifi', key: 'wifi', name: 'WiFi', category: 'connectivity', icon: 'Wifi' } },
            { amenity: { id: 'amen_gym', key: 'gym', name: 'Gym', category: 'wellness', icon: 'Dumbbell' } },
            { amenity: { id: 'amen_laundry', key: 'laundry', name: 'Laundry', category: 'service', icon: 'WashingMachine' } },
            { amenity: { id: 'amen_elevator', key: 'elevator', name: 'Elevator', category: 'service', icon: 'ArrowUpDown' } },
            {
                amenity: {
                    id: 'amen_business_center',
                    key: 'business_center',
                    name: 'Business Center',
                    category: 'service',
                    icon: 'Briefcase',
                },
            },
            {
                amenity: {
                    id: 'amen_24hr_front_desk',
                    key: '24hr_front_desk',
                    name: '24-hr Front Desk',
                    category: 'service',
                    icon: 'ConciergeBell',
                },
            },
        ],
        images: [
            {
                id: 'img_prop_002_thumb',
                url: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80',
                thumbnail: true,
                sortOrder: 0,
            },
            {
                id: 'img_prop_002_01',
                url: 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?auto=format&fit=crop&w=1200&q=80',
                thumbnail: false,
                sortOrder: 1,
            },
        ],
        addons: [],
        roomTypes: [
            {
                id: 'rt_002_01',
                name: 'Studio Apartment',
                internalCode: 'STD-APT-01',
                description: 'Compact, fully furnished studio with a dedicated work desk, kitchenette, and high-speed fibre internet.',
                maxAdults: 2,
                maxChildren: 0,
                maxOccupancy: 2,
                ratePlans: [
                    {
                        id: 'rp_002',
                        code: 'BAR',
                        name: 'Standard Rate',
                        status: 'ACTIVE',
                        defaultPrice: 8500,
                        defaultMinLOS: null,
                        defaultMaxLOS: null,
                    },
                ],
                roomSize: 32,
                smokingRoom: false,
                accessibleRoom: false,
                bathroomType: 'PRIVATE',
                viewType: 'City View',
                status: 'ACTIVE',
                beds: [{ id: 'bed_002_01_01', bedType: 'QUEEN', quantity: 1 }],
                amenities: [
                    {
                        amenity: {
                            id: 'amen_air_conditioning',
                            key: 'air_conditioning',
                            name: 'Air Conditioning',
                            category: 'room',
                            icon: 'Fan',
                        },
                    },
                    { amenity: { id: 'amen_tv', key: 'tv', name: 'TV', category: 'room', icon: 'Tv' } },
                    {
                        amenity: {
                            id: 'amen_coffee_machine',
                            key: 'coffee_machine',
                            name: 'Coffee Machine',
                            category: 'room',
                            icon: 'Coffee',
                        },
                    },
                    { amenity: { id: 'amen_desk', key: 'desk', name: 'Desk', category: 'room', icon: 'Notebook' } },
                    { amenity: { id: 'amen_kitchen', key: 'kitchen', name: 'Kitchen', category: 'room', icon: 'CookingPot' } },
                    { amenity: { id: 'amen_refrigerator', key: 'refrigerator', name: 'Refrigerator', category: 'room', icon: 'Fridge' } },
                    { amenity: { id: 'amen_safe', key: 'safe', name: 'Safe', category: 'room', icon: 'ShieldCheck' } },
                ],
                images: [
                    {
                        id: 'rti_002_01_thumb',
                        url: 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?auto=format&fit=crop&w=1200&q=80',
                        thumbnail: true,
                        sortOrder: 0,
                    },
                ],
                units: [
                    { id: 'unit_002_01_01', roomNumber: '201', floor: '2' },
                    { id: 'unit_002_01_02', roomNumber: '202', floor: '2' },
                    { id: 'unit_002_01_03', roomNumber: '203', floor: '2' },
                    { id: 'unit_002_01_04', roomNumber: '204', floor: '2' },
                ],
            },
            {
                id: 'rt_002_02',
                name: 'One-Bedroom Executive',
                internalCode: '1BR-EXC-01',
                description: 'Separate bedroom with a full living room and kitchenette. Ideal for week-long and monthly stays.',
                maxAdults: 2,
                maxChildren: 1,
                maxOccupancy: 3,
                ratePlans: [
                    {
                        id: 'rp_003',
                        code: 'BAR',
                        name: 'Standard Rate',
                        status: 'ACTIVE',
                        defaultPrice: 14500,
                        defaultMinLOS: null,
                        defaultMaxLOS: null,
                    },
                ],
                roomSize: 55,
                smokingRoom: false,
                accessibleRoom: false,
                bathroomType: 'PRIVATE',
                viewType: 'City View',
                status: 'ACTIVE',
                beds: [
                    { id: 'bed_002_02_01', bedType: 'KING', quantity: 1 },
                    { id: 'bed_002_02_02', bedType: 'SOFA_BED', quantity: 1 },
                ],
                amenities: [
                    {
                        amenity: {
                            id: 'amen_air_conditioning',
                            key: 'air_conditioning',
                            name: 'Air Conditioning',
                            category: 'room',
                            icon: 'Fan',
                        },
                    },
                    { amenity: { id: 'amen_tv', key: 'tv', name: 'TV', category: 'room', icon: 'Tv' } },
                    {
                        amenity: {
                            id: 'amen_coffee_machine',
                            key: 'coffee_machine',
                            name: 'Coffee Machine',
                            category: 'room',
                            icon: 'Coffee',
                        },
                    },
                    { amenity: { id: 'amen_desk', key: 'desk', name: 'Desk', category: 'room', icon: 'Notebook' } },
                    { amenity: { id: 'amen_kitchen', key: 'kitchen', name: 'Kitchen', category: 'room', icon: 'CookingPot' } },
                    { amenity: { id: 'amen_refrigerator', key: 'refrigerator', name: 'Refrigerator', category: 'room', icon: 'Fridge' } },
                    { amenity: { id: 'amen_microwave', key: 'microwave', name: 'Microwave', category: 'room', icon: 'Microwave' } },
                    { amenity: { id: 'amen_safe', key: 'safe', name: 'Safe', category: 'room', icon: 'ShieldCheck' } },
                ],
                images: [
                    {
                        id: 'rti_002_02_thumb',
                        url: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
                        thumbnail: true,
                        sortOrder: 0,
                    },
                ],
                units: [
                    { id: 'unit_002_02_01', roomNumber: '501', floor: '5' },
                    { id: 'unit_002_02_02', roomNumber: '502', floor: '5' },
                ],
            },
        ],
    },

    {
        id: 'prop_003',
        name: 'Maison Lumière',
        slug: 'maison-lumiere',
        propertyType: 'BOUTIQUE_HOTEL',
        description:
            'A 19th-century Haussmann building transformed into a 22-room boutique hotel in Saint-Germain-des-Prés. Hand-curated art, original parquet floors, and a hidden courtyard garden.',
        status: 'ACTIVE',
        rating: 4.7,
        reviewCount: 543,
        country: 'France',
        state: 'Île-de-France',
        city: 'Paris',
        postalCode: '75006',
        address1: "12 Rue de l'Abbaye",
        address2: null,
        latitude: 48.8534,
        longitude: 2.3352,
        checkInTime: '15:00',
        checkOutTime: '12:00',
        policy: {
            petsAllowed: true,
            minimumGuestAge: 0,
            securityDeposit: 150,
            houseRules: 'Pets welcome (max 10kg). No smoking anywhere inside. Noise curfew at 11pm.',
        },
        amenities: [
            { amenity: { id: 'amen_wifi', key: 'wifi', name: 'WiFi', category: 'connectivity', icon: 'Wifi' } },
            { amenity: { id: 'amen_bar', key: 'bar', name: 'Bar', category: 'food', icon: 'Wine' } },
            { amenity: { id: 'amen_elevator', key: 'elevator', name: 'Elevator', category: 'service', icon: 'ArrowUpDown' } },
            { amenity: { id: 'amen_laundry', key: 'laundry', name: 'Laundry', category: 'service', icon: 'WashingMachine' } },
            {
                amenity: {
                    id: 'amen_24hr_front_desk',
                    key: '24hr_front_desk',
                    name: '24-hr Front Desk',
                    category: 'service',
                    icon: 'ConciergeBell',
                },
            },
            {
                amenity: {
                    id: 'amen_wheelchair',
                    key: 'wheelchair',
                    name: 'Wheelchair Accessible',
                    category: 'service',
                    icon: 'Accessibility',
                },
            },
        ],
        images: [
            {
                id: 'img_prop_003_thumb',
                url: 'https://images.unsplash.com/photo-1546783155-4ef83c00d4ef?auto=format&fit=crop&w=1200&q=80',
                thumbnail: true,
                sortOrder: 0,
            },
            {
                id: 'img_prop_003_01',
                url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
                thumbnail: false,
                sortOrder: 1,
            },
        ],
        addons: [],
        roomTypes: [
            {
                id: 'rt_003_01',
                name: 'Classique Double',
                internalCode: 'CLS-DBL-01',
                description: 'Elegant double room with original exposed beams, premium cotton linens, and a clawfoot bathtub.',
                maxAdults: 2,
                maxChildren: 0,
                maxOccupancy: 2,
                ratePlans: [
                    {
                        id: 'rp_004',
                        code: 'BAR',
                        name: 'Standard Rate',
                        status: 'ACTIVE',
                        defaultPrice: 280,
                        defaultMinLOS: null,
                        defaultMaxLOS: null,
                    },
                ],
                roomSize: 24,
                smokingRoom: false,
                accessibleRoom: false,
                bathroomType: 'PRIVATE',
                viewType: 'Courtyard View',
                status: 'ACTIVE',
                beds: [{ id: 'bed_003_01_01', bedType: 'DOUBLE', quantity: 1 }],
                amenities: [
                    {
                        amenity: {
                            id: 'amen_air_conditioning',
                            key: 'air_conditioning',
                            name: 'Air Conditioning',
                            category: 'room',
                            icon: 'Fan',
                        },
                    },
                    { amenity: { id: 'amen_tv', key: 'tv', name: 'TV', category: 'room', icon: 'Tv' } },
                    {
                        amenity: {
                            id: 'amen_coffee_machine',
                            key: 'coffee_machine',
                            name: 'Coffee Machine',
                            category: 'room',
                            icon: 'Coffee',
                        },
                    },
                    { amenity: { id: 'amen_safe', key: 'safe', name: 'Safe', category: 'room', icon: 'ShieldCheck' } },
                    { amenity: { id: 'amen_bathtub', key: 'bathtub', name: 'Bathtub', category: 'room', icon: 'Bath' } },
                    { amenity: { id: 'amen_hair_dryer', key: 'hair_dryer', name: 'Hair Dryer', category: 'room', icon: 'Wind' } },
                ],
                images: [
                    {
                        id: 'rti_003_01_thumb',
                        url: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
                        thumbnail: true,
                        sortOrder: 0,
                    },
                ],
                units: [
                    { id: 'unit_003_01_01', roomNumber: '101', floor: '1' },
                    { id: 'unit_003_01_02', roomNumber: '102', floor: '1' },
                    { id: 'unit_003_01_03', roomNumber: '201', floor: '2' },
                    { id: 'unit_003_01_04', roomNumber: '202', floor: '2' },
                ],
            },
            {
                id: 'rt_003_02',
                name: 'Supérieure Courtyard Suite',
                internalCode: 'SUP-CRT-01',
                description: 'Larger suite overlooking the private courtyard garden, with a separate sitting area and walk-in wardrobe.',
                maxAdults: 2,
                maxChildren: 1,
                maxOccupancy: 3,
                ratePlans: [
                    {
                        id: 'rp_005',
                        code: 'BAR',
                        name: 'Standard Rate',
                        status: 'ACTIVE',
                        defaultPrice: 420,
                        defaultMinLOS: null,
                        defaultMaxLOS: null,
                    },
                ],
                roomSize: 42,
                smokingRoom: false,
                accessibleRoom: false,
                bathroomType: 'PRIVATE',
                viewType: 'Courtyard View',
                status: 'ACTIVE',
                beds: [{ id: 'bed_003_02_01', bedType: 'KING', quantity: 1 }],
                amenities: [
                    {
                        amenity: {
                            id: 'amen_air_conditioning',
                            key: 'air_conditioning',
                            name: 'Air Conditioning',
                            category: 'room',
                            icon: 'Fan',
                        },
                    },
                    { amenity: { id: 'amen_tv', key: 'tv', name: 'TV', category: 'room', icon: 'Tv' } },
                    { amenity: { id: 'amen_mini_bar', key: 'mini_bar', name: 'Mini Bar', category: 'room', icon: 'Fridge' } },
                    {
                        amenity: {
                            id: 'amen_coffee_machine',
                            key: 'coffee_machine',
                            name: 'Coffee Machine',
                            category: 'room',
                            icon: 'Coffee',
                        },
                    },
                    { amenity: { id: 'amen_desk', key: 'desk', name: 'Desk', category: 'room', icon: 'Notebook' } },
                    { amenity: { id: 'amen_safe', key: 'safe', name: 'Safe', category: 'room', icon: 'ShieldCheck' } },
                    { amenity: { id: 'amen_bathtub', key: 'bathtub', name: 'Bathtub', category: 'room', icon: 'Bath' } },
                    { amenity: { id: 'amen_hair_dryer', key: 'hair_dryer', name: 'Hair Dryer', category: 'room', icon: 'Wind' } },
                ],
                images: [
                    {
                        id: 'rti_003_02_thumb',
                        url: 'https://images.unsplash.com/photo-1630587148265-761cbd139043?auto=format&fit=crop&w=1200&q=80',
                        thumbnail: true,
                        sortOrder: 0,
                    },
                ],
                units: [
                    { id: 'unit_003_02_01', roomNumber: '301', floor: '3' },
                    { id: 'unit_003_02_02', roomNumber: '302', floor: '3' },
                ],
            },
        ],
    },

    {
        id: 'prop_004',
        name: 'Silverleaf Mountain Lodge',
        slug: 'silverleaf-mountain-lodge',
        propertyType: 'GUEST_HOUSE',
        description:
            'A cosy 8-room mountain lodge near Banff National Park with ski-in/ski-out access, a wood-burning fireplace lounge, and complimentary hearty breakfast.',
        status: 'ACTIVE',
        rating: 4.9,
        reviewCount: 218,
        country: 'Canada',
        state: 'Alberta',
        city: 'Banff',
        postalCode: 'T1L 1B3',
        address1: '220 Lynx Street',
        address2: null,
        latitude: 51.1784,
        longitude: -115.5708,
        checkInTime: '16:00',
        checkOutTime: '10:00',
        policy: {
            petsAllowed: true,
            minimumGuestAge: 0,
            securityDeposit: 100,
            houseRules: 'Ski boots must be removed at entrance. Pets allowed in designated rooms only. No loud noise after 9:30pm.',
        },
        amenities: [
            { amenity: { id: 'amen_wifi', key: 'wifi', name: 'WiFi', category: 'connectivity', icon: 'Wifi' } },
            { amenity: { id: 'amen_parking', key: 'parking', name: 'Parking', category: 'service', icon: 'ParkingCircle' } },
            { amenity: { id: 'amen_laundry', key: 'laundry', name: 'Laundry', category: 'service', icon: 'WashingMachine' } },
            { amenity: { id: 'amen_pet_friendly', key: 'pet_friendly', name: 'Pet Friendly', category: 'service', icon: 'PawPrint' } },
        ],
        images: [
            {
                id: 'img_prop_004_thumb',
                url: 'https://images.unsplash.com/photo-1602436324859-62a81466e723?auto=format&fit=crop&w=1200&q=80',
                thumbnail: true,
                sortOrder: 0,
            },
            {
                id: 'img_prop_004_01',
                url: 'https://images.unsplash.com/photo-1623718649591-311775a30c43?auto=format&fit=crop&w=1200&q=80',
                thumbnail: false,
                sortOrder: 1,
            },
        ],
        addons: [],
        roomTypes: [
            {
                id: 'rt_004_01',
                name: 'Timber King Room',
                internalCode: 'TMB-KNG-01',
                description: 'Warm timber-clad room with a king bed, heated floors, and mountain views through floor-to-ceiling windows.',
                maxAdults: 2,
                maxChildren: 0,
                maxOccupancy: 2,
                ratePlans: [
                    {
                        id: 'rp_006',
                        code: 'BAR',
                        name: 'Standard Rate',
                        status: 'ACTIVE',
                        defaultPrice: 320,
                        defaultMinLOS: null,
                        defaultMaxLOS: null,
                    },
                ],
                roomSize: 28,
                smokingRoom: false,
                accessibleRoom: false,
                bathroomType: 'PRIVATE',
                viewType: 'Mountain View',
                status: 'ACTIVE',
                beds: [{ id: 'bed_004_01_01', bedType: 'KING', quantity: 1 }],
                amenities: [
                    { amenity: { id: 'amen_tv', key: 'tv', name: 'TV', category: 'room', icon: 'Tv' } },
                    {
                        amenity: {
                            id: 'amen_coffee_machine',
                            key: 'coffee_machine',
                            name: 'Coffee Machine',
                            category: 'room',
                            icon: 'Coffee',
                        },
                    },
                    { amenity: { id: 'amen_safe', key: 'safe', name: 'Safe', category: 'room', icon: 'ShieldCheck' } },
                    { amenity: { id: 'amen_hair_dryer', key: 'hair_dryer', name: 'Hair Dryer', category: 'room', icon: 'Wind' } },
                ],
                images: [
                    {
                        id: 'rti_004_01_thumb',
                        url: 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?auto=format&fit=crop&w=1200&q=80',
                        thumbnail: true,
                        sortOrder: 0,
                    },
                ],
                units: [
                    { id: 'unit_004_01_01', roomNumber: '01', floor: '1' },
                    { id: 'unit_004_01_02', roomNumber: '02', floor: '1' },
                    { id: 'unit_004_01_03', roomNumber: '03', floor: '1' },
                ],
            },
            {
                id: 'rt_004_02',
                name: 'Family Loft',
                internalCode: 'FAM-LFT-01',
                description: 'Two-level loft with a king downstairs and two twin beds in the mezzanine, perfect for families.',
                maxAdults: 2,
                maxChildren: 2,
                maxOccupancy: 4,
                ratePlans: [
                    {
                        id: 'rp_007',
                        code: 'BAR',
                        name: 'Standard Rate',
                        status: 'ACTIVE',
                        defaultPrice: 540,
                        defaultMinLOS: null,
                        defaultMaxLOS: null,
                    },
                ],
                roomSize: 48,
                smokingRoom: false,
                accessibleRoom: false,
                bathroomType: 'PRIVATE',
                viewType: 'Mountain View',
                status: 'ACTIVE',
                beds: [
                    { id: 'bed_004_02_01', bedType: 'KING', quantity: 1 },
                    { id: 'bed_004_02_02', bedType: 'TWIN', quantity: 2 },
                ],
                amenities: [
                    { amenity: { id: 'amen_tv', key: 'tv', name: 'TV', category: 'room', icon: 'Tv' } },
                    {
                        amenity: {
                            id: 'amen_coffee_machine',
                            key: 'coffee_machine',
                            name: 'Coffee Machine',
                            category: 'room',
                            icon: 'Coffee',
                        },
                    },
                    { amenity: { id: 'amen_refrigerator', key: 'refrigerator', name: 'Refrigerator', category: 'room', icon: 'Fridge' } },
                    { amenity: { id: 'amen_safe', key: 'safe', name: 'Safe', category: 'room', icon: 'ShieldCheck' } },
                    { amenity: { id: 'amen_hair_dryer', key: 'hair_dryer', name: 'Hair Dryer', category: 'room', icon: 'Wind' } },
                ],
                images: [
                    {
                        id: 'rti_004_02_thumb',
                        url: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
                        thumbnail: true,
                        sortOrder: 0,
                    },
                ],
                units: [
                    { id: 'unit_004_02_01', roomNumber: 'L1', floor: '2' },
                    { id: 'unit_004_02_02', roomNumber: 'L2', floor: '2' },
                ],
            },
        ],
    },

    {
        id: 'prop_005',
        name: 'Urban Capsule Bangkok',
        slug: 'urban-capsule-bangkok',
        propertyType: 'HOSTEL',
        description:
            "A design-forward capsule hostel in the Silom district, blending privacy pod sleeping with a vibrant rooftop social bar. Targeted at solo and budget-conscious travellers who don't want to compromise on style.",
        status: 'ACTIVE',
        rating: 4.4,
        reviewCount: 1204,
        country: 'Thailand',
        state: 'Bangkok',
        city: 'Bangkok',
        postalCode: '10500',
        address1: '29 Silom Road, Bang Rak',
        address2: null,
        latitude: 13.7246,
        longitude: 100.5284,
        checkInTime: '14:00',
        checkOutTime: '11:00',
        policy: {
            petsAllowed: false,
            minimumGuestAge: 18,
            securityDeposit: 20,
            houseRules: '18+ only. No outside alcohol. Capsule lights out 11pm–7am. Lockers provided; own padlock required.',
        },
        amenities: [
            { amenity: { id: 'amen_wifi', key: 'wifi', name: 'WiFi', category: 'connectivity', icon: 'Wifi' } },
            { amenity: { id: 'amen_bar', key: 'bar', name: 'Bar', category: 'food', icon: 'Wine' } },
            { amenity: { id: 'amen_laundry', key: 'laundry', name: 'Laundry', category: 'service', icon: 'WashingMachine' } },
            { amenity: { id: 'amen_elevator', key: 'elevator', name: 'Elevator', category: 'service', icon: 'ArrowUpDown' } },
            {
                amenity: {
                    id: 'amen_24hr_front_desk',
                    key: '24hr_front_desk',
                    name: '24-hr Front Desk',
                    category: 'service',
                    icon: 'ConciergeBell',
                },
            },
        ],
        images: [
            {
                id: 'img_prop_005_thumb',
                url: 'https://images.unsplash.com/photo-1639647564912-651e29b8e6ad?auto=format&fit=crop&w=1200&q=80',
                thumbnail: true,
                sortOrder: 0,
            },
            {
                id: 'img_prop_005_01',
                url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
                thumbnail: false,
                sortOrder: 1,
            },
        ],
        addons: [],
        roomTypes: [
            {
                id: 'rt_005_01',
                name: 'Standard Pod — Mixed Dorm',
                internalCode: 'POD-MXD-01',
                description:
                    'Individual privacy pod in a mixed-gender 8-pod dorm. Each pod has its own reading light, USB charging, and blackout blind.',
                maxAdults: 1,
                maxChildren: 0,
                maxOccupancy: 1,
                ratePlans: [
                    {
                        id: 'rp_008',
                        code: 'BAR',
                        name: 'Standard Rate',
                        status: 'ACTIVE',
                        defaultPrice: 650,
                        defaultMinLOS: null,
                        defaultMaxLOS: null,
                    },
                ],
                roomSize: 4,
                smokingRoom: false,
                accessibleRoom: false,
                bathroomType: 'SHARED',
                viewType: 'City View',
                status: 'ACTIVE',
                beds: [{ id: 'bed_005_01_01', bedType: 'SINGLE', quantity: 1 }],
                amenities: [
                    {
                        amenity: {
                            id: 'amen_air_conditioning',
                            key: 'air_conditioning',
                            name: 'Air Conditioning',
                            category: 'room',
                            icon: 'Fan',
                        },
                    },
                    { amenity: { id: 'amen_safe', key: 'safe', name: 'Safe', category: 'room', icon: 'ShieldCheck' } },
                ],
                images: [
                    {
                        id: 'rti_005_01_thumb',
                        url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
                        thumbnail: true,
                        sortOrder: 0,
                    },
                ],
                units: [
                    { id: 'unit_005_01_01', roomNumber: 'A1', floor: '2' },
                    { id: 'unit_005_01_02', roomNumber: 'A2', floor: '2' },
                    { id: 'unit_005_01_03', roomNumber: 'A3', floor: '2' },
                    { id: 'unit_005_01_04', roomNumber: 'A4', floor: '2' },
                    { id: 'unit_005_01_05', roomNumber: 'A5', floor: '2' },
                    { id: 'unit_005_01_06', roomNumber: 'A6', floor: '2' },
                    { id: 'unit_005_01_07', roomNumber: 'A7', floor: '2' },
                    { id: 'unit_005_01_08', roomNumber: 'A8', floor: '2' },
                ],
            },
            {
                id: 'rt_005_02',
                name: 'Private Double Pod',
                internalCode: 'POD-PVT-01',
                description: 'A walled private pod room for two with a lockable door, double bed, and ensuite shower.',
                maxAdults: 2,
                maxChildren: 0,
                maxOccupancy: 2,
                ratePlans: [
                    {
                        id: 'rp_009',
                        code: 'BAR',
                        name: 'Standard Rate',
                        status: 'ACTIVE',
                        defaultPrice: 1800,
                        defaultMinLOS: null,
                        defaultMaxLOS: null,
                    },
                ],
                roomSize: 12,
                smokingRoom: false,
                accessibleRoom: false,
                bathroomType: 'PRIVATE',
                viewType: 'City View',
                status: 'ACTIVE',
                beds: [{ id: 'bed_005_02_01', bedType: 'DOUBLE', quantity: 1 }],
                amenities: [
                    {
                        amenity: {
                            id: 'amen_air_conditioning',
                            key: 'air_conditioning',
                            name: 'Air Conditioning',
                            category: 'room',
                            icon: 'Fan',
                        },
                    },
                    { amenity: { id: 'amen_tv', key: 'tv', name: 'TV', category: 'room', icon: 'Tv' } },
                    { amenity: { id: 'amen_safe', key: 'safe', name: 'Safe', category: 'room', icon: 'ShieldCheck' } },
                    { amenity: { id: 'amen_hair_dryer', key: 'hair_dryer', name: 'Hair Dryer', category: 'room', icon: 'Wind' } },
                ],
                images: [
                    {
                        id: 'rti_005_02_thumb',
                        url: 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?auto=format&fit=crop&w=1200&q=80',
                        thumbnail: true,
                        sortOrder: 0,
                    },
                ],
                units: [
                    { id: 'unit_005_02_01', roomNumber: 'P1', floor: '4' },
                    { id: 'unit_005_02_02', roomNumber: 'P2', floor: '4' },
                    { id: 'unit_005_02_03', roomNumber: 'P3', floor: '4' },
                ],
            },
        ],
    },

    {
        id: 'prop_006',
        name: 'Casa Ventana',
        slug: 'casa-ventana',
        propertyType: 'VACATION_RENTAL',
        description:
            "A privately owned 4-bedroom whitewashed villa in Tarifa, Spain — Europe's kitesurfing capital. Direct beach access, a sun terrace with Atlantic views, and a fully equipped chef's kitchen.",
        status: 'ACTIVE',
        rating: 4.6,
        reviewCount: 67,
        country: 'Spain',
        state: 'Andalusia',
        city: 'Tarifa',
        postalCode: '11380',
        address1: 'Calle Batalla del Salado 18',
        address2: null,
        latitude: 36.0143,
        longitude: -5.6044,
        checkInTime: '16:00',
        checkOutTime: '10:00',
        policy: {
            petsAllowed: true,
            minimumGuestAge: 0,
            securityDeposit: 500,
            houseRules: 'Whole-home rental only; no events. Pool heating available at extra charge. BBQ allowed on terrace only.',
        },
        amenities: [
            { amenity: { id: 'amen_wifi', key: 'wifi', name: 'WiFi', category: 'connectivity', icon: 'Wifi' } },
            { amenity: { id: 'amen_parking', key: 'parking', name: 'Parking', category: 'service', icon: 'ParkingCircle' } },
            { amenity: { id: 'amen_pool', key: 'pool', name: 'Pool', category: 'wellness', icon: 'SwimmingPool' } },
            { amenity: { id: 'amen_pet_friendly', key: 'pet_friendly', name: 'Pet Friendly', category: 'service', icon: 'PawPrint' } },
        ],
        images: [
            {
                id: 'img_prop_006_thumb',
                url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
                thumbnail: true,
                sortOrder: 0,
            },
            {
                id: 'img_prop_006_01',
                url: 'https://images.unsplash.com/photo-1622015663319-e97e697503ee?auto=format&fit=crop&w=1200&q=80',
                thumbnail: false,
                sortOrder: 1,
            },
            {
                id: 'img_prop_006_02',
                url: 'https://images.unsplash.com/photo-1622015663084-307d19eabbbf?auto=format&fit=crop&w=1200&q=80',
                thumbnail: false,
                sortOrder: 2,
            },
        ],
        addons: [],
        roomTypes: [
            {
                id: 'rt_006_01',
                name: 'Entire Villa — 4 Bedrooms',
                internalCode: 'VILLA-4BR-01',
                description:
                    'The entire 4-bedroom villa rented as one unit. Sleeps up to 8 guests across two king rooms, one twin room, and one bunk room.',
                maxAdults: 6,
                maxChildren: 2,
                maxOccupancy: 8,
                ratePlans: [
                    {
                        id: 'rp_010',
                        code: 'BAR',
                        name: 'Standard Rate',
                        status: 'ACTIVE',
                        defaultPrice: 680,
                        defaultMinLOS: null,
                        defaultMaxLOS: null,
                    },
                ],
                roomSize: 210,
                smokingRoom: false,
                accessibleRoom: false,
                bathroomType: 'PRIVATE',
                viewType: 'Ocean View',
                status: 'ACTIVE',
                beds: [
                    { id: 'bed_006_01_01', bedType: 'KING', quantity: 2 },
                    { id: 'bed_006_01_02', bedType: 'TWIN', quantity: 2 },
                    { id: 'bed_006_01_03', bedType: 'BUNK', quantity: 1 },
                ],
                amenities: [
                    {
                        amenity: {
                            id: 'amen_air_conditioning',
                            key: 'air_conditioning',
                            name: 'Air Conditioning',
                            category: 'room',
                            icon: 'Fan',
                        },
                    },
                    { amenity: { id: 'amen_tv', key: 'tv', name: 'TV', category: 'room', icon: 'Tv' } },
                    {
                        amenity: {
                            id: 'amen_coffee_machine',
                            key: 'coffee_machine',
                            name: 'Coffee Machine',
                            category: 'room',
                            icon: 'Coffee',
                        },
                    },
                    { amenity: { id: 'amen_desk', key: 'desk', name: 'Desk', category: 'room', icon: 'Notebook' } },
                    { amenity: { id: 'amen_kitchen', key: 'kitchen', name: 'Kitchen', category: 'room', icon: 'CookingPot' } },
                    { amenity: { id: 'amen_microwave', key: 'microwave', name: 'Microwave', category: 'room', icon: 'Microwave' } },
                    { amenity: { id: 'amen_refrigerator', key: 'refrigerator', name: 'Refrigerator', category: 'room', icon: 'Fridge' } },
                    { amenity: { id: 'amen_balcony', key: 'balcony', name: 'Balcony', category: 'room', icon: 'DoorOpen' } },
                    { amenity: { id: 'amen_hair_dryer', key: 'hair_dryer', name: 'Hair Dryer', category: 'room', icon: 'Wind' } },
                ],
                images: [
                    {
                        id: 'rti_006_01_thumb',
                        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
                        thumbnail: true,
                        sortOrder: 0,
                    },
                    {
                        id: 'rti_006_01_01',
                        url: 'https://images.unsplash.com/photo-1622015663319-e97e697503ee?auto=format&fit=crop&w=1200&q=80',
                        thumbnail: false,
                        sortOrder: 1,
                    },
                    {
                        id: 'rti_006_01_02',
                        url: 'https://images.unsplash.com/photo-1622015663084-307d19eabbbf?auto=format&fit=crop&w=1200&q=80',
                        thumbnail: false,
                        sortOrder: 2,
                    },
                ],
                units: [{ id: 'unit_006_01_01', roomNumber: 'VILLA-01', floor: '1-2' }],
            },
        ],
    },
]

export function getPropertyById(id: string): Property | undefined {
    return PROPERTIES.find((p) => p.id === id)
}

export function getPriceRange<T extends { roomTypes: { ratePlans: { defaultPrice: number | string }[] }[] }>(property: T) {
    const prices = property.roomTypes
        .flatMap((rt) => rt.ratePlans.map((rp) => Number(rp.defaultPrice)))
        .filter((n) => Number.isFinite(n) && n > 0)

    if (prices.length === 0) {
        return { min: 0, max: 0 }
    }

    const min = Math.min(...prices)
    const max = Math.max(...prices)
    return { min, max }
}

export function formatPrice(value: string | number | null) {
    if (value == null) return '—'
    const num = typeof value === 'string' ? Number(value) : value
    if (Number.isNaN(num)) return '—'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
}
