const $=id=>document.getElementById(id);
async function call(message){const r=await chrome.runtime.sendMessage(message);if(!r?.ok)throw Error(r?.error||'확장을 새로고침하세요.');return r;}
function status(text,isError=false){$('status').textContent=text;$('status').classList.toggle('error',isError);}
async function refresh(initial=false){const s=await call({type:'state'});if(initial){for(const k of ['owner','repo','branch','folder'])$(k).value=s.config[k];$('enabled').checked=s.connected?s.config.enabled:true;status(s.status);}
 $('tokenHint').textContent=s.connected?'토큰이 저장되어 있습니다. 그대로 사용하려면 비워두세요.':'선택한 저장소의 Contents: Read and write 권한이 필요합니다.';
 $('queueInfo').textContent=`대기 ${s.queue.length}개`;$('queue').replaceChildren();for(const q of s.queue){const li=document.createElement('li');li.textContent=`${q.title} → ${q.destination}${q.error?' / '+q.error:''}`;$('queue').append(li);}}
$('form').onsubmit=async e=>{e.preventDefault();$('save').disabled=true;status('GitHub 저장소와 브랜치를 확인하고 있습니다…');try{const config=Object.fromEntries(['owner','repo','branch','folder'].map(k=>[k,$(k).value]));config.enabled=$('enabled').checked;await call({type:'saveConfig',config,token:$('token').value});$('token').value='';status('연결했습니다. 열려 있는 문제 페이지를 새로고침한 뒤 제출하세요.');await refresh();}catch(error){status(error.message,true);}finally{$('save').disabled=false;}};
for(const [id,type] of [['retry','retry'],['clear','clearQueue'],['disconnect','disconnect']])$(id).onclick=async()=>{if(id==='clear'&&!confirm('아직 GitHub에 저장되지 않은 대기 코드를 제거할까요?'))return;try{await call({type});await refresh(true);}catch(e){status(e.message,true);}};
refresh(true).catch(e=>status(e.message,true));chrome.storage.onChanged.addListener(()=>refresh().catch(()=>{}));
