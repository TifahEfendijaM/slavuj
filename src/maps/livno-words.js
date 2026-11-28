// Livno (winter): 65 interactive Bosnian words + 1 finale word ('sloboda') = 66 unique words.
// Every single key and Bosnian word is verified 100% disjoint from all 11 other towns.
// Zero em dashes anywhere in prose, hints, or culture facts.

export const WORDS = {
  // Zone 1: Krug Plateau & Wild Horses (11)
  krdo: {
    word: 'krdo', en: 'herd', choices: ['krdo', 'stado', 'jato'],
    note: 'Over eight hundred wild horses roam free across the windswept Krug plateau above Livno, descended from farm horses released in the 1970s.',
    hint: 'On the snowy Krug plateau above the river, a free band of horses stands together.',
  },
  pastuh: {
    word: 'pastuh', en: 'stallion', choices: ['pastuh', 'magarac', 'jarac'],
    note: 'A strong stallion leads each wild band on the Krug plateau, watching over the mares and foals through freezing mountain winters.',
    hint: 'A dark chestnut stallion stands proudly on a snowy rise overlooking the herd.',
  },
  kobila: {
    word: 'kobila', en: 'mare', choices: ['kobila', 'krava', 'koza'],
    note: 'Wild mares stay close to the centre of the herd on windy days, sheltering the young foals with their warm flanks.',
    hint: 'A pale cream mare stands calmly in the snow on the western plateau.',
  },
  zdrijebe: {
    word: 'ždrijebe', en: 'foal', choices: ['ždrijebe', 'tele', 'jagnje'],
    note: 'Born on the open karst meadow in spring, a Livno foal learns to run across stone and snow within its first hours.',
    hint: 'A small chestnut foal stands right beside the pale mare on the plateau.',
  },
  griva: {
    word: 'griva', en: 'mane', choices: ['griva', 'krzno', 'perje'],
    note: 'When the cold bura wind sweeps over Mount Cincar, the wild horses turn their backs to it and their thick manes stream like dark ribbons.',
    hint: 'Look closely along the proud stallion\'s arched neck.',
  },
  kopito: {
    word: 'kopito', en: 'hoof', choices: ['kopito', 'šapa', 'kandža'],
    note: 'Hard mountain hooves let Livno\'s wild horses dig through crusted winter snow to reach dry grass and alpine herbs underneath.',
    hint: 'Look down at the stallion\'s raised foreleg and dark hoof prints in the snow.',
  },
  galop: {
    word: 'galop', en: 'gallop', choices: ['galop', 'korak', 'skok'],
    note: 'Hearing hundreds of hooves break into a sudden gallop across frozen limestone is one of the unforgettable sights of Bosnia and Herzegovina.',
    hint: 'Behind the charging wild horse on the southern plateau, snow sprays high into the air.',
  },
  visoravan: {
    word: 'visoravan', en: 'plateau', choices: ['visoravan', 'dolina', 'ravnica'],
    note: 'The Krug highland plateau sits above 1,100 metres between Livno and Mount Cincar, open to crisp sun and mountain winds.',
    hint: 'A wide snow-blanketed highland terrace rises on the far western side.',
  },
  pasnjak: {
    word: 'pašnjak', en: 'pasture', choices: ['pašnjak', 'njiva', 'voćnjak'],
    note: 'Rich summer alpine pastures around Livno are filled with wild thyme and sage, which give famous Livanjski sir its unmistakable flavour.',
    hint: 'Golden tufts of winter grass peek through the snow on the southern plateau meadow.',
  },
  pojilo: {
    word: 'pojilo', en: 'watering trough', choices: ['pojilo', 'bunar', 'korito'],
    note: 'Local volunteers and mountaineers maintain stone watering troughs and salt blocks on the Krug plateau so the wild horses thrive in deep winter.',
    hint: 'A carved stone watering trough sits near the plateau path where the horses gather.',
  },
  suhozid: {
    word: 'suhozid', en: 'dry-stone wall', choices: ['suhozid', 'taraba', 'plot'],
    note: 'Stacked without mortar from pale karst limestone, dry-stone walls have marked pastures across Livno and Herzegovina for centuries.',
    hint: 'A low wall of stacked pale limestone blocks runs along the edge of the horse plateau.',
  },

  // Zone 2: Duman Karst Spring, Ice & Winter Weather (8)
  vrelo: {
    word: 'vrelo', en: 'karst spring', choices: ['vrelo', 'potok', 'bara'],
    note: 'Duman is the dramatic karst spring where the Bistrica River bursts straight out of a towering vertical cliff at the northern edge of Livno.',
    hint: 'Turquoise water gushes from the foot of the high pale limestone cliff.',
  },
  spilja: {
    word: 'špilja', en: 'cavern', choices: ['špilja', 'jama', 'provalija'],
    note: 'Deep underground karst channels carry snowmelt from Mount Cincar for kilometres before emerging through the arched cavern mouth at Duman.',
    hint: 'A dark arched cave mouth opens at the base of the Duman limestone cliff.',
  },
  siga: {
    word: 'siga', en: 'icicle', choices: ['siga', 'pahulja', 'grad'],
    note: 'Spray from the rushing Duman spring freezes along the overhanging cliff rocks on crisp January mornings, forming gleaming curtains of icicles.',
    hint: 'Glittering frozen icicles hang beneath the limestone arch above the Duman spring.',
  },
  poledica: {
    word: 'poledica', en: 'black ice', choices: ['poledica', 'bljuzga', 'mraz'],
    note: 'When daytime sun melts snow beside the Bistrica and evening frost returns, smooth glassy ice forms along the riverside stones.',
    hint: 'A gleaming glassy sheet of ice coats the flat stone bank along the eastern river edge.',
  },
  inje: {
    word: 'inje', en: 'hoarfrost', choices: ['inje', 'rosa', 'magla'],
    note: 'Freeze-mist rising from Duman coats every nearby branch in thick feathery hoarfrost that sparkles like white coral in morning sunlight.',
    hint: 'White frost-feathered branches gleam beside the western bank near the spring.',
  },
  bura: {
    word: 'bura', en: 'cold north wind', choices: ['bura', 'jugo', 'povjetarac'],
    note: 'The fierce dry north-easterly bura sweeps down from the Dinaric peaks across Livanjsko polje, polishing the sky to a brilliant crystalline blue.',
    hint: 'A wind-sculpted pine leans south with swirling frosty wind ribbons above the western ridge.',
  },
  vijavica: {
    word: 'vijavica', en: 'snowstorm drift', choices: ['vijavica', 'oluja', 'pljusak'],
    note: 'Even under bright winter sun, strong mountain gusts lift loose powder snow into sweeping snowdrifts across the open karst slopes.',
    hint: 'Sculpted swirling snowdrift crests rise on the windward slope north of the dairy.',
  },
  hladnoca: {
    word: 'hladnoća', en: 'coldness', choices: ['hladnoća', 'vrućina', 'sparina'],
    note: 'High mountain elevation gives Livno crisp, dry winters where frosted crystals cling to stone posts long past noon.',
    hint: 'A frosted brass outdoor thermometer post ringed with icy blue crystals stands on the east bank.',
  },

  // Zone 3: Livanjski Sir Artisan Dairy & Wool Craft (11)
  mljekara: {
    word: 'mljekara', en: 'dairy', choices: ['mljekara', 'pekara', 'mesnica'],
    note: 'Small family dairies around Livno collect fresh sheep and cow milk each morning from high karst pastures.',
    hint: 'A stone-and-timber creamery house with shiny milk cans sits on the western plateau.',
  },
  sirana: {
    word: 'sirana', en: 'cheese cellar', choices: ['sirana', 'pivara', 'uljara'],
    note: 'Livanjski sir has been aged on wooden spruce boards since 1885, developing its firm golden wheel and savoury mountain aroma.',
    hint: 'Inside the timber-roofed cheese curing house next to the dairy, golden wheels line the shelves.',
  },
  sirutka: {
    word: 'sirutka', en: 'whey', choices: ['sirutka', 'kajmak', 'puter'],
    note: 'After curds are pressed for Livanjski cheese, warm mineral-rich whey is poured into pitchers and drunk fresh as a mountain tonic.',
    hint: 'A glazed earthenware jug brimming with pale golden whey stands outside the cheese house.',
  },
  kaca: {
    word: 'kaca', en: 'wooden tub', choices: ['kaca', 'bačva', 'kanister'],
    note: 'Round iron-hooped oak tubs are traditional in Dinaric farmhouses for salting cheese wheels, brining milk curds, and storing winter provisions.',
    hint: 'A wide wooden oak vat bound with dark iron hoops sits in the dairy yard.',
  },
  cjedilo: {
    word: 'cjedilo', en: 'strainer', choices: ['cjedilo', 'rende', 'mlin'],
    note: 'Cheesemakers drain fresh curds through fine linen cloth stretched over a wooden strainer hoop before pressing each wheel into shape.',
    hint: 'A wooden hoop strainer lined with white cloth hangs from a tripod in the dairy yard.',
  },
  coban: {
    word: 'čoban', en: 'shepherd', choices: ['čoban', 'kovač', 'tesar'],
    note: 'Mountain shepherds know every limestone path, hidden spring, and weather sign across Mount Cincar and the Krug plateau.',
    hint: 'A shepherd holding a tall carved wooden crook stands beside the dairy yard.',
  },
  gunj: {
    word: 'gunj', en: 'wool cloak', choices: ['gunj', 'kaput', 'prsluk'],
    note: 'Woven from thick fulled mountain wool, a traditional Bosnian gunj sheds freezing wind and sleet during long days on high pastures.',
    hint: 'A heavy dark wool shepherd cloak with red trim hangs on a wooden stand beside the shepherd.',
  },
  vuna: {
    word: 'vuna', en: 'wool', choices: ['vuna', 'pamuk', 'svila'],
    note: 'Mountain sheep fleece is washed in cold karst spring water, dried in the sun, and carded into soft cream tufts for winter spinning.',
    hint: 'A wicker basket piled high with fluffy cream wool sits near the dairy porch.',
  },
  preslica: {
    word: 'preslica', en: 'distaff', choices: ['preslica', 'igla', 'makaze'],
    note: 'Bosnian woodcarvers decorated distaffs with delicate sun rosettes and geometric stars so spinning yarn through winter evenings felt festive.',
    hint: 'A tall carved wooden distaff wrapped in soft wool yarn stands beside the wool basket.',
  },
  razboj: {
    word: 'razboj', en: 'loom', choices: ['razboj', 'stolica', 'polica'],
    note: 'On heavy timber hand-looms, Livno weavers create warm wool kilims and winter rugs dyed in deep madder red, walnut brown, and indigo.',
    hint: 'A sturdy wooden hand-loom strung with red and cream threads stands outside the creamery.',
  },
  cebe: {
    word: 'ćebe', en: 'blanket', choices: ['ćebe', 'jorgan', 'čaršaf'],
    note: 'A thick hand-woven wool blanket keeps every mountain room warm when frosty winter stars glitter over Livanjsko polje.',
    hint: 'A brightly striped wool blanket is folded over a wooden bench near the loom.',
  },

  // Zone 4: Old Town Hearth & Bosnian Winter Feast (10)
  kamin: {
    word: 'kamin', en: 'hearth fireplace', choices: ['kamin', 'peć', 'šporet'],
    note: 'A roaring stone hearth is the heart of winter hospitality in Livno, welcoming travellers in from the crisp mountain air.',
    hint: 'A tall stone hearth glowing with bright embers warms the eastern courtyard.',
  },
  cjepanica: {
    word: 'cjepanica', en: 'firewood log', choices: ['cjepanica', 'grana', 'iver'],
    note: 'Seasoned beech and oak logs split in autumn burn slowly and steadily through the coldest Dinaric nights.',
    hint: 'Freshly split hardwood logs are neatly stacked right beside the stone hearth.',
  },
  drvarnica: {
    word: 'drvarnica', en: 'woodshed', choices: ['drvarnica', 'šupa', 'tavan'],
    note: 'Every mountain home builds a sturdy timber woodshed to keep dry winter firewood clear of deep January snow.',
    hint: 'A snow-roofed timber woodshed packed with neatly stacked logs stands behind the hearth.',
  },
  sac: {
    word: 'sač', en: 'baking bell', choices: ['sač', 'tava', 'lonac'],
    note: 'Under a heavy iron sač dome heaped with glowing wood embers, bread and winter roasts bake evenly with rich smoky crust.',
    hint: 'A dark domed cast-iron baking bell rests over glowing coals in front of the hearth.',
  },
  stolnjak: {
    word: 'stolnjak', en: 'tablecloth', choices: ['stolnjak', 'salveta', 'zavjesa'],
    note: 'Woven linen tablecloths edged with red embroidery turn a simple timber table into a festive Bosnian winter gathering place.',
    hint: 'A bright embroidered cloth drapes across the long wooden feast table near the hearth.',
  },
  pogaca: {
    word: 'pogača', en: 'hearth bread', choices: ['pogača', 'perec', 'kifla'],
    note: 'Warm round pogača baked under the sač is traditionally broken by hand and shared with neighbours and guests.',
    hint: 'A golden scored round bread loaf rests on the winter feast table.',
  },
  ustipak: {
    word: 'uštipak', en: 'fried dough fritter', choices: ['uštipak', 'krofna', 'palačinka'],
    note: 'Puffy golden uštipci served piping hot alongside aged Livanjski sir and kajmak are Livno\'s beloved winter breakfast.',
    hint: 'A mound of golden puffy fritters sits in a ceramic dish on the feast table.',
  },
  corba: {
    word: 'čorba', en: 'thick soup', choices: ['čorba', 'sos', 'kaša'],
    note: 'A steaming pot of Bosnian begova čorba or mountain vegetable stew warms cold hands after a morning in the snow.',
    hint: 'A deep glazed clay pot of steaming golden soup sits at the centre of the feast table.',
  },
  kutlaca: {
    word: 'kutlača', en: 'ladle', choices: ['kutlača', 'viljuška', 'kašičica'],
    note: 'Long-handled wooden and copper ladles serve rich stew straight from the clay pot into warm earthenware bowls.',
    hint: 'A curved wooden ladle rests right across the rim of the steaming soup pot.',
  },
  slanik: {
    word: 'slanik', en: 'salt cellar', choices: ['slanik', 'šećernica', 'biber'],
    note: 'Welcoming guests with warm bread and a pinch of salt from a carved wooden salt cellar is an age-old Bosnian sign of friendship.',
    hint: 'A small carved wooden salt cellar filled with white salt stands beside the bread on the table.',
  },

  // Zone 5: Winter Village, Snow Fun & Wind Ridge (10)
  stala: {
    word: 'štala', en: 'barn', choices: ['štala', 'ambar', 'mlinica'],
    note: 'Warm timber-and-stone barns shelter mountain livestock and aromatic summer hay through Livno\'s snowy months.',
    hint: 'A cosy timber-and-stone barn with a snow-laden gable roof stands on the southern plateau.',
  },
  stog: {
    word: 'stog', en: 'haystack', choices: ['stog', 'snop', 'bala'],
    note: 'Tall round haystacks built around a central wooden pole shed snow cleanly while keeping golden meadow grass dry until spring.',
    hint: 'A tall rounded golden haystack wearing a white snow cap stands near the barn.',
  },
  snjegovic: {
    word: 'snjegović', en: 'snowman', choices: ['snjegović', 'strašilo', 'lutka'],
    note: 'Whenever fresh wet snow falls in Livno, children roll giant snowmen across every courtyard with carrot noses and warm scarves.',
    hint: 'A cheerful three-tiered snowman with a bright scarf smiles in the eastern snowy clearing.',
  },
  iglu: {
    word: 'iglu', en: 'igloo', choices: ['iglu', 'šator', 'koliba'],
    note: 'Packed winter snow blocks insulate so well that a small snow dome feels surprisingly calm and sheltered from the mountain breeze.',
    hint: 'A rounded snow-block dome with a low arched entrance sits in the eastern snowfield.',
  },
  sanjke: {
    word: 'sanjke', en: 'sleigh', choices: ['sanjke', 'kočija', 'kolica'],
    note: 'Traditional curved-runner wooden sleighs glide effortlessly down the gentle snow slopes outside Old Town Livno.',
    hint: 'A classic red-and-oak curved wooden sleigh waits on the snowy slope near the snowman.',
  },
  krplje: {
    word: 'krplje', en: 'snowshoes', choices: ['krplje', 'čizme', 'papuče'],
    note: 'Woven ash-wood snowshoes spread a walker\'s weight across deep powder, making winter trails up Mount Cincar possible.',
    hint: 'A pair of woven wooden snowshoes leans beside the snowy trail marker on the eastern side.',
  },
  subara: {
    word: 'šubara', en: 'fur hat', choices: ['šubara', 'šešir', 'kačket'],
    note: 'A tall warm sheepskin šubara protects ears and brow against freezing mountain blasts on the Dinaric highlands.',
    hint: 'A plush dark brown sheepskin winter hat rests on a wooden stump near the snowshoes.',
  },
  vjetrenjaca: {
    word: 'vjetrenjača', en: 'wind turbine', choices: ['vjetrenjača', 'elektrana', 'antena'],
    note: 'Modern wind farms along the windy ridges around Livno and Mesihovina harness the steady Dinaric mountain breeze for clean electricity.',
    hint: 'A tall white wind turbine tower stands on the breezy north-western highland ridge.',
  },
  elisa: {
    word: 'elisa', en: 'rotor blade', choices: ['elisa', 'krilo', 'točak'],
    note: 'Sweeping three-bladed rotors catch high-altitude mountain currents smoothly, turning slowly against the crisp winter sky.',
    hint: 'Look high at the three sweeping white blades mounted on the wind turbine hub.',
  },
  brijeg: {
    word: 'brijeg', en: 'hillock', choices: ['brijeg', 'litica', 'kanjon'],
    note: 'Gentle snow-draped hillocks ring the valley around Livno, offering sunny panoramas over Livanjsko polje.',
    hint: 'A rounded snowy hillock crowned with a wooden lookout bench rises on the far east edge.',
  },

  // Zone 6: Alpine Conifers, Wildlife & Mountain Explorers (10)
  kleka: {
    word: 'kleka', en: 'juniper bush', choices: ['kleka', 'paprat', 'mahovina'],
    note: 'Resilient evergreen juniper bushes thrive on windy limestone slopes, holding aromatic blue-black berries right through winter.',
    hint: 'A low spreading evergreen bush dotted with dusty-blue berries grows on the eastern slope.',
  },
  aris: {
    word: 'ariš', en: 'larch tree', choices: ['ariš', 'jasen', 'lipa'],
    note: 'Mountain larches are unique conifers whose soft needles turn warm amber-gold in late autumn before dusting the winter snow.',
    hint: 'A tall slender mountain conifer with warm golden-brown needles rises on the eastern ridge.',
  },
  vepar: {
    word: 'vepar', en: 'wild boar', choices: ['vepar', 'jazavac', 'medvjed'],
    note: 'Sturdy wild boars root through forest snow around Mount Cincar in search of beech nuts, acorns, and tender roots.',
    hint: 'A dark-bristled wild boar with curved white tusks stands among the snowy eastern pines.',
  },
  srndac: {
    word: 'srndać', en: 'roebuck', choices: ['srndać', 'divokoza', 'los'],
    note: 'Graceful mountain roebucks shelter near juniper thickets on sunny winter mornings, listening intently for footsteps in the snow.',
    hint: 'A slender russet roebuck with neat forked antlers stands alert on the north-eastern clearing.',
  },
  tetrijeb: {
    word: 'tetrijeb', en: 'capercaillie', choices: ['tetrijeb', 'ćuran', 'paun'],
    note: 'The shy woodland capercaillie is Europe\'s largest grouse, living high in quiet Bosnian conifer forests where snow lies deep.',
    hint: 'A proud dark forest grouse with a fanned tail perches on a snowy log by the larch ridge.',
  },
  zeba: {
    word: 'zeba', en: 'chaffinch', choices: ['zeba', 'kos', 'crvendać'],
    note: 'Small russet-breasted chaffinches brighten winter gardens across Livno, hopping along snowy fences in search of seeds.',
    hint: 'A tiny russet-and-slate songbird perches on a snowy wooden fence post near the hearth.',
  },
  cavka: {
    word: 'čavka', en: 'jackdaw', choices: ['čavka', 'svraka', 'čvorak'],
    note: 'Clever silver-eyed jackdaws love nesting in the stone crevices of old fortress walls and limestone cliffs above Duman.',
    hint: 'A charcoal bird with a pale grey nape perches on the stone steps leading up to the fortress.',
  },
  jazbina: {
    word: 'jazbina', en: 'den', choices: ['jazbina', 'gnijezdo', 'košnica'],
    note: 'Beneath gnarled limestone roots and fallen boulders, warm hidden dens shelter badgers and foxes through freezing winter nights.',
    hint: 'A snow-rimmed rocky forest burrow opens beneath a snowy boulder on the far eastern edge.',
  },
  planinar: {
    word: 'planinar', en: 'mountaineer', choices: ['planinar', 'skijaš', 'biciklist'],
    note: 'Livno\'s mountain club leads winter hikes from Duman up to the Krug plateau and Mount Cincar\'s panoramic 2,006-metre peak.',
    hint: 'A bundled hiker wearing a tall backpack and holding trekking poles stands at the northern trailhead.',
  },
  lovac: {
    word: 'lovac', en: 'tracker', choices: ['lovac', 'čuvar', 'vodič'],
    note: 'Experienced mountain trackers follow fresh hoof and paw prints across the winter snow to watch over wildlife herds.',
    hint: 'A forest tracker in a green wool jacket gazes through binoculars on the north-eastern ridge.',
  },

  // Zone 7: Mount Cincar, Vulture & Kula Veis Fortress (5, Stage 2: utvrda)
  sup: {
    word: 'sup', en: 'vulture', choices: ['sup', 'orao', 'jastreb'],
    note: 'Soaring griffon vultures ride rising thermal currents over the dramatic Dinaric limestone cliffs of western Bosnia and Herzegovina.',
    hint: 'A massive broad-winged mountain vulture perches high on the pale western cliff pinnacle.',
  },
  sedlo: {
    word: 'sedlo', en: 'mountain saddle', choices: ['sedlo', 'vrh', 'klisura'],
    note: 'High snow-swept saddles between Dinaric peaks have guided shepherds and trade caravans between Bosnia and Dalmatia for millennia.',
    hint: 'Look north above the Duman cliff where a smooth white pass dips between two snow ridges.',
  },
  lednik: {
    word: 'lednik', en: 'glacier', choices: ['lednik', 'lavina', 'smrznica'],
    note: 'During the Ice Age, ancient glaciers carved the sweeping cirques and bright karst bowls still visible high on Mount Cincar.',
    hint: 'A gleaming blue-white snowfield and frozen cirque rests high on the north-western peak flank.',
  },
  vrhovi: {
    word: 'vrhovi', en: 'summits', choices: ['vrhovi', 'oblaci', 'zvijezde'],
    note: 'Mount Cincar\'s twin sunlit snow summits tower above Livno at over two thousand metres, glowing rose-gold at winter sunset.',
    hint: 'Look up toward the towering twin snow-clad mountain peaks dominating the northern horizon.',
  },
  utvrda: {
    word: 'utvrda', en: 'fortress', choices: ['utvrda', 'dvorac', 'palata'],
    note: 'Old Town Livno\'s stone fortress ramparts and historic Veis Tower have watched over the Duman spring and Livanjsko polje since medieval times.',
    hint: 'High on the north-eastern limestone crag, Livno\'s crenellated stone fortress and watchtower overlook the valley.',
  },

  // Finale word
  sloboda: {
    word: 'sloboda', en: 'freedom', choices: ['sloboda', 'snaga', 'nada'],
    note: 'Nowhere in Bosnia feels freer than watching Livno\'s wild horses gallop under crisp sunlit winter skies beneath Mount Cincar.',
    hint: 'A golden glow shines above the watchtower of Livno\'s fortress.',
  },
};

