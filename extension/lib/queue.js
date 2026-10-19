import {destination,DEFAULTS} from './core.js';
export function enqueue(state,submission,config){
 state.queue??=[];
 const key=`${destination(config)}|${submission.platform}|${submission.submissionId}`;
 if(state.queue.some(j=>j.key===key)||(state.recent||[]).some(j=>j.key===key))return false;
 const bytes=new TextEncoder().encode(JSON.stringify(state.queue)).length+new TextEncoder().encode(submission.code).length;
 if(state.queue.length>=20||bytes>4000000)throw Error('대기열이 가득 찼습니다. 설정에서 대기 작업을 저장하거나 제거한 뒤 다시 제출하세요.');
 state.queue.push({key,submission,destination:{...config},attempts:0,nextAt:0,error:'',createdAt:Date.now()});return true;
}
export function nextJob(state,config,now){const job=state.queue?.[0];return job&&config.enabled&&destination(job.destination)===destination(config)&&job.attempts<5&&job.nextAt<=now?job:null;}
export function markFailure(job,error,now=Date.now()){job.attempts++;job.error=error.message;job.nextAt=now+Math.min(30,2**job.attempts)*60000;}
export function publicState(s){return{config:s.config||DEFAULTS,connected:!!s.token,status:s.status||'설정에서 GitHub를 연결하세요.',queue:(s.queue||[]).map(j=>({title:j.submission.title,id:j.submission.id,platform:j.submission.platform,destination:`${j.destination.owner}/${j.destination.repo} · ${j.destination.branch}`,error:j.error,attempts:j.attempts})),recent:(s.recent||[]).map(({key,...rest})=>rest)};}
