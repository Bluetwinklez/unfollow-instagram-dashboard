const assert=require('assert/strict'),W=require('./instagram-chrome-eklentisi/workspace-core.js');
const entry=(user,ts,shape)=>shape==='value'?{title:'',media_list_data:[],string_list_data:[{href:'https://www.instagram.com/'+user,value:user,timestamp:ts}]}:{title:user,media_list_data:[],string_list_data:[{href:'https://www.instagram.com/_u/'+user,timestamp:ts}]};
const followers=JSON.stringify([entry('Alice',1700000100,'value'),entry('bob',1700000200,'value'),entry('carol.x',1700000300,'value')]);
const following=JSON.stringify({relationships_following:[entry('alice',1690000000,'title'),entry('dave',1690000100,'title'),entry('erin_',1690000200,'title'),entry('bob',1690000300,'title')]});
const files=[{name:'followers_1.json',text:followers},{name:'following.json',text:following}];

// JSON export: usernames come from value (followers) or title (following), case-insensitive, deduplicated
const parsed=W.parseOfficialExport(files);
assert.deepEqual(parsed.followers.map(p=>p[0]),['alice','bob','carol.x']);
assert.deepEqual(parsed.following.map(p=>p[0]),['alice','bob','dave','erin_']);
assert.equal(parsed.following[0][1],1690000000);assert.equal(parsed.skipped,0);assert.deepEqual(parsed.files,['followers_1.json','following.json']);
const analysis=W.officialAnalysis(parsed);
assert.equal(analysis.following,4);assert.equal(analysis.followers,3);assert.equal(analysis.mutual,2);assert.equal(analysis.nonfollowers,2);
assert.deepEqual(analysis.rows.filter(r=>r.relationship==='nonfollowers').map(r=>r.username),['dave','erin_']);
assert.deepEqual(analysis.fans,['carol.x']);assert.equal(analysis.matched,null);assert.equal(analysis.overlap,null);

// several follower files merge; paths in file names are ignored
const split=W.parseOfficialExport([{name:'connections/followers_and_following/followers_2.json',text:JSON.stringify([entry('zed',5,'value')])},{name:'followers_1.json',text:followers},{name:'following.json',text:following}]);
assert.equal(split.followers.length,4);assert.ok(split.files.includes('followers_2.json'));

// HTML variant: only profile links count, reserved paths and foreign hosts are ignored
const html='<html><body><a href="https://www.instagram.com/">home</a><div><a target="_blank" href="https://www.instagram.com/alice">alice</a><a href="https://www.instagram.com/_u/bob?x=1&amp;y=2">bob</a><a href="https://www.instagram.com/accounts/login/">login</a><a href="https://evil.example/zed">zed</a></div></body></html>';
const fromHtml=W.parseOfficialExport([{name:'followers_1.html',text:html},{name:'following.html',text:html}]);
assert.deepEqual(fromHtml.followers.map(p=>p[0]),['alice','bob']);

// File names decide the list; structure decides when the name is unknown
assert.equal(W.parseOfficialExport([{name:'a.json',text:followers},{name:'b.json',text:following}]).following.length,4);

// Invalid entries are skipped and counted, never stored
const dirty=W.parseOfficialExport([{name:'followers_1.json',text:JSON.stringify([entry('ok',1,'value'),{string_list_data:[{value:'bad name!'}]},{},null,entry('=cmd()',1,'value')])},{name:'following.json',text:following}]);
assert.deepEqual(dirty.followers.map(p=>p[0]),['ok']);assert.equal(dirty.skipped,4);

// Failures are explicit
const code=fn=>{try{fn();return null}catch(e){return e.message}};
assert.equal(code(()=>W.parseOfficialExport([])),'OFFICIAL_FILES');
assert.equal(code(()=>W.parseOfficialExport([{name:'followers_1.json',text:followers}])),'OFFICIAL_MISSING_FOLLOWING');
assert.equal(code(()=>W.parseOfficialExport([{name:'following.json',text:following}])),'OFFICIAL_MISSING_FOLLOWERS');
assert.equal(code(()=>W.parseOfficialExport([{name:'followers_1.json',text:'{not json'},{name:'following.json',text:following}])),'OFFICIAL_FORMAT');
assert.equal(code(()=>W.parseOfficialExport([{name:'blocked_profiles.json',text:JSON.stringify({relationships_blocked_users:[]})}])),'OFFICIAL_FORMAT');
assert.equal(code(()=>W.parseOfficialExport([{name:'export.zip',text:'PK\u0003\u0004binary'}])),'OFFICIAL_ZIP');
assert.equal(code(()=>W.parseOfficialExport([{name:'followers_1.json',text:' '.repeat(5_000_001)}])),'FILE_TOO_LARGE');
const many=JSON.stringify({relationships_following:Array.from({length:20001},(_,i)=>entry('u'+i,1,'title'))});
assert.equal(code(()=>W.parseOfficialExport([{name:'followers_1.json',text:'[]'},{name:'following.json',text:many}])),'OFFICIAL_TOO_LARGE');
assert.equal(W.parseOfficialExport([{name:'followers_1.json',text:'[]'},{name:'following.json',text:following}]).followers.length,0,'an empty followers file is valid');

// Bridge to a live scan: usernames match case-insensitively; ids come only from the live snapshot
const db=W.empty();W.capture(db,{viewerId:'42',scope:'all',followingDone:true,following:[{id:'11',username:'Alice'},{id:'12',username:'dave'},{id:'13',username:'erin_'},{id:'14',username:'unrelated'}]});
const a=W.account(db,'42');
const bridged=W.officialAnalysis(parsed,a.snapshots.at(-1));
assert.equal(bridged.matched,2);assert.equal(bridged.overlap,3/4);
assert.deepEqual(bridged.rows.filter(r=>r.relationship==='nonfollowers').map(r=>r.liveId),['12','13']);
assert.equal(W.officialAnalysis(parsed,{users:[{id:'1',username:'someone_else'}]}).overlap,0,'a different account shows no overlap');

// Persistence: the field survives validation and backup, and bad data is rejected
a.official=parsed;
const backup=W.validateBackup({schemaVersion:1,accountId:'42',account:a});
assert.deepEqual(backup.account.official.following,parsed.following);
assert.equal(W.parse(JSON.stringify(db)).accounts['42'].official.at,parsed.at);
delete a.official;assert.equal(W.validateBackup({schemaVersion:1,accountId:'42',account:a}).account.official,undefined,'older data without the field still loads');
for(const bad of [{...parsed,at:'nope'},{...parsed,following:[['UPPER',1]]},{...parsed,following:[['ok','1']]},{...parsed,followers:[['a']]},{...parsed,files:[1]},{...parsed,skipped:-1},[]])assert.throws(()=>W.validateBackup({schemaVersion:1,accountId:'42',account:{...a,official:bad}}),/INVALID_OFFICIAL/);

// CSV escapes spreadsheet formulas
assert.ok(W.officialCsv([{username:'+1x',relationship:'nonfollowers',followedAt:0}]).includes("\"'+1x\""));
assert.equal(W.officialCsv(analysis.rows).split('\r\n')[0],'username,relationship,followed_at');
console.log('official export tests passed');
