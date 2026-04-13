const { useState, useEffect, useRef } = React;

const CONTAMINANTS = [
  { name: "Chlorine", unit: "mg", dailyPerLiter: 0.8, icon: "🧪", color: "#e8c84a", removed: 99 },
  { name: "Lead", unit: "μg", dailyPerLiter: 3.8, icon: "⚠️", color: "#d4644a", removed: 99 },
  { name: "Microplastics", unit: "particles", dailyPerLiter: 325, icon: "🔬", color: "#9b59b6", removed: 95 },
  { name: "Chloroform (THMs)", unit: "μg", dailyPerLiter: 16, icon: "☁️", color: "#7f8c8d", removed: 98 },
  { name: "Pharmaceuticals", unit: "ng", dailyPerLiter: 52, icon: "💊", color: "#e67e22", removed: 90 },
  { name: "Heavy Metals", unit: "μg", dailyPerLiter: 8.5, icon: "🪨", color: "#95a5a6", removed: 97 },
];

const FR_NAMES = {
  "Chlorine":          "Chlore",
  "Lead":              "Plomb",
  "Microplastics":     "Microplastiques",
  "Chloroform (THMs)": "Chloroforme (THM)",
  "Pharmaceuticals":   "Médicaments",
  "Heavy Metals":      "Métaux lourds",
};

