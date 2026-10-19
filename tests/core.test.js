import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS,validateConfig, normalizeSubmission, filesFor, blobSHA} from '../extension/lib/core.js';
const item={platform:'leetcode',id:'1',slug:'two-sum',title:'Two Sum',language:'java',code:'class Solution {}',submissionId:'123',url:'https://leetcode.com/problems/two-sum/',accepted:true};
test('default destination and safe paths',()=>{let c=validateConfig({owner:'Hoya324',repo:'DailyPS',branch:'main',folder:'DailyPS-Hub'});let f=filesFor(normalizeSubmission(item),c);assert.equal(f[0].path,'DailyPS-Hub/leetcode/1-two-sum/Solution.java');assert.match(f[1].content,/Two Sum/);});
test('reject failed submissions, unsupported language and forged URLs',()=>{for(const change of [{accepted:false},{language:'unknown'},{url:'https://evil.com/problems/two-sum/'},{slug:'../x'},{code:''}])assert.throws(()=>normalizeSubmission({...item,...change}));});
test('reject path traversal and invalid destination',()=>{for(const change of [{folder:'../x'},{folder:'.github/workflows'},{owner:'a/b'},{branch:'a..b'}])assert.throws(()=>validateConfig({owner:'Hoya324',repo:'DailyPS',branch:'main',folder:'DailyPS-Hub',...change}));});
test('UTF8 blob hash uses byte length',async()=>{assert.equal(await blobSHA('hello\n'),'ce013625030ba8dba906f756967f9e9ca394464a');assert.notEqual(await blobSHA('가'),await blobSHA('나'));});
test('programmers stable ID folder and Java filename',()=>{let n=normalizeSubmission({...item,platform:'programmers',id:'150370',slug:'',title:'개인정보 수집 유효기간',url:'https://school.programmers.co.kr/learn/courses/30/lessons/150370'});assert.match(filesFor(n,{folder:'DailyPS-Hub'})[0].path,/programmers\/150370\/Solution.java$/);});

test("fresh installation requires an explicit user destination",()=>{assert.equal(DEFAULTS.owner,"");assert.equal(DEFAULTS.repo,"");assert.equal(DEFAULTS.enabled,false);assert.throws(()=>validateConfig({}));assert.equal(validateConfig({owner:"another-user",repo:"solutions"}).owner,"another-user");});
