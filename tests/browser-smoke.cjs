const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const path=require('path');const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');
(async()=>{
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'dailyps-hub-test-'));
 const extension=path.join(profile,'extension');
 fs.cpSync(path.resolve(__dirname,'../extension'),extension,{recursive:true});
 // Expose the real module only in this disposable test copy (workers forbid dynamic import).
 fs.appendFileSync(path.join(extension,'background.js'),"\nimport {GitHub as TestGitHub} from './lib/github.js';globalThis.TestGitHub=TestGitHub;\n");
 const artifacts=path.resolve(__dirname,'../artifacts');fs.mkdirSync(artifacts,{recursive:true});
 const context=await chromium.launchPersistentContext(profile,{headless:true,channel:'chromium',args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
 try{
 let sw=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');const id=new URL(sw.url()).host;
 const errors=[];context.on('weberror',e=>errors.push(e.error().message));
 // Exercise the browser's REAL fetch before installing the synthetic GitHub API.
 const nativeStatus=await sw.evaluate(async()=>{return (await new globalThis.TestGitHub('unused-test-token').request('data:application/json,{}')).status;});
 assert.equal(nativeStatus,200);
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
 assert.equal(await options.locator('#owner').inputValue(),'');
 assert.equal(await options.locator('#repo').inputValue(),'');
 await options.locator('#owner').fill('example-user');await options.locator('#repo').fill('solutions');
 await options.locator('#token').fill('test-only-token');await options.locator('#save').click();
 await options.waitForFunction(()=>document.querySelector('#status').textContent.includes('連結しました')||document.querySelector('#status').textContent.includes('연결했습니다'));
 assert.equal(await options.locator('#owner').inputValue(),'example-user');
 const popup=await context.newPage();await popup.setViewportSize({width:390,height:680});await popup.goto(`chrome-extension://${id}/popup.html`);await popup.waitForFunction(()=>document.querySelector('#enabled').checked);
 await popup.waitForTimeout(250);
 await popup.screenshot({path:path.join(artifacts,'popup.png')});
 if(process.env.STORE_ASSETS){
  const dest=path.resolve(process.env.STORE_ASSETS);fs.mkdirSync(dest,{recursive:true});
  await options.setViewportSize({width:1280,height:800});
  await options.screenshot({path:path.join(dest,'settings-1280x800.png')});
  const png=fs.readFileSync(path.join(artifacts,'popup.png')).toString('base64');
  const artwork=await context.newPage();await artwork.setViewportSize({width:1280,height:800});
  await artwork.setContent(`<html lang="ko"><meta charset="utf-8"><style>body{margin:0;background:#eef4fa;font-family:Arial,'Apple SD Gothic Neo',sans-serif;color:#182b3d}.wrap{height:800px;display:flex;align-items:center;justify-content:center;gap:90px}h1{font-size:56px;letter-spacing:-2px}h1 span{color:#1976cf}h2{font-size:30px;line-height:1.6}p{font-size:19px;line-height:1.7;color:#557087}img{width:390px;box-shadow:0 20px 60px #18385525;border-radius:16px}.label{font-size:14px}</style><div class="wrap"><div><h1>DailyPS<span>Hub</span></h1><h2>오늘 푼 코드,<br>내 GitHub에 차곡차곡</h2><p>LeetCode · 프로그래머스<br>통과한 제출 자동 저장<br>저장소·브랜치·폴더 직접 설정</p><p class="label">실제 확장 화면 · 연결 정보는 예시입니다</p></div><img src="data:image/png;base64,${png}"></div></html>`);
  await artwork.screenshot({path:path.join(dest,'popup-1280x800.png')});
  await artwork.setViewportSize({width:440,height:280});
  await artwork.setContent(`<html><meta charset="utf-8"><style>body{margin:0;background:#eef4fa;color:#182b3d;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:280px}h1{font-size:44px;letter-spacing:-2px;margin:0 0 22px}span{color:#1976cf}p{font-size:19px;line-height:1.6;margin:0;color:#466681}</style><div><h1>DailyPS<span>Hub</span></h1><p>Accepted code → GitHub<br>LeetCode · Programmers</p></div></html>`);
  await artwork.screenshot({path:path.join(dest,'promo-440x280.png')});await artwork.close();
  fs.copyFileSync(path.join(extension,'icons/icon128.png'),path.join(dest,'icon128.png'));
 }

 // A fresh page with controlled LeetCode request/response fixtures runs real content scripts.
 await context.route('https://leetcode.com/**',route=>{
  const u=new URL(route.request().url());let body='';let type='application/json';
  if(u.pathname.endsWith('/submit/'))body=JSON.stringify({submission_id:u.pathname.includes('reverse-string')?43:42});
  else if(u.pathname.includes('/check/'))body=JSON.stringify({state:'SUCCESS',status_code:10});
  else{type='text/html';body='<html><head></head><body><h1>1. Two Sum</h1></body></html>';}
  return route.fulfill({status:200,contentType:type,body});
 });
 const lc=await context.newPage();await lc.goto('https://leetcode.com/problems/two-sum/');
 await lc.evaluate(async()=>{await fetch('/problems/two-sum/submit/',{method:'POST',body:JSON.stringify({lang:'java',question_id:'1',typed_code:'class Solution { /* snapshot */ }'})});await new Promise(r=>setTimeout(r,100));await fetch('/submissions/detail/42/v2/check/');});
 await popup.waitForFunction(()=>document.querySelector('#status').textContent.includes('저장 완료'));
 let calls=await sw.evaluate(()=>apiCalls);let tree=calls.find(x=>x.path.endsWith('/git/trees'));assert.equal(tree.body.tree[0].content,'class Solution { /* snapshot */ }');assert.equal(tree.body.tree[0].path,'DailyPS-Hub/leetcode/1-two-sum/Solution.java');
 // A second problem opened by client-side navigation must also be captured.
 await lc.evaluate(async()=>{
  history.pushState({},'', '/problems/reverse-string/');
  document.querySelector('h1').textContent='344. Reverse String';
  await fetch('/problems/reverse-string/submit/',{method:'POST',body:JSON.stringify({lang:'java',question_id:'344',typed_code:'class Solution { /* second */ }'})});
  await new Promise(r=>setTimeout(r,100));
  await fetch('/submissions/detail/43/v2/check/');
 });
 await popup.waitForFunction(()=>document.querySelector('#status').textContent.includes('Reverse String'),{},{timeout:5000});
 // Programmers WebSocket fixture uses the real extension bridge and a local routed response.
 await context.route('https://school.programmers.co.kr/**',r=>r.fulfill({status:200,contentType:'text/html; charset=utf-8',body:'<html><body><div class="algorithm-title"><span class="challenge-title">개인정보 수집 유효기간</span></div></body></html>'}));
 await context.routeWebSocket('wss://school.programmers.co.kr/cable',ws=>{ws.onMessage(message=>{let f=JSON.parse(message);if(f.command==='message'){let d=JSON.parse(f.data);ws.send(JSON.stringify({identifier:f.identifier,message:{action:d.action,type:'result_lesson_challenge',passed:true}}));}});});
 const pg=await context.newPage();await pg.goto('https://school.programmers.co.kr/learn/courses/30/lessons/150370');
 await pg.evaluate(()=>new Promise(resolve=>{const ws=new WebSocket('wss://school.programmers.co.kr/cable');ws.onopen=()=>{ws.send(JSON.stringify({command:'message',identifier:JSON.stringify({channel:'Challenge::AlgorithmChannel',lesson_id:150370,language:'java'}),data:JSON.stringify({action:'submit',codes:{solution:'class Solution { /* 프로그래머스 */ }'}})}));resolve();};}));
 await popup.waitForFunction(()=>document.querySelector('#status').textContent.includes('개인정보'));
 await options.waitForTimeout(300);
 calls=await sw.evaluate(()=>apiCalls);const trees=calls.filter(x=>x.path.endsWith('/git/trees'));assert.equal(trees.length,3);assert.equal(trees[1].body.tree[0].path,'DailyPS-Hub/leetcode/344-reverse-string/Solution.java');assert.equal(trees[2].body.tree[0].path,'DailyPS-Hub/programmers/150370/Solution.java');
 // Tokens cannot be read from isolated page contexts through storage APIs.
 const forbidden=await lc.evaluate(()=>typeof chrome?.storage);assert.equal(forbidden,'undefined');
 assert.deepEqual(errors,[]);
 console.log('PASS: real MV3 load, settings, popup, LeetCode fetch capture, Programmers WebSocket capture, atomic GitHub mock writes, no page errors.');
 }finally{await context.close();fs.rmSync(profile,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
