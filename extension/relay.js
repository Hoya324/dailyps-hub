(()=>{
 let count=0,windowStart=Date.now();
 window.addEventListener('message',event=>{
  if(event.source!==window||event.origin!==location.origin||event.data?.source!=='dailyps-hub-v1')return;
  if(Date.now()-windowStart>60000){count=0;windowStart=Date.now();}
  if(++count>30||!chrome.runtime?.id)return;
  const {kind,payload}=event.data;
  if(kind==='accepted'&&payload&&typeof payload.code==='string'&&payload.code.length<=200000){
   chrome.runtime.sendMessage({type:'capture',submission:payload}).catch(()=>{});
  }else if(kind==='notice'&&typeof payload==='string'&&payload.length<200){
   chrome.runtime.sendMessage({type:'captureNotice'}).catch(()=>{});
  }
 });
})();
