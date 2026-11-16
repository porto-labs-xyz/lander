export function mountNetworkThesis(root = document){
 const section=root.querySelector('[data-network-thesis]');
 if(!section)return () => {};
 const events = new AbortController();
 const states={
  reserve:{status:'Set aside what your studio needs.',label:'Available capacity'},
  share:{status:'Put spare hours to work.',label:'Shared with the network'},
  reclaim:{status:'Bring capacity back to your studio.',label:'Returned to your studio'}
 };
 const buttons=[...section.querySelectorAll('[data-network-step]')];
 const status=section.querySelector('[data-network-status]');
 const label=section.querySelector('[data-network-label]');
 for(const button of buttons)button.addEventListener('click',()=>{
  const state=button.dataset.networkStep;
  if(!states[state])return;
  section.dataset.networkState=state;
  buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  status.textContent=states[state].status;
  label.textContent=states[state].label;
 }, {signal:events.signal});
 return () => events.abort();
}
