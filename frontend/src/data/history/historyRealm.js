const answers = (correct, right, distractors) => ({
  options: [right, ...distractors].map((text, index) => ({ id: String.fromCharCode(65 + index), text })),
  correct: String.fromCharCode(65 + correct)
});

function landmark(id, name, icon, x, y, category, fact, question, right, distractors, explanation, correct = 0) {
  return {
    id, name, icon, x, y, category, fact,
    quiz: { id: `history-landmark:${id}`, question, ...answers(correct, right, distractors), explanation }
  };
}

const realm = (id, name, region, biome, themeColor, description, npc, baseTile, year, landmarks, index) => ({
  id, name, region,
  coords: { lat: 20, lng: index * 18 - 80 },
  globePosition: { x: Math.cos(index), y: Math.sin(index), z: 0 },
  biome, elevation: year, themeColor, description, npc,
  mapConfig: { width: 24, height: 20, baseTile, riverStyle: 'trade_route', playerStart: { x: 3, y: 10 } },
  landmarks
});

export const HISTORY_REALMS = [
  realm('bhimbetka-caves', 'Bhimbetka Caves', 'Ancient World', 'Rock Shelter Archive', '#d97706',
    'Painted rock shelters that record how early humans hunted, gathered, and later settled.',
    { name: 'Guide Bhim', title: 'Prehistory Scout', avatar: '🪨', dialogue: 'These walls remember fire, tools, and the first fields. Walk the shelters and read the stones.' },
    'stone_floor', 'c. 30,000 BCE', [
      landmark('hunter-wall', 'Hunter Wall', '🦌', 7, 4, 'Hunter-Gatherers', 'Early humans moved to find food and water rather than stay in one town.', 'Why did hunter-gatherers move?', 'To search for food and water', ['To build factories', 'To trade machines', 'To found empires'], 'They followed naturally available food and water.'),
      landmark('fire-hearth', 'Fire Hearth', '🔥', 14, 4, 'Fire', 'Fire gave warmth, light, protection, and cooked food.', 'Fire helped early humans mainly by providing:', 'Warmth, light, and cooked food', ['Steel tools', 'Writing', 'Coins'], 'Control of fire changed diet and safety.'),
      landmark('seed-plot', 'Seed Plot', '🌾', 20, 8, 'Agriculture', 'Domestication of plants and animals made settled life possible.', 'Settled villages grew after humans began:', 'Agriculture', ['Space travel', 'Printing books', 'Steam engines'], 'Farming produced a more reliable food supply.'),
      landmark('flint-bench', 'Flint Bench', '🪓', 16, 15, 'Tools', 'Stone tools were shaped for hunting, cutting, and scraping.', 'Early tools were commonly made of:', 'Stone', ['Plastic', 'Aluminum', 'Rubber'], 'Flaked stone edges were sharp and durable.'),
      landmark('shelter-nook', 'Shelter Nook', '🏕️', 7, 15, 'Settlement', 'Caves and later huts protected people from weather and animals.', 'A rock shelter is useful because it:', 'Gives protection from weather', ['Stores electricity', 'Mints coins', 'Builds railroads'], 'Natural overhangs were early homes.')
    ], 0),
  realm('mohenjo-daro', 'Mohenjo-daro', 'Ancient World', 'Harappan City', '#f59e0b',
    'A planned Indus city with streets, drains, wells, and the Great Bath.',
    { name: 'Planner Sindhu', title: 'City Surveyor', avatar: '🏺', dialogue: 'Look at the drains and the brickwork. This city was designed, not thrown together.' },
    'brick_floor', 'c. 2500 BCE', [
      landmark('street-grid', 'Street Grid', '🗺️', 7, 4, 'Town Planning', 'Harappan streets were laid out in an organized grid.', 'Harappan cities are famous for:', 'Planned streets and drains', ['Medieval castles', 'Roman theatres', 'Modern factories'], 'The grid and drainage show civic planning.'),
      landmark('great-bath', 'Great Bath', '🛁', 14, 4, 'Public Works', 'The Great Bath is a large brick-lined tank that may have had a ritual use.', 'The Great Bath is at:', 'Mohenjo-daro', ['Paris', 'Manchester', 'Berlin'], 'It is a landmark of Harappan public architecture.'),
      landmark('drain-lane', 'Drain Lane', '🚰', 20, 8, 'Drainage', 'Covered drains ran along streets and away from houses.', 'A notable Harappan civic feature was:', 'Advanced drainage systems', ['Steel bridges', 'Printing presses', 'Airports'], 'Drains show concern for cleanliness and planning.'),
      landmark('bead-workshop', 'Bead Workshop', '📿', 16, 15, 'Crafts', 'Craftspeople made beads, pottery, seals, and metal objects.', 'Harappan craft included:', 'Beads and seals', ['Steam engines', 'Plastic toys', 'Silicon chips'], 'Craft goods were used locally and in trade.'),
      landmark('trade-wharf', 'Trade Wharf', '🚢', 7, 15, 'Trade', 'Harappans traded over long distances by land and river.', 'Harappan cities took part in:', 'Long-distance trade', ['Only local barter of air', 'No exchange at all', 'Oil pipelines'], 'Seals and goods moved far beyond the city.')
    ], 1),
  realm('delhi-sultanate', 'Delhi Sultanate', 'Medieval India', 'Sultanate Court', '#b45309',
    'The first sultanate court in Delhi and the rise of new political power in north India.',
    { name: 'Chronicler Barani', title: 'Court Historian', avatar: '🕌', dialogue: 'Dynasties change, but the city remains the prize. Follow the first sultans.' },
    'court_floor', '1206 CE', [
      landmark('aibak-gate', 'Aibak Gate', '🚪', 7, 4, 'Foundation', 'Qutb-ud-din Aibak became the first Sultan of Delhi in 1206.', 'The first Sultan of Delhi was:', 'Qutb-ud-din Aibak', ['Akbar', 'Babur', 'Sher Shah Suri'], 'Aibak founded the Mamluk line in Delhi.'),
      landmark('qutb-minar', 'Qutb Minar', '🗼', 14, 4, 'Architecture', 'The Qutb complex marks early sultanate building in Delhi.', 'The Qutb Minar belongs to the:', 'Delhi Sultanate period', ['Harappan age', 'Mauryan age', 'Gupta age only'], 'It is an early sultanate monument.'),
      landmark('iqta-desk', 'Iqta Desk', '📜', 20, 8, 'Administration', 'Iqta was a land-assignment system used to pay officers.', 'Iqta was mainly a system of:', 'Land assignment to officers', ['Steam power', 'Printing', 'Railways'], 'Revenue from land supported the army and officials.'),
      landmark('market-square', 'Market Square', '🪙', 16, 15, 'Economy', 'Towns and markets grew around sultanate political centers.', 'Sultanate capitals attracted:', 'Markets and crafts', ['Only empty desert', 'Airports', 'Software parks'], 'Political centers drew traders.'),
      landmark('archive-hall', 'Archive Hall', '📚', 7, 15, 'Sources', 'Chronicles and inscriptions help reconstruct sultanate politics.', 'Historians of this period use:', 'Chronicles and inscriptions', ['Satellite photos only', 'DNA of stars', 'Radio only'], 'Written and built sources survive.')
    ], 2),
  realm('agra-fort', 'Agra Fort', 'Medieval India', 'Mughal Citadel', '#ca8a04',
    'A Mughal stronghold from the age of Babur and his successors.',
    { name: 'Mirza Court', title: 'Mughal Guide', avatar: '👑', dialogue: '1526 opened a new chapter. Walk the fort and name the first Mughal victories.' },
    'fort_floor', '1526 CE', [
      landmark('panipat-map', 'Panipat Map', '⚔️', 7, 4, 'Babur', 'Babur defeated Ibrahim Lodi at Panipat in 1526 and founded Mughal rule.', 'The First Battle of Panipat was in:', '1526', ['1498', '1556', '1605'], 'That victory began Mughal power in north India.'),
      landmark('red-walls', 'Red Walls', '🧱', 14, 4, 'Fort', 'Agra Fort became a major Mughal residence and military base.', 'Agra Fort is mainly associated with the:', 'Mughals', ['Harappans', 'British Raj only', 'French Revolution'], 'It was a Mughal citadel.'),
      landmark('diwan-hall', 'Diwan Hall', '🪑', 20, 8, 'Court', 'Mughal courts combined military power with ceremony and administration.', 'A Mughal court was a center of:', 'Power and administration', ['Only farming', 'Only fishing', 'Only mining salt'], 'The emperor ruled through a court and officers.'),
      landmark('garden-court', 'Garden Court', '🌸', 16, 15, 'Culture', 'Mughal architecture mixed Indian and Persian garden and building ideas.', 'Mughal buildings often show:', 'Indian and Persian styles together', ['Only glass skyscrapers', 'Only cave paintings', 'Only factory sheds'], 'The blend is a hallmark of the period.'),
      landmark('succession-scroll', 'Succession Scroll', '📜', 7, 15, 'Dynasty', 'Later emperors expanded and reorganized the empire from these capitals.', 'After Babur, the dynasty is called:', 'Mughal', ['Maurya', 'Chola', 'Gupta'], 'Babur founded the Mughal line.')
    ], 3),
  realm('kolkata', 'Kolkata', 'Colonial India', 'Company Port', '#78716c',
    'The rise of British power after Plassey and the growth of a colonial capital.',
    { name: 'Clerk Hastings', title: 'Company Archivist', avatar: '⚓', dialogue: 'Trade became territory. Start at Plassey and watch a trading company become a state.' },
    'port_floor', '1757 CE', [
      landmark('plassey-field', 'Plassey Field', '🎖️', 7, 4, 'Plassey', 'The Battle of Plassey in 1757 was a turning point for British power in Bengal.', 'A key turning point for the British in Bengal was:', 'Battle of Plassey', ['Battle of Panipat', 'Battle of Haldighati', 'Battle of Talikota'], 'Plassey opened the way to Company rule in Bengal.'),
      landmark('factory-house', 'Factory House', '🏛️', 14, 4, 'Company', 'The East India Company began as a trading body and became a territorial power.', 'The East India Company started as a:', 'Trading company', ['School only', 'Temple trust', 'Farmers union'], 'Trade profits funded armies and administration.'),
      landmark('dock-ledger', 'Dock Ledger', '📦', 20, 8, 'Trade', 'Colonial ports exported raw goods and imported manufactured items.', 'Colonial ports were important for:', 'Overseas trade', ['Only cave art', 'Only hunting', 'Only local wells'], 'Ports linked India to a global trading system.'),
      landmark('tax-office', 'Tax Office', '🧾', 16, 15, 'Revenue', 'Land revenue was a main source of Company income.', 'The Company collected much of its income as:', 'Land revenue', ['Space fees', 'Internet tax', 'Airport duty only'], 'Control of land meant control of revenue.'),
      landmark('press-room', 'Press Room', '📰', 7, 15, 'City Life', 'Calcutta grew into a major colonial administrative and cultural city.', 'Colonial Calcutta became a:', 'Administrative capital', ['Harappan village', 'Mughal hunting camp only', 'Prehistoric cave'], 'It was a center of British administration in India.')
    ], 4),
  realm('red-fort-delhi', 'Red Fort, Delhi', 'Colonial India', '1857 Uprising', '#9f1239',
    'The last Mughal court and the revolt of 1857.',
    { name: 'Bahadur Shah', title: 'Poet-King', avatar: '🏰', dialogue: '1857 was more than one battle. Listen to the soldiers, the court, and the city.' },
    'revolt_floor', '1857 CE', [
      landmark('zafar-court', 'Zafar Court', '👑', 7, 4, '1857', 'Bahadur Shah Zafar was proclaimed a symbol of the 1857 uprising.', 'The last Mughal emperor linked to 1857 was:', 'Bahadur Shah Zafar', ['Akbar', 'Tipu Sultan', 'Shivaji'], 'Rebels gathered around his name in Delhi.'),
      landmark('sepoy-lines', 'Sepoy Lines', '🪖', 14, 4, 'Causes', 'Discontent among sepoys, peasants, and princes fed the revolt.', 'The 1857 uprising involved:', 'Sepoys and many civilians', ['Only sailors in 1942', 'Only Harappan priests', 'Only French peasants'], 'It spread beyond the army in several regions.'),
      landmark('magazine-gate', 'Magazine Gate', '💥', 20, 8, 'Conflict', 'Delhi, Kanpur, Lucknow, and other centers saw heavy fighting.', '1857 fighting was:', 'Widespread in several regions', ['Only in Australia', 'Only at sea', 'Only in the Arctic'], 'Multiple centers rose at once.'),
      landmark('transfer-scroll', 'Transfer Scroll', '📜', 16, 15, 'Aftermath', 'After 1858 the British Crown took over from the Company.', 'After 1857, India was ruled more directly by the:', 'British Crown', ['Harappan kings', 'French Directory', 'Mauryan council'], 'Company rule ended in 1858.'),
      landmark('memory-wall', 'Memory Wall', '🕯️', 7, 15, 'Memory', '1857 is remembered as a revolt, a mutiny, or a war of independence, depending on the teller.', 'Historians debate 1857 because:', 'People give it different names and meanings', ['It never happened', 'It was in 3000 BCE', 'It was only about railways'], 'Sources and viewpoints differ.')
    ], 5),
  realm('paris', 'Paris', 'Modern World', 'Revolution Streets', '#2563eb',
    'The French Revolution and the language of liberty, rights, and the republic.',
    { name: 'Citizen Lucie', title: 'Revolution Guide', avatar: '🇫🇷', dialogue: '14 July 1789 is one date. Rights and the republic took longer. Walk the streets.' },
    'revolution_floor', '1789 CE', [
      landmark('bastille-gate', 'Bastille Gate', '🔓', 7, 4, '1789', 'The storming of the Bastille on 14 July 1789 became a symbol of the Revolution.', 'The Bastille was stormed on:', '14 July 1789', ['4 July 1776', '26 August 1789', '21 January 1793'], 'That date is remembered as a revolutionary turning point.'),
      landmark('rights-plaque', 'Rights Plaque', '⚖️', 14, 4, 'Rights', 'The Declaration of the Rights of Man and of the Citizen stated civic equality.', 'The Revolution proclaimed:', 'Civic rights and equality before the law', ['Divine right only', 'Caste by birth forever', 'No written ideas'], 'Rights language spread far beyond France.'),
      landmark('assembly-hall', 'Assembly Hall', '🏛️', 20, 8, 'Republic', 'The monarchy was abolished and a republic was declared.', 'The French Revolution ended the:', 'Absolute monarchy in France', ['Indus cities', 'Mughal gardens only', 'Harappan drains'], 'Sovereignty was claimed for the nation.'),
      landmark('press-corner', 'Press Corner', '🗞️', 16, 15, 'Ideas', 'Pamphlets, clubs, and newspapers spread revolutionary ideas.', 'Ideas spread quickly because of:', 'Print and political clubs', ['Only cave paintings', 'Only stone tools', 'Only iqta lists'], 'Print culture mattered in 1789.'),
      landmark('europe-map', 'Europe Map', '🌍', 7, 15, 'Impact', 'The Revolution shook monarchies across Europe.', 'The Revolution had effects:', 'Across Europe and beyond', ['Only in one village', 'Only in 2500 BCE', 'Only at sea under water'], 'Wars and ideas traveled together.')
    ], 6),
  realm('manchester', 'Manchester', 'Modern World', 'Industrial Mills', '#64748b',
    'Factories, steam, and the new working class of the Industrial Revolution.',
    { name: 'Millwright Ada', title: 'Industry Guide', avatar: '⚙️', dialogue: 'Cloth came first here. Listen to the machines and the people who ran them.' },
    'mill_floor', 'c. 1780 CE', [
      landmark('loom-floor', 'Loom Floor', '🧵', 7, 4, 'Textiles', 'The early Industrial Revolution was led by the textile industry.', 'An early leading industry was:', 'Textile industry', ['Software industry', 'Film industry', 'Aviation industry'], 'Cotton mills transformed production.'),
      landmark('steam-house', 'Steam House', '🚂', 14, 4, 'Power', 'Steam engines powered machines that no longer needed a riverside wheel.', 'Factories used steam to:', 'Drive machines', ['Grow wheat in caves', 'Print Harappan seals', 'Build pyramids'], 'Steam freed industry from water sites.'),
      landmark('worker-row', 'Worker Row', '🏠', 20, 8, 'Labour', 'A wage-earning working class grew around mills and towns.', 'Industrial towns created a new:', 'Working class', ['Hunter-gatherer band only', 'Harappan priest class', 'Mughal cavalry only'], 'People sold labour for wages.'),
      landmark('coal-yard', 'Coal Yard', '⛏️', 16, 15, 'Energy', 'Coal fed engines and heated growing cities.', 'A key industrial fuel was:', 'Coal', ['Olive oil only', 'Wind chimes', 'River sand only'], 'Coal and iron underpinned the new economy.'),
      landmark('export-dock', 'Export Dock', '🛳️', 7, 15, 'Markets', 'Machine-made cloth reached markets across the world.', 'Industrial goods were:', 'Sold in distant markets', ['Never transported', 'Only eaten', 'Only buried'], 'Global trade carried factory output.')
    ], 7),
  realm('sabarmati-ashram', 'Sabarmati Ashram', 'Modern India', 'Freedom Campus', '#16a34a',
    'Gandhian ashram life and the mass movements of Indian nationalism.',
    { name: 'Ba Kasturba', title: 'Ashram Keeper', avatar: '🕊️', dialogue: 'Non-cooperation, salt, and Quit India were different tools. Walk each path.' },
    'ashram_floor', '1917–1942', [
      landmark('spinning-porch', 'Spinning Porch', '🧶', 7, 4, 'Swadeshi', 'Khadi and boycott were everyday forms of non-cooperation.', 'Non-cooperation asked Indians to:', 'Withdraw cooperation from colonial institutions', ['Join the Company army only', 'Abandon all villages', 'Stop farming forever'], 'Schools, courts, and goods were boycotted.'),
      landmark('salt-pan', 'Salt Pan', '🧂', 14, 4, 'Civil Disobedience', 'The salt satyagraha broke a colonial law the poor felt every day.', 'Civil disobedience included breaking:', 'Selected colonial laws such as the salt law', ['All family rules', 'Harappan brick codes', 'Mughal garden etiquette only'], 'Salt made the protest widely understood.'),
      landmark('quit-banner', 'Quit Banner', '📢', 20, 8, '1942', 'The Quit India Movement of 1942 demanded an immediate end to British rule.', 'Quit India was launched in:', '1942', ['1919', '1920', '1930'], 'It came during the Second World War.'),
      landmark('letter-desk', 'Letter Desk', '✉️', 16, 15, 'Leadership', 'Congress and many local leaders organized nationwide campaigns.', 'Mass nationalism needed:', 'Leaders and local organization', ['Only foreign armies', 'Only factory owners in Manchester', 'Only cave painters'], 'Movements linked villages, towns, and cities.'),
      landmark('prayer-ground', 'Prayer Ground', '🙏', 7, 15, 'Methods', 'Satyagraha stressed non-violent resistance.', 'Gandhian protest emphasized:', 'Non-violent resistance', ['Only naval blockade', 'Only tank warfare', 'Only silent exile'], 'Moral pressure was part of the method.')
    ], 8),
  realm('berlin', 'Berlin', 'Modern World', 'War and Peace Archive', '#334155',
    'The world wars, their costs, and the wave of decolonization that followed.',
    { name: 'Archivist Ren', title: 'Twentieth-Century Guide', avatar: '🕊️', dialogue: 'Two wars remade the map. Then empires came apart. Keep the dates clear.' },
    'archive_floor', '1914–1945', [
      landmark('1914-map', '1914 Map', '🪖', 7, 4, 'WWI', 'The First World War lasted from 1914 to 1918.', 'The First World War is dated:', '1914–1918', ['1939–1945', '1929–1933', '1947–1950'], 'It began in 1914 and ended in 1918.'),
      landmark('1939-map', '1939 Map', '🌍', 14, 4, 'WWII', 'The Second World War lasted from 1939 to 1945.', 'The Second World War is dated:', '1939–1945', ['1914–1918', '1929–1933', '1947–1950'], 'It was a global conflict across several continents.'),
      landmark('rubble-street', 'Rubble Street', '🏚️', 20, 8, 'Cost', 'The wars killed millions and destroyed cities and economies.', 'The world wars caused:', 'Massive loss of life and damage', ['Only a local festival', 'Only a harvest boom', 'Only a new alphabet'], 'Civilian and military costs were enormous.'),
      landmark('un-desk', 'UN Desk', '🌐', 16, 15, 'Aftermath', 'New international institutions and a bipolar world followed 1945.', 'After 1945 the world saw:', 'New international institutions', ['Return to the Indus script as law', 'End of all states', 'Only hunter-gatherer bands'], 'The UN was one response to total war.'),
      landmark('freedom-gate', 'Freedom Gate', '🚪', 7, 15, 'Decolonization', 'After the Second World War many Asian and African countries gained independence.', 'Decolonization means:', 'Colonies becoming independent countries', ['Building more colonies', 'Ending all farming', 'Banning all trade'], 'European empires retreated after 1945.')
    ], 9)
];
