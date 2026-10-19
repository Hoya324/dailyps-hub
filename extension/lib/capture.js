/* Original protocol adapter. No page credentials or GitHub tokens are read here. */
(()=>{
 const parse=x=>{try{return typeof x==='string'?JSON.parse(x):x;}catch{return null;}};
 class Capture {
  constructor(emit,notice=()=>{}){this.emit=emit;this.notice=notice;this.lc=new Map();this.pg=new Map();}
  http(path,body,response,meta){
   body=parse(body);response=parse(response);
   const submit=path.match(/^\/problems\/([a-z0-9-]+)\/submit\/$/);
   if(submit&&response?.submission_id&&typeof body?.typed_code==='string'){
    if(this.lc.size>30)this.lc.delete(this.lc.keys().next().value);
    const slug=submit[1];this.lc.set(String(response.submission_id),{platform:'leetcode',id:String(meta.id||body.question_id),slug,title:meta.title||slug,language:body.lang,code:body.typed_code,submissionId:String(response.submission_id),url:`https://leetcode.com/problems/${slug}/`,at:Date.now()});return;
   }
   const check=path.match(/^\/submissions\/detail\/(\d+)\/check\/$/);
   if(!check)return;
   const s=this.lc.get(check[1]);if(!s||response?.state!=='SUCCESS')return;
   this.lc.delete(check[1]);
   if(response.status_code===10&&Date.now()-s.at<20*60*1000)this.emit({...s,accepted:true});
  }
  send(raw,meta){
   const f=parse(raw), i=parse(f?.identifier), d=parse(f?.data);
   if(f?.command!=='message'||!i?.lesson_id||!/^Challenge::(?:Algorithm|Database)Channel$/.test(i.channel))return;
   if(['run','stop'].includes(d?.action)){this.pg.delete(f.identifier);return;}
   if(d?.action!=='submit')return;
   if(this.pg.has(f.identifier)){this.pg.set(f.identifier,{ambiguous:true});this.notice('제출이 겹쳐 저장하지 않았습니다. 채점 종료 후 다시 제출하세요.');return;}
   const codes=d.codes&&Object.values(d.codes);
   if(!codes||codes.length!==1||typeof codes[0]!=='string'){this.notice('빈칸 채우기·다중 파일 문제는 자동 저장 대상이 아닙니다.');return;}
   const id=String(i.lesson_id), url=`https://school.programmers.co.kr/learn/courses/30/lessons/${id}`;
   if(meta.url!==url)return;
   this.pg.set(f.identifier,{platform:'programmers',id,slug:'',title:meta.title||id,language:i.language,code:codes[0],submissionId:`pg-${Date.now()}-${Math.random().toString(36).slice(2,10)}`,url,at:Date.now()});
  }
  receive(raw){
   const f=parse(raw),m=f?.message,s=this.pg.get(f?.identifier);
   if(!s||!m)return;
   if(m.type==='error'){this.pg.delete(f.identifier);return;}
   if(m.action!=='submit'||!['result','result_lesson_challenge','result_without_score','finish'].includes(m.type))return;
   this.pg.delete(f.identifier);
   if(!s.ambiguous&&m.passed===true&&Date.now()-s.at<20*60*1000)this.emit({...s,accepted:true});
  }
 }
 globalThis.DailyCapture=Capture;
})();
