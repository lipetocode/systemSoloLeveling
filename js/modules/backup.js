import {STORAGE_KEY,loadState} from './storage.js';
export function exportBackup(state){return JSON.stringify({format:'system-backup',version:1,exportedAt:new Date().toISOString(),state},null,2);}
export function importBackup(raw){
 if(typeof raw!=='string'||raw.length>500000)throw new Error('Arquivo muito grande ou inválido');
 let parsed;try{parsed=JSON.parse(raw);}catch{throw new Error('JSON inválido');}
 if(parsed?.format!=='system-backup'||parsed.version!==1||!parsed.state||typeof parsed.state!=='object')throw new Error('Formato de backup não reconhecido');
 const original=parsed.state;
 if(!Number.isSafeInteger(original.xp)||original.xp<0||!Number.isSafeInteger(original.totalXp)||original.totalXp<0||!Array.isArray(original.completed))throw new Error('Dados do jogador inválidos');
 return loadState({getItem:k=>k===STORAGE_KEY?JSON.stringify(original):null});
}
