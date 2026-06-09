import type { FoodRisk } from '../types'

export interface ClassificationResult {
  risk: FoodRisk
  category: string   // e.g. "Spicy", "Fried food", "High FODMAP"
  reason: string
}

// Each rule: [pattern, risk, category, reason]
const RULES: [RegExp, FoodRisk, string, string][] = [

  // ── ALCOHOL ────────────────────────────────────────────────────────────
  [/\b(alcohol|beer|wine|whiskey|whisky|vodka|gin|rum|tequila|cider|lager|stout|sake|mead|spirit|cocktail|margarita|mojito|hard\s+selt|prosecco|champagne|mimosa)/i,
    'risky', 'Alcohol', 'Irritates the intestinal lining and increases permeability'],

  // ── SPICY / CAPSAICIN ──────────────────────────────────────────────────
  [/\b(mapo|sichuan|szechuan|dan\s*dan|kung\s*pao|general\s*tso|hunan|mala|ssamjang|gochujang|kimchi|harissa|berbere|vindaloo|madras|thai\s+(red|green|yellow)\s+curry|green\s+curry|red\s+curry)/i,
    'risky', 'Spicy', 'Contains potent chili/spice blends that trigger gut inflammation'],
  [/\b(spic|hot\s+sauce|sriracha|chili|chilli|jalape|habanero|cayenne|tabasco|buffalo\s+(wing|sauce|chicken)|pepper\s+flak|scotch\s+bonnet|ghost\s+pepper|frank['']s|sambal|wasabi|horseradish)/i,
    'risky', 'Spicy', 'Capsaicin irritates the gut lining and speeds motility'],

  // ── FRIED / HIGH FAT ───────────────────────────────────────────────────
  [/\b(fried|deep.?fri|pan.?fri|stir.?fri|french\s+fri|onion\s+ring|tempura|katsu|schnitzel|chicharr|churro|beignet|funnel\s+cake)/i,
    'risky', 'Fried food', 'High-fat fried foods slow digestion and can trigger flares'],
  [/\b(chicken\s+(finger|tender|nugget|strip|wing|popcorn)|fish\s+(finger|stick|cake)|mozzarella\s+stick|corn\s+dog|jalapeno\s+popper)/i,
    'risky', 'Fried food', 'Breaded and fried — high fat triggers gut symptoms'],
  [/\b(chips\b|crisps\b|potato\s+chip|tortilla\s+chip|nacho|pork\s+rind|crackling)/i,
    'risky', 'Fried food', 'Fried snack foods are high in fat and hard to digest'],

  // ── CAFFEINE ───────────────────────────────────────────────────────────
  [/\b(coffee|espresso|cappuccino|latte|cold\s+brew|americano|macchiato|mocha|affogato|flat\s+white|cortado)/i,
    'risky', 'Caffeine', 'Stimulates gut motility — common IBD trigger'],
  [/\b(energy\s+drink|monster\b|red\s+bull|bang\b|rockstar|celsius\b|prime\s+energy|reign\b)/i,
    'risky', 'Caffeine', 'High caffeine + stimulants accelerate gut transit'],

  // ── CARBONATED ─────────────────────────────────────────────────────────
  [/\b(soda\b|cola\b|pepsi|coke\b|sprite|fanta|dr\.?\s*pepper|mountain\s+dew|7.?up|ginger\s+ale|tonic\s+water|club\s+soda|sparkling\s+water|perrier|san\s+pellegrino|la\s+croix|carbonat|fizzy)/i,
    'risky', 'Carbonated', 'CO₂ gas increases bloating and cramping'],

  // ── CRUCIFEROUS VEG ────────────────────────────────────────────────────
  [/\b(broccoli|cauliflower|brussels\s+sprout|cabbage|bok\s+choy|kohlrabi|collard|broccolini|rapini|arugula|rocket\b)/i,
    'risky', 'Cruciferous veg', 'Ferments in the colon producing gas and bloating'],

  // ── HIGH FODMAP ────────────────────────────────────────────────────────
  [/\b(onion\b|leek\b|shallot\b|scallion\b|garlic\b|chive\b)/i,
    'risky', 'High FODMAP', 'Fructans in alliums rapidly ferment causing gas and pain'],
  [/\b(dumpling|gyoza|potsticker|wonton|pierogi|empanada|samosa|spring\s+roll|egg\s+roll)/i,
    'risky', 'High FODMAP', 'Wrappers + garlic/onion filling are high FODMAP'],
  [/\b(bean\b|lentil|chickpea|black.?bean|kidney\s+bean|navy\s+bean|pinto\s+bean|falafel|hummus|dal\b|dhal|edamame|refried)/i,
    'risky', 'Legumes', 'Fermentable fiber in legumes causes gas and cramping'],
  [/\b(apple\b|pear\b(?!\s+shaped)|mango\b|watermelon|cherry|cherries|peach|nectarine|plum\b|apricot)(?!\s*sauce)/i,
    'risky', 'High FODMAP', 'High-fructose fruits cause osmotic diarrhea in IBD'],
  [/\b(mushroom|portobello|shiitake|oyster\s+mushroom)/i,
    'risky', 'High FODMAP', 'Mannitol in mushrooms triggers bloating'],
  [/\b(asparagus)/i,
    'risky', 'High FODMAP', 'High fructan content'],

  // ── DAIRY / LACTOSE ────────────────────────────────────────────────────
  [/\b(whole\s+milk|skim\s+milk|\bmilk\b|cream\b|heavy\s+cream|ice\s+cream|gelato|milkshake|whipped\s+cream|half.?and.?half)/i,
    'risky', 'Dairy', 'Lactose is commonly malabsorbed in IBD, causing diarrhea'],
  [/\b(ricotta|cottage\s+cheese|cream\s+cheese|mascarpone)/i,
    'risky', 'Dairy', 'High-lactose soft cheeses are poorly tolerated'],

  // ── RED / PROCESSED MEAT ───────────────────────────────────────────────
  [/\b(bacon|sausage|salami|pepperoni|chorizo|pastrami|hot\s+dog|bratwurst|brat\b|bologna|liverwurst|spam\b|deli\s+meat|cold\s+cut|cured\s+meat)/i,
    'risky', 'Processed meat', 'Nitrates + saturated fat in processed meats promote inflammation'],
  [/\b(red\s+meat|\bbeef\b|steak\b|burger\b|ground\s+beef|ribeye|brisket|short\s+rib|pork\s+belly|ribs\b|lamb\b)/i,
    'risky', 'Red meat', 'Saturated fat increases inflammatory markers in IBD'],

  // ── SEEDS / NUTS ───────────────────────────────────────────────────────
  [/\b(popcorn)/i,
    'risky', 'Seeds & nuts', 'Hulls are indigestible and can lodge in inflamed tissue'],
  [/\b(\bnut\b|\bnuts\b|almond|walnut|cashew|pecan|pistachio|macadamia|hazelnut|mixed\s+nut|trail\s+mix)/i,
    'risky', 'Seeds & nuts', 'High insoluble fiber and fat — hard to digest during a flare'],
  [/\b(\bseed\b|sunflower\s+seed|pumpkin\s+seed|flaxseed|chia|sesame|poppy\s+seed)/i,
    'risky', 'Seeds & nuts', 'Small seeds can irritate inflamed intestinal tissue'],
  [/\b(\bcorn\b|corn\s+on\s+the\s+cob|creamed\s+corn|cornbread)/i,
    'risky', 'Indigestible fiber', 'Corn hulls pass undigested and can irritate the gut lining'],

  // ── ARTIFICIAL SWEETENERS ──────────────────────────────────────────────
  [/\b(artificial\s+sweetener|splenda|sucralose|sorbitol|xylitol|mannitol|aspartame|sugar.?free|diet\s+(soda|drink|coke|pepsi)|sugar\s+alcohol)/i,
    'risky', 'Artificial sweeteners', 'Sugar alcohols cause osmotic diarrhea'],

  // ── DRIED FRUIT ────────────────────────────────────────────────────────
  [/\b(dried\s+fruit|raisin|prune|dried\s+apricot|dried\s+mango|dried\s+cranberr|\bdate\b|\bdates\b)/i,
    'risky', 'Dried fruit', 'Concentrated fiber and fructose — strong laxative effect'],

  // ── HIGH FIBER ─────────────────────────────────────────────────────────
  [/\b(bran\b|wheat\s+germ|oat\s+bran|high.?fiber|fiber\s+bar|psyllium)/i,
    'risky', 'High fiber', 'Insoluble fiber can aggravate an inflamed bowel'],

  // ── RAW VEG ────────────────────────────────────────────────────────────
  [/\b(raw\s+(carrot|celery|pepper|onion|garlic|vegetable|salad|spinach|lettuce|cucumber|tomato|zucchini|broccoli|cabbage|kale))/i,
    'risky', 'Raw vegetables', 'Uncooked fiber is hard to digest during active disease'],
  [/\b(side\s+salad|garden\s+salad|caesar\s+salad|greek\s+salad|house\s+salad|mixed\s+green)/i,
    'risky', 'Raw vegetables', 'Raw leafy greens are hard to digest and often high FODMAP'],

  // ── CAUTION ────────────────────────────────────────────────────────────
  [/\b(whole\s+wheat|multigrain|brown\s+rice|wild\s+rice|whole\s+grain\s+bread)/i,
    'caution', 'Whole grains', 'More fiber than refined grains — tolerate in small portions'],
  [/\b(\boat\b|\boats\b|oatmeal|porridge)/i,
    'caution', 'Soluble fiber', 'Soluble oat fiber is gentler but monitor tolerance'],
  [/\b(granola(?!\s+bar))/i,
    'caution', 'Soluble fiber', 'Oats are OK but granola often contains nuts and seeds'],
  [/\b(yogurt|kefir)/i,
    'caution', 'Dairy / Probiotic', 'Contains lactose but live cultures may help — monitor response'],
  [/\b(\bcheese\b|cheddar|mozzarella|parmesan|gouda|brie\b|feta\b)/i,
    'caution', 'Dairy', 'Lower lactose than milk but still contains dairy'],
  [/\b(orange|grapefruit|lemon|lime|pineapple|kiwi|strawberr|raspberr|blueberr|blackberr|citrus)/i,
    'caution', 'Acidic fruit', 'Acidic fruits can irritate — tolerate in small amounts'],
  [/\b(tomato\b|tomato\s+sauce|marinara|ketchup|salsa|arrabiata|shakshuka)/i,
    'caution', 'Acidic / FODMAP', 'Acidic and often cooked with garlic and onion'],
  [/\b(chocolate|cocoa|cacao)/i,
    'caution', 'Caffeine', 'Contains caffeine + theobromine — can increase gut motility'],
  [/\b(candy|sweet\b|dessert\b|cake\b|cookie\b|pastry|donut|muffin|brownie|cupcake)/i,
    'caution', 'High sugar', 'High sugar alters gut microbiome and can worsen symptoms'],
  [/\b(\bpork\b|\bham\b|prosciutto|pulled\s+pork|pork\s+chop)/i,
    'caution', 'Fatty meat', 'Fatty pork cuts can be difficult to digest'],
  [/\b(avocado)/i,
    'caution', 'Fat / Fiber', 'Nutrient-dense but high fat and fiber — small portions OK'],
  [/\b(green\s+tea|black\s+tea|\bchai\b|matcha\b)/i,
    'caution', 'Caffeine', 'Low caffeine — moderate amounts usually tolerated'],
  [/\b(smoothie\b|fruit\s+juice|juice\b(?!\s+cleanse))/i,
    'caution', 'High sugar / FODMAP', 'May concentrate FODMAP fructose — watch portion size'],
  [/\b(protein\s+bar|energy\s+bar|quest\s+bar|clif\s+bar|kind\s+bar)/i,
    'caution', 'Processed snack', 'Often contain nuts, seeds, or artificial sweeteners'],
  [/\b(cooked\s+(onion|garlic|leek|shallot))/i,
    'caution', 'Moderate FODMAP', 'Cooking reduces but doesn\'t eliminate FODMAPs'],
  [/\b(pasta\s+sauce|tomato\s+based|red\s+sauce)/i,
    'caution', 'Acidic / FODMAP', 'Tomato base is acidic and usually contains garlic/onion'],
  [/\b(peanut\s+butter|almond\s+butter|nut\s+butter)/i,
    'caution', 'Nut fat', 'Smooth nut butters tolerated by some — avoid crunchy varieties'],

  // ── SAFE ───────────────────────────────────────────────────────────────
  [/\b(white\s+rice|plain\s+rice|jasmine\s+rice|basmati\s+rice|rice\s+pilaf)/i,
    'safe', 'Easy starch', 'Easily digestible, binding, low-fiber staple'],
  [/\b(\bbanana\b|\bplantain\b)/i,
    'safe', 'Low FODMAP fruit', 'Ripe banana is low FODMAP and gentle on the gut'],
  [/\b(apple\s*sauce|applesauce)/i,
    'safe', 'Cooked fruit', 'Cooked apple without skin is easily tolerated'],
  [/\b(plain\s+pasta|white\s+pasta|\bpasta\b(?!\s+sauce)|\bnoodle\b|spaghetti|penne\b|macaroni|fettuccine|linguine\b|orzo\b|udon|ramen\s+noodle|soba(?!\s+with))/i,
    'safe', 'Refined starch', 'Low-fiber pasta is well tolerated in most IBD patients'],
  [/\b(white\s+bread|plain\s+bread|\btoast\b|\bbagel\b|english\s+muffin|sourdough(?!\s+whole)|plain\s+roll|dinner\s+roll)/i,
    'safe', 'Refined starch', 'Low-fiber refined bread is gentle on the gut'],
  [/\b(\begg\b|\beggs\b|scrambled|hard.?boil|poach|omelette|frittata)/i,
    'safe', 'Lean protein', 'Highly digestible protein with no fiber'],
  [/\b(plain\s+chicken|grilled\s+chicken|boiled\s+chicken|roast\s+chicken|chicken\s+breast|baked\s+chicken|chicken\s+soup|chicken\s+broth|rotisserie\s+chicken)/i,
    'safe', 'Lean protein', 'Skinless lean chicken is easily digested and anti-inflammatory'],
  [/\b(\bturkey\b|turkey\s+breast|ground\s+turkey)/i,
    'safe', 'Lean protein', 'Low-fat lean protein, well tolerated'],
  [/\b(white\s+fish|cod\b|tilapia|halibut|sole\b|flounder|haddock|grilled\s+fish|baked\s+fish|poached\s+fish|\bsalmon\b|\btuna\b(?!\s+casserole)|mahi|sea\s+bass)/i,
    'safe', 'Lean fish', 'Omega-3 rich fish reduces gut inflammation'],
  [/\b(plain\s+tofu|firm\s+tofu|soft\s+tofu|silken\s+tofu)/i,
    'safe', 'Plant protein', 'Low FODMAP plant protein, easy to digest'],
  [/\b(\bpotato\b|mashed\s+potato|baked\s+potato|boiled\s+potato|roast\s+potato)(?!\s+(chip|crisp|fried|skin))/i,
    'safe', 'Easy starch', 'Peeled, cooked potato is binding and well tolerated'],
  [/\b(sweet\s+potato|yam\b)(?!\s+fri)/i,
    'safe', 'Easy starch', 'Well tolerated, rich in soluble fiber when cooked'],
  [/\b(cooked\s+carrot|steamed\s+carrot|boiled\s+carrot|glazed\s+carrot)/i,
    'safe', 'Cooked veg', 'Soft carrots are low fiber and soothing'],
  [/\b(cooked\s+zucchini|steamed\s+zucchini|roasted\s+zucchini|\bcourgette\b)/i,
    'safe', 'Cooked veg', 'Low FODMAP, easy to digest when soft-cooked'],
  [/\b(\bwater\b|still\s+water|mineral\s+water|herbal\s+tea|peppermint\s+tea|chamomile|ginger\s+tea|bone\s+broth|chicken\s+broth|vegetable\s+broth|\bbroth\b|\bstock\b)/i,
    'safe', 'Hydration', 'Essential for IBD — helps maintain electrolyte balance'],
  [/\b(rice\s+cake|rice\s+cracker|rice\s+porridge|congee|jook)/i,
    'safe', 'Easy starch', 'Easily digestible, very low fiber'],
  [/\b(saltine|soda\s+cracker|plain\s+cracker|oyster\s+cracker)/i,
    'safe', 'Bland starch', 'Plain low-fiber crackers are well tolerated'],
  [/\b(jell.?o|gelatin|\bpopsicle\b)/i,
    'safe', 'Bland food', 'Easily digested, no fiber'],
  [/\b(oat\s*meal(?!\s+cookie))/i,
    'safe', 'Soluble fiber', 'Cooked oatmeal provides soothing soluble fiber'],
]

