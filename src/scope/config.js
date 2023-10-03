const size = {
    width: 256,
    height: 256
};
const config = {
    size,
    engineConfig: {
        updateWorkers: 1,
        useNeuronWorkers: false,
        randomNeuronConnections: true
    },
    levels: [
        // lvl 1
        {
            walls: [],
            breedingAreas: [
                [
                    new Vector([0, 0], Object.values(size)),
                    new Vector([size.width / 2.5, size.height / 2.5], Object.values(size)),
                ],
                [
                    new Vector([size.width - (size.width / 2.5), 0], Object.values(size)),
                    new Vector([size.width, size.height / 2.5], Object.values(size)),
                ],
                [
                    new Vector([size.width - (size.width / 2.5), size.height - (size.height / 2.5)], Object.values(size)),
                    new Vector([size.width, size.height], Object.values(size)),
                ],
                [
                    new Vector([0, size.height - (size.height / 2.5)], Object.values(size)),
                    new Vector([size.width / 2.5, size.height], Object.values(size)),
                ],
            ],
            spawnAreas: [
                [
                    new Vector([size.width / 2.5, 0], Object.values(size)),
                    new Vector([size.width - (size.width / 2.5), size.height], Object.values(size)),
                ],
                [
                    new Vector([0, size.height / 2.5], Object.values(size)),
                    new Vector([size.width / 2.5, size.height - size.height / 2.5], Object.values(size)),
                ],
                [
                    new Vector([size.width - size.width / 2.5, size.height / 2.5], Object.values(size)),
                    new Vector([size.width, size.height - size.height / 2.5], Object.values(size)),
                ],
            ]
        },
        {
            walls: [],
            breedingAreas: [
                [
                    new Vector([0, 0], Object.values(size)),
                    new Vector([size.width / 6, size.height / 6], Object.values(size)),
                ],
                [
                    new Vector([size.width - (size.width / 6), 0], Object.values(size)),
                    new Vector([size.width, size.height / 6], Object.values(size)),
                ],
                [
                    new Vector([size.width - (size.width / 6), size.height - (size.height / 6)], Object.values(size)),
                    new Vector([size.width, size.height], Object.values(size)),
                ],
                [
                    new Vector([0, size.height - (size.height / 6)], Object.values(size)),
                    new Vector([size.width / 6, size.height], Object.values(size)),
                ],
            ],
            spawnAreas: [
                [
                    new Vector([0, 0], Object.values(size)),
                    new Vector([size.width, size.height], Object.values(size)),
                ]
            ]
        },
        // lvl 2
        {
            walls: [],
            breedingAreas: [
                [
                    new Vector([size.width - (size.width / 2), 0], Object.values(size)),
                    new Vector([size.width, (size.height / 2) - 20], Object.values(size)),
                ],
                [
                    new Vector([size.width - (size.width / 2), (size.height / 2) + 20], Object.values(size)),
                    new Vector([size.width, size.height], Object.values(size)),
                ],
            ],
            spawnAreas: [
                [
                    new Vector([0, 0], Object.values(size)),
                    new Vector([size.width, size.height], Object.values(size)),
                ]
            ]
        },
        // lvl 3
        {
            walls: [],
            breedingAreas: [
                [
                    new Vector([size.width - (size.width / 2), 0], Object.values(size)),
                    new Vector([size.width, (size.height / 2) - 20], Object.values(size)),
                ],
                [
                    new Vector([size.width - (size.width / 2), (size.height / 2) + 20], Object.values(size)),
                    new Vector([size.width, size.height], Object.values(size)),
                ],
            ],
            spawnAreas: [
                [
                    new Vector([0, 0], Object.values(size)),
                    new Vector([size.width / 2, size.height], Object.values(size)),
                ]
            ]
        },
        // lvl 4
        {
            walls: [],
            breedingAreas: [
                [
                    new Vector([size.width - (size.width / 8), 0], Object.values(size)),
                    new Vector([size.width, size.height], Object.values(size)),
                ],
            ],
            spawnAreas: [
                [
                    new Vector([0, 0], Object.values(size)),
                    new Vector([size.width / 2, size.height], Object.values(size)),
                ]
            ]
        },
        // lvl 5
        {
            walls: [],
            breedingAreas: [
                [new Vector([size.width - (size.width / 8), 0], Object.values(size)), new Vector([size.width, size.height], Object.values(size))],
            ],
            spawnAreas: [
                [
                    new Vector([0, 0], Object.values(size)),
                    new Vector([size.width / 8, size.height], Object.values(size)),
                ],
            ]
        },
        {
            walls: [
                [new Vector([180,80], Object.values(size)), new Vector([182,170], Object.values(size))],
            ],
            breedingAreas: [
                [new Vector([size.width - (size.width / 8), 0], Object.values(size)), new Vector([size.width, size.height], Object.values(size))],
            ],
            spawnAreas: [
                [
                    new Vector([0, 0], Object.values(size)),
                    new Vector([size.width / 8, size.height], Object.values(size)),
                ],
            ]
        },
        {
            walls: [
                [new Vector([60,0], Object.values(size)), new Vector([62,100], Object.values(size))],
                [new Vector([60,156], Object.values(size)), new Vector([62,256], Object.values(size))],
                [new Vector([180,80], Object.values(size)), new Vector([182,170], Object.values(size))],
            ],
            breedingAreas: [
                [new Vector([size.width - (size.width / 8), 0], Object.values(size)), new Vector([size.width, size.height], Object.values(size))],
            ],
            spawnAreas: [
                [
                    new Vector([0, 0], Object.values(size)),
                    new Vector([size.width / 8, 90], Object.values(size)),
                ],
                [
                    new Vector([0, 170], Object.values(size)),
                    new Vector([size.width / 8, 256], Object.values(size)),
                ]
            ]
        },
        {
            walls: [
                [new Vector([60,30], Object.values(size)), new Vector([62,120], Object.values(size))],
                [new Vector([60,150], Object.values(size)), new Vector([62,230], Object.values(size))],
                [new Vector([180,80], Object.values(size)), new Vector([182,170], Object.values(size))],
                [new Vector([210,200], Object.values(size)), new Vector([212,256], Object.values(size))],
                [new Vector([210,0], Object.values(size)), new Vector([212,56], Object.values(size))],


                [new Vector([100,40], Object.values(size)), new Vector([160,42], Object.values(size))],
                [new Vector([100,210], Object.values(size)), new Vector([160,212], Object.values(size))],
            ],
            breedingAreas: [
                [new Vector([size.width - (size.width / 8), 0], Object.values(size)), new Vector([size.width, size.height], Object.values(size))],
            ],
            spawnAreas: [
                [
                    new Vector([0, 30], Object.values(size)),
                    new Vector([size.width / 8, 120], Object.values(size)),
                ],
                [
                    new Vector([0, 150], Object.values(size)),
                    new Vector([size.width / 8, 230], Object.values(size)),
                ]
            ]
        }
    ]
}