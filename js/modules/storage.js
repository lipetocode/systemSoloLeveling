import {QUESTS,localDay} from './missions.js';
export const STORAGE_KEY='system-player-v1';
export const defaults=()=>({name:'Caçador',playerClass:'INICIANTE',xp:0,totalXp:0,totalQuests:0,day:localDay(),completed:[]});
export function loadState(storage=localStorage) {
  try {
    const raw=JSON.parse(storage.getItem(STORAGE_KEY));
    if(!raw || typeof raw!=='object' || Array.isArray(raw)) return defaults();
    const state={...defaults(),...raw};
    if(!['xp','totalXp','totalQuests'].every(k=>Number.isSafeInteger(state[k]) && state[k]>=0)) return defaults();
    state.name=typeof state.name==='string' && state.name.trim()?state.name.slice(0,32):'Caçador';
    state.playerClass=['INICIANTE','GUERREIRO','SENTINELA'].includes(state.playerClass)?state.playerClass:'INICIANTE';
    state.completed=Array.isArray(state.completed)?[...new Set(state.completed.filter(id=>QUESTS.some(q=>q.id===id)))]:[];
    if(state.day!==localDay()){state.day=localDay();state.completed=[];}
    return state;
  } catch {return defaults();}
}
export function saveState(state,storage=localStorage) {
  try {storage.setItem(STORAGE_KEY,JSON.stringify(state));return true;} catch {return false;}
}