const REFERENCES = [
  { id: 1,  org: "CDC",           title: "Lead Poisoning Prevention",                         url: "https://www.cdc.gov/nceh/lead/" },
  { id: 2,  org: "EPA",           title: "Lead in Drinking Water",                            url: "https://www.epa.gov/lead" },
  { id: 3,  org: "EPA",           title: "National Primary Drinking Water Regulations",       url: "https://www.epa.gov/ground-water-and-drinking-water/national-primary-drinking-water-regulations" },
  { id: 4,  org: "WHO",           title: "Microplastics in Drinking-Water",                   url: "https://www.who.int/publications/i/item/9789241516198" },
  { id: 5,  org: "EPA",           title: "EPA 2026 Action: Microplastics & Pharmaceuticals",  url: "https://www.epa.gov/newsreleases/epa-takes-bold-action-ensure-drinking-water-safe-microplastics-pharmaceuticals-and" },
  { id: 6,  org: "NIH/NCBI",      title: "Microplastics in Drinking Water (Review)",          url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12474263/" },
  { id: 7,  org: "Health Canada", title: "Drinking Water Quality Guidelines Summary",         url: "https://www.canada.ca/en/health-canada/services/environmental-workplace-health/reports-publications/water-quality/guidelines-canadian-drinking-water-quality-summary-table.html" },
  { id: 8,  org: "OEHHA",         title: "Public Health Goals for Trihalomethanes",           url: "https://oehha.ca.gov/sites/default/files/media/downloads/water/chemicals/phg/thmsphg020720.pdf" },
  { id: 9,  org: "EPA",           title: "2026 Human Health Benchmarks for Pharmaceuticals",  url: "https://www.epa.gov/sdwa/2026-human-health-benchmarks-pharmaceuticals-hhb-rx" },
  { id: 10, org: "GAO",           title: "Pharmaceuticals in Drinking Water",                 url: "https://www.gao.gov/products/gao-11-346" },
  { id: 11, org: "NCI",           title: "Arsenic and Cancer Risk",                           url: "https://www.cancer.gov/about-cancer/causes-prevention/risk/substances/arsenic" },
  { id: 12, org: "EPA",           title: "Arsenic in Drinking Water",                         url: "https://www.epa.gov/arsenic" },
  { id: 13, org: "NIH",           title: "Health Effects of Arsenic in Drinking Water",       url: "https://www.ncbi.nlm.nih.gov/books/NBK230882/" },
];

const CONTAMINANT_INFO = {
  "Chlorine": {
    what: "A disinfectant added by water utilities to kill bacteria and viruses in the distribution system.",
    howEnters: "Added intentionally at treatment plants; residual levels persist to your tap to prevent microbial regrowth.",
    effects: [
      "Eye and nose irritation at high concentrations",
      "Reacts with natural organic matter to form carcinogenic byproducts (THMs)",
      "Respiratory irritation from chlorinated shower steam in enclosed spaces",
    ],
    epaLimit: "4 mg/L Maximum Residual Disinfectant Level (MRDL)",
    healthCanadaLimit: "Aesthetic objective \u2264 0.5 mg/L; no health-based MAC at typical levels",
    vulnerable: "Infants, people with asthma or reactive airway conditions",
    citations: [3, 7],
  },
  "Lead": {
    what: "A toxic heavy metal that leaches from aging pipes, solder joints, and plumbing fixtures \u2014 not from the water source itself.",
    howEnters: "Corroding lead service lines and pre-1986 household plumbing release lead into stagnant water; highest risk first thing in the morning.",
    effects: [
      "Irreversible neurological damage and IQ loss in children \u2014 no safe exposure level has been identified",
      "Learning disabilities, attention deficits, and behavioral disorders",
      "Kidney damage and elevated blood pressure in adults",
      "Developmental harm at blood lead levels previously considered safe",
    ],
    epaLimit: "Action Level 15 \u03bcg/L \u2014 utilities must act when exceeded in \u226510% of sampled homes",
    healthCanadaLimit: "MAC 5 \u03bcg/L (Health Canada 2019; interim target toward 1 \u03bcg/L)",
    vulnerable: "Children under 6 (developing nervous system), infants, pregnant women",
    citations: [1, 2, 3],
  },
  "Microplastics": {
    what: "Particles smaller than 5 mm derived from the breakdown of plastic products, synthetic textiles, and industrial processes.",
    howEnters: "Atmospheric deposition into surface water, runoff, degradation inside plastic pipes, and leaching from plastic water bottles \u2014 notably, bottled water contains significantly higher microplastic concentrations than tap water.",
    effects: [
      "Carry adsorbed pollutants (pesticides, heavy metals, plasticizers) into the body",
      "Potential endocrine disruption from phthalates and BPA residues",
      "Inflammatory response in the gastrointestinal tract",
      "Long-term systemic effects under active research \u2014 microplastics detected in blood, lungs, and organs",
    ],
    epaLimit: "No federal MCL established; designated as a priority contaminant for regulatory action in 2026",
    healthCanadaLimit: "No MAC established; under monitoring review",
    vulnerable: "Infants (formula reconstituted in warm water), heavy bottled water consumers",
    citations: [4, 5, 6],
  },
  "Chloroform (THMs)": {
    what: "Trihalomethanes (THMs) \u2014 including chloroform, bromodichloromethane, and bromoform \u2014 are disinfection byproducts formed when chlorine reacts with natural organic matter in water.",
    howEnters: "Form in-pipe during disinfection when chlorine contacts decaying leaves, algae, and humic acids in source water; also absorbed through skin and inhaled during hot showers.",
    effects: [
      "Classified as probable human carcinogens (Group B2) by the EPA; bromodichloromethane has an MCLG of zero",
      "Long-term exposure associated with increased bladder and colorectal cancer risk",
      "Liver and kidney toxicity at elevated concentrations",
      "Inhalation and dermal absorption during bathing can exceed oral ingestion as an exposure route",
    ],
    epaLimit: "Total THMs: 80 \u03bcg/L (Stage 2 Disinfectants and Disinfection Byproducts Rule)",
    healthCanadaLimit: "MAC 100 \u03bcg/L total THMs",
    vulnerable: "Pregnant women (elevated miscarriage and cardiac defect risk at high levels), long-duration shower users",
    citations: [3, 7, 8],
  },
  "Pharmaceuticals": {
    what: "Trace residues of prescription and over-the-counter medications \u2014 antibiotics, synthetic hormones, antidepressants, and anti-inflammatories \u2014 detected in municipal tap water.",
    howEnters: "Excreted by humans and animals, enter wastewater streams, pass through treatment plants not designed to remove them, and re-enter drinking water sources via surface and groundwater.",
    effects: [
      "Endocrine disruption from synthetic estrogens \u2014 associated with feminization in aquatic species at detected concentrations",
      "Potential contribution to antibiotic-resistant bacteria (antimicrobial resistance)",
      "Chronic low-dose effects largely unstudied in humans",
      "WHO notes current detected levels unlikely to cause acute harm, but long-term cumulative risk unknown",
    ],
    epaLimit: "No federal MCLs; EPA released 374 Human Health Benchmarks (HHB-Rx) in 2026 as non-mandatory guidance",
    healthCanadaLimit: "No MACs; under monitoring",
    vulnerable: "Infants, pregnant women, immunocompromised individuals (theoretical; not yet quantified)",
    citations: [5, 9, 10],
  },
  "Heavy Metals": {
    what: "Includes arsenic, cadmium, chromium-6, and mercury \u2014 naturally occurring in geological formations or released by industrial activities.",
    howEnters: "Natural leaching from mineral-rich bedrock, industrial discharge, agricultural runoff, and aging distribution infrastructure.",
    effects: [
      "Arsenic (IARC Group 1 carcinogen): elevated risk of bladder, lung, and skin cancers with chronic exposure",
      "Cadmium: accumulates in kidneys causing progressive renal damage and bone density loss",
      "Chromium-6: linked to gastrointestinal cancers in high-exposure populations",
      "Bioaccumulate over a lifetime \u2014 effects are dose-dependent and cumulative",
    ],
    epaLimit: "Arsenic MCL 10 \u03bcg/L; other metals regulated individually (see EPA National Primary Drinking Water Regulations)",
    healthCanadaLimit: "Arsenic MAC 10 \u03bcg/L; cadmium 5 \u03bcg/L; other metals regulated separately",
    vulnerable: "Children (developing systems), people with impaired kidney function, pregnant women",
    citations: [3, 11, 12, 13],
  },
};

const CONTAMINANT_INFO_FR = {
  "Chlorine": {
    what: "Un d\u00e9sinfectant ajout\u00e9 par les services des eaux pour \u00e9liminer bact\u00e9ries et virus dans le r\u00e9seau de distribution.",
    howEnters: "Ajout\u00e9 intentionnellement en station d\u2019\u00e9puration; les niveaux r\u00e9siduels persistent jusqu\u2019au robinet pour pr\u00e9venir la prolif\u00e9ration microbienne.",
    effects: [
      "Irritation des yeux et du nez \u00e0 concentrations \u00e9lev\u00e9es",
      "R\u00e9agit avec la mati\u00e8re organique naturelle pour former des sous-produits canc\u00e9rig\u00e8nes (THM)",
      "Irritation respiratoire due \u00e0 la vapeur de douche chlor\u00e9e dans les espaces confin\u00e9s",
    ],
    epaLimit: "4 mg/L \u2014 Niveau maximal r\u00e9siduel de d\u00e9sinfectant (NMRD)",
    healthCanadaLimit: "Objectif esth\u00e9tique \u2264 0,5 mg/L; aucune CMA sanitaire aux niveaux courants",
    vulnerable: "Nourrissons, personnes asthmatiques ou souffrant d\u2019affections des voies respiratoires",
    citations: [3, 7],
  },
  "Lead": {
    what: "Un m\u00e9tal lourd toxique qui migre depuis les vieilles canalisations, les joints de soudure et la robinetterie \u2014 et non depuis la source d\u2019eau elle-m\u00eame.",
    howEnters: "Les conduites en plomb qui se corrodent et la plomberie r\u00e9sidentielle d\u2019avant 1986 lib\u00e8rent du plomb dans l\u2019eau stagnante; le risque est le plus \u00e9lev\u00e9 en d\u00e9but de journ\u00e9e.",
    effects: [
      "Dommages neurologiques irr\u00e9versibles et perte de QI chez les enfants \u2014 aucun niveau d\u2019exposition s\u00fbr n\u2019a \u00e9t\u00e9 \u00e9tabli",
      "Difficult\u00e9s d\u2019apprentissage, d\u00e9ficit d\u2019attention et troubles du comportement",
      "Atteinte r\u00e9nale et hypertension chez l\u2019adulte",
      "Effets n\u00e9fastes sur le d\u00e9veloppement \u00e0 des taux autrefois jug\u00e9s sans danger",
    ],
    epaLimit: "Niveau d\u2019action : 15 \u03bcg/L \u2014 intervention obligatoire si d\u00e9pass\u00e9 dans \u226510 % des foyers \u00e9chantillonn\u00e9s",
    healthCanadaLimit: "CMA : 5 \u03bcg/L (Sant\u00e9 Canada 2019; objectif provisoire vers 1 \u03bcg/L)",
    vulnerable: "Enfants de moins de 6 ans, nourrissons, femmes enceintes",
    citations: [1, 2, 3],
  },
  "Microplastics": {
    what: "Particules de moins de 5 mm provenant de la d\u00e9gradation de produits plastiques, de textiles synth\u00e9tiques et de proc\u00e9d\u00e9s industriels.",
    howEnters: "D\u00e9p\u00f4t atmosph\u00e9rique dans les eaux de surface, ruissellement, d\u00e9gradation dans les canalisations plastiques et migration depuis les bouteilles d\u2019eau \u2014 l\u2019eau en bouteille contient des concentrations en microplastiques nettement plus \u00e9lev\u00e9es que l\u2019eau du robinet.",
    effects: [
      "Transportent des polluants adsorb\u00e9s (pesticides, m\u00e9taux lourds, plastifiants) dans l\u2019organisme",
      "Perturbation endocrinienne potentielle li\u00e9e aux phtalates et r\u00e9sidus de BPA",
      "R\u00e9action inflammatoire dans le tube digestif",
      "Effets syst\u00e9miques \u00e0 long terme en cours d\u2019\u00e9tude \u2014 microplastiques d\u00e9tect\u00e9s dans le sang, les poumons et les organes",
    ],
    epaLimit: "Aucune CMC f\u00e9d\u00e9rale \u00e9tablie; d\u00e9sign\u00e9 contaminant prioritaire pour action r\u00e9glementaire en 2026",
    healthCanadaLimit: "Aucune CMA \u00e9tablie; en cours de r\u00e9vision",
    vulnerable: "Nourrissons (pr\u00e9parations reconstitu\u00e9es \u00e0 l\u2019eau chaude), grands consommateurs d\u2019eau en bouteille",
    citations: [4, 5, 6],
  },
  "Chloroform (THMs)": {
    what: "Les trihalogenom\u00e9thanes (THM) \u2014 dont le chloroforme, le bromodichlorom\u00e9thane et le bromoforme \u2014 sont des sous-produits de d\u00e9sinfection form\u00e9s lorsque le chlore r\u00e9agit avec la mati\u00e8re organique naturelle de l\u2019eau.",
    howEnters: "Se forment dans les canalisations lors de la d\u00e9sinfection quand le chlore entre en contact avec des feuilles en d\u00e9composition, des algues et des acides humiques; \u00e9galement absorb\u00e9s par la peau et inhal\u00e9s sous la douche chaude.",
    effects: [
      "Class\u00e9s canc\u00e9rig\u00e8nes humains probables (groupe B2) par l\u2019EPA; le bromodichlorom\u00e9thane a une CMCE de z\u00e9ro",
      "L\u2019exposition prolong\u00e9e est associ\u00e9e \u00e0 un risque accru de cancer de la vessie et du c\u00f4lon",
      "Toxicit\u00e9 h\u00e9patique et r\u00e9nale \u00e0 concentrations \u00e9lev\u00e9es",
      "L\u2019inhalation et l\u2019absorption cutan\u00e9e sous la douche peuvent d\u00e9passer l\u2019ing\u00e9stion orale comme voie d\u2019exposition",
    ],
    epaLimit: "THM totaux : 80 \u03bcg/L (R\u00e8gle phase 2 sur les d\u00e9sinfectants et sous-produits de l\u2019EPA)",
    healthCanadaLimit: "CMA : 100 \u03bcg/L de THM totaux",
    vulnerable: "Femmes enceintes (risque de fausse couche et de malformation cardiaque \u00e0 niveaux \u00e9lev\u00e9s), personnes qui prennent de longues douches",
    citations: [3, 7, 8],
  },
  "Pharmaceuticals": {
    what: "R\u00e9sidus traces de m\u00e9dicaments sur ordonnance et en vente libre \u2014 antibiotiques, hormones de synth\u00e8se, antid\u00e9presseurs et anti-inflammatoires \u2014 d\u00e9tect\u00e9s dans l\u2019eau potable municipale.",
    howEnters: "Excr\u00e9t\u00e9s par les humains et les animaux, ils entrent dans les eaux us\u00e9es, traversent les stations d\u2019\u00e9puration non con\u00e7ues pour les \u00e9liminer, et r\u00e9int\u00e8grent les sources d\u2019eau via les eaux de surface et souterraines.",
    effects: [
      "Perturbation endocrinienne par les \u0153strog\u00e8nes de synth\u00e8se \u2014 associ\u00e9e \u00e0 la f\u00e9minisation d\u2019esp\u00e8ces aquatiques aux concentrations d\u00e9tect\u00e9es",
      "Contribution potentielle \u00e0 la r\u00e9sistance aux antibiotiques",
      "Effets des faibles doses chroniques en grande partie non \u00e9tudi\u00e9s chez l\u2019humain",
      "L\u2019OMS note que les niveaux actuels sont peu susceptibles de causer des dommages aigus, mais le risque cumulatif \u00e0 long terme reste inconnu",
    ],
    epaLimit: "Aucune CMC f\u00e9d\u00e9rale; l\u2019EPA a publi\u00e9 en 2026 des valeurs de r\u00e9f\u00e9rence (HHB-Rx) pour 374 compos\u00e9s \u2014 \u00e0 titre indicatif seulement",
    healthCanadaLimit: "Aucune CMA; en cours de surveillance",
    vulnerable: "Nourrissons, femmes enceintes, personnes immunod\u00e9prim\u00e9es (th\u00e9orique; non encore quantifi\u00e9)",
    citations: [5, 9, 10],
  },
  "Heavy Metals": {
    what: "Comprend l\u2019arsenic, le cadmium, le chrome hexavalent et le mercure \u2014 d\u2019origine naturelle dans les formations g\u00e9ologiques ou lib\u00e9r\u00e9s par des activit\u00e9s industrielles.",
    howEnters: "Lixiviation naturelle depuis les roches et sols min\u00e9ralis\u00e9s, rejets industriels, ruissellement agricole et vieillissement des infrastructures de distribution.",
    effects: [
      "Arsenic (canc\u00e9rig\u00e8ne groupe 1 du CIRC) : risque \u00e9lev\u00e9 de cancers de la vessie, du poumon et de la peau lors d\u2019une exposition chronique",
      "Cadmium : s\u2019accumule dans les reins, provoquant une atteinte r\u00e9nale progressive et une perte de densit\u00e9 osseuse",
      "Chrome hexavalent : associ\u00e9 aux cancers gastro-intestinaux dans les populations expos\u00e9es",
      "Bioaccumulation sur toute une vie \u2014 effets dose-d\u00e9pendants et cumulatifs",
    ],
    epaLimit: "CMA de l\u2019arsenic : 10 \u03bcg/L; autres m\u00e9taux r\u00e9glement\u00e9s individuellement (voir r\u00e8glement national de l\u2019EPA sur l\u2019eau potable)",
    healthCanadaLimit: "CMA de l\u2019arsenic : 10 \u03bcg/L; cadmium : 5 \u03bcg/L; autres m\u00e9taux r\u00e9glement\u00e9s s\u00e9par\u00e9ment",
    vulnerable: "Enfants (syst\u00e8mes en d\u00e9veloppement), personnes souffrant d\u2019insuffisance r\u00e9nale, femmes enceintes",
    citations: [3, 11, 12, 13],
  },
};

const PRODUCTS = [
  { name: "AlkaFlow\u2122 Pitcher", price: 89.99, filterCost: 35, filterMonths: 3, litersPerDay: 4, url: "https://aquahealthproducts.com/product/alkaflow-alkaline-water-pitcher/", desc: "Perfect for 1\u20132 people. Portable, no installation needed.", img: "https://aquahealthproducts.com/wp-content/uploads/2024/11/AHP-ALKAFLOW-Pitcher-Product-compressed.png" },
  { name: "AlkaFlow\u2122 Dispenser", price: 199.99, filterCost: 45, filterMonths: 6, litersPerDay: 12, url: "https://aquahealthproducts.com/product/alkaflow-dispenser-alkaline-water/", desc: "Ideal for families. High capacity, countertop convenience.", img: "https://aquahealthproducts.com/wp-content/uploads/2024/11/AHP-ALKAFLOW-Dispenser-Product-11.png", sale: true, origPrice: 269.99 },
  { name: "AQUA Coldstream 12L", price: 399.95, filterCost: 65, filterMonths: 12, litersPerDay: 20, url: "https://aquahealthproducts.com/product/aqua-coldstream-12l/", desc: "Premium gravity purification. No electricity or plumbing needed.", img: "https://aquahealthproducts.com/wp-content/uploads/2025/02/12L-Aqua-Coldstream.png" },
];

const PRODUCTS_FR = [
  { ...PRODUCTS[0], name: "Pichet d\u2019eau alcaline AlkaFlow\u2122", url: "https://aquahealthproducts.com/fr/produit/alkaflow-pichet-eau-alcaline/", desc: "Id\u00e9al pour 1\u20132 personnes. Portable, sans installation requise." },
  { ...PRODUCTS[1], name: "Distributeur d\u2019eau alcaline AlkaFlow\u2122", url: "https://aquahealthproducts.com/fr/produit/alkaflow-distributeur-eau-alcaline/", desc: "Id\u00e9al pour les familles. Grande capacit\u00e9, pratique sur le comptoir." },
  { ...PRODUCTS[2], url: "https://aquahealthproducts.com/fr/produit/aqua-coldstream-12l/", desc: "Purification par gravit\u00e9 haut de gamme. Sans \u00e9lectricit\u00e9 ni plomberie." },
];

const STRINGS = {
  en: {
    banner: "FREE SHIPPING on orders over $150",
    bannerStrong: "FREE SHIPPING",
    bannerRest: " on orders over $150",
    title: "Your Water\nReality Check",
    subtitle: "Discover what's really in your water \u2014 and what it costs you.",
    stepOf: function(n) { return "Step " + n + " of 3"; },
    householdQ: "How many people in your household?",
    waterIntakeQ: "Daily water intake per person",
    litresDay: "litres / day",
    recommended: "Recommended: 2.0L",
    next: "Next \u2192",
    sourceQ: "What's your primary water source?",
    sourceOptions: [
      { id: "tap",     label: "Mostly Tap",      icon: "\uD83D\uDEB0", desc: "Municipal or well water" },
      { id: "bottled", label: "Mostly Bottled",   icon: "\uD83E\uDDF4", desc: "Store-bought bottles" },
      { id: "mix",     label: "A Mix of Both",    icon: "\uD83D\uDD04", desc: "Some of each" },
    ],
    bottledPctQ: "What percentage is bottled?",
    bottledLabel: "bottled",
    tapLabel: "tap",
    back: "\u2190 Back",
    seeResults: "See My Results \u2192",
    householdAnnually: "Your household annually",
    waterPerYear: "of water consumed per year",
    tabHealth: "\uD83E\uDDEA Health",
    tabPlanet: "\uD83C\uDF0D Planet",
    tabWallet: "\uD83D\uDCB0 Wallet",
    contaminantHeader: "\u26A0\uFE0F ESTIMATED ANNUAL CONTAMINANT INTAKE",
    contaminantDesc: function(liters, n) { return "Based on " + liters + "L/day of unfiltered tap water for " + n + " " + (n === 1 ? "person" : "people") + ". Click \u25BC Learn more on any contaminant to see health research and official guidelines."; },
    contaminantDescStrong: "\u25BC Learn more",
    removedPct: function(pct) { return "AlkaFlow removes " + pct + "%"; },
    learnMore: "\u25BC Learn more",
    learnLess: "\u25B2 Less",
    whatItIs: "What it is:",
    howEnters: "How it enters your water:",
    healthEffects: "Health effects:",
    epaLimit: "EPA limit:",
    hcLimit: "Health Canada limit:",
    mostVulnerable: "Most vulnerable:",
    sources: "Sources:",
    disclaimer: "\uD83D\uDCA1 These are estimates based on average North American municipal water data. Actual levels vary by region.",
    refsToggleShow: "\u25BC References & Sources",
    refsToggleHide: "\u25B2 Hide References",
    noBottled: "Great \u2014 no bottled water!",
    noBottledDesc: "You're already avoiding plastic waste. A filtration system would protect you from the contaminants in the Health tab.",
    plasticFootprint: "\uD83C\uDF0D YOUR ANNUAL PLASTIC FOOTPRINT",
    plasticBottles: "plastic bottles",
    plasticWaste: "of plastic waste",
    co2Footer: "carbon footprint from production & transport",
    plasticWasteLabel: "Plastic waste",
    co2Label: "CO\u2082 emissions",
    bottlesLabel: "Bottles in landfill",
    switchMsg: "\uD83C\uDF3F Switching to filtered water eliminates 100% of this plastic waste.",
    switchMsgStrong: "100%",
    walletHeader: "\uD83D\uDCB0 YOUR WATER COSTS",
    annualSpend: "Annual bottled water spend",
    perBottle: function(price) { return "at $" + price + " per 500mL bottle"; },
    fiveYear: "5-Year comparison",
    fiveYearCost: "5-year total cost",
    save: function(amt, pct) { return "Save $" + amt + " (" + pct + "%)"; },
    vsBottled: function(amt) { return "vs. $" + amt + " on bottled water over 5 years"; },
    tapSaving: "You're saving money on tap!",
    tapSavingDesc: "An AlkaFlow system adds filtration + alkaline minerals for pennies a day \u2014 starting at just $0.25/day.",
    tapSavingStrong: "$0.25/day",
    showSolution: "Show Me the Solution \uD83D\uDCA7",
    adjustInputs: "\u2190 Adjust My Inputs",
    solutionTitle: "Clean Water, Simple Solution",
    solutionDesc: "An AlkaFlow system removes up to 99% of contaminants while adding beneficial alkaline minerals to your water.",
    trusted: "Trusted by Canadians since 2010",
    recommendedFor: "Recommended for your household",
    bestFit: "\u2605 BEST FIT",
    viewProduct: "View Product \u2192",
    filterInfo: function(cost, months, perDay) { return "Filter replacement: $" + cost + " every " + months + " months \u00b7 ~$" + perDay + "/day"; },
    myResults: "\u2190 My Results",
    startOver: "Start Over",
    saleBadge: "SALE",
    footerTagline: "Your health comes first",
    shopAll: "Shop All Products",
    shopAllUrl: "https://aquahealthproducts.com/shop/",
    shopPitcher: "AlkaFlow Pitcher",
    shopPitcherUrl: "https://aquahealthproducts.com/product/alkaflow-alkaline-water-pitcher/",
    shopDispenser: "AlkaFlow Dispenser",
    shopDispenserUrl: "https://aquahealthproducts.com/product/alkaflow-dispenser-alkaline-water/",
    footerNote: "Healthy water solutions since 2010",
  },
  fr: {
    banner: "LIVRAISON GRATUITE pour tout achat de 150$ et plus",
    bannerStrong: "LIVRAISON GRATUITE",
    bannerRest: " pour tout achat de 150$ et plus",
    title: "Votre Bilan\nQualit\u00e9 d'Eau",
    subtitle: "D\u00e9couvrez ce qui se cache vraiment dans votre eau \u2014 et ce que \u00e7a vous co\u00fbte.",
    stepOf: function(n) { return "\u00c9tape " + n + " sur 3"; },
    householdQ: "Combien de personnes dans votre foyer?",
    waterIntakeQ: "Consommation d\u2019eau quotidienne par personne",
    litresDay: "litres / jour",
    recommended: "Recommand\u00e9 : 2,0\u00a0L",
    next: "Suivant \u2192",
    sourceQ: "Quelle est votre principale source d\u2019eau?",
    sourceOptions: [
      { id: "tap",     label: "Principalement du robinet", icon: "\uD83D\uDEB0", desc: "Eau municipale ou de puits" },
      { id: "bottled", label: "Principalement en bouteille", icon: "\uD83E\uDDF4", desc: "Bouteilles achet\u00e9es en magasin" },
      { id: "mix",     label: "Un m\u00e9lange des deux",    icon: "\uD83D\uDD04", desc: "Une partie de chaque" },
    ],
    bottledPctQ: "Quel pourcentage est en bouteille?",
    bottledLabel: "en bouteille",
    tapLabel: "du robinet",
    back: "\u2190 Retour",
    seeResults: "Voir mes r\u00e9sultats \u2192",
    householdAnnually: "Votre foyer, annuellement",
    waterPerYear: "d\u2019eau consomm\u00e9e par an",
    tabHealth: "\uD83E\uDDEA Sant\u00e9",
    tabPlanet: "\uD83C\uDF0D Plan\u00e8te",
    tabWallet: "\uD83D\uDCB0 Portefeuille",
    contaminantHeader: "\u26A0\uFE0F CONSOMMATION ANNUELLE ESTIM\u00c9E DE CONTAMINANTS",
    contaminantDesc: function(liters, n) { return "Bas\u00e9 sur " + liters + "\u00a0L/jour d\u2019eau du robinet non filtr\u00e9e pour " + n + " " + (n === 1 ? "personne" : "personnes") + ". Cliquez sur \u25BC En savoir plus pour consulter les recherches et les directives officielles."; },
    contaminantDescStrong: "\u25BC En savoir plus",
    removedPct: function(pct) { return "AlkaFlow \u00e9limine " + pct + "%"; },
    learnMore: "\u25BC En savoir plus",
    learnLess: "\u25B2 R\u00e9duire",
    whatItIs: "Ce que c\u2019est :",
    howEnters: "Comment \u00e7a entre dans votre eau :",
    healthEffects: "Effets sur la sant\u00e9 :",
    epaLimit: "Limite de l\u2019EPA :",
    hcLimit: "Limite de Sant\u00e9 Canada :",
    mostVulnerable: "Les plus vuln\u00e9rables :",
    sources: "Sources :",
    disclaimer: "\uD83D\uDCA1 Ces donn\u00e9es sont des estimations bas\u00e9es sur les donn\u00e9es moyennes de l\u2019eau municipale nord-am\u00e9ricaine. Les niveaux r\u00e9els varient selon la r\u00e9gion.",
    refsToggleShow: "\u25BC R\u00e9f\u00e9rences et sources",
    refsToggleHide: "\u25B2 Masquer les r\u00e9f\u00e9rences",
    noBottled: "Super \u2014 pas d\u2019eau en bouteille\u00a0!",
    noBottledDesc: "Vous \u00e9vitez d\u00e9j\u00e0 les d\u00e9chets plastiques. Un syst\u00e8me de filtration vous prot\u00e9gerait des contaminants pr\u00e9sent\u00e9s dans l\u2019onglet Sant\u00e9.",
    plasticFootprint: "\uD83C\uDF0D VOTRE EMPREINTE PLASTIQUE ANNUELLE",
    plasticBottles: "bouteilles en plastique",
    plasticWaste: "de d\u00e9chets plastiques",
    co2Footer: "empreinte carbone de la production et du transport",
    plasticWasteLabel: "D\u00e9chets plastiques",
    co2Label: "\u00c9missions de CO\u2082",
    bottlesLabel: "Bouteilles en d\u00e9charge",
    switchMsg: "\uD83C\uDF3F Passer \u00e0 l\u2019eau filtr\u00e9e \u00e9limine 100\u00a0% de ces d\u00e9chets plastiques.",
    switchMsgStrong: "100\u00a0%",
    walletHeader: "\uD83D\uDCB0 VOS CO\u00dbTS EN EAU",
    annualSpend: "D\u00e9penses annuelles en eau embouteill\u00e9e",
    perBottle: function(price) { return "\u00e0 " + price + "\u00a0$ par bouteille de 500\u00a0ml"; },
    fiveYear: "Comparaison sur 5 ans",
    fiveYearCost: "Co\u00fbt total sur 5 ans",
    save: function(amt, pct) { return "\u00c9conomisez " + amt + "\u00a0$ (" + pct + "\u00a0%)"; },
    vsBottled: function(amt) { return "contre " + amt + "\u00a0$ d\u2019eau en bouteille sur 5 ans"; },
    tapSaving: "Vous \u00e9conomisez avec l\u2019eau du robinet\u00a0!",
    tapSavingDesc: "Un syst\u00e8me AlkaFlow ajoute filtration + min\u00e9raux alcalins pour quelques sous par jour \u2014 \u00e0 partir de seulement 0,25\u00a0$/jour.",
    tapSavingStrong: "0,25\u00a0$/jour",
    showSolution: "Montrez-moi la solution \uD83D\uDCA7",
    adjustInputs: "\u2190 Modifier mes donn\u00e9es",
    solutionTitle: "De l\u2019eau pure, une solution simple",
    solutionDesc: "Un syst\u00e8me AlkaFlow \u00e9limine jusqu\u2019\u00e0 99\u00a0% des contaminants tout en ajoutant des min\u00e9raux alcalins b\u00e9n\u00e9fiques \u00e0 votre eau.",
    trusted: "Approuv\u00e9 par les Canadiens depuis 2010",
    recommendedFor: "Recommand\u00e9 pour votre foyer",
    bestFit: "\u2605 MEILLEUR CHOIX",
    viewProduct: "Voir le produit \u2192",
    filterInfo: function(cost, months, perDay) { return "Remplacement du filtre : " + cost + "\u00a0$ toutes les " + months + " mois \u00b7 ~" + perDay + "\u00a0$/jour"; },
    myResults: "\u2190 Mes r\u00e9sultats",
    startOver: "Recommencer",
    saleBadge: "SOLDE",
    footerTagline: "Votre sant\u00e9 passe avant tout",
    shopAll: "Boutique",
    shopAllUrl: "https://aquahealthproducts.com/fr/boutique/",
    shopPitcher: "Pichet AlkaFlow\u2122",
    shopPitcherUrl: "https://aquahealthproducts.com/fr/produit/alkaflow-pichet-eau-alcaline/",
    shopDispenser: "Distributeur AlkaFlow\u2122",
    shopDispenserUrl: "https://aquahealthproducts.com/fr/produit/alkaflow-distributeur-eau-alcaline/",
    footerNote: "Solutions d\u2019eau saine depuis 2010",
  },
};

const BOTTLE_PRICE_CAD = 1.75;
const BOTTLE_ML = 500;
const BOTTLE_WEIGHT_G = 12.7;
const CO2_PER_BOTTLE_G = 82.8;

function AnimatedNumber({ value, suffix = "", prefix = "", decimals = 0, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const startTime = useRef(null);

  useEffect(() => {
    startTime.current = null;
    const animate = (ts) => {
      if (!startTime.current) startTime.current = ts;
      const progress = Math.min((ts - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);

  const formatted = display >= 1000
    ? Math.round(display).toLocaleString()
    : decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString();

  return <span>{prefix}{formatted}{suffix}</span>;
}

function ContaminantBar({ name, icon, annual, unit, color, removed, animate, lang, t }) {
  const [open, setOpen] = useState(false);
  const info = lang === "fr" ? CONTAMINANT_INFO_FR[name] : CONTAMINANT_INFO[name];
  const displayName = lang === "fr" ? FR_NAMES[name] : name;
  const displayUnit = (unit === "particles" && lang === "fr") ? "particules" : unit;

  const maxVal = name === "Microplastics" ? 200000 : name === "Pharmaceuticals" ? 25000 : name === "Chloroform (THMs)" ? 8000 : name === "Chlorine" ? 1000 : 5000;
  const pct = Math.min((annual / maxVal) * 100, 100);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#003764", fontFamily: "'DM Sans', sans-serif" }}>
          {icon} {displayName}
        </span>
        <span style={{ fontSize: 13, color: "#69727d", fontFamily: "'DM Mono', monospace" }}>
          {annual >= 1000 ? Math.round(annual).toLocaleString() : annual.toFixed(1)} {displayUnit}/yr
        </span>
      </div>
      <div style={{ height: 10, background: "#e4eef6", borderRadius: 5, overflow: "hidden", position: "relative" }}>
        <div style={{
          height: "100%",
          width: animate ? `${pct}%` : "0%",
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 5,
          transition: "width 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
        }} />
      </div>
      <div style={{ fontSize: 11, color: "#003764", marginTop: 2, fontWeight: 600 }}>
        {t.removedPct(removed)}
      </div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: "none", border: "none", color: "#03bfac", fontSize: 11,
          fontWeight: 700, cursor: "pointer", padding: "2px 0", marginTop: 2,
          fontFamily: "'DM Sans', sans-serif", display: "block",
        }}
      >
        {open ? t.learnLess : t.learnMore}
      </button>
      {open && info && (
        <div style={{
          marginTop: 8, borderLeft: "3px solid #03bfac",
          background: "#f0faf9", borderRadius: "0 8px 8px 0", padding: "10px 12px",
        }}>
          <p style={{ fontSize: 12, color: "#2a5a4a", marginBottom: 6, lineHeight: 1.5, margin: "0 0 6px" }}>
            <strong>{t.whatItIs}</strong> {info.what}
          </p>
          <p style={{ fontSize: 12, color: "#2a5a4a", marginBottom: 6, lineHeight: 1.5, margin: "0 0 6px" }}>
            <strong>{t.howEnters}</strong> {info.howEnters}
          </p>
          <div style={{ fontSize: 12, color: "#2a5a4a", marginBottom: 6 }}>
            <strong>{t.healthEffects}</strong>
            <ul style={{ paddingLeft: 16, marginTop: 4, marginBottom: 0 }}>
              {info.effects.map((e, i) => (
                <li key={i} style={{ marginBottom: 3, lineHeight: 1.4 }}>{e}</li>
              ))}
            </ul>
          </div>
          <div style={{ fontSize: 11, color: "#3a6a5a", marginBottom: 4 }}>
            <strong>{t.epaLimit}</strong> {info.epaLimit}
          </div>
          <div style={{ fontSize: 11, color: "#3a6a5a", marginBottom: 4 }}>
            <strong>{t.hcLimit}</strong> {info.healthCanadaLimit}
          </div>
          <div style={{ fontSize: 11, color: "#3a6a5a", marginBottom: 6 }}>
            <strong>{t.mostVulnerable}</strong> {info.vulnerable}
          </div>
          <div style={{ fontSize: 11, color: "#69727d" }}>
            {t.sources}{" "}
            {info.citations.map((id, i) => {
              const ref = REFERENCES.find(r => r.id === id);
              return ref ? (
                <span key={id}>
                  <a href={ref.url} target="_blank" rel="noopener noreferrer"
                     style={{ color: "#0170b9", textDecoration: "underline" }}>
                    [{id}]
                  </a>
                  {i < info.citations.length - 1 ? " " : ""}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function JarVisualization({ fillPercent, label, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 64, height: 88, borderRadius: "4px 4px 12px 12px",
        border: `2.5px solid ${color}44`, position: "relative", overflow: "hidden",
        background: "#fff",
      }}>
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: `${Math.min(fillPercent, 100)}%`,
          background: `linear-gradient(180deg, ${color}55, ${color}cc)`,
          transition: "height 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }} />
        <div style={{
          position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)",
          width: 36, height: 10, background: color + "33",
          borderRadius: "2px 2px 0 0", border: `2px solid ${color}44`,
          borderBottom: "none",
        }} />
      </div>
      <span style={{ fontSize: 10, color: "#69727d", textAlign: "center", fontWeight: 600, lineHeight: 1.2, maxWidth: 72 }}>{label}</span>
    </div>
  );
}

function WaterRealityCheck() {
  const [step, setStep] = useState(0);
  const [householdSize, setHouseholdSize] = useState(2);
  const [waterPerDay, setWaterPerDay] = useState(2.0);
  const [waterSource, setWaterSource] = useState(null);
  const [bottledPct, setBottledPct] = useState(50);
  const [activeTab, setActiveTab] = useState("health");
  const [animate, setAnimate] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showRefs, setShowRefs] = useState(false);
  const [lang, setLang] = useState("en");

  const t = STRINGS[lang];
  const products = lang === "fr" ? PRODUCTS_FR : PRODUCTS;

  useEffect(() => {
    if (step === 2) {
      setTimeout(() => setAnimate(true), 200);
    }
  }, [step]);

  const totalLitersPerDay = waterPerDay * householdSize;
  const totalLitersPerYear = totalLitersPerDay * 365;

  const bottledFraction = waterSource === "bottled" ? 1 : waterSource === "tap" ? 0 : bottledPct / 100;
  const tapFraction = 1 - bottledFraction;

  const annualBottles = Math.round((totalLitersPerYear * bottledFraction) / (BOTTLE_ML / 1000));
  const annualBottleCost = annualBottles * BOTTLE_PRICE_CAD;
  const annualPlasticKg = (annualBottles * BOTTLE_WEIGHT_G) / 1000;
  const annualCO2Kg = (annualBottles * CO2_PER_BOTTLE_G) / 1000;

  const canProceedStep1 = waterSource !== null;

  const sourceOptions = t.sourceOptions;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(170deg, #f1f9fd 0%, #E6F1F7 40%, #f9fafc 100%)",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative bg */}
      <div style={{ position: "absolute", top: -120, right: -120, width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle, #0170b9, transparent 70%)", pointerEvents: "none", opacity: 0.04 }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, #0170b9, transparent 70%)", pointerEvents: "none", opacity: 0.04 }} />

      {/* Top Banner */}
      <div style={{
        background: "#003764",
        padding: "9px 24px",
        textAlign: "center",
        fontSize: 13,
        color: "#ffffff",
        fontWeight: 500,
        letterSpacing: 0.3,
      }}>
        <strong>{t.bannerStrong}</strong>{t.bannerRest}
      </div>

      {/* Header */}
      <div style={{ padding: "20px 24px 0", textAlign: "center", background: "#fff", borderBottom: "1px solid #e2e8f0", position: "relative" }}>
        {/* EN/FR Toggle */}
        <div style={{ position: "absolute", right: 16, top: 16, display: "flex", gap: 4 }}>
          {["en", "fr"].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              padding: "4px 10px", borderRadius: 6, border: "1px solid #e2e8f0",
              background: lang === l ? "#003764" : "#f1f9fd",
              color: lang === l ? "#fff" : "#003764",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.3s ease",
            }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <a href="https://aquahealthproducts.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
          <img
            src="https://aquahealthproducts.com/wp-content/uploads/2023/05/logo-aqua.svg"
            alt="Aqua Health Products"
            style={{ height: 40, width: "auto", display: "block", margin: "0 auto" }}
          />
        </a>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28, fontWeight: 800, color: "#003764",
          lineHeight: 1.15, margin: "12px 0 6px",
          whiteSpace: "pre-line",
        }}>
          {t.title}
        </h1>
        <p style={{ fontSize: 14, color: "#69727d", margin: "0 0 16px", lineHeight: 1.5, maxWidth: 320, marginInline: "auto" }}>
          {t.subtitle}
        </p>
      </div>

      {/* Progress */}
      <div style={{ display: "flex", gap: 6, padding: "20px 32px 0", justifyContent: "center" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            height: 4, flex: 1, maxWidth: 80, borderRadius: 2,
            background: step >= i ? "#0170b9" : "#e7e7e7",
            transition: "background 0.5s ease",
          }} />
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 11, color: "#69727d", marginTop: 6, fontWeight: 600 }}>
        {t.stepOf(step + 1)}
      </div>

      {/* Content */}
      <div style={{ padding: "20px 20px 32px", maxWidth: 440, margin: "0 auto" }}>

        {/* STEP 0: Household */}
        {step === 0 && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            <div style={cardStyle}>
              <label style={labelStyle}>{t.householdQ}</label>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, margin: "16px 0" }}>
                <button onClick={() => setHouseholdSize(Math.max(1, householdSize - 1))} style={roundBtnStyle}>−</button>
                <span style={{ fontSize: 42, fontWeight: 800, color: "#003764", fontFamily: "'DM Mono', monospace", minWidth: 48, textAlign: "center" }}>
                  {householdSize}
                </span>
                <button onClick={() => setHouseholdSize(Math.min(10, householdSize + 1))} style={roundBtnStyle}>+</button>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 4 }}>
                {Array.from({ length: householdSize }).map((_, i) => (
                  <span key={i} style={{ fontSize: 22 }}>{i === 0 ? "\uD83E\uDDD1" : i < 3 ? "\uD83D\uDC64" : "\uD83D\uDC76"}</span>
                ))}
              </div>
            </div>

            <div style={cardStyle}>
              <label style={labelStyle}>{t.waterIntakeQ}</label>
              <div style={{ textAlign: "center", margin: "12px 0 4px" }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: "#003764", fontFamily: "'DM Mono', monospace" }}>
                  {waterPerDay.toFixed(1)}
                </span>
                <span style={{ fontSize: 14, color: "#69727d", marginLeft: 4 }}>{t.litresDay}</span>
              </div>
              <input
                type="range" min={0.5} max={5} step={0.1} value={waterPerDay}
                onChange={e => setWaterPerDay(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#003764", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#69727d", marginTop: 2 }}>
                <span>0.5L</span>
                <span style={{ color: "#003764", fontWeight: 600 }}>{t.recommended}</span>
                <span>5.0L</span>
              </div>
            </div>

            <button onClick={() => setStep(1)} style={primaryBtnStyle}>
              {t.next}
            </button>
          </div>
        )}

        {/* STEP 1: Water source */}
        {step === 1 && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            <div style={cardStyle}>
              <label style={labelStyle}>{t.sourceQ}</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                {sourceOptions.map(opt => (
                  <button key={opt.id} onClick={() => setWaterSource(opt.id)} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                    border: waterSource === opt.id ? "2px solid #0170b9" : "1px solid #e2e8f0",
                    borderRadius: 10, background: waterSource === opt.id ? "#E6F1F7" : "#fff",
                    cursor: "pointer", transition: "all 0.2s ease", textAlign: "left",
                  }}>
                    <span style={{ fontSize: 28 }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: "#003764", fontSize: 15 }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: "#69727d" }}>{opt.desc}</div>
                    </div>
                    {waterSource === opt.id && <span style={{ marginLeft: "auto", color: "#0170b9", fontSize: 20 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {waterSource === "mix" && (
              <div style={cardStyle}>
                <label style={labelStyle}>{t.bottledPctQ}</label>
                <div style={{ textAlign: "center", margin: "8px 0" }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: "#003764", fontFamily: "'DM Mono', monospace" }}>{bottledPct}%</span>
                  <span style={{ fontSize: 13, color: "#69727d" }}> {t.bottledLabel}</span>
                  <span style={{ fontSize: 13, color: "#69727d", marginLeft: 8 }}>{100 - bottledPct}% {t.tapLabel}</span>
                </div>
                <input
                  type="range" min={10} max={90} step={5} value={bottledPct}
                  onChange={e => setBottledPct(parseInt(e.target.value))}
                  style={{ width: "100%", accentColor: "#003764" }}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(0)} style={{ ...secondaryBtnStyle, flex: 1 }}>{t.back}</button>
              <button onClick={() => { if (canProceedStep1) setStep(2); }} style={{ ...primaryBtnStyle, flex: 2, opacity: canProceedStep1 ? 1 : 0.4, pointerEvents: canProceedStep1 ? "auto" : "none" }}>
                {t.seeResults}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Results */}
        {step === 2 && !showSolution && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            {/* Summary stat */}
            <div style={{
              ...cardStyle,
              background: "linear-gradient(135deg, #003764 0%, #0170b9 100%)",
              color: "#fff", textAlign: "center",
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: "#32B4E4", textTransform: "uppercase", marginBottom: 8 }}>
                {t.householdAnnually}
              </div>
              <div style={{ fontSize: 44, fontWeight: 800, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>
                <AnimatedNumber value={totalLitersPerYear} suffix=" L" />
              </div>
              <div style={{ fontSize: 13, color: "#b0d4e8", marginTop: 4 }}>
                {t.waterPerYear}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "#E6F1F7", borderRadius: 10, padding: 4 }}>
              {[
                { id: "health", label: t.tabHealth, color: "#d4644a" },
                { id: "planet", label: t.tabPlanet, color: "#2ecc71" },
                { id: "wallet", label: t.tabWallet, color: "#e8c84a" },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  flex: 1, padding: "10px 4px", border: "none", borderRadius: 8, cursor: "pointer",
                  background: activeTab === tab.id ? "#fff" : "transparent",
                  color: activeTab === tab.id ? "#003764" : "#69727d",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                  boxShadow: activeTab === tab.id ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                  transition: "all 0.3s ease",
                }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Health Tab */}
            {activeTab === "health" && (
              <div style={{ ...cardStyle, animation: "fadeUp 0.3s ease" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#d4644a", marginBottom: 4, letterSpacing: 0.5 }}>
                  {t.contaminantHeader}
                </div>
                <p style={{ fontSize: 12, color: "#69727d", margin: "0 0 16px", lineHeight: 1.5 }}>
                  {t.contaminantDesc(totalLitersPerDay.toFixed(1), householdSize).split(t.contaminantDescStrong)[0]}
                  <strong style={{ color: "#03bfac" }}>{t.contaminantDescStrong}</strong>
                  {t.contaminantDesc(totalLitersPerDay.toFixed(1), householdSize).split(t.contaminantDescStrong)[1]}
                </p>
                {CONTAMINANTS.map(c => (
                  <ContaminantBar
                    key={c.name} {...c}
                    annual={c.dailyPerLiter * totalLitersPerDay * tapFraction * 365}
                    animate={animate}
                    lang={lang}
                    t={t}
                  />
                ))}
                <div style={{
                  marginTop: 16, padding: 14, background: "#fef6f0", borderRadius: 10,
                  border: "1px solid #f5d5c5", fontSize: 13, color: "#8a5a3a", lineHeight: 1.6,
                }}>
                  {t.disclaimer}
                </div>

                {/* References section */}
                <div style={{ marginTop: 20, borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
                  <button
                    onClick={() => setShowRefs(r => !r)}
                    style={{
                      background: "none", border: "none", cursor: "pointer", fontSize: 12,
                      color: "#69727d", fontWeight: 600, padding: 0,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {showRefs ? t.refsToggleHide : t.refsToggleShow}
                  </button>
                  {showRefs && (
                    <ol style={{ paddingLeft: 20, marginTop: 10, marginBottom: 0 }}>
                      {REFERENCES.map(ref => (
                        <li key={ref.id} style={{ fontSize: 11, color: "#69727d", marginBottom: 5, lineHeight: 1.5 }}>
                          <a href={ref.url} target="_blank" rel="noopener noreferrer"
                             style={{ color: "#0170b9", textDecoration: "underline" }}>
                            {ref.org} \u2014 {ref.title}
                          </a>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            )}

            {/* Planet Tab */}
            {activeTab === "planet" && (
              <div style={{ ...cardStyle, animation: "fadeUp 0.3s ease" }}>
                {bottledFraction === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#003764" }}>{t.noBottled}</div>
                    <p style={{ fontSize: 13, color: "#69727d", marginTop: 8, lineHeight: 1.5 }}>
                      {t.noBottledDesc}
                    </p>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1a8a5a", marginBottom: 16, letterSpacing: 0.5 }}>
                      {t.plasticFootprint}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                      <div style={statBoxStyle}>
                        <div style={{ fontSize: 32, fontWeight: 800, color: "#003764", fontFamily: "'DM Mono', monospace" }}>
                          <AnimatedNumber value={annualBottles} />
                        </div>
                        <div style={{ fontSize: 12, color: "#69727d", fontWeight: 600 }}>{t.plasticBottles}</div>
                      </div>
                      <div style={statBoxStyle}>
                        <div style={{ fontSize: 32, fontWeight: 800, color: "#003764", fontFamily: "'DM Mono', monospace" }}>
                          <AnimatedNumber value={annualPlasticKg} suffix=" kg" decimals={1} />
                        </div>
                        <div style={{ fontSize: 12, color: "#69727d", fontWeight: 600 }}>{t.plasticWaste}</div>
                      </div>
                    </div>
                    <div style={statBoxStyle}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "#d4644a", fontFamily: "'DM Mono', monospace" }}>
                        <AnimatedNumber value={annualCO2Kg} suffix=" kg CO\u2082" decimals={1} />
                      </div>
                      <div style={{ fontSize: 12, color: "#69727d", fontWeight: 600 }}>{t.co2Footer}</div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 20 }}>
                      <JarVisualization fillPercent={animate ? Math.min((annualPlasticKg / 15) * 100, 100) : 0} label={t.plasticWasteLabel} color="#e67e22" />
                      <JarVisualization fillPercent={animate ? Math.min((annualCO2Kg / 200) * 100, 100) : 0} label={t.co2Label} color="#d4644a" />
                      <JarVisualization fillPercent={animate ? Math.min((annualBottles / 2000) * 100, 100) : 0} label={t.bottlesLabel} color="#9b59b6" />
                    </div>

                    <div style={{
                      marginTop: 20, padding: 14, background: "#f1f9fd", borderRadius: 10,
                      border: "1px solid #e2e8f0", fontSize: 13, color: "#2a5a7a", lineHeight: 1.6, textAlign: "center",
                    }}>
                      {t.switchMsg.split(t.switchMsgStrong)[0]}<strong>{t.switchMsgStrong}</strong>{t.switchMsg.split(t.switchMsgStrong)[1]}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Wallet Tab */}
            {activeTab === "wallet" && (
              <div style={{ ...cardStyle, animation: "fadeUp 0.3s ease" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#b8860b", marginBottom: 16, letterSpacing: 0.5 }}>
                  {t.walletHeader}
                </div>
                {bottledFraction > 0 ? (
                  <>
                    <div style={{ ...statBoxStyle, background: "#fef9f0", border: "1px solid #f0ddb5" }}>
                      <div style={{ fontSize: 12, color: "#a08040", fontWeight: 600, marginBottom: 4 }}>{t.annualSpend}</div>
                      <div style={{ fontSize: 38, fontWeight: 800, color: "#b8860b", fontFamily: "'DM Mono', monospace" }}>
                        <AnimatedNumber value={annualBottleCost} prefix="$" decimals={0} />
                      </div>
                      <div style={{ fontSize: 12, color: "#a08040" }}>
                        {t.perBottle(BOTTLE_PRICE_CAD.toFixed(2))}
                      </div>
                    </div>

                    <div style={{ marginTop: 16, fontSize: 14, fontWeight: 700, color: "#003764", marginBottom: 10 }}>
                      {t.fiveYear}
                    </div>
                    {products.map(p => {
                      const fiveYearFilter = (60 / p.filterMonths) * p.filterCost;
                      const fiveYearTotal = p.price + fiveYearFilter;
                      const fiveYearBottled = annualBottleCost * 5;
                      const savings = fiveYearBottled - fiveYearTotal;
                      const savingsPct = ((savings / fiveYearBottled) * 100).toFixed(0);
                      return (
                        <div key={p.name} style={{
                          padding: 14, background: "#f9fafc", borderRadius: 10,
                          border: "1px solid #e2e8f0", marginBottom: 10,
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#003764" }}>{p.name}</span>
                              {p.sale && <span style={{ fontSize: 10, background: "#d4644a", color: "#fff", padding: "2px 6px", borderRadius: 4, marginLeft: 6, fontWeight: 700 }}>{t.saleBadge}</span>}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#003764", fontFamily: "'DM Mono', monospace" }}>
                              ${fiveYearTotal.toFixed(0)}
                            </span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "#69727d" }}>
                            <span>{t.fiveYearCost}</span>
                            {savings > 0 && <span style={{ color: "#0170b9", fontWeight: 700 }}>{t.save(savings.toFixed(0), savingsPct)}</span>}
                          </div>
                          {savings > 0 && (
                            <div style={{ marginTop: 8, height: 6, background: "#e4eef6", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{
                                height: "100%", borderRadius: 3,
                                width: animate ? `${Math.min((fiveYearTotal / fiveYearBottled) * 100, 100)}%` : "0%",
                                background: "#0170b9",
                                transition: "width 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
                              }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div style={{ textAlign: "center", fontSize: 12, color: "#69727d", marginTop: 8 }}>
                      {t.vsBottled((annualBottleCost * 5).toLocaleString())}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>🚰</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#003764" }}>{t.tapSaving}</div>
                    <p style={{ fontSize: 13, color: "#69727d", marginTop: 8, lineHeight: 1.5 }}>
                      {t.tapSavingDesc.split(t.tapSavingStrong)[0]}<strong>{t.tapSavingStrong}</strong>{t.tapSavingDesc.split(t.tapSavingStrong)[1]}
                    </p>
                  </div>
                )}
              </div>
            )}

            <button onClick={() => setShowSolution(true)} style={{ ...primaryBtnStyle }}>
              {t.showSolution}
            </button>
            <button onClick={() => { setStep(1); setAnimate(false); }} style={secondaryBtnStyle}>
              {t.adjustInputs}
            </button>
          </div>
        )}

        {/* STEP 2b: Solution / Product Recommendations */}
        {step === 2 && showSolution && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            <div style={{
              ...cardStyle, textAlign: "center",
              background: "linear-gradient(135deg, #003764 0%, #0170b9 100%)",
              color: "#fff",
            }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✨</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                {t.solutionTitle}
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "#b0d4e8", margin: 0 }}>
                {t.solutionDesc}
              </p>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12,
                padding: "6px 14px", background: "rgba(255,255,255,0.15)",
                borderRadius: 20, fontSize: 11, color: "#c5daf0", fontWeight: 600,
              }}>
                {t.trusted}
              </div>
            </div>

            <div style={{ fontSize: 14, fontWeight: 700, color: "#003764", marginBottom: 12 }}>
              {t.recommendedFor}
            </div>

            {products.map((p, i) => {
              const isRecommended =
                (householdSize <= 2 && i === 0) ||
                (householdSize <= 4 && householdSize > 2 && i === 1) ||
                (householdSize > 4 && i === 2);
              return (
                <div key={p.name} style={{
                  ...cardStyle,
                  border: isRecommended ? "2px solid #0170b9" : "1px solid #e2e8f0",
                  position: "relative",
                  marginBottom: 14,
                }}>
                  {isRecommended && (
                    <div style={{
                      position: "absolute", top: -10, left: 16, background: "#0170b9", color: "#fff",
                      fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 6, letterSpacing: 0.5,
                    }}>
                      {t.bestFit}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <img src={p.img} alt={p.name} style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 8, background: "#f1f9fd", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "#003764", fontSize: 15 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "#69727d", lineHeight: 1.4, marginTop: 2 }}>{p.desc}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <div>
                      {p.sale && <span style={{ fontSize: 13, color: "#999", textDecoration: "line-through", marginRight: 6 }}>${p.origPrice}</span>}
                      <span style={{ fontSize: 22, fontWeight: 800, color: "#003764", fontFamily: "'DM Mono', monospace" }}>${p.price}</span>
                    </div>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" style={{
                      padding: "10px 20px", background: isRecommended ? "#0170b9" : "#f1f9fd",
                      color: isRecommended ? "#fff" : "#003764", border: "none", borderRadius: 8,
                      fontWeight: 700, fontSize: 13, textDecoration: "none", cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                      {t.viewProduct}
                    </a>
                  </div>
                  <div style={{ fontSize: 11, color: "#69727d", marginTop: 8 }}>
                    {t.filterInfo(p.filterCost, p.filterMonths, (p.filterCost / (p.filterMonths * 30)).toFixed(2))}
                  </div>
                </div>
              );
            })}

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={() => setShowSolution(false)} style={{ ...secondaryBtnStyle, flex: 1 }}>{t.myResults}</button>
              <button onClick={() => { setStep(0); setAnimate(false); setShowSolution(false); setWaterSource(null); }} style={{ ...secondaryBtnStyle, flex: 1 }}>
                {t.startOver}
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid #e2e8f0",
        padding: "24px 24px 32px",
        textAlign: "center",
        background: "#fff",
      }}>
        <a href="https://aquahealthproducts.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
          <img
            src="https://aquahealthproducts.com/wp-content/uploads/2023/05/logo-aqua.svg"
            alt="Aqua Health Products"
            style={{ height: 32, width: "auto", display: "block", margin: "0 auto 4px" }}
          />
        </a>
        <div style={{ fontSize: 12, color: "#69727d", marginBottom: 12, fontStyle: "italic" }}>
          {t.footerTagline}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 12, flexWrap: "wrap" }}>
          <a href={t.shopAllUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#003764", textDecoration: "none", fontWeight: 600 }}>{t.shopAll}</a>
          <a href={t.shopPitcherUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#003764", textDecoration: "none", fontWeight: 600 }}>{t.shopPitcher}</a>
          <a href={t.shopDispenserUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#003764", textDecoration: "none", fontWeight: 600 }}>{t.shopDispenser}</a>
        </div>
        <div style={{ fontSize: 11, color: "#69727d" }}>
          {t.footerNote}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input[type="range"] {
          -webkit-appearance: none;
          height: 6px;
          border-radius: 3px;
          background: #e7e7e7;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #0170b9;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(1,112,185,0.3);
        }
        button:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  borderRadius: 10,
  padding: "20px",
  marginBottom: 14,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  border: "1px solid #e2e8f0",
};

const labelStyle = {
  fontSize: 14,
  fontWeight: 700,
  color: "#003764",
  display: "block",
  marginBottom: 4,
};

const roundBtnStyle = {
  width: 44, height: 44, borderRadius: "50%",
  border: "2px solid #003764", background: "#f1f9fd",
  color: "#003764", fontSize: 22, fontWeight: 700,
  cursor: "pointer", display: "flex", alignItems: "center",
  justifyContent: "center", fontFamily: "'DM Mono', monospace",
};

const primaryBtnStyle = {
  width: "100%", padding: "15px", border: "none", borderRadius: 8,
  background: "#0170b9",
  color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif", marginBottom: 10,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  transition: "all 0.3s ease",
};

const secondaryBtnStyle = {
  width: "100%", padding: "13px", border: "1px solid #e2e8f0",
  borderRadius: 8, background: "#f1f9fd", color: "#003764",
  fontSize: 14, fontWeight: 600, cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif", marginBottom: 8,
  transition: "all 0.3s ease",
};

const statBoxStyle = {
  textAlign: "center", padding: 16, background: "#f9fafc",
  borderRadius: 10, border: "1px solid #e2e8f0",
};
