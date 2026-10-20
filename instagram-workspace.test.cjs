const assert=require('assert/strict'),W=require('./instagram-chrome-eklentisi/workspace-core.js'),{performance}=require('perf_hooks');
const db=W.empty();W.capture(db,{viewerId:'99',scope:'nonfollowers',followingDone:true,followersDone:true,following:[{id:'1',username:'=formula',full_name:'One'},{id:'2',username:'mutual',full_name:'Two'}],followerIds:['2']});const a=W.account(db,'99');assert.equal(a.preferences.language,'en','New workspace accounts start in English');
a.meta['1']={protected:true,notes:'Review',labels:['creator']};
assert.equal(W.analytics(a).mutual,1);assert.equal(W.analytics(a).nonfollowers,1);assert.equal(W.filter(W.rows(a),{category:'protected'}).length,1);assert.equal(W.filter(W.rows(a),{query:'MUTU'}).length,1);
const all=W.empty();W.capture(all,{viewerId:'7',scope:'all',followingDone:true,following:[{id:'1',username:'one'}]});assert.equal(W.analytics(W.account(all,'7')).followers,null);
const unknown={op:'not',rule:{op:'eq',field:'relationship',value:'mutual'}};assert.equal(W.evaluate(unknown,{relationship:null}),null,'NOT cannot turn missing data into true');
const conflict={op:'and',rules:[{op:'eq',field:'protected',value:true},{op:'eq',field:'protected',value:false}]};assert.deepEqual(W.ruleConflicts(conflict),['protected']);
const w=W.template();const simulated=W.simulate(w,W.rows(a));assert.equal(simulated.matching.length,1);assert.equal(simulated.mutations,0);assert.equal(simulated.requiresApproval,true);
const cycle=W.copy(w);cycle.edges.push({from:cycle.nodes.at(-1).id,to:cycle.nodes[0].id});assert.throws(()=>W.validateWorkflow(cycle));
const invalid=W.copy(w);invalid.edges.push({from:'missing',to:w.nodes[1].id});assert.throws(()=>W.validateWorkflow(invalid));
const backup={schemaVersion:1,accountId:'99',account:a};assert.equal(W.validateBackup(backup).accountId,'99');assert.throws(()=>W.validateBackup({...backup,account:{...a,tasks:[{}]}}));
assert.ok(W.csv(W.rows(a)).includes("'=formula"));assert.ok(W.csv([{username:' =formula'}]).includes("' =formula"));
assert.throws(()=>W.compare(a.snapshots[0],{...a.snapshots[0],accountId:'7'}));
const before=W.copy(a.snapshots[0]);W.capture(db,{viewerId:'99',scope:'nonfollowers',followingDone:true,followersDone:true,following:[{id:'2',username:'renamed'},{id:'3',username:'new'}],followerIds:['2','3']});const changes=W.compare(before,a.snapshots.at(-1));assert.equal(changes.added[0].id,'3');assert.equal(changes.removed[0].id,'1');assert.equal(changes.followerAdded[0],'3');
assert.throws(()=>W.parse('invalid-json'));assert.throws(()=>W.validateBackup({...backup,account:{...a,runs:[null]}}));assert.equal(W.decide([{priority:1,decision:'include',rule:{op:'eq',field:'protected',value:true}},{priority:1,decision:'exclude',rule:{op:'eq',field:'protected',value:true}}],{protected:true}).conflict,true);
const timings=[];for(const count of [100,1000,5000,10000]){const data=Array.from({length:count},(_,i)=>({id:String(i+1),username:'account'+i,full_name:'Name '+i,protected:false,relationship:'nonfollowers'}));const start=performance.now();const result=W.filter(data,{query:'account',rule:{op:'eq',field:'relationship',value:'nonfollowers'}});const elapsed=performance.now()-start;assert.equal(result.length,count);assert.ok(elapsed<3000);timings.push({count,ms:+elapsed.toFixed(2)})}
console.log('PASS: workspace account isolation, snapshots/analytics, unknown-safe rules, conflicts, workflow validation/simulation isolation, backup schema, CSV safety and 100–10,000 account performance.');console.log(JSON.stringify(timings));

for(const kind of ['quick','relationship','cleanup','diagnostic','export','protection']){const w=W.workspaceTemplate(kind);W.validateWorkflow(w);assert.equal(W.simulate(w,W.rows(a)).mutations,0)}
const graph=W.workspaceTemplate('quick');assert.throws(()=>W.connect(graph,'n0','n1'));assert.throws(()=>W.connect(graph,'n3','n1'));const disconnected=W.copy(graph);disconnected.edges.shift();assert.equal(W.connect(disconnected,'n0','n1').edges.length,graph.edges.length);
const reco=W.copy(a);reco.selections=[{id:'stale',name:'old',ids:['99999']}];reco.meta['2']={labels:['keep','remove']};assert.ok(W.recommendations(reco,[{category:'uncertain',targetId:'2'}]).some(v=>v.kind==='stale-selections'));assert.ok(W.recommendations(reco,[{category:'uncertain',targetId:'2'}]).some(v=>v.kind==='uncertain'));
assert.throws(()=>W.parse(JSON.stringify({...db,revision:-1})));assert.throws(()=>W.validateBackup({...backup,account:{...a,preferences:{...a.preferences,hiddenCards:'bad'}}}));

assert.throws(()=>W.validateBackup({...backup,account:{...a,meta:{'1':{protected:'true'}}}}),/INVALID_METADATA/);assert.throws(()=>W.validateBackup({...backup,account:{...a,meta:{'1':{favorite:1}}}}),/INVALID_METADATA/);
