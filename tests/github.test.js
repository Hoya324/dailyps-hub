import test from 'node:test';import assert from 'node:assert/strict';
import {GitHub} from '../extension/lib/github.js';
const cfg={owner:'Hoya324',repo:'DailyPS',branch:'main',folder:'DailyPS-Hub'};
const files=[{path:'DailyPS-Hub/leetcode/1-two-sum/Solution.java',content:'class Solution {}'},{path:'DailyPS-Hub/leetcode/1-two-sum/README.md',content:'# 문제'}];
function server(conflict=false){let calls=[],patch=0;let api=async(url,opt={})=>{let path=new URL(url).pathname;calls.push({path,method:opt.method||'GET',body:opt.body&&JSON.parse(opt.body)});let data={},status=200;if(path.includes('/contents/'))status=404;else if(path.endsWith('/git/ref/heads/main'))data={object:{sha:patch?'head2':'head1'}};else if(path.includes('/git/commits/head'))data={tree:{sha:'base'}};else if(path.endsWith('/git/trees'))data={sha:'tree'};else if(path.endsWith('/git/commits'))data={sha:'commit'};else if(path.endsWith('/git/refs/heads/main')){patch++;if(conflict&&patch===1)status=422;}else data={default_branch:'main',permissions:{push:true}};return new Response(JSON.stringify(data),{status});};return{api,calls};}
test('atomic two-file commit never forces ref',async()=>{const s=server();await new GitHub('secret',s.api).commit(cfg,files,'solve');let t=s.calls.find(c=>c.path.endsWith('/git/trees'));assert.equal(t.body.tree.length,2);assert.equal(t.body.base_tree,'base');assert.equal(s.calls.at(-1).body.force,false);});
test('concurrent update retries from new head',async()=>{const s=server(true);await new GitHub('secret',s.api).commit(cfg,files,'solve');let commits=s.calls.filter(c=>c.path.endsWith('/git/commits')&&c.method==='POST');assert.deepEqual(commits.map(c=>c.body.parents),[['head1'],['head2']]);});
test('permission failure is actionable without token disclosure',async()=>{let gh=new GitHub('super-secret',async()=>new Response('{}',{status:401}));await assert.rejects(gh.check(cfg),/토큰/);});
test('dedupe matching solution SHA makes no write',async()=>{const {blobSHA}=await import('../extension/lib/core.js');let sha=await blobSHA(files[0].content),writes=0;let api=async(url,opt={})=>{if(opt.method&&opt.method!=='GET')writes++;let data=url.includes('/contents/')?{sha}:url.includes('/git/ref/')?{object:{sha:'head'}}:{tree:{sha:'tree'}};return new Response(JSON.stringify(data));};let r=await new GitHub('secret',api).commit(cfg,files,'solve');assert.equal(r.skipped,true);assert.equal(writes,0);});
test('default native fetch keeps the global receiver',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async function(){assert.equal(this,globalThis,'native fetch requires global receiver');return new Response('{}');};
 try{await new GitHub('test-only-token').api('/repos/Hoya324/DailyPS');}finally{globalThis.fetch=original;}
});
