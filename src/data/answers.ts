// Curated list of common five-letter words used as puzzle answers.
// Every answer is also accepted as a valid guess.
const ANSWERS_RAW = `
about above abuse actor acute admit adopt adult after again agent agree ahead alarm album alert alien align alike alive allow alone along alter amber amend among ample angel anger angle angry ankle apart apple apply apron arena argue arise armor aroma arrow aside asset audio audit avoid awake award aware awful
bacon badge badly bagel baker basic basin batch beach beard beast begin being belly below bench berry birth black blade blame bland blank blast blaze bleak blend bless blind blink bliss block bloom blown board boast bonus boost booth bound brain brake brand brass brave bread break breed brick bride brief bring brisk broad broke brook broom brown brush buddy build built bunch burst buyer
cabin cable camel candy canoe cargo carry carve catch cause cedar chain chair chalk champ chant charm chart chase cheap check cheek cheer chess chest chief child chill china choir chord chose chunk cider cigar civic civil claim clamp clash class clean clear clerk click cliff climb cling clock close cloth cloud clown coach coast cobra cocoa coral couch cough could count court cover crack craft crane crash crate crawl crazy cream creek crest crime crisp cross crowd crown crude crumb crush crust cubic curry curve cycle
daily dairy daisy dance dated dealt death debut decay decor delay delta dense depth derby devil diary digit diner dirty disco ditch diver dizzy dodge doing donor donut doubt dough dozen draft drain drama drank drape drawn dream dress dried drift drill drink drive drone drown dryer dusty dwarf
eager eagle early earth easel eaten ebony eight elbow elder elect elite email ember empty enemy enjoy enter entry equal equip erase error essay event every exact exile exist extra
fable facet faint fairy faith false fancy feast fence ferry fetch fever fiber field fiery fifth fifty fight final flake flame flank flare flash flask fleet flesh flick fling flint float flock flood floor flour fluid flush flute focal focus foggy force forge forth forty forum found frame fresh fried front frost froze fruit fully funny fuzzy
gamer gauge ghost giant given glade gland glare glass gleam glide globe gloom glory glove going grace grade grain grand grant grape graph grasp grass grave gravy great greed green greet grief grill grind groan groom gross group grove growl grown guard guess guest guide guild guilt guise
habit happy harsh haste hatch haunt haven heart heavy hedge hello hence herbs hinge hobby honey honor horse hotel hound house hover human humid humor hurry husky
icing ideal image imply inbox index inner input irony issue ivory
jelly jewel joint joker jolly judge juice juicy jumbo
kayak kebab knack knead kneel knife knock known koala
label labor ladle large laser latch later laugh layer learn lease least leave ledge legal lemon level lever light lilac limit linen liner lodge logic loose lover lower loyal lucky lunar lunch lyric
magic major maker mango manor maple march match mayor medal media melon mercy merge merit merry metal meter midst might minor minus mirth model moist money month moral motor motto mound mount mouse mouth movie muddy mural music
naive nasty naval nerve never newly niche night noble noise north notch noted novel nudge nurse nylon
oasis ocean offer often olive onion opera orbit order organ other otter ought ounce outer owner oxide ozone
paint panel panic paper party pasta paste patch pause peace peach pearl pedal penny perch peril phase phone photo piano piece pilot pinch pitch pixel pizza place plain plane plank plant plate plaza plead pluck plumb plump plush point polar porch pouch pound power press price pride prime print prior prism prize probe prone proof proud prove prune pulse punch pupil puppy purse
quack quail quake qualm quart queen query quest queue quick quiet quilt quirk quite quota quote
radar radio rainy raise rally ranch range rapid raven reach react ready realm rebel refer reign relax relay renew reply rhyme rider ridge rifle right rigid rinse ripen risky rival river roast robin robot rocky rouge rough round route royal rugby ruler rumor rural rusty
sadly saint salad salon salsa sauce scale scare scarf scene scent scone scoop scope score scout scrap screw scrub sense serve seven shade shake shall shame shape share shark sharp shave shear sheep sheet shelf shell shift shine shiny shirt shock shore short shout shrub shrug sight sigma silly since siren skate skill skirt skull slate sleek sleep slice slide slope sloth small smart smell smile smoke snack snail snake sneak solar solid solve sonic sorry sound south space spare spark speak spear speed spell spend spice spicy spike spine spoke spoon sport spray squad stack staff stage stain stair stake stale stamp stand stark start state steak steam steel steep steer stern stick stiff still sting stock stone stood stool storm story stove straw stray strip stuck study stuff style sugar suite sunny super surge swamp swarm swear sweat sweep sweet swell swift swing sword syrup
table taken taste teach tempo tense tenth thank theme there thick thief thing think third thorn those three threw throw thumb tiger tight timer tired title toast today token topic torch total touch tough towel tower toxic trace track trade trail train trait tread treat trend trial tribe trick tried troop truck truly trunk trust truth tulip tumor tuner twice twist
ultra uncle under unify union unite unity until upper upset urban usage usual utter
valid value valve vapor vault venue verse video vigor villa vinyl viola viral virus visit vital vivid vocal voice voter
wagon waist waste watch water weary weave wedge weigh weird whale wheat wheel where which while whirl whisk white whole widen width wield windy witty woman world worry worth would wound woven wrath wrist write wrong
yacht yearn yeast yield young youth yummy
zebra zesty
`;

export const ANSWERS: readonly string[] = ANSWERS_RAW.trim().split(/\s+/);
