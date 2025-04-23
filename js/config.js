const CONFIG = {
    API_BASE_URL: 'http://localhost:3002/api',
    POLLING_INTERVAL: 5000,
    BUILDINGS: [
        { code: 'C1', name: '1栋', units: 1, unitsPerFloor: 3, floorRange: { start: 2, end: 33 } },
        { code: 'C2', name: '2栋', units: 2, unitsPerFloor: 4, floorRange: { start: 2, end: 32 } },
        { code: 'C3', name: '3栋', units: 1, unitsPerFloor: 3, floorRange: { start: 2, end: 33 } },
        { code: 'C4', name: '4栋', units: 1, unitsPerFloor: 3, floorRange: { start: 2, end: 33 } },
        { code: 'C5', name: '5栋', units: 1, unitsPerFloor: 3, floorRange: { start: 2, end: 33 } },
        { code: 'C6', name: '6栋', units: 1, unitsPerFloor: 3, floorRange: { start: 2, end: 33 } },
        { code: 'C7', name: '7栋', units: 1, unitsPerFloor: 3, floorRange: { start: 2, end: 33 } },
        { code: 'C8', name: '8栋', units: 1, unitsPerFloor: 3, floorRange: { start: 2, end: 33 } },
        { code: 'C9', name: '9栋', units: 1, unitsPerFloor: 3, floorRange: { start: 2, end: 32 } },
        { code: 'C10', name: '10栋', units: 2, unitsPerFloor: 4, floorRange: { start: 2, end: 32 }},
        { code: 'C11', name: '11栋', units: 1, unitsPerFloor: 4, floorRange: { start: 2, end: 31 } },
        { 
            code: 'C12', 
            name: '12栋', 
            units: 2, 
            floorRange: { start: 1, end: 7 },
            specialFloors: {
                1: { unitsPerFloor: 2 }, // 1-2层洋楼合并4户
                2: { unitsPerFloor: 2 },
                3: { unitsPerFloor: 1 }, // 3-5层每层2户
                4: { unitsPerFloor: 1 },
                5: { unitsPerFloor: 1 },
                6: { unitsPerFloor: 1 }, // 6-7层合并2户
                7: { unitsPerFloor: 1 }
            }
        },
        { 
            code: 'C13', 
            name: '13栋', 
            units: 2, 
            floorRange: { start: 1, end: 7 },
            specialFloors: {
                1: { unitsPerFloor: 2 },
                2: { unitsPerFloor: 2 },
                3: { unitsPerFloor: 1 },
                4: { unitsPerFloor: 1 },
                5: { unitsPerFloor: 1 },
                6: { unitsPerFloor: 1 },
                7: { unitsPerFloor: 1 }
            }
        },
        { 
            code: 'C14', 
            name: '14栋', 
            units: 1, 
            floorRange: { start: 1, end: 7 },
            specialFloors: {
                1: { unitsPerFloor: 2 },
                2: { unitsPerFloor: 2 },
                3: { unitsPerFloor: 1 },
                4: { unitsPerFloor: 1 },
                5: { unitsPerFloor: 1 },
                6: { unitsPerFloor: 1 },
                7: { unitsPerFloor: 1 }
            }
        },
        { 
            code: 'C15', 
            name: '15栋', 
            units: 2, 
            floorRange: { start: 1, end: 7 },
            specialFloors: {
                1: { unitsPerFloor: 2 },
                2: { unitsPerFloor: 2 },
                3: { unitsPerFloor: 1 },
                4: { unitsPerFloor: 1 },
                5: { unitsPerFloor: 1 },
                6: { unitsPerFloor: 1 },
                7: { unitsPerFloor: 1 }
            }
        },
        { 
            code: 'C16', 
            name: '16栋', 
            units: 1, 
            floorRange: { start: 1, end: 7 },
            specialFloors: {
                1: { unitsPerFloor: 2 },
                2: { unitsPerFloor: 2 },
                3: { unitsPerFloor: 1 },
                4: { unitsPerFloor: 1 },
                5: { unitsPerFloor: 1 },
                6: { unitsPerFloor: 1 },
                7: { unitsPerFloor: 1 }
            }
        },
        { 
            code: 'C17', 
            name: '17栋', 
            units: 2, 
            floorRange: { start: 1, end: 7 },
            specialFloors: {
                1: { unitsPerFloor: 2 },
                2: { unitsPerFloor: 2 },
                3: { unitsPerFloor: 1 },
                4: { unitsPerFloor: 1 },
                5: { unitsPerFloor: 1 },
                6: { unitsPerFloor: 1 },
                7: { unitsPerFloor: 1 }
            }
        },
        { code: 'SP', name: '商铺', units: 1, unitsPerFloor: 45, isShop: true }
    ],
    FLOOR_RANGE: {
        START: 1,
        END: 33
    },
    TOTAL_UNITS: 1549
};