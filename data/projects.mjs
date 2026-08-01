const image = (src) => ({ type: "image", src });
const bare = (src) => ({ type: "bare", src });
const row = (columns, sources, ratio = "4 / 5") => ({ type: "row", columns, sources, ratio });
const section = (title, note, count) => ({ type: "section", title, note, count });
const numbered = (folder, prefix, columns, numbers, ratio = "4 / 5") =>
  row(columns, numbers.map((number) => `assets/${folder}/${prefix}${String(number).padStart(2, "0")}.jpg`), ratio);

export const site = {
  owner: "sleekdeestudio",
  repository: "portfolio",
  baseUrl: "https://sleekdeestudio.github.io/portfolio/",
  name: "Tirth Mody",
  studio: "SleekDee",
  email: "sleekdee.studio@gmail.com",
  phone: "+44 7741 409452",
  phoneHref: "+447741409452",
  socials: {
    portfolio: "https://drive.google.com/drive/folders/1MeZlvFWwNxj8B3c2ASfkMltMO6ee8JOL",
    behance: "https://www.behance.net/tirthmody1",
    linkedin: "https://www.linkedin.com/in/tirthmodi",
    instagram: "https://www.instagram.com/tirthmody"
  }
};

export const projectOrder = [
  "pringles",
  "dr-pepper",
  "woop",
  "interior-goods-direct",
  "marshall",
  "ernest-jones",
  "sapphire"
];

