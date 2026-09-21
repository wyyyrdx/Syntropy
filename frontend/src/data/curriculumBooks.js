/**
 * Syntropy Curriculum Template Books
 * Aligned with Class 6 to 10 Geography syllabi.
 * Each book offers structured study notes, concepts, quizzes, and direct links to play corresponding globe realms.
 */

export const CURRICULUM_BOOKS = [
  {
    id: 'class-6',
    grade: 'Class 6',
    title: 'The Living Earth & Planetary Systems',
    role: 'Apprentice Cartographer',
    icon: '🧭',
    accentColor: '#38bdf8',
    coverStyle: 'book-cover-blue',
    description: 'Foundations of planetary geography: coordinate grids, planetary rotation, Earth\'s crustal spheres, and fundamental landforms.',
    chapters: [
      {
        id: 'c6-ch1',
        number: 1,
        title: 'Globe: Latitudes and Longitudes',
        realmTarget: 'himalayan-range',
        summary: 'Understanding the Earth grid system: Equator (0°), Tropics, Arctic/Antarctic circles, Prime Meridian (0°), and local time zones based on 15° per hour.',
        concepts: [
          {
            title: 'Parallels of Latitude',
            explanation: 'Imaginary horizontal circles parallel to the Equator that measure angular distance north or south from 0° to 90° at the poles.',
            importance: 'primary'
          },
          {
            title: 'Meridians of Longitude',
            explanation: 'Semi-circles running from the North Pole to the South Pole. Greenwich Prime Meridian (0°) is the reference for Universal Coordinated Time (UTC).',
            importance: 'primary'
          },
          {
            title: 'Heat Zones of the Earth',
            explanation: 'Torrid Zone (between Tropics, receiving maximum vertical sun), Temperate Zones (moderate angles), and Frigid Zones (slanted rays and extreme cold).',
            importance: 'secondary'
          }
        ],
        quiz: [
          {
            question: 'How many degrees of longitude does the Earth rotate through in 1 hour?',
            options: [
              { id: 'A', text: '10 degrees' },
              { id: 'B', text: '15 degrees' },
              { id: 'C', text: '30 degrees' },
              { id: 'D', text: '24 degrees' }
            ],
            correct: 'B',
            explanation: 'Earth rotates 360° in 24 hours, meaning 360 / 24 = 15° per hour (or 1° every 4 minutes).'
          },
          {
            question: 'The Tropic of Cancer is situated at which precise latitude?',
            options: [
              { id: 'A', text: '23.5° North' },
              { id: 'B', text: '23.5° South' },
              { id: 'C', text: '66.5° North' },
              { id: 'D', text: '0° Equator' }
            ],
            correct: 'A',
            explanation: 'Tropic of Cancer is at 23.5° N, marking the northernmost latitude where the sun can appear directly overhead at noon.'
          }
        ]
      },
      {
        id: 'c6-ch2',
        number: 2,
        title: 'Major Landforms: Mountains, Plateaus & Plains',
        realmTarget: 'amazon-basin',
        summary: 'Primary physical surface features molded by internal tectonic uplift and external weathering and fluvial erosion.',
        concepts: [
          {
            title: 'Fold Mountains',
            explanation: 'Mountains formed when tectonic compressional forces crumple continental crust (e.g. Himalayas, Alps, Andes).',
            importance: 'primary'
          },
          {
            title: 'Plateaus (Tablelands)',
            explanation: 'Elevated flat-topped land rising abruptly above surrounding area, often rich in mineral deposits (e.g. Deccan, Tibetan Plateau).',
            importance: 'secondary'
          },
          {
            title: 'Alluvial Plains',
            explanation: 'Vast low-lying flatlands created by rivers carrying and depositing alluvium, silt, and sand over millennia.',
            importance: 'primary'
          }
        ],
        quiz: [
          {
            question: 'Which of the following is considered the highest and largest plateau in the world, known as the "Roof of the World"?',
            options: [
              { id: 'A', text: 'Deccan Plateau' },
              { id: 'B', text: 'Tibetan Plateau' },
              { id: 'C', text: 'Colorado Plateau' },
              { id: 'D', text: 'Brazilian Highlands' }
            ],
            correct: 'B',
            explanation: 'The Tibetan Plateau spans 2.5 million sq km at an average altitude exceeding 4,500 meters.'
          }
        ]
      }
    ]
  },
  {
    id: 'class-7',
    grade: 'Class 7',
    title: 'Our Changing Earth & Dynamic Atmospheres',
    role: 'Geomorphologist',
    icon: '🌋',
    accentColor: '#10b981',
    coverStyle: 'book-cover-green',
    description: 'Investigate internal crustal forces, rock cycles, atmospheric layers, global pressure belts, and the oceanic conveyor belt.',
    chapters: [
      {
        id: 'c7-ch1',
        number: 1,
        title: 'Our Changing Earth: Endogenic vs Exogenic Forces',
        realmTarget: 'great-rift-valley',
        summary: 'Lithospheric plates float on the semi-molten asthenosphere. Sudden internal forces trigger earthquakes and volcanic eruptions, while external agents sculpt valleys.',
        concepts: [
          {
            title: 'Endogenic Forces',
            explanation: 'Internal forces originating deep inside the Earth (e.g., magma movement, faulting, folding) causing crustal deformation.',
            importance: 'primary'
          },
          {
            title: 'Exogenic Agents',
            explanation: 'Forces acting on the surface (running water, wind, glaciers, waves) that wear down landforms through weathering and erosion.',
            importance: 'primary'
          },
          {
            title: 'Focus and Epicentre',
            explanation: 'The focus is where earthquake rupture initiates in the crust; the epicentre is the point directly above on the Earth\'s surface.',
            importance: 'secondary'
          }
        ],
        quiz: [
          {
            question: 'The point on the surface of the Earth directly above the focus of an earthquake is known as the:',
            options: [
              { id: 'A', text: 'Hypocentre' },
              { id: 'B', text: 'Epicentre' },
              { id: 'C', text: 'Fault Scarp' },
              { id: 'D', text: 'Seismic Crater' }
            ],
            correct: 'B',
            explanation: 'The focus (hypocentre) is inside the crust where slippage begins; the epicentre is vertically straight above it on the surface.'
          }
        ]
      },
      {
        id: 'c7-ch2',
        number: 2,
        title: 'Atmospheric Layers & Global Winds',
        realmTarget: 'sahara-erg',
        summary: 'Atmospheric stratification into 5 thermal layers and the balance between high-pressure sinking air and low-pressure rising convective belts.',
        concepts: [
          {
            title: 'Troposphere',
            explanation: 'The lowest atmospheric layer containing 75% of atmospheric mass and all weather phenomena (clouds, storms, rain).',
            importance: 'primary'
          },
          {
            title: 'Stratosphere & Ozone Layer',
            explanation: 'Extends up to 50km, free from convective turbulence (ideal for jet aircraft) and contains the UV-absorbing ozone layer.',
            importance: 'primary'
          },
          {
            title: 'Permanent Wind Belts',
            explanation: 'Trade winds, Westerlies, and Polar Easterlies blowing consistently throughout the year toward low-pressure cells.',
            importance: 'secondary'
          }
        ],
        quiz: [
          {
            question: 'In which atmospheric layer is the protective ozone layer that filters solar ultraviolet radiation located?',
            options: [
              { id: 'A', text: 'Troposphere' },
              { id: 'B', text: 'Stratosphere' },
              { id: 'C', text: 'Mesosphere' },
              { id: 'D', text: 'Thermosphere' }
            ],
            correct: 'B',
            explanation: 'The ozone layer resides in the stratosphere between 15 and 35 km altitude.'
          }
        ]
      }
    ]
  },
  {
    id: 'class-8',
    grade: 'Class 8',
    title: 'Global Resources, Land & Agriculture',
    role: 'Resource Surveyor',
    icon: '🌾',
    accentColor: '#f59e0b',
    coverStyle: 'book-cover-amber',
    description: 'Resource classification, soil profile horizonation, conservation hydrology, and comparative agricultural typologies across continents.',
    chapters: [
      {
        id: 'c8-ch1',
        number: 1,
        title: 'Soil Formation & Soil Horizons',
        realmTarget: 'nile-delta',
        summary: 'Soil takes hundreds of years per centimeter to develop through weathering of parent rock, organic accumulation, and microbial decay.',
        concepts: [
          {
            title: 'Soil Profile Horizons',
            explanation: 'O-Horizon (organic litter), A-Horizon (topsoil rich in humus), B-Horizon (subsoil with weathered minerals), and C-Horizon (partially weathered parent bedrock).',
            importance: 'primary'
          },
          {
            title: 'Soil Conservation Techniques',
            explanation: 'Terrace farming, contour ploughing, shelter belts, and crop rotation to prevent sheet and gully erosion.',
            importance: 'primary'
          }
        ],
        quiz: [
          {
            question: 'Planting rows of trees along coastal or dry field margins to check wind movement and protect topsoil is called:',
            options: [
              { id: 'A', text: 'Contour Ploughing' },
              { id: 'B', text: 'Terrace Farming' },
              { id: 'C', text: 'Shelter Belts (Windbreaks)' },
              { id: 'D', text: 'Mulching' }
            ],
            correct: 'C',
            explanation: 'Shelter belts break the kinetic force of winds across dry or coastal planes, preventing wind erosion.'
          }
        ]
      },
      {
        id: 'c8-ch2',
        number: 2,
        title: 'Agricultural Systems: Subsistence vs Commercial',
        realmTarget: 'amazon-basin',
        summary: 'Comparative analysis of slash-and-burn shifting cultivation, intensive wet rice cultivation, commercial grain belts, and plantations.',
        concepts: [
          {
            title: 'Shifting Cultivation (Jhum / Swidden)',
            explanation: 'Clearing forest plots by slashing and burning, farming until soil nutrients deplete, then allowing the forest fallow period.',
            importance: 'secondary'
          },
          {
            title: 'Intensive Subsistence Farming',
            explanation: 'Practiced in high-population density regions with small land holdings using high manual labor to maximize yield per acre.',
            importance: 'primary'
          }
        ],
        quiz: [
          {
            question: 'What is the traditional shifting cultivation practice known as in Northeast India?',
            options: [
              { id: 'A', text: 'Roca' },
              { id: 'B', text: 'Milpa' },
              { id: 'C', text: 'Jhum' },
              { id: 'D', text: 'Ladang' }
            ],
            correct: 'C',
            explanation: 'Shifting cultivation is locally named Jhum in Northeast India (Roca in Brazil, Milpa in Central America, Ladang in Malaysia).'
          }
        ]
      }
    ]
  },
  {
    id: 'class-9',
    grade: 'Class 9',
    title: 'Physiography & River Drainage Systems',
    role: 'Master Cartographer',
    icon: '🗺️',
    accentColor: '#8b5cf6',
    coverStyle: 'book-cover-purple',
    description: 'Comprehensive study of tectonic collision zones, longitudinal divisions of the Himalayas, northern alluvial deposition, and perennial vs seasonal drainage.',
    chapters: [
      {
        id: 'c9-ch1',
        number: 1,
        title: 'Himalayan Longitudinal & Regional Divisions',
        realmTarget: 'himalayan-range',
        summary: 'Parallel mountain ranges: Greater Himalayas (Himadri), Lesser Himalayas (Himachal), and the outer Shiwaliks, along with transverse river-bounded sectors.',
        concepts: [
          {
            title: 'Himadri (Greater Himalayas)',
            explanation: 'The northernmost continuous ridge with average elevation of 6,000 meters, composed of granite core and perpetual snow.',
            importance: 'primary'
          },
          {
            title: 'Himachal (Lesser Himalayas)',
            explanation: 'Rugged range at 3,700-4,500m composed of highly compressed rocks, famous for hill stations like Shimla, Kullu, and Manali.',
            importance: 'secondary'
          },
          {
            title: 'Shiwaliks (Outer Himalayas)',
            explanation: 'Low altitude foothills (900-1100m) composed of unconsolidated river sediments prone to landslides and duns (valleys).',
            importance: 'secondary'
          }
        ],
        quiz: [
          {
            question: 'What are the flat-bottomed longitudinal valleys located between the Lesser Himalayas and the Shiwaliks called?',
            options: [
              { id: 'A', text: 'Gorges' },
              { id: 'B', text: 'Duns (e.g. Dehradun)' },
              { id: 'C', text: 'Cirques' },
              { id: 'D', text: 'Moraines' }
            ],
            correct: 'B',
            explanation: 'Longitudinal structural valleys filled with alluvial gravel between Himachal and Shiwaliks are known as Duns.'
          }
        ]
      },
      {
        id: 'c9-ch2',
        number: 2,
        title: 'Drainage Patterns: Dendritic, Trellis & Radial',
        realmTarget: 'nile-delta',
        summary: 'Geometrical river network arrangements dictated by bedrock structure, slope, and fault systems.',
        concepts: [
          {
            title: 'Dendritic Drainage',
            explanation: 'Branching tree-like stream pattern developing on uniformly resistant bedrock mimicking tree branches.',
            importance: 'primary'
          },
          {
            title: 'Radial Drainage',
            explanation: 'Streams flowing outwards in all directions from a central elevated dome or volcanic peak (like Amarkantak).',
            importance: 'secondary'
          },
          {
            title: 'Water Divide',
            explanation: 'An elevated topographic boundary (mountain ridge or plateau) that separates two adjacent drainage basins.',
            importance: 'primary'
          }
        ],
        quiz: [
          {
            question: 'When river tributaries join the main river at almost right angles over alternating hard and soft rocks, the pattern is:',
            options: [
              { id: 'A', text: 'Dendritic' },
              { id: 'B', text: 'Trellis' },
              { id: 'C', text: 'Radial' },
              { id: 'D', text: 'Centripetal' }
            ],
            correct: 'B',
            explanation: 'A trellis pattern forms where resistant and weak rocks lie in parallel bands, forcing tributaries to join nearly at 90 degrees.'
          }
        ]
      }
    ]
  },
  {
    id: 'class-10',
    grade: 'Class 10',
    title: 'Contemporary World Geography & Climate Action',
    role: 'Planetary Guardian',
    icon: '⚡',
    accentColor: '#f43f5e',
    coverStyle: 'book-cover-rose',
    description: 'Resource sustainability, renewable energy transitions, global climate change impacts, ocean acidification, and conservation action plans.',
    chapters: [
      {
        id: 'c10-ch1',
        number: 1,
        title: 'Non-Conventional Energy & Geothermal Potential',
        realmTarget: 'mariana-trench',
        summary: 'Transitioning from fossil fuels to renewable energy: solar photovoltaics, offshore wind farms, tidal barrages, and deep geothermal heat taps.',
        concepts: [
          {
            title: 'Geothermal Energy',
            explanation: 'Harnessing heat from radioactive decay and residual magma chambers in the crust to drive steam turbines.',
            importance: 'primary'
          },
          {
            title: 'Sustainable Resource Planning',
            explanation: 'Judicious utilization meeting current human development needs without compromising the ecological capacity of future generations.',
            importance: 'primary'
          }
        ],
        quiz: [
          {
            question: 'Which country generates nearly 100% of its electricity and district heating from renewable geothermal and hydroelectric sources?',
            options: [
              { id: 'A', text: 'Iceland' },
              { id: 'B', text: 'Australia' },
              { id: 'C', text: 'Saudi Arabia' },
              { id: 'D', text: 'South Africa' }
            ],
            correct: 'A',
            explanation: 'Situated directly on the divergent Mid-Atlantic Ridge, Iceland taps abundant volcanic geothermal aquifers to power its cities.'
          }
        ]
      }
    ]
  }
];
