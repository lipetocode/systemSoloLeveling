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
export function attributesFor(level, bonuses = {}) {
  const safe = key => Number.isSafeInteger(bonuses[key]) && bonuses[key]>=0 ? bonuses[key] : 0;
  return {strength:10+(level-1)*2+safe('strength'),endurance:10+(level-1)*2+safe('endurance'),agility:10+(level-1)+safe('agility'),discipline:10+(level-1)+safe('discipline')};
}
