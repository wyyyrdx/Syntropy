const answers = (correct, right, distractors) => ({
  options: [right, ...distractors].map((text, index) => ({ id: String.fromCharCode(65 + index), text })),
  correct: String.fromCharCode(65 + correct),
});

function landmark(id, name, icon, x, y, category, fact, question, right, distractors, explanation, correct = 0) {
  return { id, name, icon, x, y, category, fact, quiz: { id: `biology-landmark:${id}`, question, ...answers(correct, right, distractors), explanation } };
}

const realm = (id, name, region, biome, themeColor, description, npc, baseTile, playerStart, landmarks, index) => ({
  id, name, region, coords: { lat: index * 10 - 36, lng: index * 32 - 120 },
  globePosition: { x: Math.cos(index), y: Math.sin(index), z: 0 }, biome,
  elevation: `BIO SECTOR ${String(index + 1).padStart(2, '0')}`, themeColor, description, npc,
  mapConfig: { width: 24, height: 20, baseTile, riverStyle: 'life_stream', playerStart }, landmarks
});

export const BIOLOGY_REALMS = [
  realm('chlorophyll-canopy', 'Chlorophyll Canopy', 'Plants', 'Photosynthesis Forest', '#22c55e',
    'A sunlit canopy where leaves trap light, make food, and release oxygen.',
    { name: 'Dr. Flora', title: 'Plant Physiologist', avatar: '🌿', dialogue: 'Every green leaf is a solar kitchen. Follow the light, the water, and the gas exchange.' },
    'canopy_floor', { x: 3, y: 10 }, [
      landmark('leaf-lab', 'Leaf Lab', '🍃', 7, 4, 'Leaf Structure', 'A leaf blade presents a large surface for capturing sunlight.', 'Which leaf part is specialized for capturing sunlight?', 'The blade / lamina', ['The root hair', 'The flower petal', 'The seed coat'], 'A broad lamina increases the area that can absorb light.'),
      landmark('stomata-gate', 'Stomata Gate', '💨', 14, 4, 'Gas Exchange', 'Stomata are tiny pores, mostly on the lower leaf surface, that let gases move in and out.', 'Carbon dioxide enters a leaf mainly through:', 'Stomata', ['Xylem vessels', 'Root caps', 'Bark'], 'Guard cells open and close stomata to control gas exchange and water loss.'),
      landmark('chloroplast-pool', 'Chloroplast Pool', '🟢', 20, 8, 'Chlorophyll', 'Chlorophyll in chloroplasts absorbs light energy used to make glucose.', 'The green pigment that traps light energy is:', 'Chlorophyll', ['Hemoglobin', 'Melanin', 'Keratin'], 'Chlorophyll reflects green wavelengths and absorbs red and blue light.'),
      landmark('sugar-still', 'Sugar Still', '🍬', 16, 15, 'Photosynthesis', 'Photosynthesis uses carbon dioxide, water, and light to produce glucose and oxygen.', 'The food product of photosynthesis is:', 'Glucose', ['Protein only', 'Salt', 'Nitrogen gas'], 'Light energy is stored in the chemical bonds of glucose.'),
      landmark('oxygen-vent', 'Oxygen Vent', '🫧', 7, 15, 'By-product', 'Oxygen released by plants comes from the splitting of water during the light reactions.', 'Which gas do green plants release in light?', 'Oxygen', ['Nitrogen', 'Methane', 'Argon'], 'Water is split and oxygen is given off as a by-product.'),
    ], 0),
  realm('vascular-gardens', 'Vascular Gardens', 'Plants', 'Transport Terraces', '#16a34a',
    'Terraced gardens that show how roots, stems, and veins move water and food.',
    { name: 'Professor Root', title: 'Botany Guide', avatar: '🌱', dialogue: 'Water climbs, food travels, and the stem holds the plant upright. Trace each pipe.' },
    'plant_floor', { x: 3, y: 10 }, [
      landmark('root-hair-bed', 'Root Hair Bed', '🫘', 7, 4, 'Roots', 'Root hairs greatly increase surface area for absorbing water and minerals.', 'Root hairs mainly help a plant to:', 'Absorb water and minerals', ['Make pollen', 'Trap sunlight', 'Produce oxygen'], 'A larger surface area speeds uptake from soil.'),
      landmark('xylem-pipe', 'Xylem Pipe', '🚰', 14, 4, 'Xylem', 'Xylem carries water and dissolved minerals upward from roots to leaves.', 'Xylem transports mainly:', 'Water and minerals up the plant', ['Food down from leaves only', 'Pollen to insects', 'Oxygen to roots only'], 'Dead xylem vessels form a continuous upward pipeline.'),
      landmark('phloem-lane', 'Phloem Lane', '🍯', 20, 8, 'Phloem', 'Phloem carries sugars from leaves to growing and storage tissues.', 'Sugars made in leaves travel in the:', 'Phloem', ['Xylem only', 'Stomata', 'Cuticle'], 'Translocation moves sucrose through living phloem cells.'),
      landmark('stem-tower', 'Stem Tower', '🪵', 16, 15, 'Stem', 'The stem supports leaves and flowers and contains vascular bundles.', 'A main job of the stem is to:', 'Support the plant and carry materials', ['Absorb only sunlight', 'Make eggs', 'Digest food'], 'Vascular bundles in the stem connect roots to leaves.'),
      landmark('vein-map', 'Vein Map', '🗺️', 7, 15, 'Leaf Veins', 'Leaf veins are bundles of xylem and phloem that support the blade.', 'Leaf veins contain:', 'Xylem and phloem', ['Only chlorophyll', 'Only stomata', 'Only seeds'], 'The vein network delivers water and exports sugar.'),
    ], 1),
  realm('pollination-meadow', 'Pollination Meadow', 'Plants', 'Flowering Fields', '#84cc16',
    'A meadow of flowers, pollen, seeds, and the cycle from bloom to seedling.',
    { name: 'Bee Keeper Linnaeus', title: 'Reproduction Naturalist', avatar: '🐝', dialogue: 'Pollen must reach a stigma. Then a seed can form and a new plant can start.' },
    'meadow_floor', { x: 3, y: 10 }, [
      landmark('petal-stage', 'Petal Stage', '🌸', 7, 4, 'Flower Parts', 'Petals are often colorful to attract pollinators.', 'Colorful petals mainly help to:', 'Attract pollinators', ['Absorb minerals', 'Store starch only', 'Make wood'], 'Insects and birds are drawn to bright, scented flowers.'),
      landmark('pollen-mill', 'Pollen Mill', '💛', 14, 4, 'Pollination', 'Pollination is the transfer of pollen from anther to stigma.', 'Pollination is the transfer of:', 'Pollen to the stigma', ['Seeds to the soil', 'Water to the leaf', 'Oxygen to the root'], 'This step must happen before fertilization in flowering plants.'),
      landmark('ovary-vault', 'Ovary Vault', '🫘', 20, 8, 'Fertilization', 'After fertilization, the ovule becomes a seed and the ovary becomes a fruit.', 'A fertilized ovule develops into a:', 'Seed', ['Petal', 'Stomata', 'Root hair'], 'The embryo sits inside the seed with a food store.'),
      landmark('seed-bank', 'Seed Bank', '🌰', 16, 15, 'Seeds', 'A seed contains an embryo and stored food protected by a seed coat.', 'A seed typically contains:', 'An embryo and food store', ['Only a flower', 'Only chlorophyll', 'Only pollen'], 'The food store supports the seedling until it can photosynthesize.'),
      landmark('germination-bed', 'Germination Bed', '🌾', 7, 15, 'Germination', 'Germination needs water, warmth, and oxygen so the embryo can grow.', 'Which set of conditions is needed for most seeds to germinate?', 'Water, warmth, and oxygen', ['Only darkness and salt', 'Only wind', 'Only pollen'], 'Water softens the coat and activates enzymes in the seed.'),
    ], 2),
  realm('habitat-savanna', 'Habitat Savanna', 'Animals', 'Food-Web Grasslands', '#f59e0b',
    'Open grassland where producers, consumers, and decomposers form food chains.',
    { name: 'Ranger Akela', title: 'Ecology Scout', avatar: '🦁', dialogue: 'Energy starts with the Sun. Count who eats whom, and watch the habitat change.' },
    'savanna_floor', { x: 3, y: 10 }, [
      landmark('producer-patch', 'Producer Patch', '🌾', 7, 4, 'Producers', 'Producers make their own food, usually by photosynthesis.', 'Which organisms are producers?', 'Green plants', ['Lions', 'Fungi only', 'Eagles'], 'Producers convert light energy into chemical energy.'),
      landmark('herbivore-trail', 'Herbivore Trail', '🦓', 14, 4, 'Consumers', 'Herbivores are primary consumers that eat plants.', 'A zebra is a:', 'Primary consumer', ['Producer', 'Decomposer', 'Apex producer'], 'It feeds on grass, so it sits on the second trophic level.'),
      landmark('predator-lookout', 'Predator Lookout', '🦅', 20, 8, 'Predators', 'Predators hunt other animals and help keep prey populations in check.', 'A predator obtains energy by:', 'Eating other animals', ['Photosynthesis', 'Absorbing only water', 'Making chlorophyll'], 'Carnivores and omnivores occupy higher trophic levels.'),
      landmark('food-chain-sign', 'Food Chain Sign', '🔗', 16, 15, 'Food Chains', 'A food chain shows one path of energy from producer to top consumer.', 'A correct simple chain is:', 'Grass → zebra → lion', ['Lion → grass → zebra', 'Sun → lion → grass', 'Zebra → grass → sun'], 'Arrows point in the direction energy flows.'),
      landmark('decomposer-den', 'Decomposer Den', '🍄', 7, 15, 'Decomposers', 'Decomposers break down dead matter and recycle minerals into soil.', 'Fungi and many bacteria are important as:', 'Decomposers', ['Primary producers of light', 'Only predators', 'Pollinators only'], 'They return nutrients so plants can grow again.'),
    ], 3),
  realm('adaptation-isles', 'Adaptation Isles', 'Animals', 'Biome Archipelago', '#fb923c',
    'Islands that show how body features and behaviors help animals survive.',
    { name: 'Captain Darwin', title: 'Field Evolutionist', avatar: '🐢', dialogue: 'An adaptation is a trait that helps survival in a particular habitat. Compare the islands.' },
    'island_floor', { x: 3, y: 10 }, [
      landmark('camel-dune', 'Camel Dune', '🐪', 7, 4, 'Desert Adaptation', 'Camels store fat in the hump and can go long periods without drinking.', 'A camel hump mainly stores:', 'Fat', ['Water tanks', 'Sand', 'Chlorophyll'], 'Fat can be metabolized for energy and some water in desert travel.'),
      landmark('polar-shelf', 'Polar Shelf', '🐧', 14, 4, 'Cold Adaptation', 'Thick blubber and compact bodies reduce heat loss in cold climates.', 'Blubber helps polar animals by:', 'Insulating against cold', ['Making food from light', 'Attracting pollinators', 'Carrying pollen'], 'A fat layer slows heat escaping from the body.'),
      landmark('fish-gill-cove', 'Gill Cove', '🐟', 20, 8, 'Aquatic Adaptation', 'Gills extract dissolved oxygen from water.', 'Fish obtain oxygen mainly with:', 'Gills', ['Lungs only', 'Stomata', 'Root hairs'], 'Water flows over gill filaments rich in blood vessels.'),
      landmark('bird-wing-cliff', 'Wing Cliff', '🦜', 16, 15, 'Flight', 'Hollow bones and wings reduce weight and provide lift.', 'Hollow bones in birds mainly:', 'Reduce body weight for flight', ['Store extra water', 'Digest cellulose', 'Make chlorophyll'], 'A lighter skeleton makes powered flight more efficient.'),
      landmark('camouflage-thicket', 'Camouflage Thicket', '🦎', 7, 15, 'Camouflage', 'Color and pattern that match the background help animals hide from predators or prey.', 'Camouflage is useful because it:', 'Makes an animal harder to see', ['Increases photosynthesis', 'Stops all movement forever', 'Creates oxygen'], 'Blending with surroundings reduces detection.'),
    ], 4),
  realm('classification-hall', 'Classification Hall', 'Animals', 'Taxonomy Archive', '#d97706',
    'A museum hall that sorts animals by shared features and body plans.',
    { name: 'Curator Aristotle', title: 'Taxonomist', avatar: '🦋', dialogue: 'Group living things by clear traits. Vertebrate or not is a powerful first split.' },
    'archive_floor', { x: 3, y: 10 }, [
      landmark('vertebrate-gate', 'Vertebrate Gate', '🦴', 7, 4, 'Vertebrates', 'Vertebrates have a backbone, or vertebral column.', 'Which animal is a vertebrate?', 'Frog', ['Earthworm', 'Jellyfish', 'Snail'], 'Amphibians have an internal backbone.'),
      landmark('invertebrate-wing', 'Invertebrate Wing', '🐙', 14, 4, 'Invertebrates', 'Invertebrates lack a backbone and include insects, worms, and molluscs.', 'An insect is an:', 'Invertebrate', ['Vertebrate mammal', 'Plant', 'Fungus only'], 'Insects have an exoskeleton but no vertebral column.'),
      landmark('mammal-gallery', 'Mammal Gallery', '🐘', 20, 8, 'Mammals', 'Mammals are warm-blooded vertebrates that feed young on milk.', 'A defining mammal trait is:', 'Milk for the young', ['Feathers', 'Gills throughout life', 'Six legs'], 'Mammary glands produce milk.'),
      landmark('bird-gallery', 'Bird Gallery', '🦢', 16, 15, 'Birds', 'Birds are vertebrates with feathers and lay hard-shelled eggs.', 'Feathers are found on:', 'Birds', ['Fish', 'Amphibians', 'Insects only'], 'Feathers insulate and enable flight in most species.'),
      landmark('amphibian-pool', 'Amphibian Pool', '🐸', 7, 15, 'Amphibians', 'Amphibians typically begin life in water and later live on land.', 'A frog tadpole usually lives:', 'In water', ['Only in deserts', 'Only in trees', 'Inside seeds'], 'Gilled larvae later metamorphose into air-breathing adults.'),
    ], 5),
  realm('circulatory-ward', 'Circulatory Ward', 'Human Body', 'Cardio Clinic', '#f43f5e',
    'A clinic that maps the heart, blood, and the vessels that deliver oxygen.',
    { name: 'Dr. Harvey', title: 'Circulation Specialist', avatar: '❤️', dialogue: 'The heart is a pump. Blood is the courier. Follow the double circuit.' },
    'clinic_floor', { x: 3, y: 10 }, [
      landmark('heart-pump', 'Heart Pump', '💗', 7, 4, 'Heart', 'The heart has four chambers and pumps blood through two circuits.', 'The human heart has how many chambers?', 'Four', ['Two', 'Three', 'Six'], 'Two atria receive blood and two ventricles pump it out.'),
      landmark('artery-lane', 'Artery Lane', '🔴', 14, 4, 'Arteries', 'Arteries carry blood away from the heart, usually oxygen-rich.', 'Arteries carry blood:', 'Away from the heart', ['Only toward the lungs', 'Only into the intestine', 'Toward the heart only'], 'Thick elastic walls withstand pulse pressure.'),
      landmark('vein-return', 'Vein Return', '🔵', 20, 8, 'Veins', 'Veins return blood to the heart and often contain valves.', 'Valves in veins help to:', 'Prevent backflow of blood', ['Make red cells', 'Absorb food', 'Filter urine'], 'Valves keep low-pressure blood moving toward the heart.'),
      landmark('capillary-mesh', 'Capillary Mesh', '🧵', 16, 15, 'Capillaries', 'Capillaries are thin enough for oxygen, carbon dioxide, and nutrients to exchange.', 'Exchange of gases with tissues happens in:', 'Capillaries', ['Bone marrow only', 'Hair follicles', 'Enamel'], 'A single-cell wall allows diffusion.'),
      landmark('blood-lab', 'Blood Lab', '🩸', 7, 15, 'Blood', 'Red blood cells carry oxygen using hemoglobin.', 'Hemoglobin is found mainly in:', 'Red blood cells', ['Platelets only', 'Bone cells', 'Hair'], 'Iron in hemoglobin binds oxygen in the lungs.'),
    ], 6),
  realm('digestive-kitchen', 'Digestive Kitchen', 'Human Body', 'Nutrition Hall', '#fb7185',
    'A kitchen-lab for breaking food down and a lung bay for breathing.',
    { name: 'Chef Beaumont', title: 'Physiology Cook', avatar: '🫁', dialogue: 'Food must be broken into molecules the blood can carry. Air must reach the alveoli.' },
    'kitchen_floor', { x: 3, y: 10 }, [
      landmark('mouth-prep', 'Mouth Prep', '🦷', 7, 4, 'Digestion Starts', 'Teeth mechanically break food and saliva begins starch digestion.', 'Saliva contains an enzyme that starts digesting:', 'Starch', ['Iron', 'Oxygen', 'DNA only'], 'Amylase in saliva acts on cooked starch.'),
      landmark('stomach-vat', 'Stomach Vat', '🫙', 14, 4, 'Stomach', 'The stomach churns food and uses acid and pepsin to begin protein digestion.', 'Pepsin works on:', 'Proteins', ['Only fats', 'Only vitamins', 'Only water'], 'Acidic conditions in the stomach activate pepsin.'),
      landmark('intestine-line', 'Intestine Line', '🍝', 20, 8, 'Small Intestine', 'Most digested food is absorbed in the small intestine.', 'The main site of food absorption is the:', 'Small intestine', ['Windpipe', 'Bladder', 'Skin'], 'Villi greatly increase the absorptive surface.'),
      landmark('lung-bellows', 'Lung Bellows', '🌬️', 16, 15, 'Breathing', 'The lungs take in oxygen and remove carbon dioxide.', 'We inhale air mainly to obtain:', 'Oxygen', ['Nitrogen for bones', 'Chlorophyll', 'Glucose'], 'Oxygen is needed for aerobic respiration in cells.'),
      landmark('alveoli-dome', 'Alveoli Dome', '🫧', 7, 15, 'Alveoli', 'Alveoli are tiny air sacs where gases diffuse into and out of blood.', 'Gas exchange in the lungs occurs in the:', 'Alveoli', ['Stomach', 'Kidneys', 'Hair follicles'], 'A huge surface area and thin walls speed diffusion.'),
    ], 7),
  realm('skeletal-neural-lab', 'Skeletal Neural Lab', 'Human Body', 'Support & Control Deck', '#e11d48',
    'A lab for bones, joints, muscles, the brain, and the sense organs.',
    { name: 'Dr. Cajal', title: 'Systems Anatomist', avatar: '🧠', dialogue: 'Bones support, muscles move, and nerves coordinate. Test each station.' },
    'neural_floor', { x: 3, y: 10 }, [
      landmark('femur-rack', 'Femur Rack', '🦴', 7, 4, 'Skeleton', 'The skeleton supports the body, protects organs, and makes blood cells in marrow.', 'A function of bones is to:', 'Support the body and protect organs', ['Digest protein', 'Make chlorophyll', 'Carry pollen'], 'The skull and rib cage are protective cages.'),
      landmark('joint-hinge', 'Joint Hinge', '🔗', 14, 4, 'Joints', 'Joints are where bones meet and allow controlled movement.', 'The elbow is mainly a:', 'Hinge joint', ['Fixed skull suture only', 'Ball that never bends', 'Capillary'], 'Hinge joints move chiefly in one plane, like a door.'),
      landmark('muscle-bay', 'Muscle Bay', '💪', 20, 8, 'Muscles', 'Skeletal muscles pull on bones and work in antagonistic pairs.', 'Muscles move bones by:', 'Contracting and pulling', ['Pushing bones apart only', 'Photosynthesis', 'Making red light'], 'A contracted muscle shortens and pulls its attachment.'),
      landmark('brain-console', 'Brain Console', '🧠', 16, 15, 'Nervous System', 'The brain and spinal cord form the central nervous system.', 'The control center of the nervous system is the:', 'Brain', ['Stomach', 'Hair', 'Nail'], 'The brain processes information and issues responses.'),
      landmark('eye-station', 'Eye Station', '👁️', 7, 15, 'Senses', 'Sense organs detect stimuli such as light, sound, and chemicals.', 'The eye detects:', 'Light', ['Sound only', 'Salt in soil', 'Magnetic north only'], 'Photoreceptors in the retina respond to light.'),
    ], 8),
];
