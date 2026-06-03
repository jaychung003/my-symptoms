import type { FoodRisk } from '../types'

interface ClassificationResult {
  risk: FoodRisk
  reason: string
}

// Each entry: [pattern, risk, reason]
// Patterns are matched case-insensitively against the food name
const RULES: [RegExp, FoodRisk, string][] = [
  // ── RISKY ──────────────────────────────────────────────────────────────
  [/\b(alcohol|beer|wine|whiskey|vodka|gin|rum|tequila|cider|lager|stout|spirit|cocktail|hard\s+selt)/i, 'risky', 'Alcohol irritates the intestinal lining'],
  [/\b(spic|hot\s+sauce|sriracha|chili|chilli|jalape|habanero|cayenne|tabasco|buffalo|curry|wasabi|horseradish|pepper\s+flake)/i, 'risky', 'Spicy foods trigger inflammation'],
  [/\b(fried|deep.?fry|french\s+frie|onion\s+ring|fried\s+chicken|fish.?and.?chips|tempura|chicharr)/i, 'risky', 'High-fat fried foods slow digestion'],
  [/\b(coffee|espresso|cappuccino|latte|cold\s+brew|americano|macchiato|mocha)/i, 'risky', 'Caffeine increases gut motility'],
  [/\b(energy\s+drink|monster|red\s+bull|bang\s+energy|rockstar\s+energy)/i, 'risky', 'High caffeine + stimulants'],
  [/\b(soda|cola|pepsi|coke|sprite|fanta|dr\.?\s*pepper|mountain\s+dew|7.?up|ginger\s+ale|tonic\s+water|club\s+soda|sparkling\s+water|carbonat)/i, 'risky', 'Carbonation increases gas and bloating'],
  [/\b(broccoli|cauliflower|brussels\s+sprout|cabbage|kale|bok\s+choy|kohlrabi|arugula|collard)/i, 'risky', 'Cruciferous vegetables cause gas and bloating'],
  [/\b(raw\s+(carrot|celery|pepper|onion|garlic|vegetable|salad|spinach|lettuce|cucumber|tomato|zucchini|broccoli|cabbage))/i, 'risky', 'Raw vegetables are hard to digest'],
  [/\b(bean|lentil|chickpea|black.?bean|kidney\s+bean|navy\s+bean|pinto\s+bean|legume|edamame|hummus|dal|dhal)/i, 'risky', 'Legumes ferment in the gut causing gas'],
  [/\b(popcorn)/i, 'risky', 'Hulls are difficult to digest'],
  [/\b(corn\b|corn\s+on\s+the\s+cob|creamed\s+corn)/i, 'risky', 'Corn is indigestible and can irritate'],
  [/\b(dried\s+fruit|raisin|prune|dried\s+apricot|dried\s+mango|dried\s+cranberr|dates?\b)/i, 'risky', 'Concentrated fiber and sugar'],
  [/\b(nut\b|nuts\b|almond|walnut|cashew|pecan|pistachio|peanut|macadamia|hazelnut|mixed\s+nuts)/i, 'risky', 'High fiber and fat, hard to digest'],
  [/\b(seed|sunflower\s+seed|pumpkin\s+seed|flaxseed|chia\s+seed|sesame|poppy\s+seed)/i, 'risky', 'Seeds can irritate inflamed intestines'],
  [/\b(whole\s+grain|bran|wheat\s+germ|oat\s+bran|high\s+fiber|fiber\s+bar|granola\s+bar)/i, 'risky', 'Insoluble fiber can aggravate IBD'],
  [/\b(artificial\s+sweetener|splenda|sucralose|sorbitol|xylitol|mannitol|diet\s+soda|sugar.?free|aspartame|stevia\s+blend)/i, 'risky', 'Sugar alcohols cause osmotic diarrhea'],
  [/\b(lactose|whole\s+milk|skim\s+milk|milk\b|cream\b|heavy\s+cream|ice\s+cream|gelato|milkshake)/i, 'risky', 'Lactose is commonly malabsorbed in IBD'],
  [/\b(red\s+meat|beef|steak|burger|ground\s+beef|ribeye|brisket|pork\s+belly|bacon|sausage|salami|pepperoni|chorizo|pastrami|hot\s+dog|bratwurst)/i, 'risky', 'High-fat red/processed meat increases inflammation'],
  [/\b(onion\b|leek|shallot|scallion|garlic\b)/i, 'risky', 'High FODMAP — ferments rapidly in the gut'],
  [/\b(apple\b|pear\b|mango\b|watermelon|cherry|cherries|peach|nectarine|plum|apricot)\b(?!\s*sauce)/i, 'risky', 'High FODMAP fruits — can trigger cramping'],
  [/\b(mushroom|asparagus|artichoke)/i, 'risky', 'High FODMAP vegetables'],
  [/\b(alcohol.?free|non.?alcoholic\s+beer)/i, 'risky', 'Often carbonated and high FODMAP'],

  // ── CAUTION ────────────────────────────────────────────────────────────
  [/\b(whole\s+wheat|whole\s+grain\s+bread|multigrain|brown\s+rice|wild\s+rice)/i, 'caution', 'More fiber than refined grains — tolerate in small portions'],
  [/\b(oat\b|oatmeal|porridge|granola(?!\s+bar))/i, 'caution', 'Soluble fiber is generally OK but monitor tolerance'],
  [/\b(yogurt|kefir|probiotic)/i, 'caution', 'Contains lactose, but probiotics may help — monitor response'],
  [/\b(cheese\b|cheddar|mozzarella|parmesan|gouda|brie|feta|cream\s+cheese)/i, 'caution', 'Lower lactose than milk but still dairy'],
  [/\b(orange|grapefruit|lemon|lime|citrus|pineapple|kiwi|strawberr|raspberr|blueberr|blackberr)/i, 'caution', 'Acidic fruits can irritate — tolerate in small amounts'],
  [/\b(tomato(?!\s+sauce\s+plain)|tomato\s+sauce|marinara|ketchup|salsa)/i, 'caution', 'Acidic and may contain spices — monitor response'],
  [/\b(chocolate|cocoa|cacao)/i, 'caution', 'Contains caffeine and can increase motility'],
  [/\b(candy|sweet|dessert|cake|cookie|pastry|donut|muffin|brownie|pie\b)/i, 'caution', 'High sugar can alter gut microbiome'],
  [/\b(pork\b|ham\b|prosciutto|pulled\s+pork)/i, 'caution', 'Fatty pork cuts can be hard to digest'],
  [/\b(avocado)/i, 'caution', 'High fiber and fat — small portions usually OK'],
  [/\b(spinach|lettuce|mixed\s+greens|rocket|arugula)(?!\s+raw)/i, 'caution', 'Cooked is safer — raw leafy greens can be tough to digest'],
  [/\b(cooked\s+vegetable|steamed\s+veg|roasted\s+veg)/i, 'caution', 'Generally OK — monitor which vegetables trigger symptoms'],
  [/\b(smoothie|juice\b|fruit\s+juice)/i, 'caution', 'High sugar and may contain FODMAP fruits'],
  [/\b(green\s+tea|black\s+tea|chai|matcha)/i, 'caution', 'Contains some caffeine — moderate amounts usually tolerated'],
  [/\b(protein\s+bar|energy\s+bar|snack\s+bar)/i, 'caution', 'Often contain artificial sweeteners, nuts or seeds'],
  [/\b(butter|margarine|olive\s+oil|coconut\s+oil)/i, 'caution', 'Pure fats are easier than dairy but large amounts slow digestion'],

  // ── SAFE ───────────────────────────────────────────────────────────────
  [/\b(white\s+rice|plain\s+rice|jasmine\s+rice|basmati\s+rice)/i, 'safe', 'Easily digestible, low fiber staple'],
  [/\b(banana\b|plantain)/i, 'safe', 'Low FODMAP, gentle on the gut'],
  [/\b(apple\s*sauce|applesauce)/i, 'safe', 'Cooked apple without skin is easily tolerated'],
  [/\b(plain\s+pasta|white\s+pasta|pasta\b|noodle|spaghetti|penne|macaroni|fettuccine|linguine|orzo)/i, 'safe', 'Refined pasta is well tolerated'],
  [/\b(white\s+bread|plain\s+bread|toast\b|bagel|english\s+muffin|sourdough(?!\s+whole))/i, 'safe', 'Low-fiber refined bread is gentle on the gut'],
  [/\b(egg\b|eggs\b|scrambled|hard.?boil|poach)/i, 'safe', 'High-protein, easy to digest'],
  [/\b(plain\s+chicken|grilled\s+chicken|boiled\s+chicken|roast\s+chicken|chicken\s+breast|chicken\s+soup|chicken\s+broth)/i, 'safe', 'Lean protein, easily digestible'],
  [/\b(turkey\b|lean\s+turkey)/i, 'safe', 'Lean protein, well tolerated'],
  [/\b(white\s+fish|cod|tilapia|halibut|sole|flounder|baked\s+fish|grilled\s+fish|fish\b|salmon\b|tuna\b)/i, 'safe', 'Lean fish is anti-inflammatory and easily digested'],
  [/\b(tofu(?!\s+fried)|silken\s+tofu)/i, 'safe', 'Low FODMAP plant protein'],
  [/\b(potato\b|mashed\s+potato|baked\s+potato|boiled\s+potato)(?!\s+chip|\s+fried)/i, 'safe', 'Peeled, cooked potato is well tolerated'],
  [/\b(sweet\s+potato|yam\b)(?!\s+frie)/i, 'safe', 'Nutritious and generally well tolerated when cooked'],
  [/\b(cooked\s+carrot|steamed\s+carrot|boiled\s+carrot)/i, 'safe', 'Soft cooked carrots are low fiber and gentle'],
  [/\b(zucchini|courgette)(?!\s+raw)/i, 'safe', 'Low FODMAP, easy to digest when cooked'],
  [/\b(water\b|still\s+water|mineral\s+water|herbal\s+tea|peppermint\s+tea|chamomile|ginger\s+tea)/i, 'safe', 'Hydration is key for IBD management'],
  [/\b(rice\s+cake|rice\s+cracker)/i, 'safe', 'Low fiber, easily digestible snack'],
  [/\b(bone\s+broth|chicken\s+broth|vegetable\s+broth|broth\b|stock\b)/i, 'safe', 'Easily absorbed nutrients, soothing for the gut'],
  [/\b(plain\s+cracker|saltine|soda\s+cracker)/i, 'safe', 'Plain, low-fiber crackers are well tolerated'],
  [/\b(jell.?o|gelatin|popsicle|sorbet(?!\s+citrus))/i, 'safe', 'Easily digested, gentle on the gut'],
]

export function classifyFood(name: string): ClassificationResult {
  const trimmed = name.trim()
  if (!trimmed) return { risk: 'safe', reason: '' }

  for (const [pattern, risk, reason] of RULES) {
    if (pattern.test(trimmed)) {
      return { risk, reason }
    }
  }

  // Default heuristics for unrecognized foods
  if (/\b(raw|fresh\s+cut)\b/i.test(trimmed)) {
    return { risk: 'caution', reason: 'Raw foods are harder to digest — monitor your response' }
  }
  if (/\b(fried|crispy|crunchy|deep.?fry)\b/i.test(trimmed)) {
    return { risk: 'risky', reason: 'Fried preparation adds fat that slows digestion' }
  }
  if (/\b(grilled|baked|steamed|boiled|poached|plain)\b/i.test(trimmed)) {
    return { risk: 'safe', reason: 'Low-fat preparation is easier to digest' }
  }

  return { risk: 'caution', reason: 'Not enough info — monitor how your gut responds' }
}
