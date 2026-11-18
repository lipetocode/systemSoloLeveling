import {QUESTS,localDay,changeMission,resetMissions} from './modules/missions.js';
import {loadState,saveState} from './modules/storage.js';
import {playerView,editPlayer} from './modules/player.js';
import {exportBackup,importBackup} from './modules/backup.js';
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
