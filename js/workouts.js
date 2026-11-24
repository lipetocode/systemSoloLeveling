/* SYSTEM workout registry — classic script, file:// compatible */
(()=>{'use strict';
const KEY='system-workouts-v1', MAX=300;
const el=id=>document.getElementById(id);
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
function validate(record){
 if(!record||typeof record!=='object')throw Error('Registro inválido');
 const name=String(record.exercise||'').trim().slice(0,80), date=String(record.date||'');
 const sets=Number(record.sets), reps=Number(record.reps), weight=Number(record.weight);
 if(!name)throw Error('Informe o exercício');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(new Date(date+'T12:00:00').getTime())||new Date(date+'T12:00:00').toISOString().slice(0,10)!==date)throw Error('Data inválida');
 if(!Number.isInteger(sets)||sets<1||sets>30)throw Error('Séries devem estar entre 1 e 30');
 if(!Number.isInteger(reps)||reps<1||reps>200)throw Error('Repetições devem estar entre 1 e 200');
 if(!Number.isFinite(weight)||weight<0||weight>1000)throw Error('Carga deve estar entre 0 e 1000 kg');
 return {date,exercise:name,sets,reps,weight,notes:String(record.notes||'').slice(0,300)};
}
function parse(raw){const records=JSON.parse(raw||'[]');if(!Array.isArray(records)||records.length>MAX)throw Error('Histórico inválido');return records.map(r=>({...validate(r),id:String(r.id||'').slice(0,80)})).filter(r=>r.id);}
function read(){try{return parse(localStorage.getItem(KEY));}catch{return [];}}
function write(records){try{localStorage.setItem(KEY,JSON.stringify(records));return true;}catch{return false;}}
const uid=()=>`${Date.now()}-${Math.random().toString(36).slice(2,11)}`;
function init(){const form=el('workoutForm');if(!form)return;let records=read(),editing=null;
 el('workoutDate').value=today();
 function render(){const list=el('workoutList');list.replaceChildren();el('workoutCount').textContent=`${records.length} registro(s)`;
  if(!records.length){const p=document.createElement('p');p.className='history-empty';p.textContent='Nenhum exercício registrado ainda.';list.append(p);return;}
  records.slice().sort((a,b)=>b.date.localeCompare(a.date)).forEach(r=>{const item=document.createElement('div');item.className='workout-item';
   const info=document.createElement('div');info.className='workout-info';const title=document.createElement('strong');title.textContent=r.exercise;
   const details=document.createElement('span');details.textContent=`${r.date} · ${r.sets} séries × ${r.reps} rep. · ${r.weight} kg`;
   info.append(title,details);if(r.notes){const notes=document.createElement('small');notes.textContent=r.notes;info.append(notes);}
   const actions=document.createElement('div');actions.className='workout-actions';
   const edit=document.createElement('button');edit.type='button';edit.textContent='EDITAR';edit.className='btn-flat outline-btn';edit.addEventListener('click',()=>{editing=r.id;el('workoutDate').value=r.date;el('workoutExercise').value=r.exercise;el('workoutSets').value=r.sets;el('workoutReps').value=r.reps;el('workoutWeight').value=r.weight;el('workoutNotes').value=r.notes;el('workoutSubmit').textContent='ATUALIZAR REGISTRO';form.scrollIntoView({behavior:'smooth',block:'center'});});
   const del=document.createElement('button');del.type='button';del.textContent='EXCLUIR';del.className='btn-flat outline-btn';del.addEventListener('click',()=>{if(!confirm('Excluir este registro?'))return;const next=records.filter(x=>x.id!==r.id);if(!write(next)){alert('Não foi possível salvar a exclusão.');return;}records=next;render();});
   actions.append(edit,del);item.append(info,actions);list.append(item);
  });
 }
 form.addEventListener('submit',e=>{e.preventDefault();try{const data=validate({date:el('workoutDate').value,exercise:el('workoutExercise').value,sets:el('workoutSets').value,reps:el('workoutReps').value,weight:el('workoutWeight').value,notes:el('workoutNotes').value});const next=editing?records.map(r=>r.id===editing?{...data,id:r.id}:r):[...records,{...data,id:uid()}];if(next.length>MAX)throw Error('Limite de 300 registros atingido');if(!write(next))throw Error('Armazenamento indisponível');records=next;editing=null;form.reset();el('workoutDate').value=today();el('workoutSubmit').textContent='SALVAR EXERCÍCIO';render();}catch(err){alert(err.message);}});
 el('workoutCancel').addEventListener('click',()=>{editing=null;form.reset();el('workoutDate').value=today();el('workoutSubmit').textContent='SALVAR EXERCÍCIO';});
 el('exportWorkouts').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({format:'system-workouts',version:1,records},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`SYSTEM-treinos-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 el('importWorkouts').addEventListener('click',()=>el('workoutFile').click());
 el('workoutFile').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>250000)throw Error('Arquivo excede 250 KB');const parsed=JSON.parse(await file.text());if(parsed?.format!=='system-workouts'||parsed.version!==1||!Array.isArray(parsed.records))throw Error('Formato de backup de treinos inválido');const next=parse(JSON.stringify(parsed.records));if(new Set(next.map(x=>x.id)).size!==next.length)throw Error('IDs duplicados no backup');if(!confirm('Substituir todos os registros de treino pelos dados importados?'))return;if(!write(next))throw Error('Não foi possível salvar');records=next;render();alert('Treinos restaurados.');}catch(err){alert(err.message);}finally{e.target.value='';}});
 render();
}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',init);
if(typeof module!=='undefined'&&module.exports)module.exports={validate,parse};
})();
