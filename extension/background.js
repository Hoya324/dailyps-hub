import {DEFAULTS,validateConfig,normalizeSubmission,filesFor} from './lib/core.js';
import {GitHub} from './lib/github.js';
import {enqueue,nextJob,markFailure,publicState} from './lib/queue.js';
// All storage is deliberately unavailable to content scripts, including tokens.
const ready=chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});
let chain=Promise.resolve();
const serial=fn=>{const run=chain.then(fn,fn);chain=run.catch(()=>{});return run;};
const read=async()=>{await ready;const {state}=await chrome.storage.local.get('state');return state||{config:{...DEFAULTS},queue:[],recent:[]};};
const save=async state=>{await chrome.storage.local.set({state});await chrome.action.setBadgeText({text:state.queue?.length?String(state.queue.length):''});await chrome.action.setBadgeBackgroundColor({color:state.queue?.[0]?.error?'#c14d46':'#1d72ce'});};
async function drain(){
 const state=await read();if(!state.token)return;
 const job=nextJob(state,state.config,Date.now());if(!job)return;
 state.status=`저장 중: ${job.submission.title}`;await save(state);
 try{
  const result=await new GitHub(state.token).commit(job.destination,filesFor(job.submission,job.destination),`[${job.submission.platform}] ${job.submission.id} ${job.submission.title}`);
  state.queue.shift();state.status=`${result.skipped?'동일 코드 · 저장 생략':'저장 완료'}: ${job.submission.title}`;
  state.recent=[{key:job.key,title:job.submission.title,platform:job.submission.platform,url:result.url,at:new Date().toISOString(),skipped:result.skipped},...(state.recent||[])].slice(0,30);
 }catch(error){markFailure(job,error);state.status=`저장 실패: ${error.message}`;}
 await save(state);
 if(nextJob(state,state.config,Date.now()))void serial(drain);
}
const isUI=sender=>sender.id===chrome.runtime.id&&[chrome.runtime.getURL('popup.html'),chrome.runtime.getURL('options.html')].includes(sender.url);
function validCaptureSender(sender,s){
 if(sender.id!==chrome.runtime.id||!sender.tab||sender.frameId!==0)return false;
 try{const u=new URL(sender.url);return u.origin===new URL(s.url).origin&& (s.platform==='leetcode'?u.pathname.startsWith(`/problems/${s.slug}/`):u.pathname===`/learn/courses/30/lessons/${s.id}`);}catch{return false;}
}
async function handle(message,sender){
 if(message?.type==='capture'){
  const submission=normalizeSubmission(message.submission);
  if(!validCaptureSender(sender,submission))throw Error('지원하는 문제 페이지에서만 저장할 수 있습니다.');
  const state=await read();if(!state.config.enabled)return{ok:true,ignored:true};
  if(!state.token)throw Error('GitHub 연결이 필요합니다.');
  const added=enqueue(state,submission,state.config);
  if(added){state.status=`대기 중: ${submission.title}`;await save(state);void serial(drain);}
  return{ok:true};
 }
 if(message?.type==='captureNotice'){
  if(sender.id!==chrome.runtime.id||!sender.tab||sender.frameId!==0)return{ok:false};
  const state=await read();if(state.config.enabled){state.status='제출 연결이 불확실하거나 지원하지 않는 문제 형식입니다. 일반 코드 문제를 다시 제출하세요.';await save(state);}return{ok:true};
 }
 if(!isUI(sender))throw Error('확장 프로그램 설정에서 실행하세요.');
 const state=await read();
 if(message.type==='saveConfig'){
  const config=validateConfig(message.config), token=(message.token||state.token||'').trim();
  if(!token||token.length>500||/\s/.test(token))throw Error('GitHub 토큰을 입력하세요.');
  const info=await new GitHub(token).check(config);
  state.config=config;state.token=token;state.status=`연결 확인: ${config.owner}/${config.repo} · ${config.branch}`;await save(state);void serial(drain);return{ok:true,defaultBranch:info.defaultBranch};
 }
 if(message.type==='toggle'){
  if(!state.token)throw Error('설정에서 GitHub를 먼저 연결하세요.');
  state.config.enabled=message.enabled===true;state.status=state.config.enabled?'자동 저장이 켜졌습니다. 문제를 제출해보세요.':'자동 저장이 꺼졌습니다.';await save(state);if(state.config.enabled)void serial(drain);return{ok:true};
 }
 if(message.type==='retry'){
  if(!state.config.enabled)throw Error('자동 저장을 먼저 켜주세요.');
  for(const j of state.queue){j.attempts=0;j.nextAt=0;j.error='';}
  state.status='대기열 재시도를 요청했습니다. 저장소·브랜치가 다른 작업은 원래 설정으로 돌아가야 저장됩니다.';await save(state);void serial(drain);return{ok:true};
 }
 if(message.type==='clearQueue'){state.queue=[];state.status='대기 중인 작업을 제거했습니다.';await save(state);return{ok:true};}
 if(message.type==='disconnect'){delete state.token;state.config.enabled=false;state.status='GitHub 연결을 해제했습니다. 대기 작업은 유지됩니다.';await save(state);return{ok:true};}
 throw Error('알 수 없는 요청입니다.');
}
chrome.runtime.onMessage.addListener((m,sender,respond)=>{
 // Read-only popup status must not wait behind network requests.
 const task=m?.type==='state'&&isUI(sender)?read().then(s=>({ok:true,...publicState(s)})):serial(()=>handle(m,sender));
 task.then(respond,error=>respond({ok:false,error:error.message||'요청을 처리하지 못했습니다.'}));return true;
});
const setup=()=>{void ready.then(()=>chrome.alarms.create('dailyps-retry',{periodInMinutes:1}));void serial(drain);};
chrome.runtime.onInstalled.addListener(setup);
chrome.runtime.onStartup.addListener(setup);
chrome.alarms.onAlarm.addListener(a=>{if(a.name==='dailyps-retry')void serial(drain);});
