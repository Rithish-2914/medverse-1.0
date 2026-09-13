export const ROUNDS = ['Ideation','Mini Review','Twist Round','Final Review','Final Pitch'] as const;
export type RoundName = (typeof ROUNDS)[number];
export const FINAL_ROUND_IDX = ROUNDS.length - 1;

export function maskedRounds(startedRoundIdxs: number[]): string[] {
  return ROUNDS.map((name, idx) => startedRoundIdxs.includes(idx) ? name : `Round ${idx + 1} — sealed`);
}

export const CRITERIA = [
  { key: 'medical',    name: 'Medical Relevance',     weight: 25 },
  { key: 'technical',  name: 'Technical Feasibility', weight: 20 },
  { key: 'adapt',      name: 'Adaptability',          weight: 20 },
  { key: 'budget',     name: 'Budget Discipline',     weight: 15 },
  { key: 'innovation', name: 'Innovation',            weight: 10 },
  { key: 'pitch',      name: 'Pitch & Q&A',           weight: 10 },
] as const;
export type CriterionKey = (typeof CRITERIA)[number]['key'];

export interface Scenario { disease: string; patient: string; problem: string; }

export const SCENARIOS_BY_TRACK: Record<'A'|'B'|'C', Scenario[]> = {
  A: [
    { disease:'Diabetic Retinopathy', patient:'A 52-year-old Type 2 diabetic in a tier-3 town. No eye screening in 11 years — ophthalmologist is 80 km away. Uses a basic Android phone.', problem:'How might we use a smartphone and AI to detect early signs of diabetic retinopathy without a specialist or specialised hardware?' },
    { disease:'Epilepsy', patient:'A 21-year-old college student. Fears seizures while sleeping or travelling alone. Family wants alerts but constant supervision is not practical.', problem:'How might we detect a dangerous seizure and automatically alert a caregiver using a mobile or ML-based solution when the patient cannot ask for help?' },
    { disease:'Medication Non-Adherence', patient:'A 67-year-old living alone with hypertension and diabetes. Takes 6 different tablets at different times. Frequently misses doses or takes the wrong one.', problem:'How might we ensure an elderly patient with low digital literacy takes the right medication at the right time and alerts a caregiver when something goes wrong?' },
    { disease:'Postpartum Depression', patient:'A 28-year-old first-time mother in a rural district. Persistently low and anxious 6 weeks after delivery. Has told no one — stigma and no local services.', problem:'How might we screen for and support postpartum depression in rural women who would not voluntarily seek help, using a tool an ASHA worker or patient can use on a basic phone?' },
    { disease:'Chronic Kidney Disease', patient:'A 44-year-old with Stage 3 CKD. Needs regular monitoring but lab visits are expensive. Nephrologist is 60 km away and communicates by phone.', problem:'How might we help a CKD patient and their remote doctor track disease progression and flag deterioration from home without frequent clinic visits?' },
  ],
  B: [
    { disease:'COPD', patient:'A 68-year-old living alone in a village. Frequent breathlessness — cannot tell if it is a normal COPD day or a warning sign. Hospital is far and expensive.', problem:'How might we build a wearable or portable device that detects a dangerous breathing episode before it becomes critical, without internet and without the patient needing to act?' },
    { disease:'Neonatal Jaundice', patient:'A newborn in a rural PHC. Nurse suspects jaundice. No bilirubinometer available. Nearest lab is 45 km away. Early detection prevents permanent brain damage.', problem:'How might we build a low-cost, non-invasive bedside device that lets a rural nurse detect and estimate neonatal jaundice severity without a laboratory?' },
    { disease:"Parkinson's Disease", patient:"A 71-year-old with early-to-mid Parkinson's. Progressive hand tremors and gait instability. Neurologist 90 km away wants objective data, not verbal recall.", problem:'How might we build a wearable that objectively captures and logs tremor severity and movement patterns between clinic visits, giving the doctor real data?' },
    { disease:'Snakebite', patient:'A 19-year-old farmworker with an unidentified snakebite in a rural field. At the PHC within 30 min. Doctor cannot confirm envenomation or identify the species. Wrong antivenom is fatal.', problem:'How might we build a portable field tool that helps a health worker determine whether a bite is venomous and which antivenom is needed within the critical treatment window?' },
    { disease:'Arthritis', patient:'A 55-year-old with moderate arthritis in hands and knees. Daily tasks like opening bottles, writing and cooking are painful. Determined to stay independent.', problem:'How might we design an affordable, lightweight assistive device that restores hand and joint function for an arthritis patient without surgery or expensive therapy?' },
  ],
  C: [
    { disease:'Pulmonary Tuberculosis', patient:'A 34-year-old daily wage worker in a dense urban slum. 3-week cough, night sweats, weight loss. Has not sought care — fears job loss if diagnosed with TB.', problem:'How might we design a community screening and referral system that reaches TB-risk individuals in urban slums who would not self-report?' },
    { disease:'Under-5 Malnutrition', patient:'A tribal district with 38% stunting. Anganwadi workers visit monthly. No way to track growth between visits. Mothers cannot identify early malnutrition at home.', problem:'How might we design a community-level screening and education system that helps workers and mothers detect and respond to early childhood malnutrition between monthly check-ups?' },
    { disease:'Cervical Cancer', patient:'Women aged 30-50 in a rural district. Cervical cancer is the leading cause of cancer death. Screening coverage below 10% due to stigma, distance and no female health workers.', problem:'How might we design a community outreach and early detection programme that reaches rural women who currently have no access to or awareness of cervical cancer screening?' },
    { disease:'Antimicrobial Resistance', patient:'A district hospital where over 60% of post-operative infections show resistance to first-line antibiotics. Routine over-prescribing by staff. Patients self-medicate. No stewardship programme.', problem:'How might we design an antimicrobial stewardship programme a resource-constrained district hospital can implement and sustain without additional budget?' },
    { disease:'Postpartum Haemorrhage', patient:'A rural PHC where PPH is the leading cause of maternal death. ASHA workers conduct most home deliveries but lack training and supplies to manage unexpected bleeding.', problem:'How might we equip and train community health workers to prevent, detect and first-respond to PPH during home deliveries more than 1 hour from emergency care?' },
  ],
};

