import {QUESTS,localDay} from './missions.js';
export const STORAGE_KEY='system-player-v1';
export const defaults=()=>({name:'Caçador',playerClass:'INICIANTE',xp:0,totalXp:0,totalQuests:0,day:localDay(),completed:[],history:[],bonuses:{strength:0,endurance:0,agility:0,discipline:0}});
export function loadState(storage=localStorage) {
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
export function saveState(state,storage=localStorage) {
  try {storage.setItem(STORAGE_KEY,JSON.stringify(state));return true;} catch {return false;}
}
