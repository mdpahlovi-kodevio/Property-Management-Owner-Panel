export type Property = {
    property: {
        id: string
        name: string
        propertyType: string
        description: string
        status: 'Active' | 'Inactive' | 'Draft'
        rating: number
        reviewCount: number
        currency: string
        country: string
        state: string
        city: string
        postalCode: string
        address1: string
        address2: string | null
        latitude: number
        longitude: number
        timezone: string
        checkInTime: string
        checkOutTime: string
        amenities: string[]
        policies: {
            smokingAllowed: boolean
            petsAllowed: boolean
            childrenAllowed: boolean
            partiesAllowed: boolean
            minimumGuestAge: number
            securityDeposit: number
            houseRules: string
        }
        images: {
            thumbnail: string
            gallery: string[]
        }
    }
    roomTypes: Array<{
        id: string
        propertyId: string
        name: string
        internalCode: string
        description: string
        maxAdults: number
        maxChildren: number
        maxOccupancy: number
        basePrice: number
        roomSize: number
        roomSizeUnit: 'sqm' | 'sqft'
        beds: Array<{ id: string; bedType: string; quantity: number }>
        amenities: string[]
        units: Array<{ id: string; roomNumber: string; floor: string }>
        smokingRoom: boolean
        accessibleRoom: boolean
        privateBathroom: boolean
        sharedBathroom: boolean
        viewType: string
        images: {
            thumbnail: string
            gallery: string[]
        }
    }>
}

