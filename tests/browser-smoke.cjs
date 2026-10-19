const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const path=require('path');const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');
(async()=>{
 const extension=path.resolve(__dirname,'../extension');
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'dailyps-hub-test-'));
 const artifacts=path.resolve(__dirname,'../artifacts');fs.mkdirSync(artifacts,{recursive:true});
 const context=await chromium.launchPersistentContext(profile,{headless:true,channel:'chromium',args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
 try{
 let sw=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');const id=new URL(sw.url()).host;
 const errors=[];context.on('weberror',e=>errors.push(e.error().message));
 // Every GitHub API response is local synthetic data. No real repository is touched.
 await sw.evaluate(async()=>{
  await chrome.storage.local.clear();globalThis.apiCalls=[];globalThis.fetch=async(url,options={})=>{
   const p=new URL(url).pathname;globalThis.apiCalls.push({path:p,method:options.method,body:options.body&&JSON.parse(options.body)});
   let data={},status=200;
   if(p.includes('/contents/'))status=404;
   else if(p.includes('/git/ref/heads/'))data={object:{sha:'head'}};
   else if(p.endsWith('/git/commits/head'))data={tree:{sha:'base'}};
   else if(p.endsWith('/git/trees'))data={sha:'tree'};
   else if(p.endsWith('/git/commits'))data={sha:'commit'};
   else data={default_branch:'main',permissions:{push:true}};
   return new Response(JSON.stringify(data),{status});
  };
 });
 const options=await context.newPage();await options.goto(`chrome-extension://${id}/options.html`);
 await options.locator('#token').fill('test-only-token');await options.locator('#save').click();
 await options.waitForFunction(()=>document.querySelector('#status').textContent.includes('連結しました')||document.querySelector('#status').textContent.includes('연결했습니다'));
 assert.equal(await options.locator('#owner').inputValue(),'Hoya324');
 const popup=await context.newPage();await popup.setViewportSize({width:390,height:680});await popup.goto(`chrome-extension://${id}/popup.html`);await popup.waitForFunction(()=>document.querySelector('#enabled').checked);
 await popup.waitForTimeout(250);
 await popup.screenshot({path:path.join(artifacts,'popup.png')});
 // A fresh page with controlled LeetCode request/response fixtures runs real content scripts.
 await context.route('https://leetcode.com/**',route=>{
  const u=new URL(route.request().url());let body='';let type='application/json';
  if(u.pathname.endsWith('/submit/'))body=JSON.stringify({submission_id:42});
  else if(u.pathname.includes('/check/'))body=JSON.stringify({state:'SUCCESS',status_code:10});
  else{type='text/html';body='<html><head></head><body><h1>1. Two Sum</h1></body></html>';}
  return route.fulfill({status:200,contentType:type,body});
 });
 const lc=await context.newPage();await lc.goto('https://leetcode.com/problems/two-sum/');
 await lc.evaluate(async()=>{await fetch('/problems/two-sum/submit/',{method:'POST',body:JSON.stringify({lang:'java',question_id:'1',typed_code:'class Solution { /* snapshot */ }'})});await new Promise(r=>setTimeout(r,100));await fetch('/submissions/detail/42/check/');});
 await popup.waitForFunction(()=>document.querySelector('#status').textContent.includes('저장 완료'));
 let calls=await sw.evaluate(()=>apiCalls);let tree=calls.find(x=>x.path.endsWith('/git/trees'));assert.equal(tree.body.tree[0].content,'class Solution { /* snapshot */ }');assert.equal(tree.body.tree[0].path,'DailyPS-Hub/leetcode/1-two-sum/Solution.java');
 // Programmers WebSocket fixture uses the real extension bridge and a local routed response.
 await context.route('https://school.programmers.co.kr/**',r=>r.fulfill({status:200,contentType:'text/html; charset=utf-8',body:'<html><body><div class="algorithm-title"><span class="challenge-title">개인정보 수집 유효기간</span></div></body></html>'}));
 await context.routeWebSocket('wss://school.programmers.co.kr/cable',ws=>{ws.onMessage(message=>{let f=JSON.parse(message);if(f.command==='message'){let d=JSON.parse(f.data);ws.send(JSON.stringify({identifier:f.identifier,message:{action:d.action,type:'result_lesson_challenge',passed:true}}));}});});
 const pg=await context.newPage();await pg.goto('https://school.programmers.co.kr/learn/courses/30/lessons/150370');
 await pg.evaluate(()=>new Promise(resolve=>{const ws=new WebSocket('wss://school.programmers.co.kr/cable');ws.onopen=()=>{ws.send(JSON.stringify({command:'message',identifier:JSON.stringify({channel:'Challenge::AlgorithmChannel',lesson_id:150370,language:'java'}),data:JSON.stringify({action:'submit',codes:{solution:'class Solution { /* 프로그래머스 */ }'}})}));resolve();};}));
 await popup.waitForFunction(()=>document.querySelector('#status').textContent.includes('개인정보'));
 await options.waitForTimeout(300);
 calls=await sw.evaluate(()=>apiCalls);const trees=calls.filter(x=>x.path.endsWith('/git/trees'));assert.equal(trees.length,2);assert.equal(trees[1].body.tree[0].path,'DailyPS-Hub/programmers/150370/Solution.java');
 // Tokens cannot be read from isolated page contexts through storage APIs.
 const forbidden=await lc.evaluate(()=>typeof chrome?.storage);assert.equal(forbidden,'undefined');
 assert.deepEqual(errors,[]);
 console.log('PASS: real MV3 load, settings, popup, LeetCode fetch capture, Programmers WebSocket capture, atomic GitHub mock writes, no page errors.');
 }finally{await context.close();fs.rmSync(profile,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
