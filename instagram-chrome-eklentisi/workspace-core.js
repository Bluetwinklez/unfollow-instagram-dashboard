(function(root){
'use strict';
const KEY='iu_workspace_v1',SCHEMA=1;
const id=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
const copy=value=>JSON.parse(JSON.stringify(value));
const text=(s,max=1000)=>String(s??'').slice(0,max);
function empty(){return {schemaVersion:SCHEMA,revision:0,accounts:{}}}
function parse(raw){
 if(raw==null||raw==='')return empty();let value=raw;try{if(typeof raw==='string')value=JSON.parse(raw)}catch{throw Error('INVALID_WORKSPACE_DATA')}
 if(!value||value.schemaVersion!==SCHEMA||!value.accounts||Array.isArray(value.accounts)||!Number.isSafeInteger(value.revision))throw Error('INVALID_WORKSPACE_DATA');
 for(const [key,data] of Object.entries(value.accounts))validateBackup({schemaVersion:1,accountId:key,account:data});return value;
}
function account(db,viewer){
 if(!/^\d+$/.test(String(viewer)))throw Error('ACCOUNT_CONTEXT_CHANGED');
 return db.accounts[viewer]??(db.accounts[viewer]={snapshots:[],meta:{},selections:[],reviews:[],sessions:[],tasks:[],workflows:[],runs:[],preferences:{language:'tr',theme:'dark',compact:false,retention:5,notifications:false,flags:{advanced:false}},onboarded:false});
}
function capture(db,input){
 if(!input||!/^\d+$/.test(String(input.viewerId))||!Array.isArray(input.following)||!input.followingDone)throw Error('INCOMPLETE_SCAN');
 const a=account(db,String(input.viewerId));
 const completeFollowers=input.scope==='nonfollowers'&&input.followersDone===true;
 if(completeFollowers&&!Array.isArray(input.followerIds))throw Error('INCOMPLETE_SCAN');
 const seen=new Set();
 const users=input.following.map(u=>{
  if(!u||!/^\d+$/.test(String(u.id))||!u.username)throw Error('INVALID_SCAN');
  return {id:String(u.id),username:text(u.username,64),full_name:text(u.full_name,256),is_private:typeof u.is_private==='boolean'?u.is_private:null,is_verified:typeof u.is_verified==='boolean'?u.is_verified:null,hasAvatar:typeof u.profile_pic_url==='string'&&u.profile_pic_url? !/44884218_345707102882519|464760996_1254146839119862/.test(u.profile_pic_url):null};
 }).filter(u=>{if(seen.has(u.id))return false;seen.add(u.id);return true});
 const followerIds=completeFollowers?[...new Set(input.followerIds.map(String))]:null;
 if(followerIds?.some(v=>!/^\d+$/.test(v)))throw Error('INVALID_SCAN');
 const snapshot={id:id(),at:new Date().toISOString(),accountId:String(input.viewerId),scope:input.scope==='nonfollowers'?'nonfollowers':'all',complete:true,profileTotalsVerified:false,users,followerIds};
 a.snapshots.push(snapshot);a.snapshots=a.snapshots.slice(-Math.max(1,Math.min(20,Number(a.preferences.retention)||5)));
 while(a.snapshots.length>1&&JSON.stringify(db).length>6_000_000)a.snapshots.shift();db.revision++;return snapshot;
}
function rows(a,snapshot=a.snapshots.at(-1)){
 if(!snapshot)return [];
 const followers=snapshot.followerIds==null?null:new Set(snapshot.followerIds);
 const firstSeen=new Map();for(const item of a.snapshots)for(const user of item.users)if(!firstSeen.has(user.id))firstSeen.set(user.id,item.at);
 const previous=a.snapshots.at(-2);const previousIds=previous?new Set(previous.users.map(u=>u.id)):null;
 return snapshot.users.map(u=>{const meta=a.meta[u.id]||{};return {...u,protected:meta.protected===true,favorite:meta.favorite===true,notes:meta.notes||'',labels:Array.isArray(meta.labels)?meta.labels:[],reviewed:meta.reviewed===true,review:a.reviews.includes(u.id),selected:false,newlyObserved:previousIds?!previousIds.has(u.id):null,relationship:followers?(followers.has(u.id)?'mutual':'nonfollowers'):null,firstObserved:firstSeen.get(u.id)||snapshot.at,lastObserved:snapshot.at}});
}
function analytics(a,snapshot=a.snapshots.at(-1)){
 if(!snapshot)return {following:null,followers:null,mutual:null,nonfollowers:null,nonfollowerPercent:null,mutualPercent:null,ratio:null};
 const users=rows(a,snapshot),following=users.length,followers=snapshot.followerIds?.length??null;
 const mutual=followers===null?null:users.filter(u=>u.relationship==='mutual').length;
 const nonfollowers=mutual===null?null:following-mutual;
 return {following,followers,mutual,nonfollowers,nonfollowerPercent:nonfollowers===null||!following?null:100*nonfollowers/following,mutualPercent:mutual===null||!following?null:100*mutual/following,ratio:followers?following/followers:null};
}
const fields=new Set(['relationship','protected','favorite','reviewed','review','newlyObserved','is_private','is_verified','hasAvatar','username','full_name','notes','labels']);
function validateRule(rule,depth=0,count={n:0}){
 if(!rule||typeof rule!=='object'||depth>12||++count.n>100)throw Error('INVALID_RULE');
 if(['and','or'].includes(rule.op)){if(!Array.isArray(rule.rules)||!rule.rules.length)throw Error('INVALID_RULE');for(const child of rule.rules)validateRule(child,depth+1,count);return true}
 if(rule.op==='not'){validateRule(rule.rule,depth+1,count);return true}
 if(!fields.has(rule.field)||!['eq','contains','starts','exists'].includes(rule.op)||typeof rule.value==='object'||String(rule.value??'').length>500)throw Error('INVALID_RULE');return true;
}
function evaluate(rule,user){
 validateRule(rule);
 if(rule.op==='not'){const value=evaluate(rule.rule,user);return value===null?null:!value}
 if(rule.op==='and'||rule.op==='or'){const values=rule.rules.map(r=>evaluate(r,user));if(rule.op==='and')return values.includes(false)?false:values.includes(null)?null:true;return values.includes(true)?true:values.includes(null)?null:false}
 const value=user[rule.field];if(value==null)return null;
 if(rule.op==='exists')return Boolean(Array.isArray(value)?value.length:String(value).trim());
 if(rule.op==='eq')return value===rule.value;
 const values=Array.isArray(value)?value:[String(value)];
 return values.some(v=>rule.op==='starts'?String(v).toLowerCase().startsWith(String(rule.value).toLowerCase()):String(v).toLowerCase().includes(String(rule.value).toLowerCase()));
}
function filter(users,{query='',category='all',sort='username-asc',rule=null,selected=[]}={}){
 const q=query.trim().toLowerCase(),selectedSet=new Set(selected);
 const result=users.map(u=>({...u,selected:selectedSet.has(u.id)})).filter(u=>(!q||(u.username+' '+u.full_name+' '+u.notes+' '+(Array.isArray(u.labels)?u.labels:[]).join(' ')).toLowerCase().includes(q))&&(category==='all'||category==='selected'&&u.selected||category==='protected'&&u.protected||category==='favorites'&&u.favorite||category==='reviewed'&&u.reviewed||category==='review'&&u.review||category==='new'&&u.newlyObserved===true||u.relationship===category)&&(!rule||evaluate(rule,u)===true));
 const key=sort.startsWith('name')?'full_name':sort==='protected'?'protected':sort==='selected'?'selected':sort==='relationship'?'relationship':sort==='firstObserved'?'firstObserved':sort==='lastObserved'?'lastObserved':'username';
 return result.sort((a,b)=>String(a[key]??'').localeCompare(String(b[key]??''))*(sort.endsWith('-desc')?-1:1));
}
function compare(a,b){
 if(!a||!b||a.accountId!==b.accountId)throw Error('ACCOUNT_CONTEXT_CHANGED');if(!a.complete||!b.complete)throw Error('INCOMPLETE_SCAN');
 const before=new Map(a.users.map(u=>[u.id,u])),after=new Map(b.users.map(u=>[u.id,u]));
 const beforeFollowers=a.followerIds==null?null:new Set(a.followerIds),afterFollowers=b.followerIds==null?null:new Set(b.followerIds);
 return {added:b.users.filter(u=>!before.has(u.id)),removed:a.users.filter(u=>!after.has(u.id)),followerAdded:beforeFollowers&&afterFollowers?[...afterFollowers].filter(x=>!beforeFollowers.has(x)):null,followerAbsent:beforeFollowers&&afterFollowers?[...beforeFollowers].filter(x=>!afterFollowers.has(x)):null,relationshipChanged:beforeFollowers&&afterFollowers?b.users.filter(u=>before.has(u.id)&&beforeFollowers.has(u.id)!==afterFollowers.has(u.id)):null};
}
const nodeTypes=new Set(['start','load','condition','sort','review','approval','notify','report','end']);
function validateWorkflow(workflow){
 if(workflow?.schemaVersion!==1||!Array.isArray(workflow.nodes)||!Array.isArray(workflow.edges)||workflow.nodes.length>40||workflow.nodes.length<2)throw Error('INVALID_WORKFLOW');
 const nodes=new Map();for(const n of workflow.nodes){if(!n.id||nodes.has(n.id)||!nodeTypes.has(n.type))throw Error('INVALID_NODE');if(n.type==='condition'){if(n.ruleSet){if(!Array.isArray(n.ruleSet)||n.ruleSet.length>40)throw Error('INVALID_RULE');for(const r of n.ruleSet){validateRule(r.rule);if(!['include','exclude'].includes(r.decision)||!Number.isFinite(r.priority))throw Error('INVALID_RULE')}}else validateRule(n.rule);}nodes.set(n.id,n)}
 if(workflow.nodes.filter(n=>n.type==='start').length!==1||workflow.nodes.filter(n=>n.type==='end').length!==1)throw Error('INVALID_WORKFLOW');
 const degree=new Map([...nodes.keys()].map(k=>[k,0])),adj=new Map([...nodes.keys()].map(k=>[k,[]]));
 for(const edge of workflow.edges){if(!nodes.has(edge.from)||!nodes.has(edge.to)||edge.from===edge.to)throw Error('INVALID_CONNECTION');adj.get(edge.from).push(edge.to);degree.set(edge.to,degree.get(edge.to)+1)}
 const start=workflow.nodes.find(n=>n.type==='start').id;if(degree.get(start)!==0)throw Error('INVALID_CONNECTION');
 const queue=[start],order=[];while(queue.length){const key=queue.shift();order.push(key);for(const next of adj.get(key)){degree.set(next,degree.get(next)-1);if(!degree.get(next))queue.push(next)}}
 if(order.length!==nodes.size)throw Error('CYCLIC_OR_DISCONNECTED_WORKFLOW');
 const end=workflow.nodes.find(n=>n.type==='end').id;if(adj.get(end).length||order.at(-1)!==end)throw Error('INVALID_END');const reachesEnd=new Set([end]);for(const key of order.slice().reverse())if(adj.get(key).some(v=>reachesEnd.has(v)))reachesEnd.add(key);if(reachesEnd.size!==nodes.size)throw Error('DISCONNECTED_END');
 return order;
}
function template(name='Quick review',rule={op:'eq',field:'relationship',value:'nonfollowers'}){
 const types=['start','load','condition','review','approval','report','end'];return {schemaVersion:1,id:id(),name:text(name,80),nodes:types.map((type,i)=>({id:'n'+i,type,...(type==='condition'?{rule}:{}),x:40+i*150,y:50})),edges:types.slice(1).map((_,i)=>({from:'n'+i,to:'n'+(i+1)}))};
}
function simulate(workflow,users){
 const order=validateWorkflow(workflow),output=new Map(),missing=new Set(),steps=[],localEffects=[];let approval=false;
 for(const nodeId of order){
  const node=workflow.nodes.find(n=>n.id===nodeId),incoming=workflow.edges.filter(e=>e.to===nodeId).flatMap(e=>output.get(e.from)||[]);
  let items=node.type==='start'||node.type==='load'?users:[...new Map(incoming.map(u=>[u.id,u])).values()];
  if(node.type==='condition')items=items.filter(u=>{const match=node.ruleSet?decide(node.ruleSet,u).include:evaluate(node.rule,u);if(match===null)missing.add(u.id);return match===true});
  if(node.type==='sort')items=filter(items,{sort:node.sort||'username-asc'});
  if(node.type==='approval')approval=true;
  if(['review','notify','report'].includes(node.type))localEffects.push({type:node.type,ids:items.map(u=>u.id)});output.set(nodeId,items);steps.push({nodeId,type:node.type,count:items.length});
 }
 const matching=output.get(order.at(-1))||[];const ids=new Set(matching.map(u=>u.id));return {matching,excluded:users.filter(u=>!ids.has(u.id)),missing:[...missing],requiresApproval:approval,steps,localEffects,simulation:true,mutations:0};
}
function csv(users){const esc=v=>'"'+String(v??'').replace(/^(?:\s*[=+@-]|[\t\r])/,"'$&").replace(/"/g,'""')+'"';return ['id,username,name,relationship,protected,notes',...users.map(u=>[u.id,u.username,u.full_name,u.relationship,u.protected,u.notes].map(esc).join(','))].join('\r\n')}
function validateBackup(value){
 if(!value||value.schemaVersion!==1||!/^\d+$/.test(String(value.accountId))||!value.account||Array.isArray(value.account)||JSON.stringify(value).length>5_000_000)throw Error('INVALID_BACKUP');
 const input=value.account;
 if(!input.preferences||!['dark','light'].includes(input.preferences.theme)||!['tr','en'].includes(input.preferences.language)||!Number.isInteger(input.preferences.retention)||input.preferences.retention<1||input.preferences.retention>20)throw Error('INVALID_PREFERENCES');
 for(const name of ['snapshots','selections','reviews','sessions','tasks','workflows','runs'])if(!Array.isArray(input[name])||input[name].length>10000)throw Error('INVALID_BACKUP');
 if(!input.meta||typeof input.meta!=='object'||Array.isArray(input.meta)||!input.preferences||typeof input.preferences!=='object')throw Error('INVALID_BACKUP');
 for(const [key,m] of Object.entries(input.meta))if(!/^\d+$/.test(key)||!m||typeof m!=='object'||m.notes!=null&&typeof m.notes!=='string'||m.labels!=null&&(!Array.isArray(m.labels)||m.labels.some(v=>typeof v!=='string')))throw Error('INVALID_METADATA');
 for(const s of input.snapshots){if(s.accountId!==String(value.accountId)||!s.complete||!Array.isArray(s.users)||typeof s.id!=='string'||!Number.isFinite(Date.parse(s.at))||s.followerIds!=null&&(!Array.isArray(s.followerIds)||s.followerIds.some(id=>typeof id!=='string'||!/^\d+$/.test(id))))throw Error('INVALID_SNAPSHOT');for(const u of s.users)if(!u||typeof u.id!=='string'||!/^\d+$/.test(u.id)||typeof u.username!=='string')throw Error('INVALID_SNAPSHOT')}
 for(const w of input.workflows)validateWorkflow(w);
 for(const run of input.runs)if(!run||typeof run.id!=='string'||typeof run.name!=='string'||!Number.isFinite(Date.parse(run.at))||!Number.isSafeInteger(run.matched)||run.matched<0||!['simulation','local-apply'].includes(run.mode))throw Error('INVALID_RUN');
 for(const task of input.tasks)if(!task||typeof task.id!=='string'||typeof task.title!=='string'||task.due!=null&&!Number.isFinite(Date.parse(task.due)))throw Error('INVALID_TASK');
 for(const session of input.sessions)if(!session||typeof session.id!=='string'||typeof session.name!=='string'||!Array.isArray(session.ids)||session.ids.some(id=>typeof id!=='string'||!/^\d+$/.test(id))||!Number.isInteger(session.position)||session.position<0)throw Error('INVALID_SESSION');
 for(const selection of input.selections)if(!selection||typeof selection.id!=='string'||typeof selection.name!=='string'||!Array.isArray(selection.ids)||selection.ids.some(id=>typeof id!=='string'||!/^\d+$/.test(id)))throw Error('INVALID_SELECTION');
 if(input.reviews.some(id=>!/^\d+$/.test(String(id))))throw Error('INVALID_REVIEW');
 if(input.snapshots.some(s=>new Set(s.users.map(u=>u.id)).size!==s.users.length||s.followerIds&&new Set(s.followerIds).size!==s.followerIds.length))throw Error('DUPLICATE_SNAPSHOT_RECORD');
 const output={};for(const key of ['snapshots','meta','selections','reviews','sessions','tasks','workflows','runs','preferences','onboarded','lastVersion'])if(input[key]!==undefined)output[key]=copy(input[key]);
 return {schemaVersion:1,accountId:String(value.accountId),account:output};
}
function ruleConflicts(rule){validateRule(rule);if(rule.op!=='and')return [];const seen=new Map(),conflicts=[];for(const child of rule.rules){if(child.op==='eq'){if(seen.has(child.field)&&seen.get(child.field)!==child.value)conflicts.push(child.field);seen.set(child.field,child.value)}else conflicts.push(...ruleConflicts(child))}return [...new Set(conflicts)]}
function decide(rules,user){
 const matches=[];let unknown=false;
 for(const entry of rules){validateRule(entry.rule);const result=evaluate(entry.rule,user);if(result===null)unknown=true;if(result===true)matches.push(entry)}
 matches.sort((a,b)=>b.priority-a.priority);if(!matches.length)return {include:unknown?null:false,conflict:false};
 const top=matches.filter(r=>r.priority===matches[0].priority),conflict=top.some(r=>r.decision!==top[0].decision);
 return {include:conflict?null:top[0].decision==='include',conflict,priority:top[0].priority};
}
const api={KEY,SCHEMA,id,copy,text,empty,parse,account,capture,rows,analytics,filter,validateRule,evaluate,compare,template,validateWorkflow,simulate,csv,validateBackup,ruleConflicts,decide};
if(typeof module==='object'&&module.exports)module.exports=api;root.IUWorkspace=api;
})(globalThis);
