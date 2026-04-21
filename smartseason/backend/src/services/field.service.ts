import { Field, FieldUpdate } from '@prisma/client';

export type ComputedStatus = 'Active' | 'At Risk' | 'Completed';

export const computeFieldStatus = (field: Field & { updates: FieldUpdate[] }): ComputedStatus => {
  if (field.currentStage === 'HARVESTED') {
    return 'Completed';
  }

  const now = new Date();

  let lastActivityDate = field.plantingDate;
  if (field.updates && field.updates.length > 0) {
    const latestUpdate = field.updates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    lastActivityDate = latestUpdate.createdAt;
  }

  const daysSinceActivity = (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24);
  const daysSincePlanting = (now.getTime() - field.plantingDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceActivity > 21 || daysSincePlanting > 120) {
    return 'At Risk';
  }

  return 'Active';
};
