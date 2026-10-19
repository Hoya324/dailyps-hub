(()=>{
 'use strict';
 const Capture=globalThis.DailyCapture;
 if(!Capture)return;
 console.info('[DailyPS] 감지 시작');
 const emit=(kind,payload)=>window.postMessage({source:'dailyps-hub-v1',kind,payload},location.origin);
 const lc=new Capture(s=>emit('accepted',s),s=>emit('notice',s));
 function meta(){
  const isLC=location.hostname==='leetcode.com';
  if(isLC){
   const slug=location.pathname.match(/\/problems\/([a-z0-9-]+)/)?.[1]||'';
   const candidates=[...document.querySelectorAll('[data-cy="question-title"],.text-title-large a,h1,a[href^="/problems/"]')];
   const title=candidates.map(x=>x.textContent.trim()).find(t=>/^\d+\.\s/.test(t));
   const m=title?.match(/^(\d+)\.\s*(.*)/);
   return {id:m?.[1],title:m?.[2]||slug,slug,url:`https://leetcode.com/problems/${slug}/`};
  }
  const id=location.pathname.match(/\/lessons\/(\d+)/)?.[1]||'';
  return{title:document.querySelector('.algorithm-title .challenge-title')?.textContent.trim()||id,url:`https://school.programmers.co.kr/learn/courses/30/lessons/${id}`};
 }
 const safe=(f)=>{try{f();}catch{console.warn('[DailyPS] 요청 해석 실패');}};
 const observe=(path,body,data,snapshot)=>{console.info('[DailyPS] 응답 감지', /submit/.test(path)?'submit':'check', {bodyType:typeof body,codePresent:typeof (typeof body==='string'?(()=>{try{return JSON.parse(body);}catch{return {};}})():body)?.typed_code==='string',state:data?.state,status:data?.status_code});lc.http(path,body,data,snapshot);};
 if(location.hostname==='leetcode.com'){
  const original=window.fetch;
  window.fetch=function(input,init){
   let path='',snapshot,body;
   safe(()=>{const u=new URL(typeof input==='string'||input instanceof URL?input:input.url,location.href);if(u.origin!==location.origin)return;path=u.pathname;snapshot=meta();body=init?.body??(input instanceof Request?input.clone().text():null);});
   const promise=original.apply(this,arguments);
   if(/\/submit\/$|\/check\/$/.test(path))promise.then(response=>{if(!response.ok)return;response.clone().json().then(async data=>observe(path,await body,data,snapshot)).catch(()=>{});}).catch(()=>{});
   return promise;
  };
  const open=XMLHttpRequest.prototype.open,send=XMLHttpRequest.prototype.send;
  const requests=new WeakMap();
  XMLHttpRequest.prototype.open=function(method,url){safe(()=>{const u=new URL(url,location.href);requests.set(this,u.origin===location.origin?u.pathname:'');});return open.apply(this,arguments);};
  XMLHttpRequest.prototype.send=function(body){const path=requests.get(this),snapshot=meta();if(path&&/\/submit\/$|\/check\/$/.test(path))this.addEventListener('load',()=>safe(()=>{if(this.status>=200&&this.status<300)observe(path,body,this.responseType==='json'?this.response:this.responseText,snapshot);}),{once:true});return send.apply(this,arguments);};
 } else {
  const send=WebSocket.prototype.send,connections=new WeakMap();
  WebSocket.prototype.send=function(data){
   safe(()=>{
    if(!connections.has(this)){
     const c=new Capture(s=>emit('accepted',s),s=>emit('notice',s));connections.set(this,c);
     this.addEventListener('message',e=>safe(()=>c.receive(e.data)));
    }
    connections.get(this).send(data,meta());
   });
   return send.apply(this,arguments);
  };
 }
})();
