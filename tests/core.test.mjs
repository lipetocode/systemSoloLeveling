import test from 'node:test';
import assert from 'node:assert/strict';
import {xpRequired,progressFor,attributesFor} from '../js/modules/xp.js';
import {changeMission,resetMissions} from '../js/modules/missions.js';
import {defaults,loadState,saveState,STORAGE_KEY} from '../js/modules/storage.js';
import {editPlayer,playerView} from '../js/modules/player.js';
test('progressão e excedente',()=>{assert.equal(xpRequired(2),283);assert.deepEqual(progressFor(110),{level:2,xp:10,required:283,percentage:10/283*100});assert.equal(progressFor(1000).level,4);assert.equal(attributesFor(2).strength,12);});
test('XP inválido',()=>{assert.throws(()=>progressFor(-1));assert.throws(()=>xpRequired(0));});
test('missão completa e reversão',()=>{const s=defaults();const a=changeMission(s,'workout',s.day);assert.equal(a.state.xp,40);const b=changeMission(a.state,'workout',s.day);assert.equal(b.state.xp,0);assert.equal(b.state.totalQuests,0);});
test('reset só desconta missões do dia',()=>{const s=defaults();const a=changeMission(s,'cardio',s.day).state;assert.equal(resetMissions(a,s.day).xp,0);});
test('perfil',()=>{const s=editPlayer(defaults(),' Hunter ','GUERREIRO');assert.equal(playerView(s).name,'Hunter');assert.throws(()=>editPlayer(s,' ','INICIANTE'));});
test('persistência',()=>{const data=new Map();const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};const s=defaults();assert.equal(saveState(s,storage),true);assert.equal(loadState(storage).name,s.name);assert.ok(data.has(STORAGE_KEY));});

test('histórico registra ganhos, reversões e reinício',()=>{const s=defaults();const a=changeMission(s,'workout',s.day).state;assert.equal(a.history[0].delta,40);const b=changeMission(a,'workout',s.day).state;assert.equal(b.history[0].delta,-40);const c=changeMission(b,'cardio',s.day).state;const d=resetMissions(c,s.day);assert.equal(d.history[0].delta,-30);assert.equal(d.xp,0);});
test('histórico legado e dados inválidos',()=>{const data=new Map();const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};const legacy=defaults();delete legacy.history;data.set(STORAGE_KEY,JSON.stringify(legacy));assert.deepEqual(loadState(storage).history,[]);data.set(STORAGE_KEY,JSON.stringify({...legacy,history:[{day:'2026-11-12',mission:'Treino',delta:40},{delta:'bad'}]}));assert.equal(loadState(storage).history.length,1);});
