/* SYSTEM v0.4 classic-script build: supports file:// and GitHub Pages. */
(()=>{
const QUESTS = Object.freeze([
  {id:'workout',title:'Treino do dia',description:'Concluir sua sessão de musculação',xp:40,attribute:'strength'},
  {id:'cardio',title:'Missão cardio',description:'Realizar 20 minutos de cardio',xp:30,attribute:'agility'},
  {id:'water',title:'Hidratação',description:'Cumprir sua meta pessoal de água',xp:20,attribute:'discipline'}
]);
function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function changeMission(state,id,day=localDay()) {
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
function resetMissions(state,day=localDay()) {
  const current=state.day===day ? state.completed : [];
  const deducted=QUESTS.filter(q=>current.includes(q.id)).reduce((sum,q)=>sum+q.xp,0);
  const event={id:`${day}:reset:${(state.history||[]).length}`,day,mission:'Reinício das missões',delta:-deducted};
  const bonuses={strength:0,endurance:0,agility:0,discipline:0,...state.bonuses};
  QUESTS.filter(q=>current.includes(q.id)).forEach(q=>{bonuses[q.attribute]=Math.max(0,bonuses[q.attribute]-1);if(q.id==='workout')bonuses.endurance=Math.max(0,bonuses.endurance-1);});
  return {...state,bonuses,history:deducted?[event,...(state.history||[])].slice(0,30):(state.history||[]),day,completed:[],xp:Math.max(0,state.xp-deducted),totalXp:Math.max(0,state.totalXp-deducted),totalQuests:Math.max(0,state.totalQuests-current.length)};
}

const STORAGE_KEY='system-player-v1';
const defaults=()=>({name:'Caçador',playerClass:'INICIANTE',xp:0,totalXp:0,totalQuests:0,day:localDay(),completed:[],history:[],bonuses:{strength:0,endurance:0,agility:0,discipline:0}});
function loadState(storage=localStorage) {
  try {
    const raw=JSON.parse(storage.getItem(STORAGE_KEY));
    if(!raw || typeof raw!=='object' || Array.isArray(raw)) return defaults();
    const state={...defaults(),...raw};
    if(!['xp','totalXp','totalQuests'].every(k=>Number.isSafeInteger(state[k]) && state[k]>=0)) return defaults();
    state.name=typeof state.name==='string' && state.name.trim()?state.name.slice(0,32):'Caçador';
    state.playerClass=['INICIANTE','GUERREIRO','SENTINELA'].includes(state.playerClass)?state.playerClass:'INICIANTE';
    state.history=Array.isArray(state.history)?state.history.filter(e=>e && typeof e.day==='string' && typeof e.mission==='string' && Number.isSafeInteger(e.delta)).slice(0,30):[];
    const bonusKeys=['strength','endurance','agility','discipline'];
    state.bonuses=Object.fromEntries(bonusKeys.map(k=>[k,Number.isSafeInteger(state.bonuses?.[k])&&state.bonuses[k]>=0&&state.bonuses[k]<=100000?state.bonuses[k]:0]));
    state.completed=Array.isArray(state.completed)?[...new Set(state.completed.filter(id=>QUESTS.some(q=>q.id===id)))]:[];
    if(state.day!==localDay()){state.day=localDay();state.completed=[];}
    return state;
  } catch {return defaults();}
}
function saveState(state,storage=localStorage) {
  try {storage.setItem(STORAGE_KEY,JSON.stringify(state));return true;} catch {return false;}
}

const xpRequired = level => {
  if (!Number.isSafeInteger(level) || level < 1) throw new RangeError('Nível inválido');
  return Math.round(100 * Math.pow(level, 1.5));
};
function progressFor(totalXp) {
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
function attributesFor(level, bonuses = {}) {
  const safe = key => Number.isSafeInteger(bonuses[key]) && bonuses[key]>=0 ? bonuses[key] : 0;
  return {strength:10+(level-1)*2+safe('strength'),endurance:10+(level-1)*2+safe('endurance'),agility:10+(level-1)+safe('agility'),discipline:10+(level-1)+safe('discipline')};
}

function playerView(state) {
  const progress=progressFor(state.xp);
  return {...progress,attributes:attributesFor(progress.level,state.bonuses),name:state.name,playerClass:state.playerClass};
}
function editPlayer(state,name,playerClass) {
  const clean=name.trim().slice(0,32);
  if(!clean) throw new Error('Nome obrigatório');
  if(!['INICIANTE','GUERREIRO','SENTINELA'].includes(playerClass)) throw new Error('Classe inválida');
  return {...state,name:clean,playerClass};
}

function exportBackup(state){return JSON.stringify({format:'system-backup',version:1,exportedAt:new Date().toISOString(),state},null,2);}
function importBackup(raw){
 if(typeof raw!=='string'||raw.length>500000)throw new Error('Arquivo muito grande ou inválido');
 let parsed;try{parsed=JSON.parse(raw);}catch{throw new Error('JSON inválido');}
 if(parsed?.format!=='system-backup'||parsed.version!==1||!parsed.state||typeof parsed.state!=='object')throw new Error('Formato de backup não reconhecido');
 const original=parsed.state;
 if(!Number.isSafeInteger(original.xp)||original.xp<0||!Number.isSafeInteger(original.totalXp)||original.totalXp<0||!Array.isArray(original.completed))throw new Error('Dados do jogador inválidos');
 return loadState({getItem:k=>k===STORAGE_KEY?JSON.stringify(original):null});
}

const $=id=>document.getElementById(id);
let state=loadState();
function persist(){if(!saveState(state)) M.toast({html:'Não foi possível salvar neste navegador.'});}
function render(){
  const p=playerView(state);
  $('playerName').textContent=p.name;
  $('playerClass').textContent=`CLASSE: ${p.playerClass}`;
  $('level').textContent=p.level;
  $('nextLevel').textContent=`NÍVEL ${p.level+1}`;
  $('xpLabel').textContent=`${p.xp} / ${p.required} XP`;
  $('xpBar').style.width=`${p.percentage}%`;
  $('strength').textContent=p.attributes.strength;
  $('endurance').textContent=p.attributes.endurance;
  $('agility').textContent=p.attributes.agility;
  $('discipline').textContent=p.attributes.discipline;
  $('questCount').textContent=`${state.completed.length}/${QUESTS.length}`;
  $('totalQuests').textContent=state.totalQuests;
  $('totalXp').textContent=state.totalXp;
  $('availableXp').textContent=`+${QUESTS.filter(q=>!state.completed.includes(q.id)).reduce((n,q)=>n+q.xp,0)} XP`;
  const history=$('xpHistory');history.replaceChildren();
  if(!(state.history||[]).length){const empty=document.createElement('p');empty.className='history-empty';empty.textContent='Nenhuma alteração de XP registrada nesta versão.';history.append(empty);}
  (state.history||[]).forEach(event=>{const item=document.createElement('div');item.className='history-item';const description=document.createElement('span');description.textContent=`${event.day} · ${event.mission}`;const delta=document.createElement('strong');delta.textContent=`${event.delta>0?'+':''}${event.delta} XP`;delta.className=event.delta>=0?'positive':'negative';item.append(description,delta);history.append(item);});
  const list=$('questList');list.replaceChildren();
  QUESTS.forEach(q=>{
    const done=state.completed.includes(q.id);
    const item=document.createElement('div');item.className=`quest${done?' done':''}`;
    const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',`${done?'Desmarcar':'Concluir'} missão: ${q.title}`);button.setAttribute('aria-pressed',String(done));
    const icon=document.createElement('i');icon.className='material-icons';icon.textContent=done?'check':'add';button.append(icon);
    button.addEventListener('click',()=>{
      const result=changeMission(state,q.id);state=result.state;persist();render();
      M.toast({html:result.done?'Missão desmarcada':`Missão concluída! +${q.xp} XP`});
    });
    const info=document.createElement('div');info.className='quest-info';
    const title=document.createElement('div');title.className='quest-title';title.textContent=q.title;
    const sub=document.createElement('div');sub.className='quest-sub';sub.textContent=q.description;info.append(title,sub);
    const xp=document.createElement('span');xp.className='quest-xp';xp.textContent=`+${q.xp} XP`;
    item.append(button,info,xp);list.append(item);
  });
}
document.addEventListener('DOMContentLoaded',()=>{
  M.Modal.init(document.querySelectorAll('.modal'));
  M.FormSelect.init(document.querySelectorAll('select'));
  $('editProfile').addEventListener('click',()=>{
    $('nameInput').value=state.name;$('classInput').value=state.playerClass;
    const select=M.FormSelect.getInstance($('classInput'));if(select)select.destroy();M.FormSelect.init($('classInput'));
    M.updateTextFields();M.Modal.getInstance($('profileModal')).open();
  });
  $('profileForm').addEventListener('submit',event=>{
    event.preventDefault();
    try {state=editPlayer(state,$('nameInput').value,$('classInput').value);} catch(err){M.toast({html:err.message});return;}
    persist();render();M.Modal.getInstance($('profileModal')).close();M.toast({html:'Perfil atualizado!'});
  });
  $('resetDay').addEventListener('click',()=>{
    if(!window.confirm('Desmarcar as missões de hoje e remover o XP recebido por elas?'))return;
    state=resetMissions(state);persist();render();M.toast({html:'Missões reiniciadas.'});
  });
  $('exportBackup').addEventListener('click',()=>{
    const blob=new Blob([exportBackup(state)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='SYSTEM-backup-'+localDay()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  $('importBackup').addEventListener('click',()=>$('backupFile').click());
  $('backupFile').addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try{if(file.size>500000)throw new Error('Backup maior que 500 KB');const next=importBackup(await file.text());if(!confirm('Substituir os dados atuais pelo backup?'))return;
      if(!saveState(next))throw new Error('Não foi possível salvar o backup');state=next;render();M.toast({html:'Backup importado com sucesso!'});
    }catch(error){M.toast({html:error.message});}finally{e.target.value='';}
  });
  persist();render();
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden && state.day!==localDay()){state={...state,day:localDay(),completed:[]};persist();render();}
  });
});

})();
