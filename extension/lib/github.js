import {blobSHA} from './core.js';
const enc=encodeURIComponent;
const pathEncode=p=>p.split('/').map(enc).join('/');
export class GitHub {
 constructor(token,request=(...args)=>globalThis.fetch(...args)){this.token=token;this.request=request;}
 async api(path,method='GET',body){
  let response;
  try{response=await this.request(`https://api.github.com${path}`,{method,redirect:'error',headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${this.token}`,'X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});}catch{throw Error('GitHub 연결에 실패했습니다. 네트워크를 확인하고 재시도하세요.');}
  if(!response.ok){const messages={401:'GitHub 토큰이 만료되었거나 잘못되었습니다.',403:'저장소 Contents 쓰기 권한 또는 GitHub 요청 제한을 확인하세요.',404:'저장소·브랜치를 찾지 못했습니다. 토큰 접근 대상과 README 초기화를 확인하세요.',409:'빈 저장소이거나 변경 충돌입니다. GitHub에서 README를 만들고 재시도하세요.',422:'브랜치 변경이 충돌하거나 보호 규칙에 막혔습니다.'};let error=Error(messages[response.status]||`GitHub 요청 실패 (${response.status}).`);error.status=response.status;throw error;}
  return response.status===204?{}:response.json();
 }
 root(c){return `/repos/${enc(c.owner)}/${enc(c.repo)}`;}
 async check(c){const r=await this.api(this.root(c));if(r.permissions?.push===false)throw Error('저장소 쓰기 권한이 없습니다.');await this.api(`${this.root(c)}/git/ref/heads/${pathEncode(c.branch)}`);return{defaultBranch:r.default_branch};}
 async commit(c,files,message){
  const root=this.root(c);
  for(let attempt=0;attempt<3;attempt++){
   const head=(await this.api(`${root}/git/ref/heads/${pathEncode(c.branch)}`)).object.sha;
   try{const existing=await this.api(`${root}/contents/${pathEncode(files[0].path)}?ref=${enc(head)}`);if(existing.sha===await blobSHA(files[0].content))return{skipped:true,url:`https://github.com/${c.owner}/${c.repo}/blob/${pathEncode(c.branch)}/${pathEncode(files[0].path)}`};}catch(e){if(e.status!==404)throw e;}
   const base=(await this.api(`${root}/git/commits/${enc(head)}`)).tree.sha;
   const tree=await this.api(`${root}/git/trees`,'POST',{base_tree:base,tree:files.map(f=>({path:f.path,mode:'100644',type:'blob',content:f.content}))});
   const commit=await this.api(`${root}/git/commits`,'POST',{message,tree:tree.sha,parents:[head]});
   try{await this.api(`${root}/git/refs/heads/${pathEncode(c.branch)}`,'PATCH',{sha:commit.sha,force:false});return{skipped:false,url:`https://github.com/${c.owner}/${c.repo}/commit/${commit.sha}`};}catch(e){if(![409,422].includes(e.status)||attempt===2)throw e;}
  }
 }
}
