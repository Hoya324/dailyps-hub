export const DEFAULTS = Object.freeze({owner:'',repo:'',branch:'main',folder:'DailyPS-Hub',enabled:false});
const languages={java:'java',python:'py',python3:'py',javascript:'js',typescript:'ts',cpp:'cpp','c++':'cpp',c:'c',csharp:'cs','c#':'cs',kotlin:'kt',go:'go',golang:'go',swift:'swift',ruby:'rb',rust:'rs',scala:'scala',mysql:'sql',oracle:'sql'};
export function validateConfig(raw) {
 const c={...DEFAULTS,...raw};
 for(const k of ['owner','repo','branch','folder']) c[k]=String(c[k]??'').trim();
 if(!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(c.owner)||! /^[A-Za-z0-9_.-]{1,100}$/.test(c.repo)||['.','..'].includes(c.repo)) throw Error('저장소는 소유자/저장소 이름으로 입력하세요.');
 if(!c.branch||c.branch.length>200||/[\s~^:?*\[\\]/.test(c.branch)||c.branch.includes('..')||c.branch.includes('@{')||c.branch.split('/').some(x=>!x||x.startsWith('.')||x.endsWith('.')||x.endsWith('.lock'))) throw Error('올바른 기존 브랜치 이름을 입력하세요.');
 if(!/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(c.folder)||c.folder.length>100) throw Error('저장 폴더에는 영문·숫자·하이픈·밑줄·/만 사용할 수 있습니다.');
 return {owner:c.owner,repo:c.repo,branch:c.branch,folder:c.folder,enabled:c.enabled===true};
}
export function destination(c){return [c.owner.toLowerCase(),c.repo.toLowerCase(),c.branch,c.folder].join('|');}
export function normalizeSubmission(s) {
 if(!s||s.accepted!==true||!['leetcode','programmers'].includes(s.platform))throw Error('통과한 제출만 저장할 수 있습니다.');
 const id=String(s.id||''), slug=String(s.slug||'');
 if(!/^\d{1,12}$/.test(id)|| (s.platform==='leetcode'&&!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)))throw Error('문제 식별자를 확인할 수 없습니다.');
 const url=s.platform==='leetcode'?`https://leetcode.com/problems/${slug}/`:`https://school.programmers.co.kr/learn/courses/30/lessons/${id}`;
 if(s.url!==url)throw Error('문제 주소가 일치하지 않습니다.');
 const language=String(s.language||'').toLowerCase().trim();
 if(!languages[language])throw Error('지원하지 않는 언어입니다. Java 등 일반 코드 문제를 사용하세요.');
 if(typeof s.code!=='string'||!s.code.trim()||new TextEncoder().encode(s.code).length>200000)throw Error('코드가 비어 있거나 200KB 제한을 초과했습니다.');
 const submissionId=String(s.submissionId||'');
 if(!/^[a-zA-Z0-9_-]{1,120}$/.test(submissionId))throw Error('제출 식별자가 없습니다.');
 return {platform:s.platform,id,slug,title:String(s.title||slug||id).replace(/[\r\n\x00-\x1f]/g,' ').slice(0,200),language,extension:languages[language],code:s.code,submissionId,url,accepted:true,capturedAt:new Date().toISOString()};
}
export function filesFor(s,c) {
 const path=`${c.folder}/${s.platform}/${s.platform==='leetcode'?`${s.id}-${s.slug}`:s.id}`;
 const title=s.title.replace(/[<>\[\]`#]/g,'');
 return [{path:`${path}/Solution.${s.extension}`,content:s.code},{path:`${path}/README.md`,content:`# ${title}\n\n[문제 풀기](${s.url})\n\n- 플랫폼: ${s.platform}\n- 문제 번호: ${s.id}\n- 언어: ${s.language}\n- 결과: Accepted\n- 제출 식별자: ${s.submissionId}\n- 저장 감지 시각: ${s.capturedAt}\n\nDailyPS Hub로 저장했습니다. 문제 원문은 위 링크에서 확인하세요.\n`}];
}
export async function blobSHA(text) {
 const body=new TextEncoder().encode(text), header=new TextEncoder().encode(`blob ${body.length}\0`);
 const data=new Uint8Array(header.length+body.length);data.set(header);data.set(body,header.length);
 return [...new Uint8Array(await crypto.subtle.digest('SHA-1',data))].map(x=>x.toString(16).padStart(2,'0')).join('');
}
