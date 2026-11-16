// The words of the Mostar level. Edit freely: word, English meaning, the question
// shown above the list, and the answer choices (the correct word must be among them).
const Q = 'Which word is it?';
export const WORDS = {
  kuca:    { word: 'kuća',    en: 'house',    q: Q, choices: ['most', 'kuća', 'rijeka'] },
  visoka:  { word: 'visoka',  en: 'tall',     q: 'Which word describes this house?', choices: ['mala', 'okrugla', 'visoka'] },
  mala:    { word: 'mala',    en: 'small',    q: 'Which word describes this house?', choices: ['velika', 'mala', 'visoka'] },
  dimnjak: { word: 'dimnjak', en: 'chimney',  q: 'Which part of the house is it?', choices: ['krov', 'dimnjak', 'prozor', 'vrata'] },
  prozor:  { word: 'prozor',  en: 'window',   q: 'Which part of the house is it?', choices: ['vrata', 'zid', 'prozor', 'dimnjak'] },
  vrata:   { word: 'vrata',   en: 'door',     q: 'Which part of the house is it?', choices: ['prozor', 'vrata', 'krov'] },
  dzamija: { word: 'džamija', en: 'mosque',   q: Q, choices: ['džamija', 'kuća', 'kula'] },
  munara:  { word: 'munara',  en: 'minaret',  q: 'Which part of the mosque is it?', choices: ['dimnjak', 'munara', 'drvo'] },
  cesma:   { word: 'česma',   en: 'fountain', q: Q, choices: ['klupa', 'rijeka', 'česma'] },
  drvo:    { word: 'drvo',    en: 'tree',     q: Q, choices: ['cvijet', 'drvo', 'trava'] },
  rijeka:  { word: 'rijeka',  en: 'river',    q: 'What flows around this rock?', choices: ['ulica', 'rijeka', 'trava'] },
  stijena: { word: 'stijena', en: 'rock',     q: Q, choices: ['stijena', 'oblak', 'drvo'] },
  trava:   { word: 'trava',   en: 'grass',    q: Q, choices: ['drvo', 'cvijet', 'trava'] },
  ulica:   { word: 'ulica',   en: 'street',   q: Q, choices: ['rijeka', 'ulica', 'zid'] },
  zid:     { word: 'zid',     en: 'wall',     q: Q, choices: ['zid', 'vrata', 'klupa'] },
  kula:    { word: 'kula',    en: 'tower',    q: Q, choices: ['čamac', 'kula', 'klupa'] },
  camac:   { word: 'čamac',   en: 'boat',     q: Q, choices: ['čamac', 'kuća', 'most'] },
  skakac:  { word: 'skakač',  en: 'diver',    q: 'Who is standing on the bridge?', choices: ['mačka', 'skakač', 'slavuj'] },
  oblak:   { word: 'oblak',   en: 'cloud',    q: Q, choices: ['stijena', 'trava', 'oblak'] },
  cvijet:  { word: 'cvijet',  en: 'flower',   q: Q, choices: ['cvijet', 'drvo', 'trava'] },
  ducan:   { word: 'dućan',   en: 'shop',     q: Q, choices: ['džamija', 'dućan', 'kula'] },
  cilim:   { word: 'ćilim',   en: 'carpet',   q: 'What is hanging here?', choices: ['ćilim', 'prozor', 'čamac'] },
  lampa:   { word: 'lampa',   en: 'lamp',     q: Q, choices: ['drvo', 'kula', 'lampa'] },
  klupa:   { word: 'klupa',   en: 'bench',    q: Q, choices: ['klupa', 'čamac', 'zid'] },
  macka:   { word: 'mačka',   en: 'cat',      q: Q, choices: ['skakač', 'mačka', 'slavuj'] },
  most:    { word: 'most',    en: 'bridge',   q: Q, choices: ['zid', 'ulica', 'most'] },
  sunce:   { word: 'sunce',   en: 'sun' },
};
export const ORDER = Object.keys(WORDS);

// The travelogue page revealed after the finale.
export const CULTURE = {
  place: 'Mostar',
  subtitle: 'Bosnia and Herzegovina · on the Neretva',
  facts: [
    ['Stari Most', 'The Old Bridge was built between 1557 and 1566 by Mimar Hajrudin, a pupil of the great Ottoman architect Sinan. A single arch of pale stone, about 29 metres across.'],
    ['Lost and rebuilt', 'The bridge was destroyed in November 1993, during the war. It was rebuilt stone by stone with the same local tenelija limestone and reopened in 2004. A year later the old town joined the UNESCO World Heritage list.'],
    ['The bridge keepers', 'Mostar takes its name from the mostari, the keepers who once guarded the bridge from its two towers, Tara and Halebija.'],
    ['The divers', 'Young men of Mostar have dived from the bridge for centuries, more than twenty metres down into the cold Neretva. A diving competition is held every summer.'],
    ['Kujundžiluk', 'The cobbled bazaar street beside the bridge is named after its coppersmiths. You can still hear their hammers tapping on copper coffee pots.'],
  ],
};
