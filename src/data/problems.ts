export const problems = [
  {
    id: "AI-01",
    docLink: "https://docs.google.com/document/d/1mAYweREMa7YMFeLn08Iv_IxCLqEaPNQL/preview",
    track: "AI",
    title: "Autoimmune Flare",
    story: "A 24-year-old patient with an autoimmune disease experiences unpredictable flare-ups. Subtle changes in sleep, fatigue, pain and activity often appear before she feels significantly worse.",
    problemStatement: "Design an AI system that learns the patient's personal health pattern and identifies possible early signs of an autoimmune flare.",
    technologies: ["Time-series ML", "Personalised AI", "Wearable/mobile data"],
    limitation: "Cannot assume that one symptom or biomarker predicts a flare.",
    budget: 5000,
    budgetAnalysis: [
      { item: "Data/testing", amount: 2000 },
      { item: "Development", amount: 1500 },
      { item: "Interface", amount: 1000 },
      { item: "Contingency", amount: 500 }
    ],
    twistLimitation: "Patient frequently forgets to record symptoms, creating large gaps in the data.",
    twistBudget: 3000,
    twistBudgetDescription: "Retain only essential data and AI functions.",
    learningOutcomes: ["Autoimmunity", "Personalised AI", "Time-series data", "Missing data", "Uncertainty"]
  },
  {
    id: "AI-02",
    docLink: "https://docs.google.com/document/d/1blnyOO-01mtwb7OLITd4_KTufepSeSEz/preview",
    track: "AI",
    title: "The Disease Nobody Can Name",
    story: "A 16-year-old has spent years visiting doctors because of several unusual symptoms that individually appear unrelated.",
    problemStatement: "Design AI decision support that identifies possible disease patterns from combinations of symptoms and medical history and helps a doctor investigate rare conditions.",
    technologies: ["NLP", "Knowledge graphs", "Clinical decision support"],
    limitation: "More than one AI model has to be used to explain the final diagnosis.",
    budget: 6000,
    budgetAnalysis: [
      { item: "Data/knowledge base", amount: 2000 },
      { item: "Development", amount: 1500 },
      { item: "Testing", amount: 1500 },
      { item: "Interface", amount: 1000 }
    ],
    twistLimitation: "One important symptom is extremely rare and absent from the training dataset.",
    twistBudget: 4500,
    twistBudgetDescription: "Prioritise the core reasoning system.",
    learningOutcomes: ["Rare diseases", "Differential diagnosis", "NLP", "Knowledge graphs", "Explainable AI"]
  },
  {
    id: "AI-03",
    docLink: "https://docs.google.com/document/d/1gHFCaQrPe2Gu1maj671JHDWU_z7zhPO6/preview",
    track: "AI",
    title: "Antibiotic That Stops Working",
    story: "A patient develops a serious bacterial infection. The doctor needs to choose treatment quickly, but the hospital has incomplete historical antibiotic-resistance data.",
    problemStatement: "Design AI decision support that estimates the risk of antibiotic resistance using available patient and microbiology information.",
    technologies: ["ML", "Predictive modelling", "Clinical data analysis"],
    limitation: "AI cannot replace microbiological testing.",
    budget: 5000,
    budgetAnalysis: [
      { item: "Data/testing", amount: 2000 },
      { item: "Model development", amount: 1500 },
      { item: "Interface", amount: 1000 },
      { item: "Contingency", amount: 500 }
    ],
    twistLimitation: "The hospital dataset is incomplete and heavily biased toward certain bacteria.",
    twistBudget: 3000,
    twistBudgetDescription: "Simplify the model while maintaining useful predictions.",
    learningOutcomes: ["AMR", "Microbiology", "Predictive AI", "Data bias", "Clinical decision support"]
  },
  {
    id: "AI-04",
    docLink: "https://docs.google.com/document/d/1HOqGoLBqDXjinab0i_Ecnpmrlb_4KCWu/preview",
    track: "AI",
    title: "Seven Medicines, One Patient",
    story: "A 70-year-old takes medicines prescribed by three doctors. Individually they appear appropriate, but the combination may create interactions or duplication.",
    problemStatement: "Design AI that analyses medicines, dosage and timing to identify potentially dangerous drug interactions or duplication.",
    technologies: ["NLP", "Knowledge graphs", "Rule-based AI", "ML"],
    limitation: "Patient may have forgotten that they have taken a medicine and may take it again.",
    budget: 4000,
    budgetAnalysis: [
      { item: "Drug database", amount: 1500 },
      { item: "Development", amount: 1000 },
      { item: "Testing", amount: 1000 },
      { item: "Interface", amount: 500 }
    ],
    twistLimitation: "The patient begins taking an over-the-counter medicine that is missing from the medical record.",
    twistBudget: 3000,
    twistBudgetDescription: "Focus only on critical interaction detection.",
    learningOutcomes: ["Pharmacology", "Drug interactions", "Clinical reasoning", "Knowledge graphs"]
  },
  {
    id: "AI-05",
    docLink: "https://docs.google.com/document/d/15TytuLxY2Bv-XA3xPUCyCPeD1Jr-Olrk/preview",
    track: "AI",
    title: "When the Voice Changes",
    story: "A young person experiences changes in mood and daily functioning but does not want to repeatedly complete mental-health questionnaires. The doctor has been noticing changes in speech patterns in the patient.",
    problemStatement: "Explore whether changes in speech patterns can act as a digital biomarker that flags when professional support may be needed.",
    technologies: ["Speech processing", "Audio analysis", "ML"],
    limitation: "Voice alone cannot diagnose a mental-health condition.",
    budget: 5000,
    budgetAnalysis: [
      { item: "Data collection", amount: 2000 },
      { item: "Model", amount: 1500 },
      { item: "Testing", amount: 1000 },
      { item: "Interface", amount: 500 }
    ],
    twistLimitation: "The patient's speech naturally changes between conversations with friends and formal recordings.",
    twistBudget: 3000,
    twistBudgetDescription: "Retain only reliable speech features.",
    learningOutcomes: ["Speech AI", "Digital biomarkers", "Mental health", "Privacy", "Responsible AI"]
  },
  {
    id: "DEVICE-01",
    docLink: "https://docs.google.com/document/d/1m2psVDppnFftVtL3z943kniqPcZgMu17/preview",
    track: "Medical Devices & Hardware",
    title: "Ulcer Before It Appears",
    story: "A bedridden patient spends most of the day in the same position. By the time visible skin damage appears, tissue injury may already be significant.",
    problemStatement: "Design a system that detects prolonged pressure and identifies areas at risk before a pressure ulcer develops.",
    technologies: ["Pressure sensors", "Flexible electronics", "IoT"],
    limitation: "Must not create additional pressure or discomfort.",
    budget: 5000,
    budgetAnalysis: [
      { item: "Sensors", amount: 2000 },
      { item: "Electronics", amount: 1000 },
      { item: "Prototype", amount: 1000 },
      { item: "Testing", amount: 1000 }
    ],
    twistLimitation: "Patient moves unpredictably during sleep, changing pressure distribution.",
    twistBudget: 3000,
    twistBudgetDescription: "Reduce the number of sensors.",
    learningOutcomes: ["Pressure mapping", "Sensors", "Preventive healthcare", "Patient comfort"]
  },
  {
    id: "DEVICE-02",
    docLink: "https://docs.google.com/document/d/1sDW4H3aojykkG_8Vkszr7oapOzELih6u/preview",
    track: "Medical Devices & Hardware",
    title: "The Fistula That Changed",
    story: "A dialysis patient depends on an AV fistula for regular treatment. Changes in blood flow can indicate serious complications.",
    problemStatement: "Design a portable device that identifies changes in fistula function before the patient's next dialysis session.",
    technologies: ["Acoustic/vibration sensing", "Flow sensing", "Signal processing"],
    limitation: "Must be completely non-invasive.",
    budget: 7000,
    budgetAnalysis: [
      { item: "Sensors", amount: 2500 },
      { item: "MCU", amount: 1000 },
      { item: "Prototype", amount: 1000 },
      { item: "Testing", amount: 1000 },
      { item: "Contingency", amount: 500 }
    ],
    twistLimitation: "Normal arm movement produces signals similar to abnormal signals.",
    twistBudget: 5000,
    twistBudgetDescription: "Select the minimum useful sensors.",
    learningOutcomes: ["Dialysis", "Vascular access", "Biosensing", "Signal processing"]
  },
  {
    id: "DEVICE-03",
    docLink: "https://docs.google.com/document/d/1YYn0UbAzJLpBCCWnplrrUODR87QAwBsj/preview",
    track: "Medical Devices & Hardware",
    title: "The Hidden Swallow",
    story: "After a stroke, a patient appears to eat normally but has difficulty swallowing safely. Small amounts of food or liquid may enter the airway without obvious symptoms.",
    problemStatement: "Design a non-invasive device that helps identify abnormal swallowing patterns and possible aspiration risk.",
    technologies: ["Acoustic/vibration sensors", "Wearable sensing", "Signal processing"],
    limitation: "Device cannot interfere with eating or drinking.",
    budget: 5000,
    budgetAnalysis: [
      { item: "Sensors", amount: 2000 },
      { item: "Electronics", amount: 1000 },
      { item: "Prototype", amount: 1000 },
      { item: "Testing", amount: 1000 }
    ],
    twistLimitation: "Different food textures create very different swallowing signals.",
    twistBudget: 3000,
    twistBudgetDescription: "Retain the most informative sensing method.",
    learningOutcomes: ["Dysphagia", "Swallowing physiology", "Biosensors", "Signal processing"]
  },
  {
    id: "DEVICE-04",
    docLink: "https://docs.google.com/document/d/1zOkgXe00mxr3MKl5TQlOLiEankWFG8CN/preview",
    track: "Medical Devices & Hardware",
    title: "The Prosthesis That Doesn't Fit Tomorrow",
    story: "A prosthetic limb fits well in the morning but becomes uncomfortable later because pressure and tissue volume change throughout the day.",
    problemStatement: "Design a smart prosthetic socket that monitors pressure distribution and identifies areas likely to cause tissue injury.",
    technologies: ["Pressure sensors", "Flexible electronics", "3D printing"],
    limitation: "Sensors must not significantly increase weight or socket thickness.",
    budget: 7000,
    budgetAnalysis: [
      { item: "Sensors", amount: 2500 },
      { item: "3D printing", amount: 1500 },
      { item: "Electronics", amount: 1500 },
      { item: "Testing", amount: 1000 },
      { item: "Contingency", amount: 500 }
    ],
    twistLimitation: "Pressure changes significantly during walking, sitting and climbing stairs.",
    twistBudget: 5000,
    twistBudgetDescription: "Simplify the sensing system.",
    learningOutcomes: ["Prosthetics", "Biomechanics", "Pressure sensing", "3D printing"]
  },
  {
    id: "DEVICE-05",
    docLink: "https://docs.google.com/document/d/1VlIc_ajuZEu9kZhBUgNdtYX11r9IFhXG/preview",
    track: "Medical Devices & Hardware",
    title: "Keeping a Newborn Warm",
    story: "A premature newborn in a resource-limited centre struggles to maintain body temperature. Nurses cannot continuously monitor the baby.",
    problemStatement: "Design a low-cost system that detects dangerous temperature changes and assists caregivers in maintaining safe temperature.",
    technologies: ["Temperature sensors", "Embedded systems", "Feedback control"],
    limitation: "Must not overheat the newborn and cannot depend on continuous internet.",
    budget: 5000,
    budgetAnalysis: [
      { item: "Sensors", amount: 1500 },
      { item: "Control system", amount: 1500 },
      { item: "Prototype", amount: 1000 },
      { item: "Testing", amount: 1000 }
    ],
    twistLimitation: "Room temperature changes significantly between day and night.",
    twistBudget: 6000,
    twistBudgetDescription: "Retain only essential sensing/control.",
    learningOutcomes: ["Neonatal care", "Sensors", "Feedback control", "Embedded systems", "Safety"]
  },
  {
    id: "INNOVATION-01",
    docLink: "",
    track: "Healthcare Innovation",
    title: "The Implant Bacteria Love",
    story: "A patient receives an implant, but bacteria attach to its surface and form a difficult-to-treat biofilm.",
    problemStatement: "Design an implant surface strategy that reduces bacterial attachment without damaging surrounding cells.",
    technologies: ["Biomaterials", "Antimicrobial coatings", "Surface engineering"],
    limitation: "Cannot rely only on conventional antibiotic release.",
    budget: 6000,
    budgetAnalysis: [
      { item: "Materials", amount: 2000 },
      { item: "Antimicrobial testing", amount: 1500 },
      { item: "Prototype", amount: 1500 },
      { item: "Contingency", amount: 1000 }
    ],
    twistLimitation: "Antibiotic-resistant bacteria are introduced.",
    twistBudget: 4000,
    twistBudgetDescription: "Develop a simpler antimicrobial approach.",
    learningOutcomes: ["Biofilms", "AMR", "Biomaterials", "Antimicrobial strategies", "Cytotoxicity"]
  },
  {
    id: "INNOVATION-02",
    docLink: "",
    track: "Healthcare Innovation",
    title: "The Implant the Body Rejects",
    story: "A patient's implant performs its mechanical function, but the body develops an excessive foreign-body response around it.",
    problemStatement: "Design a material or surface strategy that reduces unwanted immune response while maintaining implant function.",
    technologies: ["Biomaterials", "Surface modification", "Immunoengineering"],
    limitation: "Improved biocompatibility cannot compromise mechanical strength.",
    budget: 7000,
    budgetAnalysis: [
      { item: "Material design", amount: 2500 },
      { item: "Prototype", amount: 1500 },
      { item: "Testing", amount: 2000 },
      { item: "Contingency", amount: 1000 }
    ],
    twistLimitation: "The immune response is stronger than initially expected.",
    twistBudget: 4000,
    twistBudgetDescription: "Prioritise the most important biological property.",
    learningOutcomes: ["Immunology", "Foreign-body response", "Biomaterials", "Implant design"]
  },
  {
    id: "INNOVATION-03",
    docLink: "",
    track: "Healthcare Innovation",
    title: "The Drug That Knows Where to Go",
    story: "A patient needs a powerful drug, but distributing it throughout the body also affects healthy tissue.",
    problemStatement: "Design a controlled or targeted drug-delivery system that releases more therapeutic agent at the intended site.",
    technologies: ["Hydrogels", "Nanoparticles", "Polymers", "Stimuli-responsive materials"],
    limitation: "Drug cannot simply be released immediately after application.",
    budget: 6000,
    budgetAnalysis: [
      { item: "Material development", amount: 2000 },
      { item: "Release testing", amount: 1500 },
      { item: "Prototype", amount: 1500 },
      { item: "Contingency", amount: 1000 }
    ],
    twistLimitation: "The target environment changes over time, affecting drug release.",
    twistBudget: 4000,
    twistBudgetDescription: "Focus on the most important release mechanism.",
    learningOutcomes: ["Drug delivery", "Polymers", "Controlled release", "Pharmacokinetics"]
  },
  {
    id: "INNOVATION-04",
    docLink: "",
    track: "Healthcare Innovation",
    title: "The Gut That Lost Its Balance",
    story: "After repeated antibiotic treatment, a patient's gut microbiome becomes disrupted, leading to persistent gastrointestinal problems.",
    problemStatement: "Design a safe strategy to support restoration of a healthier microbial balance rather than simply giving a generic probiotic.",
    technologies: ["Microbiome science", "Probiotics/prebiotics", "Microbial ecology", "Personalised intervention"],
    limitation: "A generic probiotic alone is not considered a sufficient solution.",
    budget: 5000,
    budgetAnalysis: [
      { item: "Intervention design", amount: 2000 },
      { item: "Microbial analysis", amount: 1000 },
      { item: "Testing", amount: 1000 },
      { item: "Contingency", amount: 1000 }
    ],
    twistLimitation: "The patient's microbial composition differs significantly from the expected profile.",
    twistBudget: 3000,
    twistBudgetDescription: "Personalise only the most important part of the intervention.",
    learningOutcomes: ["Microbiology", "Microbiome", "Microbial ecology", "Personalised healthcare"]
  },
  {
    id: "INNOVATION-05",
    docLink: "",
    track: "Healthcare Innovation",
    title: "The Nerve That Needs a Bridge",
    story: "A young patient suffers a traumatic nerve injury. The damaged nerve ends cannot easily reconnect, resulting in weakness and loss of sensation.",
    problemStatement: "Design a regenerative nerve scaffold/conduit that guides nerve regeneration across the damaged region.",
    technologies: ["Biomaterials", "Tissue engineering", "3D printing/bioprinting", "Conductive biomaterials", "Embedded biosensors"],
    limitation: "Scaffold must provide structural support while allowing nerve regeneration. The scaffold should also be able to guide and monitor nerve regeneration.",
    budget: 8000,
    budgetAnalysis: [
      { item: "Material/scaffold design", amount: 2500 },
      { item: "Prototype", amount: 2000 },
      { item: "Testing", amount: 2500 },
      { item: "Contingency", amount: 1000 }
    ],
    twistLimitation: "Scaffold has excellent mechanical strength but poor biological interaction.",
    twistBudget: 6000,
    twistBudgetDescription: "Balance mechanical and biological requirements.",
    learningOutcomes: ["Neuroregeneration", "Tissue engineering", "Biomaterials", "Scaffold design", "Regenerative medicine"]
  }
];

