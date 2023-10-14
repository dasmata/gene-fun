const size = {
    width: 256,
    height: 256
};
const config = {
    size,
    engineConfig: {
        workers: 2, // * 100%
        useNeuronWorkers: false,
        randomNeuronConnections: true
    },
    levels: [
        // lvl 1
        // {
        //     walls: [
        //     ],
        //     breedingAreas: [
        //         [
        //             new Vector([0, 0], Object.values(size)),
        //             new Vector([size.width / 2.5, size.height / 2.5], Object.values(size)),
        //         ],
        //         [
        //             new Vector([size.width - (size.width / 2.5), 0], Object.values(size)),
        //             new Vector([size.width, size.height / 2.5], Object.values(size)),
        //         ],
        //         [
        //             new Vector([size.width - (size.width / 2.5), size.height - (size.height / 2.5)], Object.values(size)),
        //             new Vector([size.width, size.height], Object.values(size)),
        //         ],
        //         [
        //             new Vector([0, size.height - (size.height / 2.5)], Object.values(size)),
        //             new Vector([size.width / 2.5, size.height], Object.values(size)),
        //         ],
        //     ],
        //     spawnAreas: [
        //         [
        //             new Vector([size.width / 2.5, 0], Object.values(size)),
        //             new Vector([size.width - (size.width / 2.5), size.height], Object.values(size)),
        //         ],
        //         [
        //             new Vector([0, size.height / 2.5], Object.values(size)),
        //             new Vector([size.width / 2.5, size.height - size.height / 2.5], Object.values(size)),
        //         ],
        //         [
        //             new Vector([size.width - size.width / 2.5, size.height / 2.5], Object.values(size)),
        //             new Vector([size.width, size.height - size.height / 2.5], Object.values(size)),
        //         ],
        //     ]
        // },
        // {
        //     walls: [],
        //     breedingAreas: [
        //         [
        //             new Vector([0, 0], Object.values(size)),
        //             new Vector([size.width / 6, size.height / 6], Object.values(size)),
        //         ],
        //         [
        //             new Vector([size.width - (size.width / 6), 0], Object.values(size)),
        //             new Vector([size.width, size.height / 6], Object.values(size)),
        //         ],
        //         [
        //             new Vector([size.width - (size.width / 6), size.height - (size.height / 6)], Object.values(size)),
        //             new Vector([size.width, size.height], Object.values(size)),
        //         ],
        //         [
        //             new Vector([0, size.height - (size.height / 6)], Object.values(size)),
        //             new Vector([size.width / 6, size.height], Object.values(size)),
        //         ],
        //     ],
        //     spawnAreas: [
        //         [
        //             new Vector([50, 0], Object.values(size)),
        //             new Vector([size.width - 50, size.height], Object.values(size)),
        //         ]
        //     ]
        // },
        // lvl 2
        // {
        //     walls: [],
        //     breedingAreas: [
        //         [
        //             new Vector([size.width - (size.width / 2), 0], Object.values(size)),
        //             new Vector([size.width, (size.height / 2) - 20], Object.values(size)),
        //         ],
        //         [
        //             new Vector([size.width - (size.width / 2), (size.height / 2) + 20], Object.values(size)),
        //             new Vector([size.width, size.height], Object.values(size)),
        //         ],
        //     ],
        //     spawnAreas: [
        //         [
        //             new Vector([0, 0], Object.values(size)),
        //             new Vector([size.width, size.height], Object.values(size)),
        //         ]
        //     ]
        // },
        // lvl 3
        // {
        //     walls: [],
        //     breedingAreas: [
        //         [
        //             new Vector([size.width - (size.width / 2), 0], Object.values(size)),
        //             new Vector([size.width, (size.height / 2) - 20], Object.values(size)),
        //         ],
        //         [
        //             new Vector([size.width - (size.width / 2), (size.height / 2) + 20], Object.values(size)),
        //             new Vector([size.width, size.height], Object.values(size)),
        //         ],
        //     ],
        //     spawnAreas: [
        //         [
        //             new Vector([0, 0], Object.values(size)),
        //             new Vector([size.width / 2, size.height], Object.values(size)),
        //         ]
        //     ]
        // },
        // lvl 4
        // {
        //     walls: [],
        //     breedingAreas: [
        //         [
        //             new Vector([size.width - (size.width / 8), 0], Object.values(size)),
        //             new Vector([size.width, size.height], Object.values(size)),
        //         ],
        //     ],
        //     spawnAreas: [
        //         [
        //             new Vector([0, 0], Object.values(size)),
        //             new Vector([size.width / 2, size.height], Object.values(size)),
        //         ]
        //     ]
        // },
        // lvl 5
        // {
        //     walls: [],
        //     breedingAreas: [
        //         [new Vector([size.width - (size.width / 8), 0], Object.values(size)), new Vector([size.width, size.height], Object.values(size))],
        //     ],
        //     spawnAreas: [
        //         [
        //             new Vector([0, 0], Object.values(size)),
        //             new Vector([size.width / 8, size.height], Object.values(size)),
        //         ],
        //     ]
        // },
        // {
        //     walls: [
        //         [new Vector([180,80], Object.values(size)), new Vector([182,170], Object.values(size))],
        //     ],
        //     breedingAreas: [
        //         [new Vector([size.width - (size.width / 8), 0], Object.values(size)), new Vector([size.width, size.height], Object.values(size))],
        //     ],
        //     spawnAreas: [
        //         [
        //             new Vector([0, 0], Object.values(size)),
        //             new Vector([size.width / 8, size.height], Object.values(size)),
        //         ],
        //     ]
        // },
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
        },
        {
            walls: [
                [new Vector([30,60], Object.values(size)), new Vector([120, 62], Object.values(size))],
                [new Vector([150, 60], Object.values(size)), new Vector([230, 62], Object.values(size))],
                [new Vector([80, 180], Object.values(size)), new Vector([170, 182], Object.values(size))],
                [new Vector([200, 210], Object.values(size)), new Vector([256, 212], Object.values(size))],
                [new Vector([0, 210], Object.values(size)), new Vector([56, 212], Object.values(size))],


                [new Vector([40, 100], Object.values(size)), new Vector([42, 160], Object.values(size))],
                [new Vector([210, 100], Object.values(size)), new Vector([212, 160], Object.values(size))],
            ],
            breedingAreas: [
                [
                    new Vector([0, 0], Object.values(size)),
                    new Vector([size.width, size.height / 8], Object.values(size))
                ],
            ],
            spawnAreas: [
                [
                    new Vector([30, 256 - size.height / 8], Object.values(size)),
                    new Vector([120, 256], Object.values(size)),
                ],
                [
                    new Vector([150, size.height - size.height / 8], Object.values(size)),
                    new Vector([230, size.height], Object.values(size)),
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
                [
                    new Vector([0, 0], Object.values(size)),
                    new Vector([size.width / 8, size.height], Object.values(size))
                ],
            ],
            spawnAreas: [
                [
                    new Vector([256 - size.width / 8, 30], Object.values(size)),
                    new Vector([256, 120], Object.values(size)),
                ],
                [
                    new Vector([256 - size.width / 8, 150], Object.values(size)),
                    new Vector([size.width, 230], Object.values(size)),
                ]
            ]
        },
        {
            walls: [
                [new Vector([30,60], Object.values(size)), new Vector([120, 62], Object.values(size))],
                [new Vector([150, 60], Object.values(size)), new Vector([230, 62], Object.values(size))],
                [new Vector([80, 180], Object.values(size)), new Vector([170, 182], Object.values(size))],
                [new Vector([200, 210], Object.values(size)), new Vector([256, 212], Object.values(size))],
                [new Vector([0, 210], Object.values(size)), new Vector([56, 212], Object.values(size))],


                [new Vector([40, 100], Object.values(size)), new Vector([42, 160], Object.values(size))],
                [new Vector([210, 100], Object.values(size)), new Vector([212, 160], Object.values(size))],
            ],
            breedingAreas: [
                [
                    new Vector([0, size.height - size.height / 8], Object.values(size)),
                    new Vector([size.width, size.height], Object.values(size))
                ],
            ],
            spawnAreas: [
                [
                    new Vector([30, 0], Object.values(size)),
                    new Vector([120, size.height / 8], Object.values(size)),
                ],
                [
                    new Vector([150, 0], Object.values(size)),
                    new Vector([230, size.height / 8], Object.values(size)),
                ]
            ]
        }
    ]
}