export const TECH_BY_TRACK: Record<'A'|'B'|'C', string[]> = {
  A: ['AI / ML Diagnostic Model','Offline-First Mobile App','Chatbot-Based Patient Support Tool','Health Data Dashboard & Alert System','Computer Vision Screening Tool'],
  B: ['Low-Cost IoT Wearable Sensor','3D-Printed Diagnostic or Assistive Device','Point-of-Care Biosensor','Portable Embedded Diagnostic Rig','Custom Hardware Prototype (MCU + Sensors)'],
  C: ['Community Screening Protocol','Last-Mile Referral & Delivery System','ASHA / CHW Training & Decision Kit','Paper-Based Triage Decision Tree','Public Health Outreach Programme'],
};

export const BUDGETS = ['Rs.8,000','Rs.10,000','Rs.12,000','Rs.15,000','Rs.20,000'];

export const CONSTRAINTS_BY_TRACK: Record<'A'|'B'|'C', string[]> = {
  A: ['No paid APIs, no cloud. Fully offline or free open-source tools only.','Target device: Android 2018 or older, 1 GB RAM, no Play Store, no guaranteed internet.','Must work within 5 minutes of onboarding. No manuals, no tutorials, no training.','Open-source only. No licensed ML frameworks or proprietary SDKs of any kind.','No pre-trained models or third-party APIs. All inference built from scratch using event data.'],
  B: ['No rechargeable battery. Only standard AA / AAA cells available at a local kirana store.','Must weigh under 150 g and fit inside a standard trouser pocket.','No PCB fabrication or custom soldering. Breadboard and off-the-shelf modules only.','Must operate at 40 degrees C ambient temperature and 80% humidity for a continuous 8-hour deployment.','All patient-contact components must be single-use or sterilisable with a 70% alcohol wipe between patients.'],
  C: ['Executable by ASHA-level workers only. Class 10 education and a 2-week health training course.','No English anywhere. All materials must use the local language or pictorial symbols only.','Zero electricity at the deployment site. No powered equipment, no phone charging, no batteries.','Deployable within 48 hours of training with zero ongoing support from the design team.','All consumables must cost under Rs.50 per patient and be available at any district-level pharmacy.'],
};

export const TWISTS = [
  'Budget cut by 30%. Remove or replace anything that now exceeds the revised cap. Justify every rupee that remains.',
  'The primary user has changed. Your solution must now be operable by a family member or community volunteer with zero medical or technical background.',
  'No wireless communication anywhere in the solution. No WiFi, no Bluetooth, no cellular, no NFC.',
  'No electricity, no solar, no batteries of any kind. Rethink your energy source from scratch.',
  'The target community has documented mistrust of outside medical interventions. Redesign for acceptance, not just clinical function.',
];

export function pick<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function drawKit(track: 'A'|'B'|'C') {
  const scenario = pick(SCENARIOS_BY_TRACK[track]);
  return { disease: scenario.disease, patient: scenario.patient, problem: scenario.problem, tech: pick(TECH_BY_TRACK[track]), budget: pick(BUDGETS), constraintText: pick(CONSTRAINTS_BY_TRACK[track]) };
}