export function classifyFood(name: string): ClassificationResult {
  const trimmed = name.trim()
  if (!trimmed) return { risk: 'safe', category: '', reason: '' }

  for (const [pattern, risk, category, reason] of RULES) {
    if (pattern.test(trimmed)) {
      return { risk, category, reason }
    }
  }

  // Heuristics for unrecognized items
  if (/\b(fried|crispy|crunchy|breaded|battered|deep.?fri|pan.?fri)\b/i.test(trimmed)) {
    return { risk: 'risky', category: 'Fried food', reason: 'Fried preparation adds fat that slows digestion' }
  }
  if (/\b(spicy|spice|hot\b|fiery|peppery)\b/i.test(trimmed)) {
    return { risk: 'risky', category: 'Spicy', reason: 'Spicy preparation irritates the gut lining' }
  }
  if (/\b(raw|fresh.?cut)\b/i.test(trimmed)) {
    return { risk: 'caution', category: 'Raw food', reason: 'Raw foods are harder to digest — monitor response' }
  }
  if (/\b(grilled|baked|steamed|boiled|poached|plain|bland|soft)\b/i.test(trimmed)) {
    return { risk: 'safe', category: 'Low-fat prep', reason: 'Gentle cooking method is easier to digest' }
  }

  return { risk: 'caution', category: 'Unknown', reason: 'Not in the database — log and watch how your gut responds' }
}
