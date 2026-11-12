export const xpRequired = level => {
  if (!Number.isSafeInteger(level) || level < 1) throw new RangeError('Nível inválido');
  return Math.round(100 * Math.pow(level, 1.5));
};
export function progressFor(totalXp) {
  if (!Number.isSafeInteger(totalXp) || totalXp < 0) throw new RangeError('XP inválido');
  let level = 1, remaining = totalXp;
  while (remaining >= xpRequired(level)) {
    remaining -= xpRequired(level);
    level++;
    if (level > 100000) throw new RangeError('XP excede o limite');
  }
  const required = xpRequired(level);
  return {level, xp: remaining, required, percentage: remaining / required * 100};
}
export function attributesFor(level) {
  return {strength: 10 + (level-1)*2, endurance: 10 + (level-1)*2, discipline: 10 + level-1};
}
