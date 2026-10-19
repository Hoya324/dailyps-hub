import test from 'node:test';import assert from 'node:assert/strict';
import '../extension/lib/capture.js';
const Capture=globalThis.DailyCapture;
const meta={id:'1',slug:'two-sum',title:'Two Sum',url:'https://leetcode.com/problems/two-sum/'};
test('LeetCode snapshots submitted code and matches exact result ID',()=>{let out=[];let c=new Capture(x=>out.push(x));c.http('/problems/two-sum/submit/',{typed_code:'original',lang:'java',question_id:'1'},{submission_id:42},meta);c.http('/submissions/detail/43/check/',null,{state:'SUCCESS',status_code:10},meta);assert.equal(out.length,0);c.http('/submissions/detail/42/check/',null,{state:'SUCCESS',status_code:10},meta);c.http('/submissions/detail/42/check/',null,{state:'SUCCESS',status_code:10},meta);assert.equal(out.length,1);assert.equal(out[0].code,'original');});
test('LeetCode run and wrong answer never publish',()=>{let out=[];let c=new Capture(x=>out.push(x));c.http('/problems/two-sum/interpret_solution/',{typed_code:'x'}, {interpret_id:1},meta);c.http('/problems/two-sum/submit/',{typed_code:'x',lang:'java',question_id:'1'},{submission_id:42},meta);c.http('/submissions/detail/42/check/',null,{state:'SUCCESS',status_code:11},meta);assert.equal(out.length,0);});
const ident=JSON.stringify({channel:'Challenge::AlgorithmChannel',lesson_id:150370,language:'java'});
const pm={title:'한글 문제',url:'https://school.programmers.co.kr/learn/courses/30/lessons/150370'};
const frame=(action,codes)=>JSON.stringify({command:'message',identifier:ident,data:JSON.stringify({action,codes})});
const result=(passed=true,action='submit')=>JSON.stringify({identifier:ident,message:{action,type:'result_lesson_challenge',passed}});
test('Programmers websocket submit correlates channel; run result ignored',()=>{let out=[];let c=new Capture(x=>out.push(x));c.send(frame('submit',{'solution.java':'class Solution {}'}),pm);c.receive(result(true,'run'));assert.equal(out.length,0);c.receive(result());assert.equal(out.length,1);assert.equal(out[0].id,'150370');assert.equal(out[0].language,'java');});
test('Programmers overlapping submissions fail closed',()=>{let out=[];let c=new Capture(x=>out.push(x));c.send(frame('submit',{solution:'old'}),pm);c.send(frame('submit',{solution:'new'}),pm);c.receive(result());assert.equal(out.length,0);});
test('Programmers failed submissions and fill-in arrays not uploaded',()=>{let out=[];let c=new Capture(x=>out.push(x));c.send(frame('submit',{solution:['a','b']}),pm);c.receive(result());c.send(frame('submit',{solution:'bad'}),pm);c.receive(result(false));assert.equal(out.length,0);});
test('LeetCode v2 check correlates the submitted ID, waits for completion and emits once',()=>{
 const out=[];const c=new Capture(x=>out.push(x));
 c.http('/problems/richest-customer-wealth/submit/',JSON.stringify({typed_code:'class Solution {}',lang:'java',question_id:'1791'}),{submission_id:2176098802},{title:'Richest Customer Wealth'});
 const path='/submissions/detail/2176098802/v2/check/';
 c.http('/submissions/detail/2176098803/v2/check/',null,{state:'SUCCESS',status_code:10},{});
 c.http(path,null,{state:'PENDING'},{});assert.equal(out.length,0);
 c.http(path,null,{state:'SUCCESS',status_code:10},{});
 c.http(path,null,{state:'SUCCESS',status_code:10},{});
 assert.equal(out.length,1);assert.equal(out[0].submissionId,'2176098802');assert.equal(out[0].code,'class Solution {}');
});
test('LeetCode v2 wrong answers are not captured',()=>{
 const out=[];const c=new Capture(x=>out.push(x));
 c.http('/problems/two-sum/submit/',{typed_code:'wrong',lang:'java',question_id:'1'},{submission_id:42},meta);
 c.http('/submissions/detail/42/v2/check/',null,{state:'SUCCESS',status_code:11},meta);
 assert.equal(out.length,0);
});
