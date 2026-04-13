const { useState, useEffect, useRef } = React;

const CONTAMINANTS = [
  { name: "Chlorine", unit: "mg", dailyPerLiter: 0.8, icon: "🧪", color: "#e8c84a", removed: 99 },
  { name: "Lead", unit: "μg", dailyPerLiter: 3.8, icon: "⚠️", color: "#d4644a", removed: 99 },
  { name: "Microplastics", unit: "particles", dailyPerLiter: 325, icon: "🔬", color: "#9b59b6", removed: 95 },
  { name: "Chloroform (THMs)", unit: "μg", dailyPerLiter: 16, icon: "☁️", color: "#7f8c8d", removed: 98 },
  { name: "Pharmaceuticals", unit: "ng", dailyPerLiter: 52, icon: "💊", color: "#e67e22", removed: 90 },
  { name: "Heavy Metals", unit: "μg", dailyPerLiter: 8.5, icon: "🪨", color: "#95a5a6", removed: 97 },
];

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
    healthCanadaLimit: "Aesthetic objective ≤ 0.5 mg/L; no health-based MAC at typical levels",
    vulnerable: "Infants, people with asthma or reactive airway conditions",
    citations: [3, 7],
  },
  "Lead": {
    what: "A toxic heavy metal that leaches from aging pipes, solder joints, and plumbing fixtures — not from the water source itself.",
    howEnters: "Corroding lead service lines and pre-1986 household plumbing release lead into stagnant water; highest risk first thing in the morning.",
    effects: [
      "Irreversible neurological damage and IQ loss in children — no safe exposure level has been identified",
      "Learning disabilities, attention deficits, and behavioral disorders",
      "Kidney damage and elevated blood pressure in adults",
      "Developmental harm at blood lead levels previously considered safe",
    ],
    epaLimit: "Action Level 15 μg/L — utilities must act when exceeded in ≥10% of sampled homes",
    healthCanadaLimit: "MAC 5 μg/L (Health Canada 2019; interim target toward 1 μg/L)",
    vulnerable: "Children under 6 (developing nervous system), infants, pregnant women",
    citations: [1, 2, 3],
  },
  "Microplastics": {
    what: "Particles smaller than 5 mm derived from the breakdown of plastic products, synthetic textiles, and industrial processes.",
    howEnters: "Atmospheric deposition into surface water, runoff, degradation inside plastic pipes, and leaching from plastic water bottles — notably, bottled water contains significantly higher microplastic concentrations than tap water.",
    effects: [
      "Carry adsorbed pollutants (pesticides, heavy metals, plasticizers) into the body",
      "Potential endocrine disruption from phthalates and BPA residues",
      "Inflammatory response in the gastrointestinal tract",
      "Long-term systemic effects under active research — microplastics detected in blood, lungs, and organs",
    ],
    epaLimit: "No federal MCL established; designated as a priority contaminant for regulatory action in 2026",
    healthCanadaLimit: "No MAC established; under monitoring review",
    vulnerable: "Infants (formula reconstituted in warm water), heavy bottled water consumers",
    citations: [4, 5, 6],
  },
  "Chloroform (THMs)": {
    what: "Trihalomethanes (THMs) — including chloroform, bromodichloromethane, and bromoform — are disinfection byproducts formed when chlorine reacts with natural organic matter in water.",
    howEnters: "Form in-pipe during disinfection when chlorine contacts decaying leaves, algae, and humic acids in source water; also absorbed through skin and inhaled during hot showers.",
    effects: [
      "Classified as probable human carcinogens (Group B2) by the EPA; bromodichloromethane has an MCLG of zero",
      "Long-term exposure associated with increased bladder and colorectal cancer risk",
      "Liver and kidney toxicity at elevated concentrations",
      "Inhalation and dermal absorption during bathing can exceed oral ingestion as an exposure route",
    ],
    epaLimit: "Total THMs: 80 μg/L (Stage 2 Disinfectants and Disinfection Byproducts Rule)",
    healthCanadaLimit: "MAC 100 μg/L total THMs",
    vulnerable: "Pregnant women (elevated miscarriage and cardiac defect risk at high levels), long-duration shower users",
    citations: [3, 7, 8],
  },
  "Pharmaceuticals": {
    what: "Trace residues of prescription and over-the-counter medications — antibiotics, synthetic hormones, antidepressants, and anti-inflammatories — detected in municipal tap water.",
    howEnters: "Excreted by humans and animals, enter wastewater streams, pass through treatment plants not designed to remove them, and re-enter drinking water sources via surface and groundwater.",
    effects: [
      "Endocrine disruption from synthetic estrogens — associated with feminization in aquatic species at detected concentrations",
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
    what: "Includes arsenic, cadmium, chromium-6, and mercury — naturally occurring in geological formations or released by industrial activities.",
    howEnters: "Natural leaching from mineral-rich bedrock, industrial discharge, agricultural runoff, and aging distribution infrastructure.",
    effects: [
      "Arsenic (IARC Group 1 carcinogen): elevated risk of bladder, lung, and skin cancers with chronic exposure",
      "Cadmium: accumulates in kidneys causing progressive renal damage and bone density loss",
      "Chromium-6: linked to gastrointestinal cancers in high-exposure populations",
      "Bioaccumulate over a lifetime — effects are dose-dependent and cumulative",
    ],
    epaLimit: "Arsenic MCL 10 μg/L; other metals regulated individually (see EPA National Primary Drinking Water Regulations)",
    healthCanadaLimit: "Arsenic MAC 10 μg/L; cadmium 5 μg/L; other metals regulated separately",
    vulnerable: "Children (developing systems), people with impaired kidney function, pregnant women",
    citations: [3, 11, 12, 13],
  },
};