export const PROPERTIES: Property[] = [
    {
        property: {
            id: 'prop_001',
            name: 'The Azure Cliff Resort',
            propertyType: 'Resort',
            description:
                "A clifftop resort perched above Uluwatu's famous surf break, offering panoramic Indian Ocean views, infinity pools, and a world-class spa. Perfect for honeymooners and luxury travellers.",
            status: 'Active',
            rating: 4.8,
            reviewCount: 312,
            currency: 'USD',
            country: 'Indonesia',
            state: 'Bali',
            city: 'Uluwatu',
            postalCode: '80364',
            address1: 'Jl. Labuansait No. 7',
            address2: null,
            latitude: -8.8291,
            longitude: 115.0849,
            timezone: 'Asia/Bali (UTC+8)',
            checkInTime: '15:00',
            checkOutTime: '12:00',
            amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Gym', 'Airport Shuttle', '24-hr Front Desk'],
            policies: {
                smokingAllowed: false,
                petsAllowed: false,
                childrenAllowed: true,
                partiesAllowed: false,
                minimumGuestAge: 12,
                securityDeposit: 200.0,
                houseRules: 'No smoking anywhere on the property. Quiet hours after 10pm. No outside food in pool areas.',
            },
            images: {
                thumbnail: 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?auto=format&fit=crop&w=1200&q=80',
                gallery: [
                    'https://images.unsplash.com/photo-1623718649591-311775a30c43?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
                ],
            },
        },
        roomTypes: [
            {
                id: 'rt_001_01',
                propertyId: 'prop_001',
                name: 'Cliff View King Suite',
                internalCode: 'CLF-KNG-01',
                description: 'Spacious suite with a private plunge pool and unobstructed views of the Indian Ocean.',
                maxAdults: 2,
                maxChildren: 1,
                maxOccupancy: 3,
                basePrice: 450,
                roomSize: 72,
                roomSizeUnit: 'sqm',
                beds: [{ id: 'bed_001_01_01', bedType: 'King', quantity: 1 }],
                amenities: ['Air Conditioning', 'TV', 'Mini Bar', 'Coffee Machine', 'Balcony', 'Safe', 'Bathtub'],
                units: [
                    { id: 'unit_001_01_01', roomNumber: '301', floor: '3' },
                    { id: 'unit_001_01_02', roomNumber: '302', floor: '3' },
                    { id: 'unit_001_01_03', roomNumber: '401', floor: '4' },
                ],
                smokingRoom: false,
                accessibleRoom: false,
                privateBathroom: true,
                sharedBathroom: false,
                viewType: 'Ocean View',
                images: {
                    thumbnail: 'https://images.unsplash.com/photo-1630587148265-761cbd139043?auto=format&fit=crop&w=1200&q=80',
                    gallery: ['https://images.unsplash.com/photo-1630587148265-761cbd139043?auto=format&fit=crop&w=1200&q=80'],
                },
            },
        ],
    },

    {
        property: {
            id: 'prop_002',
            name: 'Nomad House Dhaka',
            propertyType: 'Serviced Apartment',
            description:
                'Modern co-living and short-stay serviced apartments in the heart of Gulshan, designed for remote workers and business travellers. Fast internet, flexible check-in, and rooftop workspace.',
            status: 'Active',
            rating: 4.5,
            reviewCount: 87,
            currency: 'BDT',
            country: 'Bangladesh',
            state: 'Dhaka Division',
            city: 'Dhaka',
            postalCode: '1212',
            address1: 'House 14, Road 48',
            address2: 'Gulshan-2',
            latitude: 23.7937,
            longitude: 90.4066,
            timezone: 'Asia/Dhaka (UTC+6)',
            checkInTime: '13:00',
            checkOutTime: '11:00',
            amenities: ['WiFi', 'Gym', 'Laundry', 'Elevator', 'Business Center', '24-hr Front Desk'],
            policies: {
                smokingAllowed: false,
                petsAllowed: false,
                childrenAllowed: true,
                partiesAllowed: false,
                minimumGuestAge: 18,
                securityDeposit: 50.0,
                houseRules: 'No smoking indoors. Guests must show ID at check-in. Quiet hours 11pm–7am.',
            },
            images: {
                thumbnail: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80',
                gallery: [
                    'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?auto=format&fit=crop&w=1200&q=80',
                ],
            },
        },
        roomTypes: [
            {
                id: 'rt_002_01',
                propertyId: 'prop_002',
                name: 'Studio Apartment',
                internalCode: 'STD-APT-01',
                description: 'Compact, fully furnished studio with a dedicated work desk, kitchenette, and high-speed fibre internet.',
                maxAdults: 2,
                maxChildren: 0,
                maxOccupancy: 2,
                basePrice: 8500,
                roomSize: 32,
                roomSizeUnit: 'sqm',
                beds: [{ id: 'bed_002_01_01', bedType: 'Queen', quantity: 1 }],
                amenities: ['Air Conditioning', 'TV', 'Coffee Machine', 'Desk', 'Kitchen', 'Refrigerator', 'Safe'],
                units: [
                    { id: 'unit_002_01_01', roomNumber: '201', floor: '2' },
                    { id: 'unit_002_01_02', roomNumber: '202', floor: '2' },
                    { id: 'unit_002_01_03', roomNumber: '203', floor: '2' },
                    { id: 'unit_002_01_04', roomNumber: '204', floor: '2' },
                ],
                smokingRoom: false,
                accessibleRoom: false,
                privateBathroom: true,
                sharedBathroom: false,
                viewType: 'City View',
                images: {
                    thumbnail: 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?auto=format&fit=crop&w=1200&q=80',
                    gallery: ['https://images.unsplash.com/photo-1631049552057-403cdb8f0658?auto=format&fit=crop&w=1200&q=80'],
                },
            },
            {
                id: 'rt_002_02',
                propertyId: 'prop_002',
                name: 'One-Bedroom Executive',
                internalCode: '1BR-EXC-01',
                description: 'Separate bedroom with a full living room and kitchenette. Ideal for week-long and monthly stays.',
                maxAdults: 2,
                maxChildren: 1,
                maxOccupancy: 3,
                basePrice: 14500,
                roomSize: 55,
                roomSizeUnit: 'sqm',
                beds: [
                    { id: 'bed_002_02_01', bedType: 'King', quantity: 1 },
                    { id: 'bed_002_02_02', bedType: 'Sofa Bed', quantity: 1 },
                ],
                amenities: ['Air Conditioning', 'TV', 'Coffee Machine', 'Desk', 'Kitchen', 'Refrigerator', 'Microwave', 'Safe'],
                units: [
                    { id: 'unit_002_02_01', roomNumber: '501', floor: '5' },
                    { id: 'unit_002_02_02', roomNumber: '502', floor: '5' },
                ],
                smokingRoom: false,
                accessibleRoom: false,
                privateBathroom: true,
                sharedBathroom: false,
                viewType: 'City View',
                images: {
                    thumbnail: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
                    gallery: ['https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80'],
                },
            },
        ],
    },

    {
        property: {
            id: 'prop_003',
            name: 'Maison Lumière',
            propertyType: 'Boutique Hotel',
            description:
                'A 19th-century Haussmann building transformed into a 22-room boutique hotel in Saint-Germain-des-Prés. Hand-curated art, original parquet floors, and a hidden courtyard garden.',
            status: 'Active',
            rating: 4.7,
            reviewCount: 543,
            currency: 'EUR',
            country: 'France',
            state: 'Île-de-France',
            city: 'Paris',
            postalCode: '75006',
            address1: "12 Rue de l'Abbaye",
            address2: null,
            latitude: 48.8534,
            longitude: 2.3352,
            timezone: 'Europe/Paris (UTC+1)',
            checkInTime: '15:00',
            checkOutTime: '12:00',
            amenities: ['WiFi', 'Bar', 'Elevator', 'Laundry', '24-hr Front Desk', 'Wheelchair Accessible'],
            policies: {
                smokingAllowed: false,
                petsAllowed: true,
                childrenAllowed: true,
                partiesAllowed: false,
                minimumGuestAge: 0,
                securityDeposit: 150.0,
                houseRules: 'Pets welcome (max 10kg). No smoking anywhere inside. Noise curfew at 11pm.',
            },
            images: {
                thumbnail: 'https://images.unsplash.com/photo-1546783155-4ef83c00d4ef?auto=format&fit=crop&w=1200&q=80',
                gallery: [
                    'https://images.unsplash.com/photo-1546783155-4ef83c00d4ef?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
                ],
            },
        },
        roomTypes: [
            {
                id: 'rt_003_01',
                propertyId: 'prop_003',
                name: 'Classique Double',
                internalCode: 'CLS-DBL-01',
                description: 'Elegant double room with original exposed beams, premium cotton linens, and a clawfoot bathtub.',
                maxAdults: 2,
                maxChildren: 0,
                maxOccupancy: 2,
                basePrice: 280,
                roomSize: 24,
                roomSizeUnit: 'sqm',
                beds: [{ id: 'bed_003_01_01', bedType: 'Double', quantity: 1 }],
                amenities: ['Air Conditioning', 'TV', 'Coffee Machine', 'Safe', 'Bathtub', 'Hair Dryer'],
                units: [
                    { id: 'unit_003_01_01', roomNumber: '101', floor: '1' },
                    { id: 'unit_003_01_02', roomNumber: '102', floor: '1' },
                    { id: 'unit_003_01_03', roomNumber: '201', floor: '2' },
                    { id: 'unit_003_01_04', roomNumber: '202', floor: '2' },
                ],
                smokingRoom: false,
                accessibleRoom: false,
                privateBathroom: true,
                sharedBathroom: false,
                viewType: 'Courtyard View',
                images: {
                    thumbnail: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
                    gallery: ['https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80'],
                },
            },
            {
                id: 'rt_003_02',
                propertyId: 'prop_003',
                name: 'Supérieure Courtyard Suite',
                internalCode: 'SUP-CRT-01',
                description: 'Larger suite overlooking the private courtyard garden, with a separate sitting area and walk-in wardrobe.',
                maxAdults: 2,
                maxChildren: 1,
                maxOccupancy: 3,
                basePrice: 420,
                roomSize: 42,
                roomSizeUnit: 'sqm',
                beds: [{ id: 'bed_003_02_01', bedType: 'King', quantity: 1 }],
                amenities: ['Air Conditioning', 'TV', 'Mini Bar', 'Coffee Machine', 'Desk', 'Safe', 'Bathtub', 'Hair Dryer'],
                units: [
                    { id: 'unit_003_02_01', roomNumber: '301', floor: '3' },
                    { id: 'unit_003_02_02', roomNumber: '302', floor: '3' },
                ],
                smokingRoom: false,
                accessibleRoom: false,
                privateBathroom: true,
                sharedBathroom: false,
                viewType: 'Courtyard View',
                images: {
                    thumbnail: 'https://images.unsplash.com/photo-1630587148265-761cbd139043?auto=format&fit=crop&w=1200&q=80',
                    gallery: ['https://images.unsplash.com/photo-1630587148265-761cbd139043?auto=format&fit=crop&w=1200&q=80'],
                },
            },
        ],
    },

    {
        property: {
            id: 'prop_004',
            name: 'Silverleaf Mountain Lodge',
            propertyType: 'Guest House',
            description:
                'A cosy 8-room mountain lodge near Banff National Park with ski-in/ski-out access, a wood-burning fireplace lounge, and complimentary hearty breakfast.',
            status: 'Active',
            rating: 4.9,
            reviewCount: 218,
            currency: 'CAD',
            country: 'Canada',
            state: 'Alberta',
            city: 'Banff',
            postalCode: 'T1L 1B3',
            address1: '220 Lynx Street',
            address2: null,
            latitude: 51.1784,
            longitude: -115.5708,
            timezone: 'America/Denver (UTC-7)',
            checkInTime: '16:00',
            checkOutTime: '10:00',
            amenities: ['WiFi', 'Parking', 'Laundry', 'Pet Friendly'],
            policies: {
                smokingAllowed: false,
                petsAllowed: true,
                childrenAllowed: true,
                partiesAllowed: false,
                minimumGuestAge: 0,
                securityDeposit: 100.0,
                houseRules: 'Ski boots must be removed at entrance. Pets allowed in designated rooms only. No loud noise after 9:30pm.',
            },
            images: {
                thumbnail: 'https://images.unsplash.com/photo-1602436324859-62a81466e723?auto=format&fit=crop&w=1200&q=80',
                gallery: [
                    'https://images.unsplash.com/photo-1602436324859-62a81466e723?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1623718649591-311775a30c43?auto=format&fit=crop&w=1200&q=80',
                ],
            },
        },
        roomTypes: [
            {
                id: 'rt_004_01',
                propertyId: 'prop_004',
                name: 'Timber King Room',
                internalCode: 'TMB-KNG-01',
                description: 'Warm timber-clad room with a king bed, heated floors, and mountain views through floor-to-ceiling windows.',
                maxAdults: 2,
                maxChildren: 0,
                maxOccupancy: 2,
                basePrice: 320,
                roomSize: 28,
                roomSizeUnit: 'sqm',
                beds: [{ id: 'bed_004_01_01', bedType: 'King', quantity: 1 }],
                amenities: ['TV', 'Coffee Machine', 'Safe', 'Hair Dryer'],
                units: [
                    { id: 'unit_004_01_01', roomNumber: '01', floor: '1' },
                    { id: 'unit_004_01_02', roomNumber: '02', floor: '1' },
                    { id: 'unit_004_01_03', roomNumber: '03', floor: '1' },
                ],
                smokingRoom: false,
                accessibleRoom: false,
                privateBathroom: true,
                sharedBathroom: false,
                viewType: 'Mountain View',
                images: {
                    thumbnail: 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?auto=format&fit=crop&w=1200&q=80',
                    gallery: ['https://images.unsplash.com/photo-1631049552057-403cdb8f0658?auto=format&fit=crop&w=1200&q=80'],
                },
            },
            {
                id: 'rt_004_02',
                propertyId: 'prop_004',
                name: 'Family Loft',
                internalCode: 'FAM-LFT-01',
                description: 'Two-level loft with a king downstairs and two twin beds in the mezzanine, perfect for families.',
                maxAdults: 2,
                maxChildren: 2,
                maxOccupancy: 4,
                basePrice: 540,
                roomSize: 48,
                roomSizeUnit: 'sqm',
                beds: [
                    { id: 'bed_004_02_01', bedType: 'King', quantity: 1 },
                    { id: 'bed_004_02_02', bedType: 'Twin', quantity: 2 },
                ],
                amenities: ['TV', 'Coffee Machine', 'Refrigerator', 'Safe', 'Hair Dryer'],
                units: [
                    { id: 'unit_004_02_01', roomNumber: 'L1', floor: '2' },
                    { id: 'unit_004_02_02', roomNumber: 'L2', floor: '2' },
                ],
                smokingRoom: false,
                accessibleRoom: false,
                privateBathroom: true,
                sharedBathroom: false,
                viewType: 'Mountain View',
                images: {
                    thumbnail: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
                    gallery: ['https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80'],
                },
            },
        ],
    },

    {
        property: {
            id: 'prop_005',
            name: 'Urban Capsule Bangkok',
            propertyType: 'Hostel',
            description:
                "A design-forward capsule hostel in the Silom district, blending privacy pod sleeping with a vibrant rooftop social bar. Targeted at solo and budget-conscious travellers who don't want to compromise on style.",
            status: 'Active',
            rating: 4.4,
            reviewCount: 1204,
            currency: 'THB',
            country: 'Thailand',
            state: 'Bangkok',
            city: 'Bangkok',
            postalCode: '10500',
            address1: '29 Silom Road, Bang Rak',
            address2: null,
            latitude: 13.7246,
            longitude: 100.5284,
            timezone: 'Asia/Bangkok (UTC+7)',
            checkInTime: '14:00',
            checkOutTime: '11:00',
            amenities: ['WiFi', 'Bar', 'Laundry', 'Elevator', '24-hr Front Desk'],
            policies: {
                smokingAllowed: false,
                petsAllowed: false,
                childrenAllowed: false,
                partiesAllowed: false,
                minimumGuestAge: 18,
                securityDeposit: 20.0,
                houseRules: '18+ only. No outside alcohol. Capsule lights out 11pm–7am. Lockers provided; own padlock required.',
            },
            images: {
                thumbnail: 'https://images.unsplash.com/photo-1639647564912-651e29b8e6ad?auto=format&fit=crop&w=1200&q=80',
                gallery: [
                    'https://images.unsplash.com/photo-1639647564912-651e29b8e6ad?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
                ],
            },
        },
        roomTypes: [
            {
                id: 'rt_005_01',
                propertyId: 'prop_005',
                name: 'Standard Pod — Mixed Dorm',
                internalCode: 'POD-MXD-01',
                description:
                    'Individual privacy pod in a mixed-gender 8-pod dorm. Each pod has its own reading light, USB charging, and blackout blind.',
                maxAdults: 1,
                maxChildren: 0,
                maxOccupancy: 1,
                basePrice: 650,
                roomSize: 4,
                roomSizeUnit: 'sqm',
                beds: [{ id: 'bed_005_01_01', bedType: 'Single', quantity: 1 }],
                amenities: ['Air Conditioning', 'Safe'],
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
                smokingRoom: false,
                accessibleRoom: false,
                privateBathroom: false,
                sharedBathroom: true,
                viewType: 'City View',
                images: {
                    thumbnail: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
                    gallery: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80'],
                },
            },
            {
                id: 'rt_005_02',
                propertyId: 'prop_005',
                name: 'Private Double Pod',
                internalCode: 'POD-PVT-01',
                description: 'A walled private pod room for two with a lockable door, double bed, and ensuite shower.',
                maxAdults: 2,
                maxChildren: 0,
                maxOccupancy: 2,
                basePrice: 1800,
                roomSize: 12,
                roomSizeUnit: 'sqm',
                beds: [{ id: 'bed_005_02_01', bedType: 'Double', quantity: 1 }],
                amenities: ['Air Conditioning', 'TV', 'Safe', 'Hair Dryer'],
                units: [
                    { id: 'unit_005_02_01', roomNumber: 'P1', floor: '4' },
                    { id: 'unit_005_02_02', roomNumber: 'P2', floor: '4' },
                    { id: 'unit_005_02_03', roomNumber: 'P3', floor: '4' },
                ],
                smokingRoom: false,
                accessibleRoom: false,
                privateBathroom: true,
                sharedBathroom: false,
                viewType: 'City View',
                images: {
                    thumbnail: 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?auto=format&fit=crop&w=1200&q=80',
                    gallery: ['https://images.unsplash.com/photo-1631049552057-403cdb8f0658?auto=format&fit=crop&w=1200&q=80'],
                },
            },
        ],
    },

    {
        property: {
            id: 'prop_006',
            name: 'Casa Ventana',
            propertyType: 'Vacation Rental',
            description:
                "A privately owned 4-bedroom whitewashed villa in Tarifa, Spain — Europe's kitesurfing capital. Direct beach access, a sun terrace with Atlantic views, and a fully equipped chef's kitchen.",
            status: 'Active',
            rating: 4.6,
            reviewCount: 67,
            currency: 'EUR',
            country: 'Spain',
            state: 'Andalusia',
            city: 'Tarifa',
            postalCode: '11380',
            address1: 'Calle Batalla del Salado 18',
            address2: null,
            latitude: 36.0143,
            longitude: -5.6044,
            timezone: 'Europe/Madrid (UTC+1)',
            checkInTime: '16:00',
            checkOutTime: '10:00',
            amenities: ['WiFi', 'Parking', 'Pool', 'Pet Friendly'],
            policies: {
                smokingAllowed: false,
                petsAllowed: true,
                childrenAllowed: true,
                partiesAllowed: false,
                minimumGuestAge: 0,
                securityDeposit: 500.0,
                houseRules: 'Whole-home rental only; no events. Pool heating available at extra charge. BBQ allowed on terrace only.',
            },
            images: {
                thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
                gallery: [
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1622015663319-e97e697503ee?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1622015663084-307d19eabbbf?auto=format&fit=crop&w=1200&q=80',
                ],
            },
        },
        roomTypes: [
            {
                id: 'rt_006_01',
                propertyId: 'prop_006',
                name: 'Entire Villa — 4 Bedrooms',
                internalCode: 'VILLA-4BR-01',
                description:
                    'The entire 4-bedroom villa rented as one unit. Sleeps up to 8 guests across two king rooms, one twin room, and one bunk room.',
                maxAdults: 6,
                maxChildren: 2,
                maxOccupancy: 8,
                basePrice: 680,
                roomSize: 210,
                roomSizeUnit: 'sqm',
                beds: [
                    { id: 'bed_006_01_01', bedType: 'King', quantity: 2 },
                    { id: 'bed_006_01_02', bedType: 'Twin', quantity: 2 },
                    { id: 'bed_006_01_03', bedType: 'Bunk', quantity: 1 },
                ],
                amenities: [
                    'Air Conditioning',
                    'TV',
                    'Coffee Machine',
                    'Desk',
                    'Kitchen',
                    'Microwave',
                    'Refrigerator',
                    'Balcony',
                    'Hair Dryer',
                ],
                units: [{ id: 'unit_006_01_01', roomNumber: 'VILLA-01', floor: '1-2' }],
                smokingRoom: false,
                accessibleRoom: false,
                privateBathroom: true,
                sharedBathroom: false,
                viewType: 'Ocean View',
                images: {
                    thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
                    gallery: [
                        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
                        'https://images.unsplash.com/photo-1622015663319-e97e697503ee?auto=format&fit=crop&w=1200&q=80',
                        'https://images.unsplash.com/photo-1622015663084-307d19eabbbf?auto=format&fit=crop&w=1200&q=80',
                    ],
                },
            },
        ],
    },
]

export function getPropertyById(id: string): Property | undefined {
    return PROPERTIES.find((p) => p.property.id === id)
}

export function getPriceRange(property: Property) {
    const prices = property.roomTypes.map((rt) => rt.basePrice)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    return { min, max }
}

export function formatPrice(value: number, currency: string) {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            maximumFractionDigits: 0,
        }).format(value)
    } catch {
        return `${currency} ${value}`
    }
}