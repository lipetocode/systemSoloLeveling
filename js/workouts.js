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
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(new Date(date+'T00:00:00Z').getTime())||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)throw Error('Data inválida');
 if(!Number.isInteger(sets)||sets<1||sets>30)throw Error('Séries devem estar entre 1 e 30');
 if(!Number.isInteger(reps)||reps<1||reps>200)throw Error('Repetições devem estar entre 1 e 200');
 if(!Number.isFinite(weight)||weight<0||weight>1000)throw Error('Carga deve estar entre 0 e 1000 kg');
 return {date,exercise:name,sets,reps,weight,notes:String(record.notes||'').slice(0,300)};
}
function parse(raw){const records=JSON.parse(raw||'[]');if(!Array.isArray(records)||records.length>MAX)throw Error('Histórico inválido');return records.map(r=>({...validate(r),id:String(r.id||'').slice(0,80)})).filter(r=>r.id);}
function read(){try{return parse(localStorage.getItem(KEY));}catch{return [];}}
function write(records){try{localStorage.setItem(KEY,JSON.stringify(records));return true;}catch{return false;}}
const uid=()=>`${Date.now()}-${Math.random().toString(36).slice(2,11)}`;
const SESSION_KEY='system-workouts-v2';
const groups=['Não informado','Peitoral','Costas','Ombros','Bíceps','Tríceps','Quadríceps','Posterior de coxa','Glúteos','Panturrilhas','Abdômen','Antebraços','Corpo inteiro','Outro'];
function validateSession(s){
 if(!s||typeof s!=='object'||!Array.isArray(s.exercises)||s.exercises.length<1||s.exercises.length>30)throw Error('Informe de 1 a 30 exercícios');
 const id=String(s.id||'').trim(),name=String(s.name||'').trim();if(!id||id.length>100||!name||name.length>80)throw Error('Sessão inválida');
 const date=String(s.date||'');validate({date,exercise:name,sets:1,reps:1,weight:0});
 return {id,date,name,notes:String(s.notes||'').slice(0,300),exercises:s.exercises.map(e=>{
 if(!e||!Array.isArray(e.sets)||!e.sets.length||e.sets.length>30)throw Error('Informe de 1 a 30 séries por exercício');
 const exercise=String(e.name||'').trim();if(!exercise||exercise.length>80||!groups.includes(e.group))throw Error('Exercício ou grupo inválido');
 return {name:exercise,group:e.group,notes:String(e.notes||'').slice(0,300),sets:e.sets.map(t=>{if(!t||t.weight===''||t.reps===''||t.weight==null||t.reps==null||!['prep','work','unknown'].includes(t.type))throw Error('Série inválida');const v=validate({date,exercise,sets:1,reps:t.reps,weight:t.weight});return {weight:v.weight,reps:v.reps,type:t.type};})};
 })};
}
function parseSessions(raw){const a=JSON.parse(raw);if(!Array.isArray(a)||a.length>MAX)throw Error('Histórico inválido');const out=a.map(validateSession);if(new Set(out.map(s=>s.id)).size!==out.length)throw Error('IDs duplicados');return out;}
function migrate(records){return parseSessions(JSON.stringify(records.map(r=>({id:'legacy-'+r.id,date:r.date,name:r.exercise,notes:r.notes,exercises:[{name:r.exercise,group:'Não informado',sets:Array.from({length:r.sets},()=>({weight:r.weight,reps:r.reps,type:'unknown'}))}]}))));}
function totals(s){let total=0,effective=0,work=0,prep=0,unknown=0;for(const e of s.exercises)for(const t of e.sets){const v=t.weight*t.reps;total+=v;if(t.type==='work'){effective+=v;work++;}else if(t.type==='prep')prep++;else unknown++;}return {total,effective,work,prep,unknown};}
function decodeBackup(b){if(b?.format!=='system-workouts')throw Error('Backup inválido');if(b.version===2)return parseSessions(JSON.stringify(b.sessions));if(b.version===1){if(!Array.isArray(b.records)||b.records.some(r=>!r?.id))throw Error('Registros antigos inválidos');return migrate(parse(JSON.stringify(b.records)));}throw Error('Versão de backup incompatível');}
function init(){const form=el('workoutForm');if(!form)return;let records,editing=null;const host=el('sessionExercises');
 const save=a=>localStorage.setItem(SESSION_KEY,JSON.stringify(a));
 try{const raw=localStorage.getItem(SESSION_KEY);if(raw!==null)records=parseSessions(raw);else{const old=localStorage.getItem(KEY);records=old===null?[]:decodeBackup({format:'system-workouts',version:1,records:JSON.parse(old)});save(records);}}catch(e){const p=document.createElement('p');p.textContent='Não foi possível carregar os treinos. Dados originais preservados. '+e.message;el('workoutList').append(p);form.querySelectorAll('button,input,textarea').forEach(x=>x.disabled=true);el('exportWorkouts').disabled=true;el('importWorkouts').disabled=true;return;}
 const node=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 const button=(text,fn)=>{const b=node('button','btn-flat outline-btn',text);b.type='button';b.addEventListener('click',fn);return b;};
 function field(parent,label,tag,props,options){const l=node('label','',label),n=node(tag);Object.assign(n,props);if(options)for(const [value,text] of options){const o=node('option','',text);o.value=value;n.append(o);}if(props.value!==undefined)n.value=props.value;l.append(n);parent.append(l);return n;}
 function addExercise(data={name:'',group:'Não informado',sets:[{weight:0,reps:10,type:'work'}]}){if(host.children.length>=30)return;const card=node('section','session-exercise'),head=node('div','session-exercise-head'),fields=node('div','session-exercise-fields'),rows=node('div','session-sets');head.append(node('strong','','EXERCÍCIO'),button('REMOVER',()=>{if(host.children.length>1){card.remove();refresh();}}));card.append(head,fields,rows);field(fields,'EXERCÍCIO','input',{className:'ex-name',required:true,maxLength:80,value:data.name});field(fields,'GRUPO MUSCULAR','select',{className:'ex-group',value:data.group},groups.map(g=>[g,g]));field(fields,'OBSERVAÇÕES DO EXERCÍCIO','input',{className:'ex-notes',maxLength:300,value:data.notes||''});
 function addSet(t={weight:0,reps:10,type:'work'}){if(rows.children.length>=30)return;const row=node('div','session-set');field(row,'CARGA (KG)','input',{className:'set-weight',type:'number',min:0,max:1000,step:'0.01',required:true,value:t.weight});field(row,'REPETIÇÕES','input',{className:'set-reps',type:'number',min:1,max:200,step:1,required:true,value:t.reps});field(row,'TIPO','select',{className:'set-type',value:t.type},[['prep','Preparatória'],['work','Efetiva'],['unknown','Não classificada']]);row.append(button('REMOVER SÉRIE',()=>{if(rows.children.length>1){row.remove();refresh();}}));rows.append(row);refresh();}
 card.append(button('+ SÉRIE',()=>addSet()));host.append(card);data.sets.forEach(addSet);refresh();}
 function collect(){return {id:editing||uid(),date:el('workoutDate').value,name:el('sessionName').value,notes:el('workoutNotes').value,exercises:Array.from(host.children,c=>({name:c.querySelector('.ex-name').value,group:c.querySelector('.ex-group').value,notes:c.querySelector('.ex-notes').value,sets:Array.from(c.querySelectorAll('.session-set'),r=>({weight:r.querySelector('.set-weight').value,reps:r.querySelector('.set-reps').value,type:r.querySelector('.set-type').value}))}))};}
 const fmt=n=>n.toLocaleString('pt-BR',{maximumFractionDigits:2});
 function refresh(){const s=collect();const t=totals(s);el('sessionTotals').textContent=`${s.exercises.length} exercício(s) · ${t.work} efetiva(s) · ${t.prep} preparatória(s) · ${t.unknown} não classificada(s) · Volume total: ${fmt(t.total)} kg · Efetivo: ${fmt(t.effective)} kg`;}
 function reset(s){editing=s?.id||null;host.replaceChildren();el('workoutDate').value=s?.date||today();el('sessionName').value=s?.name||'';el('workoutNotes').value=s?.notes||'';(s?.exercises||[undefined]).forEach(addExercise);el('workoutSubmit').textContent=editing?'ATUALIZAR SESSÃO':'SALVAR SESSÃO';refresh();}
 function commit(next){save(next);records=next;render();}
 function render(){const list=el('workoutList');list.replaceChildren();el('workoutCount').textContent=`${records.length} sessão(ões)`;if(!records.length)list.append(node('p','history-empty','Nenhuma sessão registrada.'));for(const s of records.slice().sort((a,b)=>b.date.localeCompare(a.date))){const item=node('div','workout-item'),info=node('div','workout-info'),actions=node('div','workout-actions'),t=totals(s);info.append(node('strong','',s.name),node('span','',`${s.date} · ${s.exercises.length} exercício(s) · ${fmt(t.total)} kg · ${t.work} séries efetivas`));for(const e of s.exercises)info.append(node('small','',`${e.name} (${e.group}): ${e.sets.map(x=>`${x.weight} kg × ${x.reps} (${({prep:'P',work:'E',unknown:'?'})[x.type]})`).join(' / ')}`));if(s.notes)info.append(node('small','',s.notes));actions.append(button('EDITAR',()=>{reset(s);form.scrollIntoView({block:'center'});}),button('EXCLUIR',()=>{if(confirm('Excluir esta sessão?'))try{commit(records.filter(x=>x.id!==s.id));if(editing===s.id)reset();}catch(e){alert(e.message);}}));item.append(info,actions);list.append(item);}}
 form.addEventListener('input',refresh);form.addEventListener('change',refresh);el('addExercise').addEventListener('click',()=>addExercise());el('workoutCancel').addEventListener('click',()=>reset());form.addEventListener('submit',e=>{e.preventDefault();try{const s=validateSession(collect());const next=editing?records.map(x=>x.id===editing?s:x):[...records,s];if(next.length>MAX)throw Error('Limite de 300 sessões');commit(next);reset();}catch(e){alert(e.message);}});
 el('exportWorkouts').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({format:'system-workouts',version:2,sessions:records},null,2)],{type:'application/json'}));const a=node('a');a.href=url;a.download=`SYSTEM-treinos-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});el('importWorkouts').addEventListener('click',()=>el('workoutFile').click());el('workoutFile').addEventListener('change',async e=>{try{const f=e.target.files?.[0];if(!f)return;if(f.size>50000000)throw Error('Arquivo muito grande');const next=decodeBackup(JSON.parse(await f.text()));if(confirm('Substituir todas as sessões atuais pelo backup?')){commit(next);reset();}}catch(err){alert(err.message);}finally{e.target.value='';}});reset();render();
}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',init);
if(typeof module!=='undefined'&&module.exports)module.exports={validate,parse,validateSession,parseSessions,migrate,totals,decodeBackup};
})();
