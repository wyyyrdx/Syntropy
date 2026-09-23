// historyBooksData.js
// Source data — replace/import this from wherever your existing
// HISTORY_BOOKS module lives in your project.

export const HISTORY_BOOKS = [
  {
    id: 'history-class-6',
    grade: 'Class 6',
    title: 'Our Pasts: Ancient Civilizations',
    role: 'Time Explorer',
    icon: '🏺',
    accentColor: '#f59e0b',
    coverStyle: 'book-cover-amber',
    description:
      'Explore early human societies, the first civilizations, ancient cities, and the beginnings of kingdoms in the Indian subcontinent.',
    chapters: [
      {
        id: 'h6-ch1',
        number: 1,
        title: 'Early Humans & The First Settlements',
        realmTarget: 'bhimbetka-caves',
        summary:
          'Learn how early humans hunted, gathered food, discovered fire, developed tools, and gradually moved towards settled agricultural communities.',
        concepts: [
          { title: 'Hunter-Gatherers', explanation: 'Early humans survived by hunting animals, gathering plants, fishing, and moving from one place to another in search of food and water.', importance: 'primary' },
          { title: 'Discovery of Fire', explanation: 'Fire provided warmth, protection, light, and allowed humans to cook food.', importance: 'secondary' },
          { title: 'Beginning of Agriculture', explanation: 'The domestication of plants and animals allowed humans to establish more permanent settlements.', importance: 'primary' }
        ],
        quiz: [
          {
            question: 'Why did hunter-gatherers move from place to place?',
            options: [
              { id: 'A', text: 'To search for food and water' },
              { id: 'B', text: 'To build factories' },
              { id: 'C', text: 'To trade machines' },
              { id: 'D', text: 'To establish empires' }
            ],
            correct: 'A',
            explanation: 'Hunter-gatherers depended on naturally available food and water, so they moved when resources became scarce.'
          }
        ]
      },
      {
        id: 'h6-ch2',
        number: 2,
        title: 'The Indus Valley Civilization',
        realmTarget: 'mohenjo-daro',
        summary:
          'Discover the cities, town planning, drainage systems, trade, crafts, and daily life of the Harappan civilization.',
        concepts: [
          { title: 'Planned Cities', explanation: 'Harappan cities had organized streets, houses, wells, public structures, and sophisticated drainage systems.', importance: 'primary' },
          { title: 'Great Bath', explanation: 'The Great Bath at Mohenjo-daro is a large brick-lined structure that may have had an important ritual or social purpose.', importance: 'secondary' },
          { title: 'Trade & Crafts', explanation: 'Harappan people produced pottery, beads, metal objects, seals, and other goods and participated in long-distance trade.', importance: 'primary' }
        ],
        quiz: [
          {
            question: 'Which feature is especially associated with Harappan cities?',
            options: [
              { id: 'A', text: 'Advanced drainage systems' },
              { id: 'B', text: 'Medieval castles' },
              { id: 'C', text: 'Roman theatres' },
              { id: 'D', text: 'Modern factories' }
            ],
            correct: 'A',
            explanation: 'Harappan cities are well known for their carefully planned drainage and sanitation systems.'
          }
        ]
      }
    ]
  },

  {
    id: 'history-class-7',
    grade: 'Class 7',
    title: 'Medieval India',
    role: 'Royal Chronicler',
    icon: '⚔️',
    accentColor: '#10b981',
    coverStyle: 'book-cover-green',
    description:
      'Explore the major kingdoms, Delhi Sultanate, Mughal Empire, administration, architecture, and cultures of medieval India.',
    chapters: [
      {
        id: 'h7-ch1',
        number: 1,
        title: 'The Delhi Sultanate',
        realmTarget: 'delhi-sultanate',
        summary:
          'Study the major dynasties of the Delhi Sultanate and the political and administrative changes that shaped medieval northern India.',
        concepts: [
          { title: 'Mamluk Dynasty', explanation: 'The Mamluk dynasty was the first major dynasty of the Delhi Sultanate and was established by Qutb-ud-din Aibak.', importance: 'primary' },
          { title: 'Iqta System', explanation: 'The iqta system involved assigning revenue-producing territories to officials in return for administrative and military responsibilities.', importance: 'primary' },
          { title: 'Alauddin Khalji', explanation: 'Alauddin Khalji expanded the Sultanate and introduced important military, administrative, and market-control measures.', importance: 'secondary' }
        ],
        quiz: [
          {
            question: 'Who established the Mamluk dynasty in Delhi?',
            options: [
              { id: 'A', text: 'Qutb-ud-din Aibak' },
              { id: 'B', text: 'Akbar' },
              { id: 'C', text: 'Babur' },
              { id: 'D', text: 'Sher Shah Suri' }
            ],
            correct: 'A',
            explanation: 'Qutb-ud-din Aibak established the Mamluk dynasty of the Delhi Sultanate.'
          }
        ]
      },
      {
        id: 'h7-ch2',
        number: 2,
        title: 'The Mughal Empire',
        realmTarget: 'agra-fort',
        summary:
          'Learn about the foundation and expansion of the Mughal Empire, its administration, rulers, architecture, and cultural developments.',
        concepts: [
          { title: 'Babur', explanation: 'Babur founded the Mughal Empire in India after defeating Ibrahim Lodi at the First Battle of Panipat in 1526.', importance: 'primary' },
          { title: 'Akbar', explanation: 'Akbar greatly expanded the Mughal Empire and developed systems of administration and political integration.', importance: 'primary' },
          { title: 'Mansabdari System', explanation: 'The mansabdari system organized imperial officials according to ranks and defined their administrative and military responsibilities.', importance: 'secondary' }
        ],
        quiz: [
          {
            question: 'When was the First Battle of Panipat fought?',
            options: [
              { id: 'A', text: '1498' },
              { id: 'B', text: '1526' },
              { id: 'C', text: '1556' },
              { id: 'D', text: '1605' }
            ],
            correct: 'B',
            explanation: 'Babur defeated Ibrahim Lodi at the First Battle of Panipat in 1526.'
          }
        ]
      }
    ]
  },

  {
    id: 'history-class-8',
    grade: 'Class 8',
    title: 'Colonial India & Resistance',
    role: 'Freedom Historian',
    icon: '📜',
    accentColor: '#f59e0b',
    coverStyle: 'book-cover-amber',
    description:
      'Understand the expansion of British colonial rule, changes in Indian society and economy, and major resistance movements.',
    chapters: [
      {
        id: 'h8-ch1',
        number: 1,
        title: 'The East India Company',
        realmTarget: 'kolkata',
        summary:
          'Trace the transformation of the East India Company from a trading organization into a major political power in India.',
        concepts: [
          { title: 'Battle of Plassey', explanation: 'The Battle of Plassey in 1757 strengthened the East India Company\u2019s political influence in Bengal.', importance: 'primary' },
          { title: 'Battle of Buxar', explanation: 'The Battle of Buxar in 1764 further strengthened Company power in eastern India.', importance: 'primary' },
          { title: 'Doctrine of Lapse', explanation: 'A policy associated with Lord Dalhousie under which certain princely states were annexed when a ruler died without an accepted natural heir.', importance: 'secondary' }
        ],
        quiz: [
          {
            question: 'Which battle in 1757 strengthened the East India Company in Bengal?',
            options: [
              { id: 'A', text: 'Battle of Plassey' },
              { id: 'B', text: 'Battle of Panipat' },
              { id: 'C', text: 'Battle of Haldighati' },
              { id: 'D', text: 'Battle of Talikota' }
            ],
            correct: 'A',
            explanation: 'The Battle of Plassey in 1757 was a major turning point in the Company\u2019s political expansion.'
          }
        ]
      },
      {
        id: 'h8-ch2',
        number: 2,
        title: 'The Revolt of 1857',
        realmTarget: 'red-fort-delhi',
        summary:
          'Explore the causes, major leaders, important centers, events, and consequences of the Revolt of 1857.',
        concepts: [
          { title: 'Causes of the Revolt', explanation: 'Political annexations, economic changes, military grievances, and social and religious concerns contributed to growing resistance.', importance: 'primary' },
          { title: 'Major Leaders', explanation: 'Important figures associated with the revolt included Bahadur Shah Zafar, Rani Lakshmibai, Nana Sahib, and Kunwar Singh.', importance: 'primary' },
          { title: 'Consequences', explanation: 'Following the revolt, the British Crown took direct control of the government of India from the East India Company.', importance: 'primary' }
        ],
        quiz: [
          {
            question: 'Who became the symbolic leader of the Revolt of 1857 in Delhi?',
            options: [
              { id: 'A', text: 'Bahadur Shah Zafar' },
              { id: 'B', text: 'Akbar' },
              { id: 'C', text: 'Tipu Sultan' },
              { id: 'D', text: 'Shivaji' }
            ],
            correct: 'A',
            explanation: 'Bahadur Shah Zafar was proclaimed the symbolic leader of the revolt in Delhi.'
          }
        ]
      }
    ]
  },

  {
    id: 'history-class-9',
    grade: 'Class 9',
    title: 'Revolutions & The Modern World',
    role: 'Revolution Scholar',
    icon: '🔥',
    accentColor: '#8b5cf6',
    coverStyle: 'book-cover-purple',
    description:
      'Study major political and social transformations including the French Revolution, Russian Revolution, and industrialization.',
    chapters: [
      {
        id: 'h9-ch1',
        number: 1,
        title: 'The French Revolution',
        realmTarget: 'paris',
        summary:
          'Understand the social structure, economic crisis, political developments, and major events of the French Revolution.',
        concepts: [
          { title: 'Three Estates', explanation: 'French society before the Revolution was traditionally divided into the First Estate, Second Estate, and Third Estate.', importance: 'primary' },
          { title: 'Storming of the Bastille', explanation: 'The Bastille was attacked on 14 July 1789, becoming an important symbol of the French Revolution.', importance: 'primary' },
          { title: 'Declaration of Rights', explanation: 'The Declaration of the Rights of Man and of the Citizen expressed principles concerning liberty and equality.', importance: 'primary' }
        ],
        quiz: [
          {
            question: 'When was the Bastille stormed?',
            options: [
              { id: 'A', text: '4 July 1776' },
              { id: 'B', text: '14 July 1789' },
              { id: 'C', text: '26 August 1789' },
              { id: 'D', text: '21 January 1793' }
            ],
            correct: 'B',
            explanation: 'The Bastille was stormed on 14 July 1789.'
          }
        ]
      },
      {
        id: 'h9-ch2',
        number: 2,
        title: 'The Industrial Revolution',
        realmTarget: 'manchester',
        summary:
          'Explore the transition from hand production to machine-based manufacturing and its effects on workers, cities, and society.',
        concepts: [
          { title: 'Mechanization', explanation: 'Machines increasingly replaced or supplemented manual production, especially in textile manufacturing.', importance: 'primary' },
          { title: 'Factory System', explanation: 'Production became concentrated in factories where workers and machines operated together under organized production systems.', importance: 'primary' },
          { title: 'Urbanization', explanation: 'Industrial employment contributed to rapid population growth in towns and cities.', importance: 'secondary' }
        ],
        quiz: [
          {
            question: 'Which industry was among the earliest to experience major mechanization?',
            options: [
              { id: 'A', text: 'Textile industry' },
              { id: 'B', text: 'Software industry' },
              { id: 'C', text: 'Film industry' },
              { id: 'D', text: 'Aviation industry' }
            ],
            correct: 'A',
            explanation: 'Textile manufacturing was one of the earliest industries to experience extensive mechanization.'
          }
        ]
      }
    ]
  },

  {
    id: 'history-class-10',
    grade: 'Class 10',
    title: 'Nationalism & Independence',
    role: 'Modern Historian',
    icon: '🕊️',
    accentColor: '#f43f5e',
    coverStyle: 'book-cover-rose',
    description:
      'Explore nationalism, the Indian freedom movement, global conflicts, and the major historical developments of the modern era.',
    chapters: [
      {
        id: 'h10-ch1',
        number: 1,
        title: 'Nationalism in India',
        realmTarget: 'sabarmati-ashram',
        summary:
          'Trace the development of Indian nationalism and the major movements against British colonial rule.',
        concepts: [
          { title: 'Non-Cooperation Movement', explanation: 'Launched in 1920 under Mahatma Gandhi, the movement encouraged Indians to withdraw cooperation from colonial institutions.', importance: 'primary' },
          { title: 'Civil Disobedience Movement', explanation: 'The movement involved peaceful and deliberate violation of selected colonial laws, including the salt laws.', importance: 'primary' },
          { title: 'Quit India Movement', explanation: 'Launched in 1942, the movement demanded an end to British colonial rule in India.', importance: 'primary' }
        ],
        quiz: [
          {
            question: 'In which year was the Quit India Movement launched?',
            options: [
              { id: 'A', text: '1919' },
              { id: 'B', text: '1920' },
              { id: 'C', text: '1930' },
              { id: 'D', text: '1942' }
            ],
            correct: 'D',
            explanation: 'The Quit India Movement was launched in August 1942.'
          }
        ]
      },
      {
        id: 'h10-ch2',
        number: 2,
        title: 'The World Wars & Decolonization',
        realmTarget: 'berlin',
        summary:
          'Study the two World Wars, their global consequences, and the process of decolonization that transformed the twentieth-century world.',
        concepts: [
          { title: 'First World War', explanation: 'The First World War lasted from 1914 to 1918 and involved major powers and alliances across Europe and beyond.', importance: 'primary' },
          { title: 'Second World War', explanation: 'The Second World War lasted from 1939 to 1945 and became a global conflict involving major powers across multiple continents.', importance: 'primary' },
          { title: 'Decolonization', explanation: 'After the Second World War, many countries in Asia and Africa gained independence from European colonial powers.', importance: 'secondary' }
        ],
        quiz: [
          {
            question: 'Which years are generally associated with the Second World War?',
            options: [
              { id: 'A', text: '1914\u20131918' },
              { id: 'B', text: '1929\u20131933' },
              { id: 'C', text: '1939\u20131945' },
              { id: 'D', text: '1947\u20131950' }
            ],
            correct: 'C',
            explanation: 'The Second World War lasted from 1939 to 1945.'
          }
        ]
      }
    ]
  }
];
