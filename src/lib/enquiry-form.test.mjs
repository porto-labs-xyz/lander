import test from 'node:test'
import assert from 'node:assert/strict'
import { bindEnquiryForm, enquiryPayload, signupEndpoint } from './enquiry-form.mjs'
const tick=()=>new Promise(resolve=>setImmediate(resolve))
function fixture(kind='interest') {
 const label={textContent:'Send message'};const button={disabled:false,querySelector:()=>kind==='contact'?label:null},error={hidden:true},done={focus(){}},status={hidden:true,querySelector:()=>done}
 const form=new EventTarget();form.dataset={enquiryKind:kind};form.reportValidity=()=>true
 form.querySelector=s=>s==='[type=submit]'?button:error;form.querySelectorAll=()=>[button]
 form.closest=()=>({querySelector:()=>status});form.setAttribute=()=>{};form.removeAttribute=()=>{};form.reset=()=>{form.resetCalled=true}
 const fields={email:' test@example.com ',product:'Kiln Atelier Rack',consent:'on',reason:'Studio pilot',message:'Test'}
 return {form,button,label,error,status,fields,submit:()=>form.dispatchEvent(new Event('submit',{cancelable:true}))}
}
test('registration includes selected hardware and consent; contact never opts into marketing',()=>{
 const p=enquiryPayload('interest',{email:' a@example.com ',product:'Kiln Atelier Rack',consent:'on'});assert.equal(p.email,'a@example.com');assert.equal(p.product,'Kiln Atelier Rack');assert.equal(p.company_updates,'yes')
 assert.throws(()=>enquiryPayload('interest',{email:'a@example.com'}),/confirm/)
 const contact=enquiryPayload('contact',{email:'a@example.com',reason:'Studio pilot',message:'Hello',consent:'on'});assert.equal(contact.company_updates,'no');assert.equal(contact.consent_text,'');assert.equal(contact.reason,'Studio pilot')
 assert.throws(()=>enquiryPayload('interest',{website:'spam',consent:'on'}),/accept/)
})
test('one request per submission and success only after provider acknowledgement',async()=>{
 const f=fixture('contact');let finish,calls=0
 const dispose=bindEnquiryForm(f.form,{readFields:()=>f.fields,fetchImpl:(url,opts)=>{calls++;assert.equal(url,signupEndpoint);assert.equal(JSON.parse(opts.body).product,'Kiln Atelier Rack');return new Promise(r=>finish=r)}})
 f.submit();f.submit();assert.equal(calls,1);assert.equal(f.status.hidden,true);assert.equal(f.label.textContent,'Sending…')
 finish({ok:true,json:async()=>({ok:true})});await tick();assert.equal(f.status.hidden,false);assert.equal(f.form.resetCalled,true);assert.equal(f.label.textContent,'Send message');dispose()
})
test('media, legal and investor registrations preserve the selected interest for delivery',()=>{
 for(const product of ['Media','Legal','Investor interest']){
  const payload=enquiryPayload('interest',{email:'test@example.com',product,consent:'on'})
  assert.equal(payload.product,product);assert.equal(payload.kind,'interest');assert.equal(payload.company_updates,'yes')
  assert.throws(()=>enquiryPayload('interest',{email:'test@example.com',product}),/confirm/)
 }
})
for(const failure of ['rejected','network','timeout','unexpected-response']) test(`${failure} preserves fields and permits retry`,async()=>{
 const f=fixture('contact');const dispose=bindEnquiryForm(f.form,{readFields:()=>f.fields,timeoutMs:5,fetchImpl:(_url,opts)=>{
 if(failure==='network')return Promise.reject(new Error('offline'))
 if(failure==='timeout')return new Promise((_,reject)=>opts.signal.addEventListener('abort',()=>reject(new Error('timeout'))))
 return Promise.resolve({ok:failure==='unexpected-response',json:async()=>({errors:[{message:'not accepted'}]})})
 }})
 f.submit();await new Promise(r=>setTimeout(r,15));assert.equal(f.status.hidden,true);assert.equal(f.error.hidden,false);assert.equal(f.form.resetCalled,undefined);assert.equal(f.button.disabled,false);assert.equal(f.label.textContent,'Send message');dispose()
})
test('unmount cancels pending submission and removes its handler',async()=>{
 const f=fixture();let calls=0,signal
 const dispose=bindEnquiryForm(f.form,{readFields:()=>f.fields,fetchImpl:(_url,opts)=>{calls++;signal=opts.signal;return new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted'))))}})
 f.submit();dispose();f.submit();await tick();assert.equal(calls,1);assert.equal(signal.aborted,true);assert.equal(f.status.hidden,true)
})
