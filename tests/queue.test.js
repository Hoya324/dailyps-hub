import test from 'node:test';import assert from 'node:assert/strict';
import {enqueue, nextJob, markFailure, publicState} from '../extension/lib/queue.js';
const config={owner:'Hoya324',repo:'DailyPS',branch:'main',folder:'DailyPS-Hub',enabled:true};
const sub={platform:'leetcode',submissionId:'1',code:'abc'};
test('queue deduplicates submission and binds destination',()=>{let s={queue:[]};enqueue(s,sub,config);enqueue(s,sub,config);assert.equal(s.queue.length,1);assert.equal(nextJob(s,{...config,repo:'Other'},Date.now()),null);assert.equal(nextJob(s,config,Date.now()),s.queue[0]);});
test('failure keeps order, restart state and retry deadline',()=>{let s={queue:[]};enqueue(s,sub,config);enqueue(s,{...sub,submissionId:'2'},config);markFailure(s.queue[0],Error('offline'),1000);let restored=JSON.parse(JSON.stringify(s));assert.equal(nextJob(restored,config,1001),null);assert.equal(nextJob(restored,config,999999).submission.submissionId,'1');});
test('public state never exposes token or code',()=>{let s={config,token:'SECRET',queue:[]};enqueue(s,sub,config);const json=JSON.stringify(publicState(s));assert.ok(!json.includes('SECRET'));assert.ok(!json.includes('abc'));});
