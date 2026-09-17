import { problems } from '@/data/problems';

export const ROUNDS = ["Ideation", "Mini Review", "Twist Round", "Final Review", "Final Pitch"];

export function maskedRounds(started: number[]) {
  return ROUNDS.map((r, i) => started.includes(i) ? r : "???");
}

export const CRITERIA = [
  { key: "medical", label: "Medical Relevance", weight: 30 },
  { key: "technical", label: "Technical Feasibility", weight: 30 },
  { key: "adapt", label: "Adaptability & Scalability", weight: 15 },
  { key: "budget", label: "Budget & Viability", weight: 15 },
  { key: "innovation", label: "Innovation & Creativity", weight: 10 },
  { key: "pitch", label: "Pitch & Presentation", weight: 0 },
];

export function drawKit(track: 'A'|'B'|'C') {
  const map: Record<string, string> = { A: "AI", B: "Medical Devices & Hardware", C: "Healthcare Innovation" };
  const trackName = map[track];
  const list = problems.filter(p => p.track === trackName);
  const p = list[Math.floor(Math.random() * list.length)];
  return {
    disease: p.id + ': ' + p.title,
    patient: p.story,
    problem: p.problemStatement,
    tech: p.technologies.join(', '),
    budget: 'Rs. ' + p.budget.toLocaleString(),
    constraintText: p.limitation
  };
}

export const FINAL_ROUND_IDX = ROUNDS.length - 1;

