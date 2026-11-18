/* Camada local mínima para os componentes Materialize usados pelo SYSTEM. */
(()=>{'use strict';
const instances=new WeakMap();
function modalInstance(el){if(!el)return null;if(instances.has(el))return instances.get(el);
let overlay;const api={open(){if(el.classList.contains('open'))return;overlay=document.createElement('div');overlay.className='modal-overlay';overlay.addEventListener('click',()=>api.close());document.body.append(overlay);el.classList.add('open');el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.querySelector('input,button')?.focus();},close(){el.classList.remove('open');overlay?.remove();overlay=null;}};
el.querySelectorAll('.modal-close').forEach(btn=>btn.addEventListener('click',()=>api.close()));instances.set(el,api);return api;}
window.M={Modal:{init:els=>Array.from(els).map(modalInstance),getInstance:modalInstance},FormSelect:{init:()=>{},getInstance:()=>null},updateTextFields:()=>{},toast:({html})=>{let t=document.querySelector('.toast-container');if(!t){t=document.createElement('div');t.className='toast-container';t.setAttribute('role','status');document.body.append(t);}t.textContent=String(html);clearTimeout(t._timeout);t._timeout=setTimeout(()=>t.remove(),3300);}};
document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('.material-icons').forEach(i=>i.dataset.icon=i.textContent.trim());});
})();
