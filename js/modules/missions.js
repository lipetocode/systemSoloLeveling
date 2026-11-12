export const QUESTS = Object.freeze([
  {id:'workout',title:'Treino do dia',description:'Concluir sua sessão de musculação',xp:40},
  {id:'cardio',title:'Missão cardio',description:'Realizar 20 minutos de cardio',xp:30},
  {id:'water',title:'Hidratação',description:'Cumprir sua meta pessoal de água',xp:20}
]);
export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function changeMission(state,id,day=localDay()) {
  const q=QUESTS.find(q=>q.id===id);
  if(!q) throw new RangeError('Missão desconhecida');
  const current = state.day === day ? state.completed : [];
  const done=current.includes(id);
  const completed=done ? current.filter(x=>x!==id) : [...current,id];
  const delta=done ? -q.xp : q.xp;
  return {state:{...state,day,completed,xp:Math.max(0,state.xp+delta),totalXp:Math.max(0,state.totalXp+delta),totalQuests:Math.max(0,state.totalQuests+(done?-1:1))},done,delta};
}
export function resetMissions(state,day=localDay()) {
  const current=state.day===day ? state.completed : [];
  const deducted=QUESTS.filter(q=>current.includes(q.id)).reduce((sum,q)=>sum+q.xp,0);
  return {...state,day,completed:[],xp:Math.max(0,state.xp-deducted),totalXp:Math.max(0,state.totalXp-deducted),totalQuests:Math.max(0,state.totalQuests-current.length)};
}
