import { mountNetworkThesis } from './network-thesis.mjs'
import { mountProductCarousel } from './product-carousel.mjs'
import { mountScrollFrames } from './scroll-frames.mjs'
import { mountHardwareReveal } from './hardware-reveal.mjs'
import { mountArrival } from './monument-arrival.mjs'
import { bindEnquiryForm } from './enquiry-form.mjs'
export function mountMonument(root) {
 const cleanups=[];
 const events=new AbortController();
 const on=(target,type,callback,options={})=>target?.addEventListener(type,callback,{...options,signal:events.signal});
const $=s=>root.querySelector(s);
const $$=s=>[...root.querySelectorAll(s)];
const menu=$('#mobile-menu'), toggle=$('.menu-toggle');
const menuBackground=$$('main,.site-footer,.mobile-dock');
function closeMenu(restoreFocus=false){
 if(!menu||!toggle)return;
 const wasOpen=!menu.hidden;menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open menu');document.body.classList.remove('menu-open');menuBackground.forEach(el=>el.inert=false);
 if(restoreFocus&&wasOpen)toggle.focus();
}
on(toggle,'click',()=>{
 if(!menu.hidden){closeMenu(true);return;}
 menu.hidden=false;toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','Close menu');document.body.classList.add('menu-open');menuBackground.forEach(el=>el.inert=true);menu.querySelector('a').focus();
});
$$('.mobile-menu a').forEach(a=>on(a,'click',()=>closeMenu()));
on(document,'keydown',e=>{
 if(menu.hidden)return;
 if(e.key==='Escape'){e.preventDefault();closeMenu(true);return;}
 if(e.key==='Tab'){
  const controls=[toggle,...menu.querySelectorAll('a,button')];const first=controls[0],last=controls[controls.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
});
cleanups.push(mountProductCarousel(root));
cleanups.push(mountNetworkThesis(root));
const workflows={"files":{"quote":["“Pick up the","approved direction.”"],"note":"Bring the approved brief, product assets and latest client feedback into the same working context.","files":["Approved brief","Product assets","Client feedback"]},"apps":{"quote":["“Change the background.","Keep the product.”"],"note":"Propose a targeted edit using the approved product asset. Compare the new version before accepting it.","files":["Product reference","Background revision","Version comparison"]},"flows":{"quote":["“Review the change.","Approve the delivery.”"],"note":"A named reviewer signs off the selected version before the workflow prepares the agreed delivery formats.","files":["Reviewer sign-off","Approved version","Delivery formats"]}};
$$('[data-workflow]').forEach(t=>on(t,'click',()=>{const w=workflows[t.dataset.workflow];$('#work-quote').replaceChildren(document.createTextNode(w.quote[0]),document.createElement('br'),document.createTextNode(w.quote[1]));$('#work-note').textContent=w.note;$('#workspace-files').replaceChildren(...w.files.map(text=>{const span=document.createElement('span');span.textContent=text;return span;}));$('#work-panel').setAttribute('aria-labelledby',t.id);$$('[data-workflow]').forEach(tab=>{const active=tab===t;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});}));
$$('[role=tablist]').forEach(list=>on(list,'keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=[...list.querySelectorAll('[role=tab]')];const i=tabs.indexOf(document.activeElement);const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].click();tabs[next].focus();}));
let lastOpener=null;
function openDialog(dialog,opener){if(!dialog)return;lastOpener=opener;closeMenu();dialog.showModal();document.body.style.overflow='hidden';if(dialog.id==='enquiry-dialog')dialog.querySelector('h2').focus({preventScroll:true});}
function closeDialog(dialog){dialog.close();document.body.style.overflow='';(lastOpener?.closest('#mobile-menu')?toggle:lastOpener)?.focus();}
function resetEnquiry(dialog){const form=dialog.querySelector('form');form.hidden=false;form.querySelector('.form-error').hidden=true;dialog.querySelector('.form-status').hidden=true;}
$$('.register-open').forEach(button=>on(button,'click',()=>{const dialog=$('#register-dialog');resetEnquiry(dialog);$('#register-product').value=button.dataset.interest||'Still exploring';openDialog(dialog,button);}));
$$('.enquiry-open').forEach(button=>on(button,'click',()=>{const dialog=$('#enquiry-dialog');resetEnquiry(dialog);$('#enquiry-interest').value=button.dataset.interest||'General question';openDialog(dialog,button);}));
$$('.compare-open').forEach(button=>on(button,'click',e=>openDialog($('#compare-dialog'),e.currentTarget)));
$$('dialog').forEach(dialog=>{dialog.querySelectorAll('.dialog-close,.dialog-done').forEach(button=>on(button,'click',()=>closeDialog(dialog)));on(dialog,'close',()=>{document.body.style.overflow='';if(lastOpener?.closest('#mobile-menu'))toggle.focus();});on(dialog,'click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(dialog);});});

cleanups.push(mountArrival());
cleanups.push(mountHardwareReveal(root));
cleanups.push(mountScrollFrames(root));


 $$('[data-enquiry-kind]').forEach(form=>cleanups.push(bindEnquiryForm(form)));
 return ()=>{events.abort();cleanups.forEach(fn=>fn?.());closeMenu();document.body.style.overflow='';};
}
