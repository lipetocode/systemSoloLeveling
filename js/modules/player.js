import {progressFor,attributesFor} from './xp.js';
export function playerView(state) {
  const progress=progressFor(state.xp);
  return {...progress,attributes:attributesFor(progress.level),name:state.name,playerClass:state.playerClass};
}
export function editPlayer(state,name,playerClass) {
  const clean=name.trim().slice(0,32);
  if(!clean) throw new Error('Nome obrigatório');
  if(!['INICIANTE','GUERREIRO','SENTINELA'].includes(playerClass)) throw new Error('Classe inválida');
  return {...state,name:clean,playerClass};
}