export const projects = {
  pringles: {
    number: "(01)",
    title: "pringles conceptual ads",
    meta: "Concept campaign · Social media posts & banners",
    summary: [
      "A self-initiated concept campaign for Pringles, built flavour by flavour. Each post takes one idea about the taste and stages it as a single, unmistakable image — a pink lighthouse for Prawn Cocktail, a crisp in an evidence frame for Original, a chip submarine for Salt & Vinegar, smoke on a turntable for Texas Barbecue.",
      "Five flavours, one rule: one thought per post, no clutter, and the crisp always the hero. Colour comes from the flavour itself, type stays big and quiet, and every frame is built to read in the half-second a thumb gives it — as a single post, or as a full campaign scrolled end to end."
    ],
    segments: ["social media posts", "concept art direction", "flavour campaigns"],
    niche: "fmcg — snacks",
    og: "assets/pringles/cover-11.jpg",
    blocks: [
      section("original", "The classic treated like an artefact — museums, evidence rooms, red carpets.", "18 posts"),
      numbered("pringles", "pr-", 3, [5, 6, 7]),
      numbered("pringles", "pr-", 2, [8, 9]),
      numbered("pringles", "pr-", 3, [10, 11, 12]),
      numbered("pringles", "pr-", 3, [13, 14, 15]),
      numbered("pringles", "pr-", 2, [16, 20]),
      numbered("pringles", "pr-", 3, [21, 22, 23]),
      numbered("pringles", "pr-", 2, [24, 25]),
      section("prawn cocktail", "Pink as a place you can sail to — seaside light, shells and instinct.", "13 posts"),
      numbered("pringles", "pr-", 3, [1, 2, 3]),
      numbered("pringles", "pr-", 2, [4, 26]),
      numbered("pringles", "pr-", 3, [27, 28, 29]),
      numbered("pringles", "pr-", 2, [30, 31]),
      numbered("pringles", "pr-", 3, [32, 33, 38]),
      section("salt & vinegar", "Sharp, cold and curious — salt crystals, deep blue and one open question.", "13 posts"),
      numbered("pringles", "pr-", 3, [17, 18, 19]),
      numbered("pringles", "pr-", 2, [34, 35]),
      numbered("pringles", "pr-", 3, [36, 37, 39]),
      numbered("pringles", "pr-", 2, [40, 43]),
      numbered("pringles", "pr-", 3, [44, 45, 46]),
      section("texas barbecue", "Smoke as the subject — western props, embers and slow heat.", "10 posts"),
      numbered("pringles", "pr-", 3, [41, 42, 47]),
      numbered("pringles", "pr-", 2, [48, 49]),
      numbered("pringles", "pr-", 3, [50, 51, 52]),
      numbered("pringles", "pr-", 2, [57, 58]),
      section("cream & onion", "The calm flavour — layers, cream and a quieter kind of appetite.", "4 posts"),
      numbered("pringles", "pr-", 2, [53, 54]),
      numbered("pringles", "pr-", 2, [55, 56])
    ]
  },
  "dr-pepper": {
    number: "(02)",
    title: "dr pepper conceptual ads",
    meta: "Concept campaign · Social media posts",
    summary: [
      "A self-initiated concept campaign for Dr Pepper, built across three flavours — Cream Soda, Strawberries & Cream and Creamy Coconut. Each post takes one idea about the taste and stages it as a single, unmistakable image: cream poured through a megaphone, spice wrapped in silk, a whole holiday folded out of paper.",
      "The rule I set myself was one thought per post, no clutter, and the can always the hero. Type stays big and quiet, colour comes from the flavour itself, and every frame is built to read in the half-second a thumb gives it — as a single post, or as a full campaign scrolled end to end."
    ],
    segments: ["social media posts", "concept art direction", "flavour campaigns"],
    niche: "beverages — fmcg",
    og: "assets/dp/cover-01.jpg",
    blocks: [
      numbered("dp", "", 3, [1, 2, 3]),
      numbered("dp", "", 2, [4, 5]),
      numbered("dp", "", 2, [6, 7]),
      numbered("dp", "", 3, [8, 9, 10]),
      numbered("dp", "", 2, [11, 12]),
      numbered("dp", "", 3, [13, 14, 15]),
      numbered("dp", "", 2, [16, 17]),
      numbered("dp", "", 2, [18, 19])
    ]
  },
  woop: {
    number: "(03)",
    title: "woop",
    meta: "Brand identity · Packaging · Campaign",
    summary: [
      "A brand and packaging system for Woop — a naturally flavoured energy drink built to feel like a good time rather than a warning label. Three flavours, one rounded wordmark, and a palette of lavender, ultraviolet, pink grapefruit and cream.",
      "The mark is drawn on a 14x grid with a 16° forward slant, then carried onto cans, coolers, totes and two billboards — so it reads the same in a hand, in an ice bucket and from across the street."
    ],
    segments: ["brand identity", "packaging design", "campaign & out-of-home"],
    niche: "energy drinks — fmcg",
    og: "assets/woop/wp-a.jpg",
    blocks: [
      image("assets/woop/wp-a.jpg"),
      section("the system", "A wordmark drawn on a grid, five colours and two typefaces — fixed before anything got applied.", "foundations"),
      row(2, ["assets/woop/wp-b.jpg", "assets/woop/wp-k.jpg"], "3 / 4"),
      section("in the wild", "Cans, coolers and totes photographed where the drink actually gets opened.", "lifestyle"),
      row(2, ["assets/woop/wp-c.jpg", "assets/woop/wp-d.jpg"]),
      row(2, ["assets/woop/wp-e.jpg", "assets/woop/wp-f.jpg"]),
      row(2, ["assets/woop/wp-g.jpg", "assets/woop/wp-j.jpg"]),
      section("out of home", "Two billboards, one voice — big type, one can, no explaining.", "campaign"),
      row(2, ["assets/woop/wp-h.jpg", "assets/woop/wp-i.jpg"])
    ]
  },
  "interior-goods-direct": {
    number: "(04)",
    title: "interior goods direct",
    meta: "Social · Content",
    summary: [
      "A full Instagram feed redesign for a premium home-furnishings retailer — turning a scattered grid into one cohesive, recognisable feed.",
      "One template system, one palette, one voice — so every post looks like it came from the same brand."
    ],
    segments: ["feed redesign", "content system"],
    niche: "home & interiors",
    og: "assets/igd/cover.webp",
    blocks: [
      image("assets/igd/cover.webp"),
      row(2, ["assets/igd/post-1.webp", "assets/igd/post-2.webp"], "1 / 1"),
      image("assets/igd/banner-1.webp"),
      row(3, ["assets/igd/post-3.webp", "assets/igd/post-4.webp", "assets/igd/post-5.webp"], "1 / 1"),
      row(2, ["assets/igd/post-6.webp", "assets/igd/post-7.webp"], "1 / 1"),
      image("assets/igd/banner-2.webp")
    ]
  },
  marshall: {
    number: "(05)",
    title: "marshall",
    meta: "Social media marketing & handling",
    summary: [
      "Running the socials of a brand people already trust — without dulling what makes it loud.",
      "Calendars, captions and community, planned and posted so the business can run itself."
    ],
    segments: ["social handling", "content calendar"],
    niche: "consumer audio",
    og: "assets/marshall/ms-19.png",
    blocks: [
      bare("assets/marshall/ms-19.png"),
      image("assets/marshall/ms-03.jpg"),
      row(2, ["assets/marshall/ms-05.jpg", "assets/marshall/ms-06.jpg"]),
      row(3, ["assets/marshall/ms-07.jpg", "assets/marshall/ms-08.jpg", "assets/marshall/ms-09.jpg"]),
      image("assets/marshall/ms-04.jpg"),
      row(3, ["assets/marshall/ms-10.jpg", "assets/marshall/ms-11.jpg", "assets/marshall/ms-12.jpg"]),
      row(2, ["assets/marshall/ms-13.jpg", "assets/marshall/ms-16.jpg"]),
      row(2, ["assets/marshall/ms-14.jpg", "assets/marshall/ms-15.jpg"]),
      row(3, ["assets/marshall/ms-01.jpg", "assets/marshall/ms-17.jpg", "assets/marshall/ms-18.jpg"], "3 / 4")
    ]
  },
  "ernest-jones": {
    number: "(06)",
    title: "ernest jones",
    meta: "Social media post design · Out-of-home banners",
    summary: [
      "Post design for a jeweller, built as two campaigns that share one rule: one piece, one light, one line. Circle of Light runs warm — cream, brushed gold and a pendant lifted onto a plinth. Quiet Brilliance runs cold — daylight, crystal and a bracelet laid on stone.",
      "The wordmark sits letter-spaced at the top, the headline in a high-contrast serif underneath, and the product takes the right half of every frame. Sized for feed posts first, then stretched to billboard and storefront banners without redrawing a thing."
    ],
    segments: ["social media post design", "campaign art direction", "banner adaptation"],
    niche: "jewellery — retail",
    og: "assets/ernest/ej-banner-1.png",
    blocks: [
      image("assets/ernest/ej-title.png"),
      section("circle of light", "Warm campaign — cream, brushed gold and a pendant given the whole frame.", "campaign one"),
      image("assets/ernest/ej-banner-1.png"),
      section("quiet brilliance", "Cold campaign — daylight, crystal and a bracelet that does the talking.", "campaign two"),
      image("assets/ernest/ej-banner-2.png")
    ]
  },
  sapphire: {
    number: "(07)",
    title: "sapphire coffee & culture",
    meta: "Brand identity · Packaging design",
    summary: [
      "A full brand and packaging system for Sapphire — a coffee house that sells culture as much as coffee. The mark is a hand-drawn quatrefoil sitting over a high-contrast serif wordmark, built on a 14x7 grid so it holds from a lapel pin to a shopfront fascia. Underneath it: five earth tones, one display serif, one quiet sans.",
      "Packaging carries an engraved skyline — domes, minarets and palms — printed on kraft and deep maroon so the range reads as one family across cups, bags, aprons and totes. Every surface repeats three things: the mark, the skyline, and one line of voice — joy in every cup."
    ],
    segments: ["brand identity", "packaging design", "collateral & merch"],
    niche: "coffee — hospitality",
    og: "assets/sapphire/sp-hero.png",
    blocks: [
      image("assets/sapphire/sp-hero.png"),
      section("the system", "Five earth tones and a serif-over-sans pairing, fixed before a single surface was drawn.", "foundations"),
      row(2, ["assets/sapphire/sp-palette-type.png", "assets/sapphire/sp-logo-construction.png"], "1 / 1"),
      section("packaging", "Kraft and deep maroon, an engraved skyline, and the wordmark centred every time.", "primary range"),
      image("assets/sapphire/sp-bag.png"),
      row(2, ["assets/sapphire/sp-cups-float.png", "assets/sapphire/sp-cups-hands.png"]),
      section("in the wild", "The range doing its job — in hand, behind the bar and on the street.", "application"),
      image("assets/sapphire/sp-storefront.png"),
      row(2, ["assets/sapphire/sp-barista.png", "assets/sapphire/sp-lifestyle.png"]),
      section("collateral", "Totes, aprons, caps, coasters and a loyalty card cut from the same cloth.", "merch & print"),
      image("assets/sapphire/sp-merch.png")
    ]
  }
};