const PRODUCTS = [
  { name: "AlkaFlow™ Pitcher", price: 89.99, filterCost: 35, filterMonths: 3, litersPerDay: 4, url: "https://aquahealthproducts.com/product/alkaflow-alkaline-water-pitcher/", desc: "Perfect for 1–2 people. Portable, no installation needed.", img: "🫗" },
  { name: "AlkaFlow™ Dispenser", price: 199.99, filterCost: 45, filterMonths: 6, litersPerDay: 12, url: "https://aquahealthproducts.com/product/alkaflow-dispenser-alkaline-water/", desc: "Ideal for families. High capacity, countertop convenience.", img: "🚰", sale: true, origPrice: 269.99 },
  { name: "AQUA Coldstream 12L", price: 399.95, filterCost: 65, filterMonths: 12, litersPerDay: 20, url: "https://aquahealthproducts.com/product/aqua-coldstream-12l/", desc: "Premium gravity purification. No electricity or plumbing needed.", img: "💧" },
];

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

function ContaminantBar({ name, icon, annual, unit, color, removed, animate }) {
  const [open, setOpen] = useState(false);
  const info = CONTAMINANT_INFO[name];

  const maxVal = name === "Microplastics" ? 200000 : name === "Pharmaceuticals" ? 25000 : name === "Chloroform (THMs)" ? 8000 : name === "Chlorine" ? 1000 : 5000;
  const pct = Math.min((annual / maxVal) * 100, 100);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#003764", fontFamily: "'DM Sans', sans-serif" }}>
          {icon} {name}
        </span>
        <span style={{ fontSize: 13, color: "#69727d", fontFamily: "'DM Mono', monospace" }}>
          {annual >= 1000 ? Math.round(annual).toLocaleString() : annual.toFixed(1)} {unit}/yr
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
        AlkaFlow removes {removed}%
      </div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: "none", border: "none", color: "#03bfac", fontSize: 11,
          fontWeight: 700, cursor: "pointer", padding: "2px 0", marginTop: 2,
          fontFamily: "'DM Sans', sans-serif", display: "block",
        }}
      >
        {open ? "▲ Less" : "▼ Learn more"}
      </button>
      {open && info && (
        <div style={{
          marginTop: 8, borderLeft: "3px solid #03bfac",
          background: "#f0faf9", borderRadius: "0 8px 8px 0", padding: "10px 12px",
        }}>
          <p style={{ fontSize: 12, color: "#2a5a4a", marginBottom: 6, lineHeight: 1.5, margin: "0 0 6px" }}>
            <strong>What it is:</strong> {info.what}
          </p>
          <p style={{ fontSize: 12, color: "#2a5a4a", marginBottom: 6, lineHeight: 1.5, margin: "0 0 6px" }}>
            <strong>How it enters your water:</strong> {info.howEnters}
          </p>
          <div style={{ fontSize: 12, color: "#2a5a4a", marginBottom: 6 }}>
            <strong>Health effects:</strong>
            <ul style={{ paddingLeft: 16, marginTop: 4, marginBottom: 0 }}>
              {info.effects.map((e, i) => (
                <li key={i} style={{ marginBottom: 3, lineHeight: 1.4 }}>{e}</li>
              ))}
            </ul>
          </div>
          <div style={{ fontSize: 11, color: "#3a6a5a", marginBottom: 4 }}>
            <strong>EPA limit:</strong> {info.epaLimit}
          </div>
          <div style={{ fontSize: 11, color: "#3a6a5a", marginBottom: 4 }}>
            <strong>Health Canada limit:</strong> {info.healthCanadaLimit}
          </div>
          <div style={{ fontSize: 11, color: "#3a6a5a", marginBottom: 6 }}>
            <strong>Most vulnerable:</strong> {info.vulnerable}
          </div>
          <div style={{ fontSize: 11, color: "#69727d" }}>
            Sources:{" "}
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

  const sourceOptions = [
    { id: "tap", label: "Mostly Tap", icon: "🚰", desc: "Municipal or well water" },
    { id: "bottled", label: "Mostly Bottled", icon: "🧴", desc: "Store-bought bottles" },
    { id: "mix", label: "A Mix of Both", icon: "🔄", desc: "Some of each" },
  ];

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
        <strong>FREE SHIPPING</strong> on orders over $150
      </div>

      {/* Header */}
      <div style={{ padding: "20px 24px 0", textAlign: "center", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
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
        }}>
          Your Water<br />Reality Check
        </h1>
        <p style={{ fontSize: 14, color: "#69727d", margin: "0 0 16px", lineHeight: 1.5, maxWidth: 320, marginInline: "auto" }}>
          Discover what's really in your water — and what it costs you.
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
        Step {step + 1} of 3
      </div>

      {/* Content */}
      <div style={{ padding: "20px 20px 32px", maxWidth: 440, margin: "0 auto" }}>

        {/* STEP 0: Household */}
        {step === 0 && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            <div style={cardStyle}>
              <label style={labelStyle}>How many people in your household?</label>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, margin: "16px 0" }}>
                <button onClick={() => setHouseholdSize(Math.max(1, householdSize - 1))} style={roundBtnStyle}>−</button>
                <span style={{ fontSize: 42, fontWeight: 800, color: "#003764", fontFamily: "'DM Mono', monospace", minWidth: 48, textAlign: "center" }}>
                  {householdSize}
                </span>
                <button onClick={() => setHouseholdSize(Math.min(10, householdSize + 1))} style={roundBtnStyle}>+</button>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 4 }}>
                {Array.from({ length: householdSize }).map((_, i) => (
                  <span key={i} style={{ fontSize: 22 }}>{i === 0 ? "🧑" : i < 3 ? "👤" : "👶"}</span>
                ))}
              </div>
            </div>

            <div style={cardStyle}>
              <label style={labelStyle}>Daily water intake per person</label>
              <div style={{ textAlign: "center", margin: "12px 0 4px" }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: "#003764", fontFamily: "'DM Mono', monospace" }}>
                  {waterPerDay.toFixed(1)}
                </span>
                <span style={{ fontSize: 14, color: "#69727d", marginLeft: 4 }}>litres / day</span>
              </div>
              <input
                type="range" min={0.5} max={5} step={0.1} value={waterPerDay}
                onChange={e => setWaterPerDay(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#003764", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#69727d", marginTop: 2 }}>
                <span>0.5L</span>
                <span style={{ color: "#003764", fontWeight: 600 }}>Recommended: 2.0L</span>
                <span>5.0L</span>
              </div>
            </div>

            <button onClick={() => setStep(1)} style={primaryBtnStyle}>
              Next →
            </button>
          </div>
        )}

        {/* STEP 1: Water source */}
        {step === 1 && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            <div style={cardStyle}>
              <label style={labelStyle}>What's your primary water source?</label>
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
                <label style={labelStyle}>What percentage is bottled?</label>
                <div style={{ textAlign: "center", margin: "8px 0" }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: "#003764", fontFamily: "'DM Mono', monospace" }}>{bottledPct}%</span>
                  <span style={{ fontSize: 13, color: "#69727d" }}> bottled</span>
                  <span style={{ fontSize: 13, color: "#69727d", marginLeft: 8 }}>{100 - bottledPct}% tap</span>
                </div>
                <input
                  type="range" min={10} max={90} step={5} value={bottledPct}
                  onChange={e => setBottledPct(parseInt(e.target.value))}
                  style={{ width: "100%", accentColor: "#003764" }}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(0)} style={{ ...secondaryBtnStyle, flex: 1 }}>← Back</button>
              <button onClick={() => { if (canProceedStep1) setStep(2); }} style={{ ...primaryBtnStyle, flex: 2, opacity: canProceedStep1 ? 1 : 0.4, pointerEvents: canProceedStep1 ? "auto" : "none" }}>
                See My Results →
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
                Your household annually
              </div>
              <div style={{ fontSize: 44, fontWeight: 800, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>
                <AnimatedNumber value={totalLitersPerYear} suffix=" L" />
              </div>
              <div style={{ fontSize: 13, color: "#b0d4e8", marginTop: 4 }}>
                of water consumed per year
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "#E6F1F7", borderRadius: 10, padding: 4 }}>
              {[
                { id: "health", label: "🧪 Health", color: "#d4644a" },
                { id: "planet", label: "🌍 Planet", color: "#2ecc71" },
                { id: "wallet", label: "💰 Wallet", color: "#e8c84a" },
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
                  ⚠️ ESTIMATED ANNUAL CONTAMINANT INTAKE
                </div>
                <p style={{ fontSize: 12, color: "#69727d", margin: "0 0 16px", lineHeight: 1.5 }}>
                  Based on {totalLitersPerDay.toFixed(1)}L/day of unfiltered tap water for {householdSize} {householdSize === 1 ? "person" : "people"}. Click <strong style={{ color: "#03bfac" }}>▼ Learn more</strong> on any contaminant to see health research and official guidelines.
                </p>
                {CONTAMINANTS.map(c => (
                  <ContaminantBar
                    key={c.name} {...c}
                    annual={c.dailyPerLiter * totalLitersPerDay * tapFraction * 365}
                    animate={animate}
                  />
                ))}
                <div style={{
                  marginTop: 16, padding: 14, background: "#fef6f0", borderRadius: 10,
                  border: "1px solid #f5d5c5", fontSize: 13, color: "#8a5a3a", lineHeight: 1.6,
                }}>
                  💡 These are estimates based on average North American municipal water data. Actual levels vary by region.
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
                    {showRefs ? "▲ Hide References" : "▼ References & Sources"}
                  </button>
                  {showRefs && (
                    <ol style={{ paddingLeft: 20, marginTop: 10, marginBottom: 0 }}>
                      {REFERENCES.map(ref => (
                        <li key={ref.id} style={{ fontSize: 11, color: "#69727d", marginBottom: 5, lineHeight: 1.5 }}>
                          <a href={ref.url} target="_blank" rel="noopener noreferrer"
                             style={{ color: "#0170b9", textDecoration: "underline" }}>
                            {ref.org} — {ref.title}
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
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#003764" }}>Great — no bottled water!</div>
                    <p style={{ fontSize: 13, color: "#69727d", marginTop: 8, lineHeight: 1.5 }}>
                      You're already avoiding plastic waste. A filtration system would protect you from the contaminants in the Health tab.
                    </p>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1a8a5a", marginBottom: 16, letterSpacing: 0.5 }}>
                      🌍 YOUR ANNUAL PLASTIC FOOTPRINT
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                      <div style={statBoxStyle}>
                        <div style={{ fontSize: 32, fontWeight: 800, color: "#003764", fontFamily: "'DM Mono', monospace" }}>
                          <AnimatedNumber value={annualBottles} />
                        </div>
                        <div style={{ fontSize: 12, color: "#69727d", fontWeight: 600 }}>plastic bottles</div>
                      </div>
                      <div style={statBoxStyle}>
                        <div style={{ fontSize: 32, fontWeight: 800, color: "#003764", fontFamily: "'DM Mono', monospace" }}>
                          <AnimatedNumber value={annualPlasticKg} suffix=" kg" decimals={1} />
                        </div>
                        <div style={{ fontSize: 12, color: "#69727d", fontWeight: 600 }}>of plastic waste</div>
                      </div>
                    </div>
                    <div style={statBoxStyle}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "#d4644a", fontFamily: "'DM Mono', monospace" }}>
                        <AnimatedNumber value={annualCO2Kg} suffix=" kg CO₂" decimals={1} />
                      </div>
                      <div style={{ fontSize: 12, color: "#69727d", fontWeight: 600 }}>carbon footprint from production & transport</div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 20 }}>
                      <JarVisualization fillPercent={animate ? Math.min((annualPlasticKg / 15) * 100, 100) : 0} label="Plastic waste" color="#e67e22" />
                      <JarVisualization fillPercent={animate ? Math.min((annualCO2Kg / 200) * 100, 100) : 0} label="CO₂ emissions" color="#d4644a" />
                      <JarVisualization fillPercent={animate ? Math.min((annualBottles / 2000) * 100, 100) : 0} label="Bottles in landfill" color="#9b59b6" />
                    </div>

                    <div style={{
                      marginTop: 20, padding: 14, background: "#f1f9fd", borderRadius: 10,
                      border: "1px solid #e2e8f0", fontSize: 13, color: "#2a5a7a", lineHeight: 1.6, textAlign: "center",
                    }}>
                      🌿 Switching to filtered water eliminates <strong>100%</strong> of this plastic waste.
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Wallet Tab */}
            {activeTab === "wallet" && (
              <div style={{ ...cardStyle, animation: "fadeUp 0.3s ease" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#b8860b", marginBottom: 16, letterSpacing: 0.5 }}>
                  💰 YOUR WATER COSTS
                </div>
                {bottledFraction > 0 ? (
                  <>
                    <div style={{ ...statBoxStyle, background: "#fef9f0", border: "1px solid #f0ddb5" }}>
                      <div style={{ fontSize: 12, color: "#a08040", fontWeight: 600, marginBottom: 4 }}>Annual bottled water spend</div>
                      <div style={{ fontSize: 38, fontWeight: 800, color: "#b8860b", fontFamily: "'DM Mono', monospace" }}>
                        <AnimatedNumber value={annualBottleCost} prefix="$" decimals={0} />
                      </div>
                      <div style={{ fontSize: 12, color: "#a08040" }}>
                        at ${BOTTLE_PRICE_CAD.toFixed(2)} per 500mL bottle
                      </div>
                    </div>

                    <div style={{ marginTop: 16, fontSize: 14, fontWeight: 700, color: "#003764", marginBottom: 10 }}>
                      5-Year comparison
                    </div>
                    {PRODUCTS.map(p => {
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
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#003764" }}>{p.img} {p.name}</span>
                              {p.sale && <span style={{ fontSize: 10, background: "#d4644a", color: "#fff", padding: "2px 6px", borderRadius: 4, marginLeft: 6, fontWeight: 700 }}>SALE</span>}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#003764", fontFamily: "'DM Mono', monospace" }}>
                              ${fiveYearTotal.toFixed(0)}
                            </span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "#69727d" }}>
                            <span>5-year total cost</span>
                            {savings > 0 && <span style={{ color: "#0170b9", fontWeight: 700 }}>Save ${savings.toFixed(0)} ({savingsPct}%)</span>}
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
                      vs. <strong>${(annualBottleCost * 5).toLocaleString()}</strong> on bottled water over 5 years
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>🚰</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#003764" }}>You're saving money on tap!</div>
                    <p style={{ fontSize: 13, color: "#69727d", marginTop: 8, lineHeight: 1.5 }}>
                      An AlkaFlow system adds filtration + alkaline minerals for pennies a day — starting at just <strong>$0.25/day</strong>.
                    </p>
                  </div>
                )}
              </div>
            )}

            <button onClick={() => setShowSolution(true)} style={{ ...primaryBtnStyle }}>
              Show Me the Solution 💧
            </button>
            <button onClick={() => { setStep(1); setAnimate(false); }} style={secondaryBtnStyle}>
              ← Adjust My Inputs
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
                Clean Water, Simple Solution
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "#b0d4e8", margin: 0 }}>
                An AlkaFlow system removes up to 99% of contaminants while adding beneficial alkaline minerals to your water.
              </p>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12,
                padding: "6px 14px", background: "rgba(255,255,255,0.15)",
                borderRadius: 20, fontSize: 11, color: "#c5daf0", fontWeight: 600,
              }}>
                Trusted by Canadians since 2010
              </div>
            </div>

            <div style={{ fontSize: 14, fontWeight: 700, color: "#003764", marginBottom: 12 }}>
              Recommended for your household
            </div>

            {PRODUCTS.map((p, i) => {
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
                      ★ BEST FIT
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: 32 }}>{p.img}</span>
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
                      View Product →
                    </a>
                  </div>
                  <div style={{ fontSize: 11, color: "#69727d", marginTop: 8 }}>
                    Filter replacement: ${p.filterCost} every {p.filterMonths} months · ~${(p.filterCost / (p.filterMonths * 30)).toFixed(2)}/day
                  </div>
                </div>
              );
            })}

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={() => setShowSolution(false)} style={{ ...secondaryBtnStyle, flex: 1 }}>← My Results</button>
              <button onClick={() => { setStep(0); setAnimate(false); setShowSolution(false); setWaterSource(null); }} style={{ ...secondaryBtnStyle, flex: 1 }}>
                Start Over
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
          Your health comes first
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 12, flexWrap: "wrap" }}>
          <a href="https://aquahealthproducts.com/shop/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#003764", textDecoration: "none", fontWeight: 600 }}>Shop All Products</a>
          <a href="https://aquahealthproducts.com/product/alkaflow-alkaline-water-pitcher/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#003764", textDecoration: "none", fontWeight: 600 }}>AlkaFlow Pitcher</a>
          <a href="https://aquahealthproducts.com/product/alkaflow-dispenser-alkaline-water/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#003764", textDecoration: "none", fontWeight: 600 }}>AlkaFlow Dispenser</a>
        </div>
        <div style={{ fontSize: 11, color: "#69727d" }}>
          Healthy water solutions since 2010
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
