export const QUESTS = Object.freeze([
  {id:'workout',title:'Treino do dia',description:'Concluir sua sessão de musculação',xp:40,attribute:'strength'},
  {id:'cardio',title:'Missão cardio',description:'Realizar 20 minutos de cardio',xp:30,attribute:'agility'},
  {id:'water',title:'Hidratação',description:'Cumprir sua meta pessoal de água',xp:20,attribute:'discipline'}
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
  const event={id:`${day}:${id}:${done?'undo':'complete'}:${(state.history||[]).length}`,day,mission:q.title,delta};
  const bonuses={strength:0,endurance:0,agility:0,discipline:0,...state.bonuses};
  bonuses[q.attribute]=Math.max(0,bonuses[q.attribute]+(done?-1:1));
  if(id==='workout') bonuses.endurance=Math.max(0,bonuses.endurance+(done?-1:1));
  return {state:{...state,bonuses,history:[event,...(state.history||[])].slice(0,30),day,completed,xp:Math.max(0,state.xp+delta),totalXp:Math.max(0,state.totalXp+delta),totalQuests:Math.max(0,state.totalQuests+(done?-1:1))},done,delta};
}
export function resetMissions(state,day=localDay()) {
  const current=state.day===day ? state.completed : [];
  const deducted=QUESTS.filter(q=>current.includes(q.id)).reduce((sum,q)=>sum+q.xp,0);
  const event={id:`${day}:reset:${(state.history||[]).length}`,day,mission:'Reinício das missões',delta:-deducted};
  const bonuses={strength:0,endurance:0,agility:0,discipline:0,...state.bonuses};
  QUESTS.filter(q=>current.includes(q.id)).forEach(q=>{bonuses[q.attribute]=Math.max(0,bonuses[q.attribute]-1);if(q.id==='workout')bonuses.endurance=Math.max(0,bonuses.endurance-1);});
  return {...state,bonuses,history:deducted?[event,...(state.history||[])].slice(0,30):(state.history||[]),day,completed:[],xp:Math.max(0,state.xp-deducted),totalXp:Math.max(0,state.totalXp-deducted),totalQuests:Math.max(0,state.totalQuests-current.length)};
}