export const workItems = [
  {
    slug: "pringles",
    number: "(01)",
    title: "Pringles Conceptual Ads",
    description: "A concept campaign of social posts and banner ads — flavour first, thumb-stopping.",
    tags: ["Social", "Concept"],
    layout: "wide triptych",
    images: ["assets/pringles/cover-11.jpg", "assets/pringles/cover-51.jpg", "assets/pringles/cover-45.jpg"],
    alts: ["Pringles Original concept ad", "Pringles Texas Barbecue concept ad", "Pringles Salt and Vinegar concept ad"]
  },
  {
    slug: "dr-pepper",
    number: "(02)",
    title: "Dr Pepper Conceptual Ads",
    description: "Three flavours, nineteen posts — one idea about the taste per frame.",
    tags: ["Social", "Concept"],
    layout: "wide triptych",
    images: ["assets/dp/cover-01.jpg", "assets/dp/cover-08.jpg", "assets/dp/cover-04.jpg"],
    alts: ["Dr Pepper Cream Soda concept ad", "Dr Pepper Creamy Coconut concept ad", "Dr Pepper Strawberries and Cream concept ad"]
  },
  {
    slug: "woop",
    number: "(03)",
    title: "Woop",
    description: "Energy drink identity — wordmark, three flavours, cans and billboards.",
    tags: ["Branding", "Packaging"],
    layout: "wide",
    images: ["assets/woop/wp-a.jpg"],
    alts: ["Woop energy drink cans on ice"]
  },
  {
    slug: "interior-goods-direct",
    number: "(04)",
    title: "Interior Goods Direct",
    description: "Turning a scattered grid into one cohesive, premium feed — before and after.",
    tags: ["Social", "Content"],
    layout: "half contain warm",
    images: ["assets/igd-feed.png"],
    alts: ["Interior Goods Direct Instagram feed redesign, before and after"]
  },
  {
    slug: "marshall",
    number: "(05)",
    title: "Marshall",
    description: "Running the socials of a brand people already trust — without dulling it.",
    tags: ["Growth"],
    layout: "half contain cream",
    images: ["assets/marshall/ms-19.png"],
    alts: ["Marshall social content and feed art direction"]
  },
  {
    slug: "ernest-jones",
    number: "(06)",
    title: "Ernest Jones",
    description: "Social media post design — two campaigns, gold and silver.",
    tags: ["Social", "Content"],
    layout: "half landscape",
    images: ["assets/ernest/ej-banner-1.png"],
    alts: ["Ernest Jones Circle of Light campaign banner"]
  },
  {
    slug: "sapphire",
    number: "(07)",
    title: "Sapphire Coffee & Culture",
    description: "A full identity and packaging range — mark, palette, cups, bags and merch.",
    tags: ["Branding", "Packaging"],
    layout: "half landscape cream",
    images: ["assets/sapphire/sp-hero.png"],
    alts: ["Sapphire Coffee and Culture brand identity and packaging"]
  }
];
