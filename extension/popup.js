const $=id=>document.getElementById(id);
async function call(message){const r=await chrome.runtime.sendMessage(message);if(!r?.ok)throw Error(r?.error||'확장을 새로고침하세요.');return r;}
function error(e){$('status').textContent=e.message;$('status').classList.add('error');}
async function refresh(){
 const s=await call({type:'state'}),c=s.config;
 $('repo').textContent=`${c.owner}/${c.repo}`;$('repo').href=$('github').href=`https://github.com/${c.owner}/${c.repo}`;
 $('branch').textContent=s.connected?`${c.branch} · ${c.folder}`:'아직 연결되지 않았습니다';
 $('enabled').checked=c.enabled;$('enabled').disabled=!s.connected;
 $('toggleHint').textContent=s.connected?(c.enabled?'통과한 제출을 저장합니다':'자동 저장을 일시 중지했습니다'):'설정에서 토큰을 연결하세요';
 $('status').textContent=s.status;$('status').classList.toggle('error',s.status.includes('실패'));
 $('pending').textContent=`대기 ${s.queue.length}개`;$('retry').disabled=!s.queue.length;
 $('recent').replaceChildren();
 if(!s.recent.length){const li=document.createElement('li');li.className='empty';li.textContent='아직 저장한 풀이가 없습니다.';$('recent').append(li);}
 for(const r of s.recent.slice(0,3)){const li=document.createElement('li'),a=document.createElement('a'),small=document.createElement('small');a.textContent=r.title;a.href=r.url;a.target='_blank';a.rel='noreferrer';small.textContent=`${r.platform} · ${new Date(r.at).toLocaleString('ko-KR')} ${r.skipped?'· 중복 생략':''}`;li.append(a,small);$('recent').append(li);}
}
$('settings').onclick=()=>chrome.runtime.openOptionsPage();
$('enabled').onchange=async()=>{try{await call({type:'toggle',enabled:$('enabled').checked});await refresh();}catch(e){error(e);}};
$('retry').onclick=async()=>{try{await call({type:'retry'});await refresh();}catch(e){error(e);}};
refresh().catch(error);chrome.storage.onChanged.addListener(()=>refresh().catch(error));
