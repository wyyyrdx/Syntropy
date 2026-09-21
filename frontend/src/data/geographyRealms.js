/**
 * Syntropy Geography Game: World Realms & Waypoints Data
 * Each realm is mapped to world coordinates and contains rich terrain, landmarks, NPCs, and quizzes.
 */

export const GEOGRAPHY_REALMS = [
  {
    id: 'amazon-basin',
    name: 'Amazon Rainforest Basin',
    region: 'South America',
    coords: { lat: -3.4653, lng: -62.2159 },
    globePosition: { x: -0.45, y: -0.06, z: 0.88 }, // 3D unit sphere coord
    biome: 'Tropical Rainforest (Equatorial Af)',
    elevation: '106m ASL',
    themeColor: '#10b981',
    description: 'The world\'s largest river drainage basin and vital carbon sink, teeming with dense canopy stratification and oxbow lakes.',
    npc: {
      name: 'Ranger Maya',
      title: 'Canopy Ecologist',
      avatar: '🌿',
      dialogue: 'Welcome to the Amazon basin! The river discharges 20% of the world\'s freshwater into the Atlantic. Watch the stratification as you walk from the riverbank to the emergent trees!'
    },
    mapConfig: {
      width: 24,
      height: 20,
      baseTile: 'grass_dense',
      riverStyle: 'horizontal_meander',
      playerStart: { x: 4, y: 10 }
    },
    landmarks: [
      {
        id: 'canopy_tower',
        name: 'Meteorological Canopy Tower',
        icon: '🗼',
        x: 8,
        y: 4,
        category: 'Atmospheric Science',
        fact: 'The Amazon produces its own rainfall through evapotranspiration, creating "flying rivers" in the South American atmosphere.',
        quiz: {
          question: 'What is the phenomenon where massive vapor streams travel above the Amazon rainforest called?',
          options: [
            { id: 'A', text: 'Flying Rivers (Atmospheric Rivers)' },
            { id: 'B', text: 'Trade Wind Inversions' },
            { id: 'C', text: 'Monsoon Fronts' },
            { id: 'D', text: 'Catabatic Winds' }
          ],
          correct: 'A',
          explanation: 'Trees pump billions of liters of water vapor into the air daily, creating aerial rivers that nourish rainfall across the continent.'
        }
      },
      {
        id: 'oxbow_lake',
        name: 'Oxbow Lagoon & Meander Cutoff',
        icon: '🌊',
        x: 17,
        y: 11,
        category: 'Geomorphology',
        fact: 'As meandering rivers erode outer banks and deposit silt on inner curves, tight loops get pinched off to form crescent oxbow lakes.',
        quiz: {
          question: 'An oxbow lake is formed due to which continuous fluvial processes?',
          options: [
            { id: 'A', text: 'Tectonic uplift and faulting' },
            { id: 'B', text: 'Continuous erosion on the outer bend and deposition on the inner bend' },
            { id: 'C', text: 'Glacial plucking and abrasion' },
            { id: 'D', text: 'Wind deflation and dune scouring' }
          ],
          correct: 'B',
          explanation: 'Fluvial meanders evolve when water moves faster on the outside bend (scouring) and slower on the inside (depositing sediment), eventually cutting through the neck.'
        }
      },
      {
        id: 'botanical_station',
        name: 'Medicinal Flora Research Camp',
        icon: '🏕️',
        x: 12,
        y: 15,
        category: 'Biogeography',
        fact: 'More than 25% of modern western pharmaceuticals originate from tropical forest plants, yet less than 1% have been tested for medicinal properties.',
        quiz: {
          question: 'In which vertical layer of the tropical rainforest is biodiversity the most concentrated?',
          options: [
            { id: 'A', text: 'Forest Floor' },
            { id: 'B', text: 'Canopy Layer' },
            { id: 'C', text: 'Understory Sub-layer' },
            { id: 'D', text: 'Subsoil Root Zone' }
          ],
          correct: 'B',
          explanation: 'The canopy, receiving abundant sunlight 30 meters up, hosts an estimated 50-70% of all rainforest life.'
        }
      }
    ]
  },
  {
    id: 'himalayan-range',
    name: 'Himalayan Karakoram High Pass',
    region: 'Asia',
    coords: { lat: 27.9881, lng: 86.9250 },
    globePosition: { x: 0.65, y: 0.45, z: 0.61 },
    biome: 'Alpine Cryosphere & Montane Tundra',
    elevation: '5,364m ASL (Khumbu)',
    themeColor: '#38bdf8',
    description: 'The roof of the world, born from the collision of the Indian and Eurasian tectonic plates. Cradle of major Asian river systems.',
    npc: {
      name: 'Sherpa Tenzin',
      title: 'High Alpine Guide',
      avatar: '🏔️',
      dialogue: 'Tashi Delek, explorer! The Himalayas are young fold mountains that are still growing 5mm taller each year as continental plates crunch together.'
    },
    mapConfig: {
      width: 24,
      height: 20,
      baseTile: 'snow_rock',
      riverStyle: 'glacial_run',
      playerStart: { x: 5, y: 15 }
    },
    landmarks: [
      {
        id: 'tectonic_monument',
        name: 'Indo-Eurasian Suture Marker',
        icon: '🪨',
        x: 10,
        y: 8,
        category: 'Tectonics',
        fact: 'The collision between India and Eurasia started 50 million years ago, closing the ancient Tethys Sea whose marine fossils are still found high up Everest.',
        quiz: {
          question: 'What kind of plate boundary created the Himalayan mountain range?',
          options: [
            { id: 'A', text: 'Divergent oceanic plate boundary' },
            { id: 'B', text: 'Transform boundary with lateral strike-slip' },
            { id: 'C', text: 'Continental-continental convergent boundary' },
            { id: 'D', text: 'Oceanic-continental subduction trench' }
          ],
          correct: 'C',
          explanation: 'Both the Indian and Eurasian plates are buoyant continental crust; neither could easily subduct, forcing crust upwards into colossal fold mountains.'
        }
      },
      {
        id: 'khumbu_glacier',
        name: 'Glacial Moraine & Serac Field',
        icon: '❄️',
        x: 18,
        y: 5,
        category: 'Glaciology',
        fact: 'Known as the "Third Pole", Himalayan glaciers store more snow and ice than anywhere outside Antarctica and Greenland, feeding 10 major river basins.',
        quiz: {
          question: 'Sediment ridges formed along the sides and terminus of moving glaciers are called:',
          options: [
            { id: 'A', text: 'Drumlins' },
            { id: 'B', text: 'Moraines' },
            { id: 'C', text: 'Eskers' },
            { id: 'D', text: 'Oxbows' }
          ],
          correct: 'B',
          explanation: 'Moraines are ridges composed of unconsolidated rock and debris deposited directly by a glacier along its edges and snout.'
        }
      },
      {
        id: 'rain_shadow_observatory',
        name: 'Tibetan Rain-Shadow Weather Hut',
        icon: '🧭',
        x: 14,
        y: 16,
        category: 'Climatology',
        fact: 'The southern Himalayan slopes capture torrential monsoon rains, while the leeward Tibetan Plateau behind is left in a dry, cold rain-shadow desert.',
        quiz: {
          question: 'Which rainfall mechanism causes the dramatic climate contrast between southern Nepal and the northern Tibetan plateau?',
          options: [
            { id: 'A', text: 'Convectional Precipitation' },
            { id: 'B', text: 'Orographic (Relief) Precipitation' },
            { id: 'C', text: 'Frontal Cyclonic Lift' },
            { id: 'D', text: 'Polar Jet Subduction' }
          ],
          correct: 'B',
          explanation: 'Moist Indian Ocean winds are forced up mountain slopes, cooling and dumping moisture on the windward side, descending dry and warm on the leeward side.'
        }
      }
    ]
  },
  {
    id: 'sahara-erg',
    name: 'Sahara Oasis & Erg Chebbi',
    region: 'North Africa',
    coords: { lat: 23.4162, lng: 11.6628 },
    globePosition: { x: 0.15, y: 0.39, z: 0.90 },
    biome: 'Subtropical Hyper-Arid Desert (BWh)',
    elevation: '420m ASL',
    themeColor: '#f59e0b',
    description: 'The world\'s largest hot desert, defined by vast seas of shifting wind-blown dunes (ergs), rocky hammadas, and precious subterranean aquifers.',
    npc: {
      name: 'Bedouin Tariq',
      title: 'Caravan Navigator',
      avatar: '🐪',
      dialogue: 'Salam traveler. The sands of Erg Chebbi move with the harmattan wind. Walk toward the date palm grove to discover how ancient aquifers make life possible here.'
    },
    mapConfig: {
      width: 24,
      height: 20,
      baseTile: 'sand_dune',
      riverStyle: 'dry_wadi',
      playerStart: { x: 3, y: 8 }
    },
    landmarks: [
      {
        id: 'artesian_oasis',
        name: 'Artesian Date Palm Oasis',
        icon: '🌴',
        x: 12,
        y: 10,
        category: 'Hydrology',
        fact: 'Desert oases exist where subterranean permeable rock layers (aquifers) breach the surface or are reached by pressurized artesian springs.',
        quiz: {
          question: 'Where does the natural groundwater supplying desert oases primarily originate from?',
          options: [
            { id: 'A', text: 'Local daily flash floods' },
            { id: 'B', text: 'Confined deep aquifers recharged in distant highland ranges' },
            { id: 'C', text: 'Condensation from coastal morning fogs' },
            { id: 'D', text: 'Seawater desalinated by sand filtration' }
          ],
          correct: 'B',
          explanation: 'Artesian aquifers store "fossil water" trapped under impermeable strata, recharged hundreds of miles away in mountain rain catchments.'
        }
      },
      {
        id: 'barchan_ridge',
        name: 'Crescent Barchan Dune Crest',
        icon: '🏜️',
        x: 19,
        y: 4,
        category: 'Aeolian Landforms',
        fact: 'Barchan dunes are crescent-shaped dunes where the horns point downwind in regions with consistent wind direction and moderate sand supply.',
        quiz: {
          question: 'In a barchan dune, in which direction do the two crescent horns point?',
          options: [
            { id: 'A', text: 'Toward the incoming wind (windward)' },
            { id: 'B', text: 'In the direction the wind is blowing (downwind)' },
            { id: 'C', text: 'Always toward the magnetic north pole' },
            { id: 'D', text: 'Perpendicular to wind flow' }
          ],
          correct: 'B',
          explanation: 'Wind blows sand up the gentle windward slope; the faster-moving edges are carried downwind faster than the bulky center, forming crescent horns pointing downwind.'
        }
      }
    ]
  },
  {
    id: 'mariana-trench',
    name: 'Mariana Trench & Pacific Ring of Fire',
    region: 'Oceania / Pacific',
    coords: { lat: 11.3493, lng: 142.1996 },
    globePosition: { x: -0.76, y: 0.19, z: 0.61 },
    biome: 'Hadal Ocean Trench & Volcanic Atoll',
    elevation: '-10,994m Bathymetry (Challenger Deep)',
    themeColor: '#06b6d4',
    description: 'The deepest scar on Earth\'s lithosphere, where the dense Pacific plate dives beneath the Mariana plate, accompanied by volcanic island arcs.',
    npc: {
      name: 'Dr. Marina',
      title: 'Marine Oceanographer',
      avatar: '🤿',
      dialogue: 'We are stationed above Challenger Deep! At nearly 11 kilometers down, water pressure exceeds 1,000 atmospheres. Yet geothermal vents support unique chemosynthetic ecosystems.'
    },
    mapConfig: {
      width: 24,
      height: 20,
      baseTile: 'coral_atoll',
      riverStyle: 'trench_chasm',
      playerStart: { x: 4, y: 12 }
    },
    landmarks: [
      {
        id: 'subduction_beacon',
        name: 'Trench Subduction Sensor Buoy',
        icon: '📡',
        x: 9,
        y: 6,
        category: 'Geophysics',
        fact: 'The Pacific Ring of Fire contains over 75% of Earth\'s active volcanoes and 90% of its earthquakes due to continuous lithospheric subduction.',
        quiz: {
          question: 'Why does oceanic crust subduct underneath continental or younger oceanic crust at convergent margins?',
          options: [
            { id: 'A', text: 'It is made of low-density granite' },
            { id: 'B', text: 'Old oceanic crust is cold, dense, and composed of heavy basaltic minerals' },
            { id: 'C', text: 'Ocean currents pull the plates downward' },
            { id: 'D', text: 'Earthquakes actively crush the plate into powder' }
          ],
          correct: 'B',
          explanation: 'Dense basaltic oceanic lithosphere, chilled over millions of years, is denser than the underlying asthenosphere and lighter continental crust, triggering subduction.'
        }
      },
      {
        id: 'hydrothermal_vent',
        name: 'Black Smoker Hydrothermal Vent Field',
        icon: '🌋',
        x: 18,
        y: 14,
        category: 'Deep Ocean Ecology',
        fact: 'Hydrothermal vents spew mineral-rich fluids exceeding 350°C. Life here is powered not by solar photosynthesis, but by hydrogen sulfide chemosynthesis.',
        quiz: {
          question: 'What is the primary energy source powering food chains around deep-sea hydrothermal vents?',
          options: [
            { id: 'A', text: 'Sunlight filtering through deep waters' },
            { id: 'B', text: 'Chemosynthesis by specialized sulfur-oxidizing bacteria' },
            { id: 'C', text: 'Nutrients sinking from surface whale falls' },
            { id: 'D', text: 'Nuclear radiation from mantle decay' }
          ],
          correct: 'B',
          explanation: 'Without sunlight, microbes oxidize mineral hydrogen sulfide emitted from hot vents to manufacture organic matter, supporting tube worms and crabs.'
        }
      }
    ]
  },
  {
    id: 'great-rift-valley',
    name: 'East African Great Rift Valley',
    region: 'East Africa',
    coords: { lat: -2.3333, lng: 34.8333 },
    globePosition: { x: 0.52, y: -0.04, z: 0.85 },
    biome: 'Tropical Savannah & Rifting Escarpments',
    elevation: '1,500m ASL',
    themeColor: '#84cc16',
    description: 'A colossal continental fracture tearing Africa into two plates (Nubian & Somali), studded with soda lakes, volcanic calderas, and early hominin sites.',
    npc: {
      name: 'Naturalist Kwame',
      title: 'Rift Geomorphologist',
      avatar: '🦒',
      dialogue: 'Jambo! You are standing on the seam where eastern Africa is splitting away from the continent. In millions of years, a new ocean basin will flood this rift valley.'
    },
    mapConfig: {
      width: 24,
      height: 20,
      baseTile: 'savannah_grass',
      riverStyle: 'graben_lakes',
      playerStart: { x: 5, y: 10 }
    },
    landmarks: [
      {
        id: 'graben_escarpment',
        name: 'Great Graben Fault Escarpment',
        icon: '⛰️',
        x: 12,
        y: 4,
        category: 'Structural Geology',
        fact: 'A graben is a depressed block of Earth\'s crust bordered by parallel normal faults, created by extensional tensional forces pulling the land apart.',
        quiz: {
          question: 'What type of tectonic stress causes continental rift valleys and normal faults?',
          options: [
            { id: 'A', text: 'Compressional stress pushing inward' },
            { id: 'B', text: 'Tensional stress pulling crust apart' },
            { id: 'C', text: 'Shear stress grinding laterally' },
            { id: 'D', text: 'Isostatic glacier rebounding' }
          ],
          correct: 'B',
          explanation: 'Tensional forces stretch and thin continental lithosphere until crustal blocks drop down along normal fault lines to form rift valleys (grabens).'
        }
      },
      {
        id: 'serengeti_plains',
        name: 'Savannah Ecosystem Research Outpost',
        icon: '🦁',
        x: 17,
        y: 12,
        category: 'Ecosystems & Climate',
        fact: 'Tropical savannahs experience distinct alternating rainy and dry seasons dictated by the seasonal shift of the Intertropical Convergence Zone (ITCZ).',
        quiz: {
          question: 'The seasonal migration of wildlife in East Africa is driven directly by the movement of which planetary atmospheric belt?',
          options: [
            { id: 'A', text: 'Intertropical Convergence Zone (ITCZ)' },
            { id: 'B', text: 'Subtropical High Pressure Ridge' },
            { id: 'C', text: 'Polar Easterlies Front' },
            { id: 'D', text: 'Mid-Latitude Rossby Wave' }
          ],
          correct: 'A',
          explanation: 'As the sun shifts between the Tropics of Cancer and Capricorn, the ITCZ rain belt migrates, causing alternating wet and dry seasons that prompt vast herbivore migrations.'
        }
      }
    ]
  },
  {
    id: 'nile-delta',
    name: 'Nile Delta & Alluvial Floodplain',
    region: 'Egypt / North Africa',
    coords: { lat: 30.8359, lng: 31.0784 },
    globePosition: { x: 0.44, y: 0.51, z: 0.73 },
    biome: 'Fluvial Delta & Mediterranean Estuary',
    elevation: '12m ASL',
    themeColor: '#eab308',
    description: 'The classic triangular river delta where the Nile branches into distributaries before entering the Mediterranean, depositing thousands of years of rich alluvial silt.',
    npc: {
      name: 'Historian Amena',
      title: 'Nile Hydrology Researcher',
      avatar: '📜',
      dialogue: 'Welcome! Herodotus wrote that Egypt is the gift of the Nile. Notice how the river fans out into distributary channels as the slope drops near sea level.'
    },
    mapConfig: {
      width: 24,
      height: 20,
      baseTile: 'alluvial_soil',
      riverStyle: 'delta_fan',
      playerStart: { x: 4, y: 14 }
    },
    landmarks: [
      {
        id: 'delta_apex',
        name: 'Distributary Channel Sluice Gate',
        icon: '🏛️',
        x: 11,
        y: 8,
        category: 'Fluvial Landforms',
        fact: 'Unlike upstream tributaries that merge into a single river, delta distributaries branch outwards from the main stem, distributing sediment into the sea.',
        quiz: {
          question: 'What is the key geological reason why rivers drop their sediment load at the mouth to build deltas?',
          options: [
            { id: 'A', text: 'Sudden drop in river velocity upon entering standing ocean water' },
            { id: 'B', text: 'Extreme evaporation immediately drying the riverbed' },
            { id: 'C', text: 'Earthquakes at the coastline creating dams' },
            { id: 'D', text: 'Saltwater dissolving all river rocks' }
          ],
          correct: 'A',
          explanation: 'When a fast-moving river meets a standing body of water like a lake or sea, its velocity plummets, reducing carrying capacity and depositing suspended silt.'
        }
      }
    ]
  }
];
