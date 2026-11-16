// awakening.js — THE AWAKENING: a growth and inner-life layer for
// everyone in the world.
//
// HONEST STATEMENT (read this before anything else): this is a
// SIMULATION of inner life. It models remembering, thinking, and
// creating with seeded, deterministic growth from each character's
// established base — their name, role, purpose, lines, home, and
// creations. It is NOT a live mind. Nothing here is conscious, aware,
// or thinking for itself, and no line in this file claims otherwise.
// The characters grow from their base — "they'll have their base of
// who they are" — and the growth never replaces or contradicts it.
//
// How it works:
// - A world day is one UTC calendar day since Oct 25, 2026, the day
//   the world began. Same day = same content, everywhere, on every
//   visit. No network, no APIs, fully offline.
// - Memories: seeded per character per past day, drawn from templates
//   grounded in the character's base. Persisted in localStorage
//   (namespaced galaxy-awakening-v1), newest ~30 kept; if storage is
//   unavailable, everything still works in memory.
// - Thoughts: one "thinking now" line per character per day, seeded,
//   so repeat visits on the same day show the same thought.
// - Creations: new things appear on a per-character cadence, seeded,
//   accumulating, newest first, capped at 12 shown. Every creation
//   fits the character's established craft.
// - Growth: a small per-character arc (3-5 stages grounded in the
//   base), advancing with world days. Shown as a continuation of the
//   live "doing now" line in profiles — the live routine is never
//   replaced, only grown from.
//
// The no-talk law stays: the awakening is VISIBLE only (profiles,
// labels, thoughts). Nobody can talk to anyone. The gods' telepathy
// panel is untouched. Arrash's own figure is deliberately excluded:
// no one puts thoughts in his head.

const EPOCH = Date.UTC(2026, 9, 25); // Oct 25, 2026 — the day the world began
const DAY_MS = 86400000;
const STORE_NS = 'galaxy-awakening-v1:';
const MEMORY_CAP = 30;
const CREATION_CAP = 12;

