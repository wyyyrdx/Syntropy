const concepts = (...items) => items.map(([title, explanation, importance = 'primary']) => ({ title, explanation, importance }));
const quiz = (id, question, correctText, distractors, explanation) => [{
  id, question,
  options: [correctText, ...distractors].map((text, index) => ({ id: String.fromCharCode(65 + index), text })),
  correct: 'A', explanation
}];
const chapter = (id, number, title, realmTarget, summary, conceptItems, question, correct, distractors, explanation) => ({
  id, number, title, realmTarget, summary, concepts: concepts(...conceptItems), quiz: quiz(`biology-chapter:${id}`, question, correct, distractors, explanation)
});

export const BIOLOGY_CURRICULUM_BOOKS = [
  {
    id: 'class-6', grade: 'Class 6', title: 'Living World: Plants & Habitats', role: 'Field Naturalist', icon: '🌿', accentColor: '#22c55e', coverStyle: 'book-cover-green',
    description: 'Name plant parts, sort animals by habitat, and see how living things depend on one another.',
    chapters: [
      chapter('b6-ch1', 1, 'Parts of a Plant', 'vascular-gardens', 'Identify root, stem, leaf, flower, and fruit, and connect each part to a job.', [['Root', 'Anchors the plant and absorbs water and minerals.'], ['Leaf', 'The main site of photosynthesis.'], ['Flower', 'The reproductive organ of a flowering plant.', 'secondary']], 'Which plant part absorbs water from the soil?', 'Root', ['Petal', 'Fruit skin', 'Pollen'], 'Roots take up water and dissolved minerals.'),
      chapter('b6-ch2', 2, 'Animal Habitats', 'habitat-savanna', 'Match animals to habitats and build a simple food chain.', [['Habitat', 'The natural place where an organism lives.'], ['Food Chain', 'A single path of who eats whom.'], ['Producer', 'An organism that makes its own food.', 'secondary']], 'The starting living link in a grazing food chain is a:', 'Producer', ['Lion', 'Fungi only', 'Vulture'], 'Energy enters the living community through producers.')
    ]
  },
  {
    id: 'class-7', grade: 'Class 7', title: 'Nutrition in Plants & Humans', role: 'Lab Naturalist', icon: '🥗', accentColor: '#16a34a', coverStyle: 'book-cover-green',
    description: 'Follow how plants cook food in light and how the human gut unlocks that food.',
    chapters: [
      chapter('b7-ch1', 1, 'Photosynthesis', 'chlorophyll-canopy', 'Write the word equation and name the leaf structures that make it possible.', [['Photosynthesis', 'Green plants make glucose from carbon dioxide and water using light.'], ['Stomata', 'Pores that allow gas exchange.'], ['Chlorophyll', 'The pigment that captures light energy.', 'secondary']], 'Which gas do plants take in for photosynthesis?', 'Carbon dioxide', ['Nitrogen', 'Helium', 'Ozone'], 'Carbon dioxide and water are the raw materials.'),
      chapter('b7-ch2', 2, 'Human Digestion', 'digestive-kitchen', 'Track food from mouth to absorption and link breathing to energy release.', [['Stomach', 'Churns food and begins protein digestion.'], ['Small Intestine', 'Completes digestion and absorbs nutrients.'], ['Alveoli', 'Air sacs where oxygen enters the blood.', 'secondary']], 'Most digested food is absorbed in the:', 'Small intestine', ['Windpipe', 'Hair', 'Enamel'], 'Villi give the small intestine a huge surface area.')
    ]
  },
  {
    id: 'class-8', grade: 'Class 8', title: 'Reproduction & Animal Diversity', role: 'Junior Taxonomist', icon: '🦋', accentColor: '#84cc16', coverStyle: 'book-cover-lime',
    description: 'See how flowering plants reproduce and how animals are grouped by body plan.',
    chapters: [
      chapter('b8-ch1', 1, 'Flower to Seed', 'pollination-meadow', 'Follow pollination, fertilization, seed formation, and germination.', [['Pollination', 'Transfer of pollen from anther to stigma.'], ['Seed', 'Contains an embryo and stored food.'], ['Germination', 'The embryo grows into a seedling when conditions are right.', 'secondary']], 'Pollination is the transfer of pollen to the:', 'Stigma', ['Root tip', 'Leaf vein', 'Bark'], 'The stigma is the receptive tip of the carpel.'),
      chapter('b8-ch2', 2, 'Grouping Animals', 'classification-hall', 'Separate vertebrates from invertebrates and name the main vertebrate classes.', [['Vertebrate', 'An animal with a backbone.'], ['Mammal', 'A warm-blooded vertebrate that feeds young on milk.'], ['Amphibian', 'A vertebrate that typically has an aquatic larval stage.', 'secondary']], 'Which animal is an invertebrate?', 'Butterfly', ['Cat', 'Sparrow', 'Shark'], 'Insects lack a vertebral column.')
    ]
  },
  {
    id: 'class-9', grade: 'Class 9', title: 'Adaptation, Tissues & Transport', role: 'Systems Analyst', icon: '🧬', accentColor: '#f59e0b', coverStyle: 'book-cover-amber',
    description: 'Connect animal adaptations with plant transport tissues and human circulation.',
    chapters: [
      chapter('b9-ch1', 1, 'How Animals Survive', 'adaptation-isles', 'Explain desert, polar, aquatic, and camouflage adaptations with examples.', [['Adaptation', 'A trait that improves survival in a habitat.'], ['Camouflage', 'Color or shape that hides an animal.'], ['Gills', 'Organs that take oxygen from water.', 'secondary']], 'Blubber helps polar animals mainly by:', 'Reducing heat loss', ['Making glucose from light', 'Attracting bees', 'Storing pollen'], 'A fat layer is an insulator.'),
      chapter('b9-ch2', 2, 'Transport in Plants and Blood', 'circulatory-ward', 'Compare xylem and phloem with the human heart and vessels.', [['Xylem', 'Carries water and minerals upward.'], ['Heart', 'A muscular pump with four chambers.'], ['Capillary', 'A thin vessel where exchange with tissues occurs.', 'secondary']], 'Blood is pumped away from the heart in:', 'Arteries', ['Veins only', 'Alveoli', 'Root hairs'], 'Arteries leave the ventricles under pressure.')
    ]
  },
  {
    id: 'class-10', grade: 'Class 10', title: 'Life Processes & Control', role: 'Mission Biologist', icon: '🧠', accentColor: '#f43f5e', coverStyle: 'book-cover-rose',
    description: 'Integrate photosynthesis, respiration, circulation, movement, and nervous control.',
    chapters: [
      chapter('b10-ch1', 1, 'Life Processes', 'chlorophyll-canopy', 'Unite nutrition, respiration, and transport as processes that keep an organism alive.', [['Respiration', 'Cells release energy from food, often using oxygen.'], ['Circulation', 'Blood carries oxygen, food, and wastes.'], ['Photosynthesis', 'Autotrophs convert light energy into chemical energy.', 'secondary']], 'Aerobic respiration uses oxygen to release energy from:', 'Food / glucose', ['Only nitrogen', 'Chlorophyll pigment', 'Bone enamel'], 'Glucose is oxidized and energy is transferred to ATP.'),
      chapter('b10-ch2', 2, 'Control and Coordination', 'skeletal-neural-lab', 'Show how bones, muscles, and nerves produce movement and respond to stimuli.', [['Neuron', 'A nerve cell that carries electrical signals.'], ['Antagonistic Muscles', 'Pairs that pull bones in opposite directions.'], ['Receptor', 'A cell or organ that detects a stimulus.', 'secondary']], 'The brain and spinal cord make up the:', 'Central nervous system', ['Xylem', 'Small intestine only', 'Seed coat'], 'They process information and coordinate responses.')
    ]
  }
];
