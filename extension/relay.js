(()=>{
 let count=0,windowStart=Date.now();
 window.addEventListener('message',event=>{
  if(event.source!==window||event.origin!==location.origin||event.data?.source!=='dailyps-hub-v1')return;
  if(Date.now()-windowStart>60000){count=0;windowStart=Date.now();}
  if(++count>30||!chrome.runtime?.id)return;
  const {kind,payload}=event.data;
  if(kind==='accepted'&&payload&&typeof payload.code==='string'&&payload.code.length<=200000){
   console.info('[DailyPS] 정답 감지 · 저장 요청 전달');
   chrome.runtime.sendMessage({type:'capture',submission:payload,pageUrl:location.href}).then(result=>{if(!result?.ok)console.warn('[DailyPS] 저장 요청 거절:',result?.error);else console.info('[DailyPS] 저장 요청 응답:',result.ignored?'자동 저장 꺼짐':'접수 완료');}).catch(()=>console.warn('[DailyPS] 확장 연결 종료 · 문제 페이지를 새로고침하세요.'));
  }else if(kind==='notice'&&typeof payload==='string'&&payload.length<200){
   chrome.runtime.sendMessage({type:'captureNotice'}).catch(()=>{});
  }
 });
})();
