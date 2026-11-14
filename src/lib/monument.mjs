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
// Native scrolling owns touch gestures; tabs and arrows share the same position.
const carousel=$('.product-carousel'), productSlides=$$('[data-product-slide]');
let productIndex=0;
function selectProduct(index){
 productIndex=Math.max(0,Math.min(productSlides.length-1,index));
 const key=productSlides[productIndex].dataset.productSlide;
 $('#hardware').dataset.product=key;
 $$('[data-product][role=tab]').forEach(t=>{const active=t.dataset.product===key;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;});
 productSlides.forEach((slide,i)=>{slide.inert=i!==productIndex;slide.setAttribute('aria-hidden',String(i!==productIndex));});
 $('.carousel-count').textContent=String(productIndex+1).padStart(2,'0')+' / 03';
 $('.carousel-prev').disabled=productIndex===0;$('.carousel-next').disabled=productIndex===productSlides.length-1;
}
function chooseProduct(index){if(!carousel)return;carousel.scrollTo({left:carousel.clientWidth*index,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}
if(carousel){
 let frame=0;
 on(carousel,'scroll',()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;selectProduct(Math.round(carousel.scrollLeft/carousel.clientWidth));});},{passive:true});
 $$('[data-product][role=tab]').forEach((tab,i)=>on(tab,'click',()=>chooseProduct(i)));
 on($('.carousel-prev'),'click',()=>chooseProduct(productIndex-1));
 on($('.carousel-next'),'click',()=>chooseProduct(productIndex+1));
 // Mouse dragging complements native touch swipes without intercepting page scrolling.
 let drag=null;
 on(carousel,'pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('a,button'))return;drag={x:e.clientX,y:e.clientY,left:carousel.scrollLeft,active:false};});
 on(carousel,'pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.active&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){drag.active=true;carousel.setPointerCapture(e.pointerId);carousel.classList.add('is-dragging');}if(drag.active){carousel.scrollLeft=drag.left-dx;e.preventDefault();}});
 const release=()=>{if(!drag)return;const active=drag.active;drag=null;carousel.classList.remove('is-dragging');if(active)chooseProduct(Math.round(carousel.scrollLeft/carousel.clientWidth));};
 on(carousel,'pointerup',release);on(carousel,'pointercancel',release);on(carousel,'lostpointercapture',release);
 let width=carousel.clientWidth;const observer=new ResizeObserver(()=>{if(width!==carousel.clientWidth){width=carousel.clientWidth;carousel.scrollTo({left:width*productIndex,behavior:'instant'});}});observer.observe(carousel);cleanups.push(()=>{observer.disconnect();cancelAnimationFrame(frame);});
 selectProduct(0);
}
const workflows={"files":{"quote":["“Find the latest.","Show what changed.”"],"note":"Bring the approved brief, references and feedback into one project context.","files":["Brief v3.pdf","Approved references","Client feedback"]},"apps":{"quote":["“Bring the tools.","Keep the context.”"],"note":"Coordinate connected applications around the same goal, with access you approve.","files":["Design application","Project tracker","Access approved"]},"flows":{"quote":["“From this brief.","To a first direction.”"],"note":"Propose a sequence of tasks. Review the plan and approve key actions before your agent proceeds.","files":["Gather context","Propose plan","Await approval"]}};
$$('[data-workflow]').forEach(t=>on(t,'click',()=>{const w=workflows[t.dataset.workflow];$('#work-quote').replaceChildren(document.createTextNode(w.quote[0]),document.createElement('br'),document.createTextNode(w.quote[1]));$('#work-note').textContent=w.note;$('#workspace-files').replaceChildren(...w.files.map(text=>{const span=document.createElement('span');span.textContent=text;return span;}));$('#work-panel').setAttribute('aria-labelledby',t.id);$$('[data-workflow]').forEach(tab=>{const active=tab===t;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});}));
$$('[role=tablist]').forEach(list=>on(list,'keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=[...list.querySelectorAll('[role=tab]')];const i=tabs.indexOf(document.activeElement);const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].click();tabs[next].focus();}));
let lastOpener=null;
function openDialog(dialog,opener){if(!dialog)return;lastOpener=opener;closeMenu();dialog.showModal();document.body.style.overflow='hidden';}
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