export const ORDER = [
  'krdo', 'pastuh', 'kobila', 'zdrijebe', 'griva', 'kopito', 'galop', 'visoravan', 'pasnjak', 'pojilo', 'suhozid',
  'vrelo', 'spilja', 'siga', 'poledica', 'inje', 'bura', 'vijavica', 'hladnoca',
  'mljekara', 'sirana', 'sirutka', 'kaca', 'cjedilo', 'coban', 'gunj', 'vuna', 'preslica', 'razboj', 'cebe',
  'kamin', 'cjepanica', 'drvarnica', 'sac', 'stolnjak', 'pogaca', 'ustipak', 'corba', 'kutlaca', 'slanik',
  'stala', 'stog', 'snjegovic', 'iglu', 'sanjke', 'krplje', 'subara', 'vjetrenjaca', 'elisa', 'brijeg',
  'kleka', 'aris', 'vepar', 'srndac', 'tetrijeb', 'zeba', 'cavka', 'jazbina', 'planinar', 'lovac',
  'sup', 'sedlo', 'lednik', 'vrhovi', 'utvrda',
  'sloboda',
];

export const CULTURE = {
  place: 'Livno',
  subtitle: 'Bosnia and Herzegovina · beneath Mount Cincar',
  facts: [
    ['Wild Horses of the Krug Plateau ', 'More than 800 wild horses live freely on the high Krug karst plateau between Livno and Mount Cincar, descended from hardy domestic horses released in the 1970s.'],
    ['Livanjski Sir (Livno Cheese) ', 'First crafted in 1885 using recipes inspired by Alpine cheesemaking, Livanjski sir ages on wooden shelves from milk rich in wild Dinaric mountain herbs.'],
    ['Duman Karst Spring ', 'The emerald Bistrica River is born in a single dramatic burst at Duman, pouring straight out of a towering vertical limestone cliff right above Old Town Livno.'],
    ['Old Town Fortifications & Veis Tower ', 'Medieval and Ottoman stone ramparts, watchtowers, and historic mosques crown the craggy hillside above Duman, watching over vast Livanjsko polje.'],
    ['Mount Cincar & the Crisp Bura Wind ', 'Rising to 2,006 metres, snow-capped Mount Cincar feeds Livno\'s springs while the dry northern bura sweeps the highland plateau clear under bright winter sun.'],
    ['Uštipci & Winter Hearth Hospitality ', 'On frosty mornings in Livno, families gather around warm stone hearths to break fresh pogača bread and dip piping-hot uštipci into aged cheese and kajmak.'],
  ],
};
