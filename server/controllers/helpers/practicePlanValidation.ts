// T041 Validation helpers for Practice Plans
import { PracticePlan } from '../../models/practicePlan';

export function isNonEmptyName(name: unknown): name is string {
  return typeof name === 'string' && name.trim().length > 0;
}

export function validateNonNegativeDurations(plan: any): string[] {
  const errors: string[] = [];
  if (!plan) return ['plan missing'];
  const overBound = (v: any) => typeof v === 'number' && v > 1000;
  plan.sections?.forEach((s: any, si: number) => {
    if (typeof s.targetDuration === 'number') {
      if (s.targetDuration < 0) errors.push(`sections[${si}].targetDuration negative`);
      if (overBound(s.targetDuration)) errors.push(`sections[${si}].targetDuration exceedsMax`);
    }
    s.groups?.forEach((g: any, gi: number) => {
      g.items?.forEach((it: any, ii: number) => {
        if (it.kind === 'break') {
          if (typeof it.duration === 'number') {
            if (it.duration < 0) errors.push(`sections[${si}].groups[${gi}].items[${ii}].duration negative`);
            if (overBound(it.duration)) errors.push(`sections[${si}].groups[${gi}].items[${ii}].duration exceedsMax`);
          }
        }
        if (it.kind === 'exercise') {
          if (typeof it.durationOverride === 'number') {
            if (it.durationOverride < 0) errors.push(`sections[${si}].groups[${gi}].items[${ii}].durationOverride negative`);
            if (overBound(it.durationOverride)) errors.push(`sections[${si}].groups[${gi}].items[${ii}].durationOverride exceedsMax`);
          }
        }
      });
    });
  });
  return errors;
}