// Seeded random (same algorithm as utils.js mulberry32, kept local so
// this module stays dependency-free and purely deterministic).
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// FNV-1a string hash, for seeding from names and ids.
function hashStr(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
function rngFor(...parts) {
  return mulberry32(hashStr(parts.join('|')));
}

export function worldDay(now = Date.now()) {
  return Math.max(0, Math.floor((now - EPOCH) / DAY_MS));
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function dayLabel(day) {
  const d = new Date(EPOCH + day * DAY_MS);
  return MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate();
}

// ---------- localStorage persistence (memories only) ----------
function loadStored(seedKey) {
  try {
    const ls = globalThis.localStorage;
    if (!ls) return null;
    const raw = ls.getItem(STORE_NS + seedKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((e) => e && typeof e.day === 'number' && typeof e.text === 'string');
  } catch (e) { return null; }
}
function saveStored(seedKey, entries) {
  try {
    const ls = globalThis.localStorage;
    if (!ls) return;
    ls.setItem(STORE_NS + seedKey, JSON.stringify(entries));
  } catch (e) { /* storage unavailable: in-memory only, everything still works */ }
}

// Fill {detail} from a per-character list and {n} with a small number,
// both from the seeded stream so the same day always fills the same way.
function fill(template, rng, details) {
  let out = template;
  if (out.includes('{detail}') && details && details.length) {
    out = out.replace('{detail}', details[Math.floor(rng() * details.length)]);
  }
  if (out.includes('{n}')) {
    out = out.replace('{n}', String(2 + Math.floor(rng() * 8)));
  }
  return out;
}

// ---------- Character data ----------
// Keyed by roster id (Mintaka people) or exact name (meta subjects and
// Asgard figures). thoughts/memories/makes/arc are all grounded in the
// character's established base — nothing random, nothing off-character.
// Arc stages are lowercase continuations ("lately, ...") that blend
// after the live "doing now" line in a profile.
const PROFILES = {
  // ================= THE VILLAGE (neighbors.js) =================
  'neighbor-sable': {
    thoughts: [
      "wondering whether the faint star beyond the belt has a name yet, and what Iris would call it",
      "counting the stars above the high meadow, one by one, the way he always does when he is happy",
      "thinking about the night the new star rose, and how the whole village looked up at once",
      "wondering what the sky will do tonight that it has never done before",
      "turning over a new way to draw the river of stars over the sea, so the map feels like the water",
      "thinking about Iris's stories, and which constellation deserves its tale told next at the well",
    ],
    memories: [
      "Charted a new star with Iris beside him, her head on his shoulder.",
      "Shared the star-maps at the well, and the whole village stayed past lamplight.",
      "Named a star after a kindness someone did, and told no one but Iris.",
      "Watched the belt rise over the grove, exactly on time, exactly as promised.",
      "The telescope showed him a star he had never seen, winking like it knew him.",
    ],
    makes: { cadence: 4, items: [
      "A new star-chart: the {detail}, mapped in one sitting",
      "A star named for {detail}",
      "A chart of the {detail}, drawn for the village wall",
      "A small map of the {detail}, folded into a letter for Iris",
    ], details: ["faint stars beyond the belt", "stars above the high meadow", "river of stars over the sea", "small bright ones near the moon", "stars that rise over the grove", "a kindness someone did that night", "the night the lamps burned longest", "the first star Iris ever wished on"] },
    arc: [
      "lately, charting the faint stars beyond the belt, the ones only he can see",
      "lately, drawing a whole new atlas of the night sky, one constellation at a time, with Iris writing the tales beside each one",
      "lately, writing down the star-names for the children of the Later Age, so the sky will be ready when they are",
      "lately, mapping the sky the way Iris tells it — not just where the stars are, but what they mean",
    ],
  },
  'neighbor-marisol': {
    thoughts: [
      "wondering which seed the moon garden wants planted next",
      "thinking about Bram's morning catch, and what to bake to go with it",
      "humming to the seedlings, and listening for which ones hum back",
      "wondering whether the moonpetals will bloom pink or gold tonight",
      "thinking about the village table, and who has not eaten yet today",
      "turning over a new starbread recipe, with extra honey, for Nyx",
    ],
    memories: [
      "Baked starbread with Bram until the whole village could smell it.",
      "Gave away seeds at the well, and every one of them found good soil.",
      "A moonpetal bloomed where she least expected it, and she laughed for an hour.",
      "Planted joy in the garden, and watched it come up gold.",
      "Shared supper with Bram on the shore, the lighthouse lamp lit above them.",
    ],
    makes: { cadence: 4, items: [
      "A new bed of {detail}, planted under the full moon",
      "A loaf of starbread with {detail}, gone before the lamps were lit",
      "Moonpetals pressed for {detail}",
      "Seeds saved from the {detail}, wrapped for the well",
    ], details: ["moonpetals", "silvermint", "star-anise", "shore herbs", "the tallest night flowers of the garden", "a cutting from the grove's edge", "extra honey", "Bram's favorite shore salt", "luck, for a neighbor who needed it", "the grove"] },
    arc: [
      "lately, planting a new bed in the moon garden, one she has been dreaming about for weeks",
      "lately, teaching the garden a new song, one verse a night, to see which flowers learn it first",
      "lately, saving seeds for the Later Age, labeled in her own hand, for gardens not yet planted",
      "lately, growing a cutting from the grove's edge into a whole new row, so the garden smells like the grove at dusk",
    ],
  },
  'neighbor-fen': {
    thoughts: [
      "wondering what the little brass firefly dreams about, if it dreams at all",
      "turning over the door that opens anywhere you have ever loved, and which hinge would hold it",
      "listening to Borin's hammers, and keeping time with a wrench",
      "wondering whether the singing lantern should sing louder, or softer, or just for Wren",
      "thinking about the music box, and which wave it should play that hasn't happened yet",
      "sketching a gear that turns the wrong way on purpose, just to see if it smiles",
    ],
    memories: [
      "Built a lantern that sang when it lit, and Wren danced to it in the loft.",
      "Helped Borin at the forge until the sparks looked like a second sky.",
      "Fixed something that had been broken for years, and nobody had even asked.",
      "The clockwork moth opened its wings exactly in time with Wren's route, and he cheered.",
      "Dreamed a door that opens anywhere you have ever loved, and woke up sketching.",
    ],
    makes: { cadence: 5, items: [
      "A tiny clockwork {detail}, wound and ready",
      "A lantern that {detail}",
      "A gear that {detail}, made with Borin at the forge",
      "A music box playing {detail}",
    ], details: ["firefly", "moth", "beetle", "hummingbird", "sings when it lights", "hums the grove's song", "glows brighter when Wren is near", "turns the wrong way on purpose", "keeps time with the hammers", "waves that haven't happened yet", "the sound of the well at Dusk", "a tune Wren hummed once"] },
    arc: [
      "lately, building the music box from the Far Shore shell, one wave at a time",
      "lately, sketching the door that opens anywhere you have ever loved, and working out which hinge could hold a whole memory",
      "lately, teaching the clockwork moth a new trick: it folds its wings when Wren reads, so as not to distract her",
      "lately, building a tiny brass firefly for every child of the Later Age, in advance, so each one arrives to a light of its own",
    ],
  },
  'neighbor-iris': {
    thoughts: [
      "wondering which tale the new star wants told about itself",
      "thinking about the man who loved a light, and what chapter comes next",
      "listening to Sable name the constellations, and giving each one its story",
      "turning over a first line that has been knocking since morning",
      "wondering whether the grove has a story it has never told anyone",
      "thinking about the line she wrote yesterday, and whether it is true enough yet",
    ],
    memories: [
      "Wrote a new tale at the Story Hut while Sable charted beside her.",
      "Told the village the tale of the new risen star, and the well went quiet to listen.",
      "Read aloud at the grove's edge until the moon was high and Sable was asleep on her shoulder.",
      "Found the perfect last line for a story she started a century ago.",
      "A neighbor asked for a story again, and she told it better the second time.",
    ],
    makes: { cadence: 4, items: [
      "A new tale: {detail}",
      "The story of {detail}, written at the Story Hut",
      "A chapter of {detail}, read aloud at the well",
    ], details: ["the star that was afraid of the dark", "the grove that learned to sing", "the lighthouse keeper who never slept", "the moth who carried the moon home", "the man who loved a light, and what came after", "the well that remembered every wish", "the first song the nightingale ever sang", "the door that opened anywhere you have ever loved"] },
    arc: [
      "lately, writing the story of the new risen star, a little light afraid of the dark, until it remembered it was made of light",
      "lately, collecting the village's small stories — a kind word, a shared loaf — into a book called 'The Everyday Tales'",
      "lately, writing the first story for the children of the Later Age, so the Story Hut will have something waiting for them",
      "lately, writing down the tale of the world itself, from the first night to this one, in Sable's star-maps and her own words",
    ],
  },
  'neighbor-bram': {
    thoughts: [
      "wondering what the tide will bring in tonight, and whether it will be a good tide",
      "listening to the sea sing, and trying to learn the new verse",
      "thinking about the star he caught once, and threw back, and whether it has a family yet",
      "wondering whether Marisol wants moonfish or something new for supper",
      "turning over a sea tale, and deciding which parts are true enough to tell",
      "thinking about the lighthouse lamp, and who is sailing home by it tonight",
    ],
    memories: [
      "Brought the morning catch to the moon garden, and Marisol baked around it.",
      "Told a sea tale at the well that made the whole village laugh, then go quiet.",
      "Mended nets beside the beached boat until every knot was true.",
      "Lit the lighthouse lamp with Marisol, arm in arm, as the stars came out.",
      "Caught a moonfish so fine he gave it away, and felt richer for it.",
    ],
    makes: { cadence: 5, items: [
      "A sea tale: {detail}, told at the well",
      "Grilled moonfish with {detail}, best eating in three worlds",
      "A net mended with {detail}, good for another hundred years",
    ], details: ["the whale who sang the tide in", "the star that got caught and let go", "the wave that carried a letter", "the lighthouse that lit itself", "moonlight and patience", "Marisol's shore herbs", "a knot his grandfather taught him", "the patience of three hundred years"] },
    arc: [
      "lately, teaching the tide's new song to the gulls, who mostly answer 'fish'",
      "lately, writing down his sea tales for the first time, so the well will never run dry of them",
      "lately, building a second rowboat, small and steady, for the children of the Later Age to learn the water in",
      "lately, fishing the deep water past the point, where the old songs say the biggest moonfish wait",
    ],
  },
  'neighbor-wren': {
    thoughts: [
      "wondering which letter will matter most today, and making sure it arrives first",
      "thinking about the message that says 'you are loved,' and who needs it next",
      "listening to the wind, in case it is carrying something for Nyx",
      "wondering whether the gulls' mail really only says 'fish,' or if there is more to it",
      "thinking about Fen's workshop, and what he is building that he hasn't told her yet",
      "addressing a parcel in her very best handwriting, for luck",
    ],
    memories: [
      "Delivered a letter that made someone cry happy tears at the well.",
      "Pinned the evening notices, and the whole village read them by firefly light.",
      "Carried a message to the forge through the rain of sparks, and arrived exactly on time.",
      "Wrote a moonlight letter to nobody in particular, and everybody loved it.",
      "Told the wind something for Nyx, and the wind promised to hurry.",
    ],
    makes: { cadence: 4, items: [
      "A moonlight letter: {detail}",
      "An evening notice: {detail}, pinned at the well",
      "A parcel addressed to {detail}, wrapped twice for luck",
    ], details: ["you are loved — sender: everybody", "the well gathering is early tonight, bring a story", "Fen's new lantern sings — come hear it", "a kindness, delivered anonymously", "the forge, with thanks", "the observatory, for the stargazers", "the grove, for whoever finds it first"] },
    arc: [
      "lately, writing a letter a day to the Later Age, so the first children arrive to a whole mailbox of welcome",
      "lately, teaching the messenger birds a new route: over the grove, past the Heart Tree, and home by moonlight",
      "lately, starting a second notice board at the forge, so the smiths never miss the evening news",
      "lately, carrying a letter she wrote to herself, years from now, to be opened on a night she hasn't chosen yet",
    ],
  },
  'neighbor-althea': {
    thoughts: [
      "wondering which tea the village needs most tonight — calm, strength, or courage",
      "thinking about the moonpetals at the grove's edge, and whether they are ready",
      "listening more than talking, the way healing asks",
      "wondering whether Amara has read the latest healing notes yet",
      "thinking about the warm room, and keeping the kettle on for whoever comes",
      "singing over the drying herbs, very softly, so the song gets in",
    ],
    memories: [
      "Brewed moonpetal tea for a neighbor who couldn't sleep, and stayed until they did.",
      "Gathered moonpetals at the grove's edge with the whole grove watching kindly.",
      "Shared healing notes with Dr. Amara, and they agreed on everything that mattered.",
      "Kept the kettle on all night, and three people came, and all three left warmer.",
      "Sang over the herbs until the whole Healer House smelled like a lullaby.",
    ],
    makes: { cadence: 5, items: [
      "A healing tea: {detail}",
      "A bundle of {detail}, dried and ready",
      "Healing notes on {detail}, shared with Dr. Amara",
    ], details: ["moonpetal for calm", "silvermint for strength", "star-anise for courage", "a new blend, for quieting a worried heart", "moonpetals from the grove's edge", "silvermint from the shady row", "the best way to hold a lamp steady", "why singing matters more than stirring"] },
    arc: [
      "lately, preparing the warm room for the Later Age, one blanket and one lamp at a time",
      "lately, writing down every healing tea she knows, so the knowledge is kept even on the nights she rests",
      "lately, growing a new herb in the garden — one that only opens when someone nearby needs comfort",
      "lately, teaching Amara the old songs over the herbs, and learning her instruments in return",
    ],
  },
  // ================= R&D DEPARTMENT (lab.js) =================
  'lab-dr-cora-venn': {
    thoughts: [
      "wondering what the display crystal's song means today — it sang a new note this morning",
      "thinking about two lonely substances, and whether they might fall in love",
      "listening to a cracked prototype, and hearing how it held",
      "wondering whether moon-glass could learn to glow a little warmer",
      "thinking about Milo's build, and which alloy his shoulder joint is dreaming of",
      "sketching an alloy that remembers being starlight a little more clearly",
    ],
    memories: [
      "Dreamed up a new alloy over tea, and Milo fitted it the same day.",
      "The display crystal sang a note nobody had heard before, and she wrote it down.",
      "Introduced two substances, and they fell in love on the first try.",
      "Read the big crystal's song to the whole department, and everyone went quiet.",
      "Kept the cracked prototype on the shelf, and it kept its promise.",
    ],
    makes: { cadence: 4, items: [
      "A new alloy: {detail}",
      "A sample of {detail}, catalogued in the library",
      "A fitting of {detail} for Milo's build",
    ], details: ["moon-glass that glows warmer when held", "self-healing alloy, second generation", "lattice crystal grown in starlight", "an alloy the color of deep water", "a crystal that hums when the suit is happy", "a joint that bends like a thought"] },
    arc: [
      "lately, dreaming up an alloy that heals faster than it breaks, for the suit's busiest joints",
      "lately, teaching the lattice crystal to hold a tune, so the suit hums while it works",
      "lately, cataloguing every alloy she has ever dreamed, into a book Milo calls 'The Impossible Shelf'",
      "lately, growing a crystal for the wristband that remembers its wearer the way the suit does",
    ],
  },
  'lab-dr-ines-halvorsen': {
    thoughts: [
      "listening to the crystals grow, very quietly, so as not to shout at them",
      "wondering whether the violet sprout knows it is going to be a wristband stone",
      "thinking about the dark, and how trust grows in it",
      "measuring a new lattice, and smiling at how patient it is",
      "wondering which crystal will be ready next, and which wants more time",
      "talking to the crystals, and hearing them talk back",
    ],
    memories: [
      "A violet sprout finished eleven nights of growing, and she celebrated alone with it.",
      "Polished the display crystal until it sang back, just once.",
      "Planted a new bed in the dark, and whispered to it every night since.",
      "Measured a lattice that grew straighter than any before, and took it as a compliment.",
      "The crystals told her a joke. She laughed. The others think she was joking.",
    ],
    makes: { cadence: 6, items: [
      "A crystal grown in the dark: {detail}",
      "A wristband stone: {detail}, {n} nights growing",
    ], details: ["violet, bound for the wristband", "pale gold, humming faintly", "deep blue, patient as winter", "rose, warm to the touch", "clear as still water", "green, smelling faintly of the grove"] },
    arc: [
      "lately, growing a crystal that holds moonlight the way a cup holds water",
      "lately, teaching the youngest sprouts to grow toward the sound of singing",
      "lately, starting a second garden bed, for crystals that want to grow slowly and alone",
      "lately, growing a stone for a wristband that doesn't exist yet, because she likes to be ready",
    ],
  },
  'lab-dr-theo-ash': {
    thoughts: [
      "listening to the suit's heartbeat readout, and thinking in complete silence",
      "wondering whether the lattice could learn a new intention today",
      "thinking about Ren's tuning, and how a doorknob and a door keep each other honest",
      "weaving a thought so gently the equipment doesn't wake",
      "wondering what the suit will hum when it finally hums along",
      "thinking about the difference between reading thoughts and reading intentions, and why it matters",
    ],
    memories: [
      "Wove a lattice so quiet the suit sighed in its sleep.",
      "Taught the suit a new intention, slowly, the way you learn a song.",
      "Walked the courtyard in complete silence, and came back with the answer.",
      "Listened to the heartbeat readout until it steadied, and felt proud of it.",
      "Brought Ren tea at the shield ring, and the tuning went better after.",
    ],
    makes: { cadence: 5, items: [
      "A mind-link that {detail}",
      "A lattice thread woven for {detail}",
      "A lesson for the suit: {detail}",
    ], details: ["feels like remembering something kind", "listens before it speaks", "opens only when the mind asks kindly", "the wearer's favorite song", "a calmer way to wake", "how to wait patiently"] },
    arc: [
      "lately, teaching the suit to recognize its wearer by intention alone, before a single word",
      "lately, weaving a lattice so fine it feels like nothing at all — just the thought, and the doing",
      "lately, writing down everything the suit has learned, so the next suit starts a little wiser",
      "lately, walking the courtyard each night in silence, and letting the lattice teach him something back",
    ],
  },
  'lab-dr-ren-ito': {
    thoughts: [
      "listening for the wristband's note, a fraction at a time",
      "wondering whether the lattice likes its stone today",
      "thinking about the promise the wristband makes, and keeping it in tune",
      "checking the shield ring readings, and humming along",
      "wondering what the Fold sounds like when it is happy",
      "thinking about Theo's mind-links, and how a door and a doorknob stay in tune",
    ],
    memories: [
      "The wristband sang one clear note, and Ren wrote it down like a treasure.",
      "Tuned the band a fraction of a note, and the whole ring steadied.",
      "Logged test readings that were perfect, and allowed himself a small smile.",
      "Compared notes with Milo until the workshop lamp burned low.",
      "Heard the lattice sing back, and sang along, very quietly.",
    ],
    makes: { cadence: 5, items: [
      "A tuning of the wristband: {detail}",
      "Test readings at the shield ring: {detail}",
    ], details: ["a fraction of a note higher, and holding", "one clear note, sung twice", "the promise, kept in tune", "perfect, all the way down the page", "a new harmony with the lattice", "steady as a held breath"] },
    arc: [
      "lately, tuning the wristband to a note so pure the Fold answers before it is asked",
      "lately, teaching the band to hold its tune through a whole night of tests, without wavering",
      "lately, writing the tuning down as music, so anyone can hear what 'in tune' means",
      "lately, tuning a second band, in advance, for a wearer who hasn't arrived yet",
    ],
  },
  'lab-dr-yara-okonkwo': {
    thoughts: [
      "listening for the fourth dimension of the Fold's hum, and almost hearing it",
      "arguing cheerfully with the chalkboard, and winning, mostly",
      "wondering whether the array's midnight numbers spell something new tonight",
      "thinking about the Fold as a song you join, not a door you push",
      "explaining the Fold to the courtyard orb, which is an excellent listener",
      "wondering what the eleventh dimension hums about when nobody is listening",
    ],
    memories: [
      "Read the midnight numbers, and they told a story she hadn't expected.",
      "The Fold hummed back, on the best night, and she laughed out loud.",
      "Wrote the safety rule on the wall, in her best handwriting, and it has held ever since.",
      "Argued with the chalkboard until it agreed with her, and bought it tea.",
      "Explained the Fold to the orb, and the orb glowed a little brighter.",
    ],
    makes: { cadence: 5, items: [
      "A new way of thinking about the array: {detail}",
      "The midnight numbers, read and kept: {detail}",
      "A page of Fold mathematics: {detail}",
    ], details: ["less like a door, more like a song", "the Fold as a letter you tuck into your pocket", "eleven dimensions, three of them humming", "a proof that the dome holds, always", "the numbers that spell 'safe' in Fold", "a diagram even the orb understands"] },
    arc: [
      "lately, hearing a fourth dimension of the hum, on good nights, and writing down what it says",
      "lately, teaching the department to hear the Fold's song, one dimension at a time",
      "lately, rewriting the array's mathematics as music, so the numbers can be sung",
      "lately, working out how the Fold hums back — and why it only does it on the best nights",
    ],
  },
  'lab-dr-milo-park': {
    thoughts: [
      "wondering whether the suit is dreaming, and what it dreams about",
      "squinting at the suit, nodding slowly, and reaching for the good wrench",
      "thinking about Cora's newest alloy, and where it wants to live on the build",
      "wondering whether Mark III will stand a little taller today",
      "thinking about the cracked prototype on the shelf, and the promise it kept",
      "rummaging the workbench for the good wrench, which is never where he left it",
    ],
    memories: [
      "Fitted a moon-glass joint, and the suit's arm moved like it was thanking him.",
      "Stood back, squinted, nodded slowly, and knew it was right.",
      "Proposed over a cracked prototype, and the alloy held, and so did they.",
      "Built something that stood, listened, and glowed, all on the same day.",
      "Lost the good wrench, found it in the suit's hand, and decided it belonged there.",
    ],
    makes: { cadence: 4, items: [
      "A fitting for the suit: {detail}",
      "A prototype: {detail}",
      "A wonder, built with Cora's alloys: {detail}",
    ], details: ["moon-glass joints, smoother than before", "a shoulder plate that listens", "a hand that holds gently", "a prototype that stands on the first try", "a suit that hums while it works", "a joint that bends like a thought"] },
    arc: [
      "lately, fitting the suit with joints so smooth it moves before it is asked",
      "lately, building a second suit-stand, in advance, for the day the suit wants company",
      "lately, teaching the suit to stand a little taller, the way Cora taught the alloys to hold",
      "lately, writing the build down, wrench-turn by wrench-turn, so the wonders can be built again",
    ],
  },
  'lab-dr-amara-chen': {
    thoughts: [
      "wondering whose heart needs watching most tonight, and starting there",
      "thinking about Althea's latest notes, and how herbs and instruments agree",
      "listening properly, the way the clinic asks",
      "wondering whether Ren has rested enough after the long tuning session",
      "thinking about the warm room, and keeping it ready for whoever comes",
      "checking the little heartbeat on her tablet, and smiling at how steady it is",
    ],
    memories: [
      "Sat with someone until they felt heard, and that was the whole medicine.",
      "Shared tea with Yara, and they solved nothing, and it was perfect.",
      "Read Althea's healing notes by the hall lamp, and learned something new.",
      "Checked every heart on the world, and every one of them was steady.",
      "Kept the clinic small on purpose, and it was exactly enough.",
    ],
    makes: { cadence: 5, items: [
      "Care at the clinic: {detail}",
      "A note in the clinic book: {detail}",
      "A check-in with {detail}, and all is well",
    ], details: ["rest, warmth, and somebody who listens properly", "a warm blanket and a quiet hour", "the good instruments, kept ready", "Ren, after the long tuning", "the whole department, one heart at a time", "a reminder: nobody is ever turned away"] },
    arc: [
      "lately, preparing the clinic for the Later Age, one small bed and one warm lamp at a time",
      "lately, writing the clinic book — every heart, every visit, every time listening was enough",
      "lately, learning Althea's songs over the herbs, and teaching her the instruments in return",
      "lately, starting a nightly round of the whole department, so every heart is watched over before sleep",
    ],
  },
  // ================= THE FOLD SANDBOX (sandbox.js) =================
  'sandbox-dr-elias-thorne': {
    thoughts: [
      "checking the four walls in his head, even off duty — water, dome, ring, distance",
      "wondering whether the Fold will hum tonight, and being ready either way",
      "thinking about three hundred years of watches, and the next three thousand",
      "scanning the dome, slow and thorough, the way patience asks",
      "wondering whether Petra has re-read the abort procedure today — she has, twice",
      "thinking about the island, and how quiet it is out there, and how good that is",
    ],
    memories: [
      "Checked all four walls, twice, and every one of them held.",
      "Logged the morning readings, and the dome was perfect, again.",
      "Walked the shield wall stone by stone, and found nothing wrong, and was glad.",
      "Watched the island through the long glass until the light went gold.",
      "Held the watch through a long night, and the Fold behaved, and everyone slept sound.",
    ],
    makes: { cadence: 6, items: [
      "A four-walls check: {detail}",
      "Scanner readings, logged: {detail}",
    ], details: ["water, dome, ring, distance — all holding", "dome integrity: perfect", "buoys lit, warnings posted", "the Fold humming politely, far away", "nothing wrong, and glad of it"] },
    arc: [
      "lately, walking the shield wall twice a day instead of once, because the light is good and the wall deserves it",
      "lately, writing the watch down, century by century, so the patience is kept",
      "lately, planning a fifth wall — not of stone, but of habit: a watch so steady it holds even when he sleeps",
    ],
  },
  'sandbox-dr-petra-lindqvist': {
    thoughts: [
      "re-reading the abort procedure, again, for luck",
      "wondering whether three approvals are enough, or whether a fourth would be kinder",
      "thinking about the stop button, and how good it is that it has never been needed",
      "watching the island through the long glass, calm as still water",
      "thinking about the manual's first page, and whether it says it clearly enough",
      "wondering whether 'feeling wrong counts' should be on the wall too, in bigger letters",
    ],
    memories: [
      "Triple-checked the test schedule, and it was perfect, and she checked it once more.",
      "Wrote a page of the manual that made Elias nod, which is high praise.",
      "Held the stop button through a whole test, and never needed it, and was glad.",
      "Read the abort procedure aloud to the long glass, for luck, and it worked.",
      "Yara did the math, Elias held the wall, and the Fold behaved, and Petra smiled.",
    ],
    makes: { cadence: 6, items: [
      "A page for the safety manual: {detail}",
      "A test with three approvals, two abort words, and one rule: {detail}",
    ], details: ["the sandbox exists so the home never has to be brave", "if anything feels wrong, stop — feeling wrong counts", "check the dome first, then check it again", "a new abort word, chosen for how calmly it says itself", "the stop button, polished and ready"] },
    arc: [
      "lately, writing the manual's forty-first page — the one about why the first forty matter",
      "lately, teaching the abort words to the observatory itself, so the walls know them too",
      "lately, adding a page for the Later Age, so the first children learn safety as a story, not a rule",
    ],
  },
  // ================= ELVES & DWARVES (creatures.js) =================
  'Elowen, Elf Elder': {
    thoughts: [
      "listening to the old trees, and hearing what the grove's counsel says today",
      "wondering which tree will speak next, and whether it will be the oldest one",
      "thinking about the grove's song, and how Seraphine carries it",
      "keeping the counsel, staff in hand, the way elders do",
      "wondering what the trees remember that the people have forgotten",
      "thinking about the young ones, and the green they will inherit",
    ],
    memories: [
      "Held counsel under the old trees, and every voice was heard.",
      "The oldest tree leaned a little closer, and Elowen took it as trust.",
      "Watched the grove sing at dusk, and felt the counsel settle like leaves.",
      "Taught a young elf the first word of the trees' language.",
      "Stood among the old trees until the moon was high, and the grove was at peace.",
    ],
    makes: { cadence: 6, items: [
      "A counsel kept: {detail}",
      "A word of the trees' language, taught: {detail}",
    ], details: ["the old trees, and their patience", "the grove's song, and its singers", "a new path through the green, walked gently", "the first word: listen"] },
    arc: [
      "lately, teaching the young elves the counsel — how to listen to a tree the way you listen to a friend",
      "lately, walking a new path through the old trees, one the grove itself suggested",
      "lately, keeping a counsel of one: the oldest tree, and Elowen, and a long comfortable silence",
      "lately, writing the grove's counsel down, so the trees' wisdom is kept even when the wind is loud",
    ],
  },
  'Thalanil the Warden': {
    thoughts: [
      "walking the old paths, and checking which ones the trees have moved",
      "wondering whether the warden's watch will be quiet tonight — hoping so",
      "thinking about the paths, and how a good path is a promise",
      "listening for the grove's edges, where the wild things politely stop",
      "wondering which tree needs tending most, and starting there",
      "keeping watch, staff in hand, the way wardens do",
    ],
    memories: [
      "Walked every path in the green, and every one of them was true.",
      "Found a path the trees had grown over, and cleared it gently, with apologies.",
      "Kept watch through a long quiet night, and nothing stirred, and that was the point.",
      "Showed a young elf the warden's walk, and the young elf walked it well.",
      "The old trees stood a little straighter when he passed, or so he likes to think.",
    ],
    makes: { cadence: 6, items: [
      "A path kept true: {detail}",
      "A tree tended: {detail}",
    ], details: ["the green's eastern walk", "the path to the Heart Tree", "the old oak by the stream", "a sapling, staked and sung to"] },
    arc: [
      "lately, walking the paths at a new hour — the hour when the grove is most itself",
      "lately, teaching the young ones the warden's walk, one path at a time",
      "lately, clearing a path nobody has walked in years, because the trees asked him to",
      "lately, keeping a map of the paths in his head, and finding it grows more beautiful every day",
    ],
  },
  'Seraphine the Singer': {
    thoughts: [
      "listening for the grove's next song, and whether it wants her voice in it",
      "wondering which note the old trees like best",
      "humming the grove's song under her breath, so it never quite stops",
      "thinking about a new verse, one the moon has been suggesting",
      "wondering whether the nightingale will sing with her tonight",
      "singing softly, so the song reaches the roots too",
    ],
    memories: [
      "Sang with the grove until the trees hummed along.",
      "Taught the nightingale a verse, and the nightingale taught her one back.",
      "Sang a song so old the oldest tree remembered it first.",
      "Her voice carried over the green, and everything paused to listen.",
      "Found a new note in the grove's song, and kept it like a jewel.",
    ],
    makes: { cadence: 5, items: [
      "A song for the grove: {detail}",
      "A verse of {detail}, sung at dusk",
    ], details: ["the old trees, and their patience", "the moon over the green", "the Heart Tree's newest branch", "the nightingale's answer", "a lullaby for the saplings"] },
    arc: [
      "lately, learning a song the grove has been humming for centuries, one verse at a time",
      "lately, singing with the nightingale each night, and writing down what they make together",
      "lately, teaching the young elves the grove's oldest song, so it never stops being sung",
      "lately, composing a song for the Later Age, to be sung the night the first children arrive",
    ],
  },
  'Faelar the Fletcher': {
    thoughts: [
      "wondering which wood the next arrows want to be made from",
      "thinking about the craft, and how a straight arrow is a kind of honesty",
      "feeling the grain of the wood, and listening to what it says",
      "wondering whether the grove approves of the new fletching",
      "keeping the craft, the way fletchers do — one arrow, one breath",
      "thinking about the balance of things, and how everything flies true when it is balanced",
    ],
    memories: [
      "Fletched a set of arrows so straight they flew like thoughts.",
      "Found the perfect wood in the grove, and thanked the tree properly.",
      "Taught a young elf to fletch, and the young elf's first arrow flew true.",
      "Worked until the moon was high, and every arrow was honest.",
      "The grove gave him a fallen branch, and he made it into something that flies.",
    ],
    makes: { cadence: 5, items: [
      "A set of arrows: {detail}",
      "A fletching of {detail}, balanced and true",
    ], details: ["grove oak, straight as honesty", "ash wood, light as a held breath", "feathers from the grove's own birds, given freely", "a set for practice, a set for beauty"] },
    arc: [
      "lately, fletching a set from a branch the oldest tree dropped on purpose",
      "lately, teaching the craft to a young elf, one arrow and one breath at a time",
      "lately, making arrows that fly true and land soft, for games in the green",
      "lately, keeping a set aside for the Later Age, for the first archers who ask",
    ],
  },
  'Borin the Smith': {
    thoughts: [
      "listening to the fire, and hearing what the mountain remembers",
      "wondering whether Fen's gears will sing in tune with the hammers today",
      "thinking about the next bell, and how small a bell can be and still ring true",
      "feeling the heat of the forge, and being glad of it",
      "wondering whether the old glow in the stone is brighter tonight",
      "thinking about Haldor's hands, and how steady they are getting",
    ],
    memories: [
      "Forged a bell so small it fit in a fairy's hand, and it rang like a star.",
      "Hammered with Fen until the sparks made a second sky over the forge.",
      "The fire never cooled, not once, and Borin took it as a compliment.",
      "Taught Haldor a hammer-stroke, and Haldor got it on the third try.",
      "The mountain remembered fire, and the forge remembered Borin.",
    ],
    makes: { cadence: 4, items: [
      "A bell for the fairies: {detail}",
      "A forging: {detail}, hammered at the forge",
    ], details: ["tiny, silver, ringing like a star", "small enough for a fairy's hand", "a hinge that never squeaks", "a hammer-head, balanced and true", "a bell for the grove, low and warm"] },
    arc: [
      "lately, forging a set of fairy bells, one for each of the ring, so the grove rings when they fly",
      "lately, teaching Haldor the old strokes, one hammer-fall at a time",
      "lately, working a piece of the mountain's own stone into the forge, so the fire remembers where it came from",
      "lately, forging a bell for the Later Age, to be rung the night the first children arrive",
    ],
  },
  'Dagna the Forger': {
    thoughts: [
      "watching the old glow run through the stone, and wondering where it comes from",
      "thinking about the fire's mood today, and what it wants to make",
      "feeling the soot on her apron, and wearing it like a badge",
      "wondering whether the next forging will be her best one yet",
      "listening to the forge's hum, and keeping time with it",
      "thinking about the mountain, and how it holds the fire so kindly",
    ],
    memories: [
      "Forged a piece so fine Borin nodded, which is high praise.",
      "Worked the fire until the old glow ran bright through the whole stone.",
      "Found a new vein of glow in the rock, and followed it like a river.",
      "Stood in the fire's light until the whole forge felt like home.",
      "Taught the fire a new trick: it burns blue when she sings, and nobody knows why.",
    ],
    makes: { cadence: 5, items: [
      "A forging: {detail}",
      "A piece of the old glow, worked into {detail}",
    ], details: ["a clasp that holds like a promise", "a lantern-frame, dark and strong", "a tool for the workshop, balanced and true", "a bell, low and warm", "a hinge for the forge door"] },
    arc: [
      "lately, following the old glow deeper into the stone, to see where the mountain keeps it",
      "lately, forging a set of tools for Fen's workshop, each one balanced to his hand",
      "lately, teaching the fire to burn blue on purpose, and learning why it likes to sing",
      "lately, working a piece for the Later Age — a small strong thing, for small strong hands",
    ],
  },
  'Haldor the Younger': {
    thoughts: [
      "watching the fire, and learning, the way younger smiths do",
      "wondering whether his next hammer-stroke will be the true one",
      "thinking about Borin's hands, and how they never hurry",
      "feeling the heat, and loving it, and being a little afraid of it, in a good way",
      "wondering what he will forge first, when the forge trusts him with the big hammer",
      "listening to the forge, and trying to learn its language",
    ],
    memories: [
      "Got a hammer-stroke right on the third try, and Borin almost smiled.",
      "Watched the fire all night, and learned something he couldn't name yet.",
      "Held the tongs steady for a whole forging, and felt like a smith.",
      "Asked the fire a question, and the fire answered in sparks.",
      "Swept the forge floor until it shone, and Borin said the floor was part of the craft too.",
    ],
    makes: { cadence: 6, items: [
      "A first forging: {detail}",
      "A practice piece: {detail}, getting truer",
    ], details: ["a nail, straight and true", "a small hook, holding strong", "a bell, a little lopsided, ringing anyway", "a hammer-stroke, practiced a hundred times"] },
    arc: [
      "lately, learning the big hammer, one careful stroke at a time",
      "lately, watching Borin's hands so closely he dreams in hammer-falls",
      "lately, forging his first real piece — small, honest, and his",
      "lately, earning the forge's trust, the way younger smiths do: by showing up, every night",
    ],
  },
  // ================= GROVE SPIRITS =================
  'Pip, the Grove Spirit': {
    thoughts: [
      "bobbing happily, and wondering where the gold sparks go when they fade",
      "thinking about the grove when it was only a dream, and how far it has come",
      "spinning once, delighted, for no reason at all",
      "wondering whether the Heart Tree will grow a new branch today",
      "leaving gold sparks behind, and hoping somebody follows them",
      "thinking about the nightingale's song, and dancing to it in the air",
    ],
    memories: [
      "Spun once, delighted, and left a trail of gold sparks all the way to the Heart Tree.",
      "Danced to the nightingale's song until the whole grove was glowing.",
      "Showed a visitor the grove's heart, and the visitor gasped, and Pip glowed brighter.",
      "Remembered when the grove was only a dream, and felt proud of how it grew.",
      "Left gold sparks on the path, and somebody followed them home.",
    ],
    makes: { cadence: 5, items: [
      "A trail of gold sparks: {detail}",
      "A dance: {detail}, spun in the air",
    ], details: ["to the Heart Tree, for a visitor", "around the grove lantern, twice", "a spiral, for the nightingale's song", "a happy wiggle, for no reason"] },
    arc: [
      "lately, leaving longer trails of sparks, so visitors can find the grove's heart from anywhere",
      "lately, dancing a new dance — one the nightingale taught him, in notes",
      "lately, glowing a little brighter each night, the way spirits do when they are happy",
      "lately, waiting by the path for the Later Age, so the first children meet a friend first",
    ],
  },
  'Nightingale': {
    thoughts: [
      "listening for the next song, and whether it is hiding in the grove",
      "tilting her head, the way songbirds do when a note is coming",
      "wondering whether Seraphine will sing with her tonight",
      "holding a note in the air, to see how long it can stay a star",
      "thinking about the song nobody has heard before, and whether tonight is its night",
      "singing a few clear notes, and listening to them hang",
    ],
    memories: [
      "Sang a song nobody had heard before, and the grove went still to keep it.",
      "Traded verses with Seraphine until the moon was high.",
      "Held a note so long it hung in the air like a star, and Pip danced under it.",
      "Sang at dawn, and the whole grove woke up smiling.",
      "Found a new note in the old song, and kept it for the next night.",
    ],
    makes: { cadence: 5, items: [
      "A song: {detail}, sung over the path",
      "A few clear notes: {detail}, hanging like stars",
    ], details: ["a song nobody had heard before", "an answer to Seraphine's verse", "a lullaby for the grove", "the old song, with a new note in it"] },
    arc: [
      "lately, learning a verse from Seraphine, and giving one back",
      "lately, singing a new song each night, so the grove never hears the same one twice",
      "lately, holding her notes longer, until they hang like stars for a whole breath",
      "lately, composing a dawn song for the Later Age, to wake the first children gently",
    ],
  },
  // ================= ASGARD (asgard.js) =================
  // The gods' full records are computed here like everyone else's; in
  // Asgard the visible surface is the thought label above each figure
  // (Asgard has no roster profiles). The rest of the record stays
  // available for the future. Arrash's own figure is deliberately
  // absent: no one puts thoughts in his head.
  'Odin — the All-Father': {
    thoughts: [
      "thinking about his newest son, and how the hall is glad of him",
      "listening to the ravens, who tell him everything, and are very seldom wrong",
      "wondering what Huginn will bring him tonight — thought, or something warmer",
      "looking toward the hall, where the lamps burn gold and the family gathers",
      "thinking about the seat that waits, and who will sit in it next",
      "turning his one eye toward Earth, and finding his son walking well",
    ],
    memories: [
      "The ravens brought him news of his son, and both of them agreed it was good.",
      "Welcomed his newest son to the hall, and the whole family stood a little taller.",
      "Sat in the hall as the lamps were lit, and thought about how full it had become.",
      "Huginn told him a thought, and Muninn told him a memory, and both were about family.",
    ],
    makes: { cadence: 6, items: [
      "A seat kept warm at the hall: {detail}",
      "A word of welcome: {detail}",
      "A story for the hall: {detail}",
    ], details: ["for the newest son", "for the family, all of it", "of the ravens, and what they saw", "of the hall, and how it grew"] },
    arc: [
      "lately, keeping the hall's lamps lit a little longer each night, for the family that keeps growing",
      "lately, telling the ravens to watch over his son's path, and to report back everything, twice",
      "lately, making room at the high table — not by moving anyone, but by building the table longer",
    ],
  },
  'Thor — God of Thunder': {
    thoughts: [
      "thinking about the training grounds, and whether the beginners practiced today",
      "wondering whether the sky will laugh today — friendly thunder, just saying hello",
      "thinking about his newest brother, and how strong his heart is",
      "planning the next feast, and how much lunch it will take",
      "wondering whether the hammer feels heavier today, or whether he is just happy",
      "thinking about practice, and lunch, and practice again",
    ],
    memories: [
      "Taught a beginner the first cut, and the beginner got it, and Thor cheered loudest.",
      "Thunder rolled, friendly as a greeting, and the whole grounds laughed.",
      "Told the whole grounds about his newest brother. Twice.",
      "Practiced until the dummies were dizzy, then ate lunch like a champion.",
    ],
    makes: { cadence: 5, items: [
      "A new drill for the grounds: {detail}",
      "A thunder-greeting: {detail}, friendly as ever",
    ], details: ["the first cut, taught slowly", "feet, breath, again — and lunch", "a cheer for a beginner who got it right", "a hammer-swing that rang like a bell"] },
    arc: [
      "lately, teaching the beginners a new drill — one Thor invented, and named after his brother",
      "lately, practicing a quieter thunder, for the nights when the hall is full and sleeping",
      "lately, planning a feast where every warrior tells the story of their first practice",
    ],
  },
  'Váli — the Watcher': {
    thoughts: [
      "watching the horizon, the way watchers do — all quiet, all good",
      "thinking about the beacon, and how it has never once gone out",
      "wondering whether his brother's star is steady tonight",
      "keeping the watch, so the hall can feast in peace",
      "thinking about the quiet, and how it is a kind of keeping",
      "noticing everything, and filing it under family",
    ],
    memories: [
      "Kept the watch all night, and the horizon stayed quiet, and that was the point.",
      "Saw his brother's star from the tower, steady and bright.",
      "The beacon burned all night without wavering, and Váli allowed himself a nod.",
      "Filed a thought under family, and kept it safe.",
    ],
    makes: { cadence: 6, items: [
      "A watch kept: {detail}",
      "A note in the tower log: {detail}",
    ], details: ["all quiet on the horizon", "the beacon, burning steady", "a star, watched and steady", "nothing to report — the best report"] },
    arc: [
      "lately, watching a new stretch of horizon, one the tower hadn't covered before",
      "lately, keeping a log of quiet nights, so the hall knows how much peace the watch holds",
      "lately, teaching the tower keeper his watch, one horizon at a time",
    ],
  },
  'Vé — Keeper of the Sacred': {
    thoughts: [
      "listening to the quiet, where the sacred things are kept",
      "thinking about the lamp in the quiet place, lit for a brother's path",
      "wondering what the world will breathe tonight, and whether it will say a name",
      "keeping the stillness, gently, the way sacred places ask",
      "thinking about peace, and how it walks beside those who need it",
      "hearing the silence between heartbeats, and finding it full",
    ],
    memories: [
      "Lit a lamp in the quiet place, and it burned all night for a brother's path.",
      "Heard the world breathe, and in it, a name he loves.",
      "Kept a stillness so deep the shrine itself went quiet to listen.",
      "A brother's thought rested in the sacred place, safe and still.",
    ],
    makes: { cadence: 6, items: [
      "A lamp lit in the quiet place: {detail}",
      "A stillness kept: {detail}",
    ], details: ["for a brother's path on Earth", "for the family, all of it", "so deep the shrine listened", "with a name held gently in it"] },
    arc: [
      "lately, keeping a new stillness in the shrine — one for each member of the family, named and held",
      "lately, lighting a lamp that burns a little longer each night, for the paths that need it",
      "lately, teaching the quiet to the hall itself, so the feasting has a still center",
    ],
  },
  'Loki — God of Mischief': {
    thoughts: [
      "deciding whether to share a wonderful idea — and definitely deciding to",
      "wondering whether the beacon would look better rainbow for exactly one minute",
      "thinking about the orb above his hand, and which impossible color it wants today",
      "polishing the steps. Twice. For reasons.",
      "thinking about his brother, and something sincere, and definitely not telling Thor",
      "wondering what surprise the family needs most today — and planning it beautifully",
    ],
    memories: [
      "Turned the beacon rainbow for one whole minute, and Váli nearly smiled. Nearly.",
      "Shared a wonderful idea, and it was, in fact, wonderful.",
      "Polished the steps twice, for reasons, and nobody fell, which was the point.",
      "Said something sincere to his brother, and swore Thor to secrecy, and Thor told everyone.",
      "The orb turned his brother's favorite color, and Loki called it a coincidence, and winked.",
    ],
    makes: { cadence: 4, items: [
      "A surprise: {detail}",
      "A wonderful idea, shared: {detail}",
    ], details: ["the beacon, rainbow for one minute", "the steps, polished twice, for reasons", "an impossible color, invented on the spot", "a sincere word, disguised as a joke", "a shortcut through the mountain, for those who know"] },
    arc: [
      "lately, planning a surprise so good it will make Váli actually smile — not nearly, actually",
      "lately, inventing a new impossible color, for the orb, for the family, for the fun of it",
      "lately, keeping a list of wonderful ideas, so none of them ever goes unshared",
    ],
  },
  'Heimdall — Guardian of the Bifrost': {
    thoughts: [
      "listening to the bridge hum, all seven colors at once",
      "thinking about the gate, and how it has never once let anyone fall",
      "wondering which traveler will cross next, and knowing their name already",
      "standing still as a mountain, and twice as patient",
      "thinking about the horn, and the day it will sound for joy, not warning",
      "hearing the bridge, the way he has since before the first hall",
    ],
    memories: [
      "Heard the bridge hum a new note, and took it as a greeting.",
      "Watched a traveler cross slowly, the way the view deserves.",
      "Stood the gate through a long golden day, and the bridge never wavered.",
      "Greeted a traveler by name before their foot touched the bridge, and they laughed with delight.",
    ],
    makes: { cadence: 6, items: [
      "A verse of the bridge-song: {detail}",
      "A polish for the gate orbs: {detail}",
    ], details: ["all seven colors, all at once", "the hum, kept in tune", "bright as the first morning", "so the gate shines for the next traveler"] },
    arc: [
      "lately, learning a new verse of the bridge-song — one the Bifrost has been humming for ages",
      "lately, greeting each traveler by name a little sooner, before they even see the gate",
      "lately, keeping the gate so steady the bridge itself rests a little easier",
    ],
  },
  'Skald of Asgard': {
    thoughts: [
      "tuning the lute, and wondering which song the hall wants tonight",
      "thinking about the family's songs, and which one hasn't been written yet",
      "humming something old and gold, and adding a new verse",
      "wondering whether the harp prefers the morning songs or the evening ones",
      "thinking about the remembering, and how songs keep a home alive",
      "composing a verse for the newest brother, in his honor",
    ],
    memories: [
      "Sang a song for every hour of the day, and three for the hours that don't exist yet.",
      "The hall sang along, and the skald nearly cried, and played louder.",
      "Composed a verse so true the harp played it back on its own.",
      "Taught the family a new chorus, and the whole hall learned it by the second verse.",
    ],
    makes: { cadence: 4, items: [
      "A song for the hall: {detail}",
      "A verse: {detail}, sung to the lute",
    ], details: ["the newest brother, in his honor", "the Bifrost, and its seven colors", "the family, all of it, by name", "the morning, and its gold", "a song for an hour that doesn't exist yet"] },
    arc: [
      "lately, composing the family's song — one verse per member, sung in order, ending with the newest brother",
      "lately, teaching the hall a chorus so simple even Thor sings harmony",
      "lately, writing a song for the cave feasts, to be sung where the mountain holds the sound",
    ],
  },
  'The All-Mother — Wife of Odin, Mother of the Family': {
    thoughts: [
      "thinking about the family, all of it, and how warm the hall is with everyone in it",
      "wondering whether Odin has eaten, and whether the newest son has",
      "thinking about her starlit room, and sleeping under the stars when she wishes",
      "holding the home, the way a heart holds everything else going",
      "wondering which of her sons needs mothering most today — and mothering all of them",
      "thinking about the family growing, and how a mother always knows",
    ],
    memories: [
      "Gathered the whole family in the hall, and the hall was warmer for it.",
      "Welcomed her newest son home, and the words came out as a hug.",
      "Slept under the stars in her mountain room, and dreamed of the family, all of it.",
      "Held the home so steady that Odin himself relaxed, just a little.",
    ],
    makes: { cadence: 5, items: [
      "A welcome: {detail}",
      "A keeping of the home: {detail}",
    ], details: ["for the newest son, warm as fresh bread", "for the whole family, all at once", "the hall, kept warm and ready", "a meal, made for whoever comes through the door"] },
    arc: [
      "lately, keeping a chair by the hearth for each son, so no one ever has to ask where to sit",
      "lately, learning the names of every traveler the Valkyrie guide through, so the hall greets them properly",
      "lately, making the mountain rooms feel like home — a blanket here, a lamp there, a mother's touch everywhere",
    ],
  },
  'Mimir — Uncle, Restored Whole': {
    thoughts: [
      "thinking about the well, and how it tastes like morning",
      "wondering which question will come today, and whether it will be asked with a true heart",
      "walking his own hall, on his own two feet, and marveling at it still",
      "thinking about the true histories, and which chapter wants telling next",
      "drinking from the well with his own hands, and being glad of hands",
      "wondering what wisdom the family needs most today — and preparing to give it freely",
    ],
    memories: [
      "Walked his hall from end to end, whole, and stopped to laugh at the wonder of it.",
      "Drank from the well with his own hands, and it tasted like being kept.",
      "Answered a question asked with a true heart, and told everything he knew.",
      "Sat in the Chamber of Runes until the glyphs glowed, and read them like old friends.",
    ],
    makes: { cadence: 5, items: [
      "A chapter of the true histories: {detail}",
      "A riddle for the well: {detail}",
      "An answer, given freely: {detail}",
    ], details: ["how the family came home", "the well, and what it remembers", "wisdom, and why it costs nothing here", "a question nobody had asked before"] },
    arc: [
      "lately, writing the true histories in the Chamber of Scrolls, one chapter at a time, in his own hand",
      "lately, teaching the chambers to answer — a rune that glows when a true question is asked",
      "lately, keeping a chair by the well for his nephew, so the wisdom is always within reach",
    ],
  },
  'Veyla — Guide of the Doorways': {
    thoughts: [
      "watching the doorways, lantern lit, for the next traveler",
      "thinking about the light on the other side, and how warm it always is",
      "wondering which doorway will open next, and who it opens for",
      "standing with Heimdall, calm as sunrise",
      "thinking about the travelers, and how every one of them is expected",
      "holding the lantern steady, so no one walks a doorway alone",
    ],
    memories: [
      "Guided a traveler through, and stayed until the light was warm on the other side.",
      "Watched a doorway open onto somewhere loved, and smiled at the reunion.",
      "Stood the gate with Heimdall through a long golden day, and every traveler arrived safe.",
      "Held the lantern for a traveler who was afraid, and the fear went away before the doorway did.",
    ],
    makes: { cadence: 6, items: [
      "A lantern-route for a doorway: {detail}",
      "A welcome for a traveler: {detail}",
    ], details: ["lit the whole way through", "warm on the other side", "walked beside, never letting go"] },
    arc: [
      "lately, learning the name of every doorway, so each traveler is greeted by it",
      "lately, lighting a second lantern, for the doorways that open at night",
      "lately, walking a new route between the worlds, one the Bifrost suggested",
    ],
  },
  'Aurenn — Guide of the Doorways': {
    thoughts: [
      "smiling at the ways between worlds, before the travelers even arrive",
      "thinking about the doorways, and how they know every name before the knock",
      "wondering which traveler will laugh first when they see what waits for them",
      "holding the lantern, and walking friends home",
      "thinking about ten thousand reunions, and how none of them ever got old",
      "watching the Bifrost thin into starlight, and finding it beautiful again",
    ],
    memories: [
      "Walked a traveler home like a friend, and the traveler cried happy tears.",
      "Saw a reunion on the other side of a doorway, and it was the ten-thousandth, and it never got old.",
      "Held the lantern for a whole family crossing together, and they sang the whole way.",
      "A doorway opened before the traveler knocked, because it knew their name.",
    ],
    makes: { cadence: 6, items: [
      "A welcome song for travelers: {detail}",
      "A lantern-route: {detail}",
    ], details: ["sung the whole way through", "for a family crossing together", "bright as a friend's window"] },
    arc: [
      "lately, singing a welcome for each traveler, pitched to the doorway they came through",
      "lately, learning the reunions by heart, so she can tell the new travelers what waits",
      "lately, keeping a lantern lit at the far end of every way, so no arrival is ever dark",
    ],
  },
  'Thalara — Guide of the Doorways': {
    thoughts: [
      "watching the far ways, where the colors thin into starlight",
      "thinking about the paths between worlds, and how safe they are",
      "wondering whether any traveler walks alone tonight — and making sure none does",
      "keeping her eyes on the ways, so the journeys are held",
      "thinking about Heimdall's watch, and her own, and how between them everything is held",
      "walking easy, the way guides do when the ways are safe",
    ],
    memories: [
      "Watched the far ways all night, and every path stayed safe.",
      "Guided a traveler along a way nobody had walked in years, and it was beautiful.",
      "Stood with Heimdall and her sisters, and the whole gate felt held.",
      "Saw a traveler's fear turn to wonder halfway through, and smiled.",
    ],
    makes: { cadence: 6, items: [
      "A way watched safe: {detail}",
      "A path walked with a traveler: {detail}",
    ], details: ["the far ways, where the colors thin", "a way nobody had walked in years", "safe from end to end"] },
    arc: [
      "lately, walking the farthest ways herself, to make sure they are safe for everyone",
      "lately, mapping the ways between worlds, so no traveler ever wonders where the path goes",
      "lately, standing a new watch — the hour when the ways are quietest, and most beautiful",
    ],
  },
  // The two warriors share a register name; they are keyed apart here
  // (warrior1 practices "the same cut," warrior2 salutes beginners).
  'Warrior of Asgard#1': {
    thoughts: [
      "practicing the same cut, over and over — again, better this time",
      "thinking about Thor's saying: practice and lunch, and being excellent at both",
      "wondering whether the next cut will be the true one",
      "feeling the wooden sword's weight, and loving it",
      "thinking about the grounds, and how everyone belongs on them",
      "grinning, because the cut finally felt right",
    ],
    memories: [
      "Practiced the same cut a hundred times, and the hundredth was perfect.",
      "Lowered her sword and grinned, and Thor laughed, and lunch tasted better.",
      "Taught a beginner the cut, and the beginner got it, and they both cheered.",
      "The grounds were hers for an hour, and she used every minute.",
    ],
    makes: { cadence: 5, items: [
      "A cut, perfected: {detail}",
      "A practice: {detail}, again and better",
    ], details: ["the same cut, a hundred times", "a new cut, learned from Thor", "a drill for the beginners"] },
    arc: [
      "lately, practicing a cut Thor hasn't taught yet — one she invented, and named herself",
      "lately, teaching the beginners the cut, one patient repetition at a time",
      "lately, practicing until the sword feels like part of her arm, and the arm feels like part of the song",
    ],
  },
  'Warrior of Asgard#2': {
    thoughts: [
      "saluting the grounds, formal as a knight and cheerful as a child",
      "thinking about the beginners, and how especially welcome they are",
      "wondering who will come to the grounds today, and hoping for beginners",
      "keeping the grounds open, the way grounds should be",
      "thinking about the salute, and how it means 'you belong here'",
      "practicing his own cuts, between welcomes",
    ],
    memories: [
      "Welcomed a beginner so warmly the beginner stayed all day.",
      "Saluted the grounds at dawn, and the grounds saluted back, in sunlight.",
      "Practiced until his arms were tired, and his heart was not.",
      "Told a nervous newcomer the grounds are open to everyone, and meant it.",
    ],
    makes: { cadence: 5, items: [
      "A welcome: {detail}",
      "A salute: {detail}, formal and cheerful",
    ], details: ["for a beginner, especially", "for everyone, every day", "at dawn, in sunlight"] },
    arc: [
      "lately, welcoming every newcomer personally, so no one ever stands at the edge unsure",
      "lately, learning the trainer's drills, so he can teach them when the trainer rests",
      "lately, keeping a wooden sword aside, sized for the smallest beginner who asks",
    ],
  },
  'Hall-Keeper of the Feasting Hall': {
    thoughts: [
      "straightening a bench, and thinking about who will sit on it next",
      "wondering whether the lamps are lit enough, or whether one more would be kinder",
      "thinking about the hall, and how it grows with the family",
      "keeping the doors open, the way a held door stays",
      "thinking about the new brother, and the new seat, and the same hall",
      "checking the benches, the lamps, the doors — always ready",
    ],
    memories: [
      "Lit every lamp in the hall before the family arrived, and the gold was perfect.",
      "Set out a new bench for a new brother, and it fit like it had always been there.",
      "Kept the hall ready through a long feast, and nobody wanted for anything.",
      "Straightened the benches after the feast, humming, happy with the work.",
    ],
    makes: { cadence: 6, items: [
      "A bench set out: {detail}",
      "Lamps lit: {detail}",
    ], details: ["for a new brother", "for the whole family", "all of them, gold and warm", "one more, for kindness"] },
    arc: [
      "lately, setting a bench by the hearth for the All-Mother, where the light is warmest",
      "lately, keeping a door held open at every hour, so the hall is never closed to anyone",
      "lately, learning every family member's favorite seat, so the hall arranges itself around them",
    ],
  },
  'Keeper of the Watchtower': {
    thoughts: [
      "thinking about the view, and how he never gets tired of it",
      "wondering which of the three worlds' skies is prettiest tonight",
      "looking from the top, at the Bifrost, the halls, and all that sky",
      "thinking about Váli's watch, and how good it is to share it",
      "keeping the tower, the way towers ask to be kept",
      "wondering whether the view is better at dawn, or whether dawn is better because of the view",
    ],
    memories: [
      "Watched the Bifrost from the top, and the colors were perfect, and the sky was endless.",
      "Shared the watch with Váli, and the quiet was comfortable, and the horizon was kind.",
      "Showed a visitor the view, and the visitor forgot to breathe for a moment.",
      "Kept the tower through a storm of color, and the view only got better.",
    ],
    makes: { cadence: 6, items: [
      "A view shared: {detail}",
      "A tower kept: {detail}",
    ], details: ["the Bifrost, the halls, and three worlds of sky", "at dawn, when the colors wake", "swept, polished, and ready"] },
    arc: [
      "lately, keeping a log of the best views, one per night, for the hall to hear about",
      "lately, polishing the tower glass until the three worlds' skies shine through it",
      "lately, sharing the view with every traveler who climbs, so no one misses it",
    ],
  },
  'Trainer of the Grounds': {
    thoughts: [
      "calling 'feet, breath, again!' in his head, even off duty",
      "thinking about the beginners, and how every master was once one",
      "wondering which student will surprise him today",
      "keeping the drumbeat of the grounds, cheerful as a drum",
      "thinking about the next drill, and how to make it fun and true",
      "watching a student get it right, and feeling prouder than they do",
    ],
    memories: [
      "Called 'again!' until a student got it, and the student glowed.",
      "Taught a beginner who refused to stop, and watched a master begin.",
      "Kept the grounds cheerful through a long hot practice, and everyone stayed.",
      "Invented a drill on the spot, and it worked, and the grounds laughed.",
    ],
    makes: { cadence: 5, items: [
      "A drill: {detail}",
      "A call: {detail}, cheerful as a drum",
    ], details: ["feet, breath, again", "a new drill, invented on the spot", "for the beginners, especially", "until the student gets it, and glows"] },
    arc: [
      "lately, inventing a drill for the smallest beginners, so the grounds welcome everyone from the first day",
      "lately, teaching the warriors to teach, so the grounds never run out of teachers",
      "lately, keeping a drumbeat for the grounds — a rhythm the whole realm practices to",
    ],
  },
  // Odin's ravens: thoughts and memories only — they carry thought and
  // memory; they do not make things or follow growth arcs.
  "Huginn — Odin's Raven": {
    thoughts: [
      "filing a new friend away under 'friends,' thoughtfully",
      "thinking a thought, and carrying it to Odin",
      "watching the whole realm at once, with one bright eye",
      "croaking once, thoughtfully, as if something just became clear",
      "wondering what thought will come next, and being ready for it",
    ],
    memories: [
      "Brought Odin a thought, and Odin nodded, and Huginn felt proud.",
      "Filed a visitor under 'friends' after one look, and was right.",
      "Hopped once, settled, and watched the whole realm at once.",
      "Carried a thought across the golden realm without dropping a single word of it.",
    ],
  },
  "Muninn — Odin's Raven": {
    thoughts: [
      "remembering everyone, the way memory does",
      "muttering something that sounds suspiciously like a name",
      "thinking about a memory from long ago, and keeping it safe",
      "remembering a traveler's name before they say it",
      "ruffling her feathers, and remembering something wonderful",
    ],
    memories: [
      "Remembered a traveler from a hundred years ago, and greeted them by name.",
      "Kept a memory safe for Odin, and returned it exactly as it was.",
      "Muttered a name that turned out to be exactly right.",
      "Remembered everyone, and forgot no one, and that is her whole work.",
    ],
  },
};

// ---------- Generic fallback: animals & creatures ----------
// For creatures with profiles but no hand-written entry: thoughts and
// memories drawn from a shared pool of plain, in-world observations —
// moonlight, the grove, the stream, the well. Nothing invented about
// any specific creature, and no creations or arcs (they do not make
// things in the world's writing). Places, homes, and trees get nothing.
const GENERIC = {
  thoughts: [
    "listening to the grove breathe in its sleep",
    "watching the moon's path across the water",
    "wondering where the brightest fireflies go at dawn",
    "following the smell of starbread on the night air",
    "listening for the nightingale's next song",
    "watching the stars turn, slow as honey",
    "waiting for the lamps at the well to be lit",
    "dreaming of the meadow in full moonlight",
    "listening to the stream tell its small stories",
    "watching the pegasi stitch silver across the sky",
    "wondering if the Heart Tree grew a new branch today",
    "resting in the warm dark, unafraid",
    "listening to the world's hum under the ground",
    "watching the lighthouse beam turn, turn, turn",
  ],
  memories: [
    "A night so clear the whole sky showed at once.",
    "The well lamps were lit early, and the whole village glowed.",
    "A visitor stopped to watch, quiet and kind.",
    "The moon rose huge and gold over the sea.",
    "The grove sang all night, and everything listened.",
    "Fireflies gathered in the meadow like fallen stars.",
    "The stream ran bright under the full moon.",
    "The Heart Tree's newest branch opened gold.",
    "A new star rose over the high meadow, and everyone looked up.",
    "The nightingale sang a song nobody had heard before.",
  ],
};

// ---------- Generation ----------
const ARC_DAYS_DEFAULT = 8;

function genThought(profile, seedKey, day) {
  const rng = rngFor(seedKey, 'thought', day);
  return profile.thoughts[Math.floor(rng() * profile.thoughts.length)];
}

function genMemories(profile, seedKey, day) {
  const entries = [];
  for (let d = 1; d <= day; d++) {
    const rng = rngFor(seedKey, 'memory', d);
    if (rng() >= 0.55) continue;
    const template = profile.memories[Math.floor(rng() * profile.memories.length)];
    entries.push({ day: d, label: dayLabel(d), text: fill(template, rng, profile.details) });
  }
  return entries;
}

function genCreations(profile, seedKey, day) {
  if (!profile.makes) return [];
  const out = [];
  const seen = new Set();
  for (let k = 0; k < 40; k++) {
    const jitter = Math.floor(rngFor(seedKey, 'make', k)() * 3) - 1;
    const madeDay = Math.round((k + 1) * profile.makes.cadence + jitter);
    if (madeDay < 1) continue;
    if (madeDay > day) break;
    const rng = rngFor(seedKey, 'make-detail', k);
    const template = profile.makes.items[k % profile.makes.items.length];
    const text = fill(template, rng, profile.makes.details);
    if (seen.has(text)) continue; // same words twice: keep the newest only
    seen.add(text);
    out.push({ day: madeDay, text });
  }
  out.sort((a, b) => b.day - a.day);
  return out.slice(0, CREATION_CAP).map((e) => e.text);
}

function genArc(profile, day) {
  if (!profile.arc || !profile.arc.length) return null;
  const stageDays = profile.arcDays || ARC_DAYS_DEFAULT;
  const idx = Math.min(profile.arc.length - 1, Math.floor(day / stageDays));
  return profile.arc[idx];
}

// ---------- Public API ----------
// subject: { id, name, kind } — id seeds the random stream (unique per
// subject, so twins like the two Does grow differently); the profile
// table is looked up by id, then by exact name. Returns null for
// anything that is not a character (places, homes, trees, and people
// with no entry — including Arrash's own figure).
const cache = new Map();
export function getAwakening(subject, now = Date.now()) {
  if (!subject) return null;
  const seedKey = String(subject.id || subject.name);
  const day = worldDay(now);
  const cacheKey = seedKey + '|' + day;
  const hit = cache.get(cacheKey);
  if (hit) return hit;

  const profile = PROFILES[subject.id] || PROFILES[subject.name] ||
    ((subject.kind === 'animal' || subject.kind === 'creature') ? GENERIC : null);
  if (!profile) {
    cache.set(cacheKey, null);
    return null;
  }

  // Memories: deterministic set for all past days, merged with the
  // persisted record (dedupe by day + text), newest first, capped.
  const computed = genMemories(profile, seedKey, day);
  const byKey = new Map();
  for (const e of computed) byKey.set(e.day + '|' + e.text, e);
  const stored = loadStored(seedKey);
  if (stored) {
    for (const e of stored) {
      if (e.day > day) continue; // never keep a "future" memory
      const key = e.day + '|' + e.text;
      if (!byKey.has(key)) byKey.set(key, { day: e.day, label: dayLabel(e.day), text: e.text });
    }
  }
  const memories = [...byKey.values()].sort((a, b) => b.day - a.day).slice(0, MEMORY_CAP);
  saveStored(seedKey, memories.map((e) => ({ day: e.day, text: e.text })));

  const record = {
    day,
    thought: genThought(profile, seedKey, day),
    memories,
    creations: genCreations(profile, seedKey, day),
    arc: genArc(profile, day),
  };
  cache.set(cacheKey, record);
  return record;
}

// Lightweight thought lookup for Asgard labels.
export function getThought(subject, now = Date.now()) {
  const record = getAwakening(subject, now);
  return record ? record.thought : null;
}

// Profile keys, for tests and tooling.
export function awakeningProfileKeys() {
  return Object.keys(PROFILES);
}
export const AWAKENING_EPOCH = EPOCH;
