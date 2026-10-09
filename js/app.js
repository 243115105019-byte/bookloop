var DEPTS=["EEE","ECE","CSE","Mechanical","Civil","Science and Humanities"];
var books=[
{t:"Basic Electrical Engineering",a:"Sample Author",c:"XX101",d:"EEE",s:1,e:"2nd",n:"Good",y:"Sell",p:250,st:"Available"},
{t:"Engineering Mathematics II",a:"Sample Author",c:"XX102",d:"Science and Humanities",s:2,e:"4th",n:"Like new",y:"Rent",p:60,st:"Available"},
{t:"Circuit Theory",a:"Sample Author",c:"XX301",d:"EEE",s:3,e:"1st",n:"Fair",y:"Exchange",p:0,st:"Available"},
{t:"Data Structures",a:"Sample Author",c:"XX302",d:"CSE",s:3,e:"3rd",n:"Good",y:"Donate",p:0,st:"Available"},
{t:"Engineering Mechanics",a:"Sample Author",c:"XX201",d:"Mechanical",s:2,e:"2nd",n:"Good",y:"Sell",p:180,st:"Reserved"},
{t:"Digital Electronics Lab Manual",a:"Sample Author",c:"XX401",d:"ECE",s:4,e:"1st",n:"Like new",y:"Sell",p:90,st:"Available"}].map(function(b,i){b.id="l"+i;return b});
var DB=null,UID=null,OWNER=false,reports=[];
var $=function(i){return document.getElementById(i)};
var colors=["#12315a","#0e8c8c","#3f9d4a","#1b5e8c","#0a6b6b","#2c4a7c","#5cb85c","#145a82"],names=["EEE","MATHS","BMS","CIRCUITS","CODE","MECH","LAB","ESVC"];
var sh=$("shelf");names.forEach(function(n,i){var s=document.createElement("div");s.className="spine";s.style.cssText="--i:"+i+";height:"+(170+((i*53)%110))+"px;background:"+colors[i];s.textContent=n;sh.appendChild(s)});
function fill(sel,arr,first){arr.forEach(function(v){var o=document.createElement("option");o.value=v;o.textContent=first?(first+" "+v):v;sel.appendChild(o)})}
fill($("fDept"),DEPTS);fill($("fSem"),[1,2,3,4,5,6,7,8],"Semester");fill($("fType"),["Sell","Rent","Exchange","Donate"]);
fill($("aD"),DEPTS);fill($("aS"),[1,2,3,4,5,6,7,8],"Semester");
function toast(m){var t=$("toast");t.textContent=m;t.classList.add("on");setTimeout(function(){t.classList.remove("on")},2400)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function find(id){return books.filter(function(b){return b.id===id})[0]}
function mine(b){return !!DB&&!!UID&&b.owner===UID}
function render(){
 var q=$("q").value.toLowerCase(),d=$("fDept").value,s=$("fSem").value,y=$("fType").value;
 var list=books.filter(function(b){
  return (!q||(b.t+b.a+b.c).toLowerCase().indexOf(q)>-1)&&(!d||b.d===d)&&(!s||String(b.s)===s)&&(!y||b.y===y)});
 $("cards").innerHTML=list.length?list.map(function(b){
  var price=b.y==="Donate"?"Free":b.y==="Exchange"?"Swap":"₹"+b.p+(b.y==="Rent"?" / sem":"");
  var avail=b.st==="Available",acts="";
  if(mine(b)){
   if(b.st==="Reserved")acts+='<button class="btn sm alt" data-id="'+b.id+'" data-k="release">Release</button>';
   if(b.st!=="Completed")acts+='<button class="btn sm" data-id="'+b.id+'" data-k="done">Mark completed</button>';
   acts+='<button class="btn sm alt" data-id="'+b.id+'" data-k="del">Delete</button>';
  }else{
   acts+='<button class="btn sm" data-id="'+b.id+'" data-k="contact"'+(avail?"":" disabled")+'>'+(avail?"Contact owner":b.st)+'</button>';
   if(DB)acts+='<button class="btn sm alt" data-id="'+b.id+'" data-k="report">Report</button>';
  }
  return '<article class="card"><span class="tags"><span class="tag">'+esc(b.y)+'</span><span class="tag '+(avail?"g":"")+'">'+esc(b.st)+'</span>'+(mine(b)?'<span class="tag">Yours</span>':'')+'</span><h3>'+esc(b.t)+'</h3><div class="meta">'+esc(b.a)+' · '+esc(b.e)+' edition · '+esc(b.n)+'</div><div class="meta">'+esc(b.c)+' · '+esc(b.d)+' · Sem '+esc(b.s)+'</div><div class="price">'+price+'</div><div class="acts">'+acts+'</div></article>'}).join(""):
  '<div class="empty">No books match these filters. Clear a filter, or list your own book below.</div>';
}
function fail(){toast("Could not save. You may have view-only access.")}
$("cards").addEventListener("click",function(e){
 var b=e.target.closest("button[data-id]");if(!b||b.disabled)return;
 var id=b.dataset.id,k=b.dataset.k,it=find(id);if(!it)return;
 if(!DB){
  if(k==="contact"){it.st="Reserved";toast("Request sent. The listing is now reserved.")}
  render();return}
 var L=DB.collection("listings").doc(id),p;
 if(k==="contact"){p=L.update({st:"Reserved",by:UID||"guest"});DB.collection("requests").doc("q"+Date.now()).set({lid:id,title:it.t,from:UID||"guest",at:Date.now()}).catch(function(){})}
 else if(k==="release")p=L.update({st:"Available",by:null});
 else if(k==="done")p=L.update({st:"Completed"});
 else if(k==="del")p=L.delete();
 else if(k==="report")p=DB.collection("reports").doc("r"+Date.now()).set({lid:id,title:it.t,by:UID||"guest",open:true,at:Date.now()});
 if(p)p.then(function(){toast(k==="contact"?"Request sent. The listing is now reserved.":k==="report"?"Report sent to the moderators.":k==="del"?"Listing deleted.":"Listing updated.")}).catch(fail);
});
["q","fDept","fSem","fType"].forEach(function(i){$(i).addEventListener("input",render)});
$("addForm").addEventListener("submit",function(e){e.preventDefault();
 var y=$("aY").value,o={t:$("aT").value,a:$("aA").value,c:$("aC").value,d:$("aD").value,s:+$("aS").value,e:$("aE").value||"n/a",n:$("aN").value,y:y,p:y==="Sell"||y==="Rent"?+$("aP").value||0:0,st:"Available",owner:UID||"guest",created:Date.now()};
 e.target.reset();["q","fDept","fSem","fType"].forEach(function(i){$(i).value=""});
 if(DB){DB.collection("listings").doc("u"+Date.now()).set(o).then(function(){toast("Listing published for everyone.")}).catch(fail)}
 else{o.id="l"+Date.now();books.unshift(o);render();toast("Listing added.")}
 $("browse").scrollIntoView()});
function renderAdmin(){
 if(!(DB&&OWNER))return;
 $("admLede").textContent="Live reports from students. Only the page owner sees this view.";
 $("adm").innerHTML=reports.length?reports.map(function(r){return '<div class="row"><div><b>'+esc(r.title)+'</b><div class="meta">Reported by a student</div></div><div class="acts"><button class="btn sm" data-r="'+r.id+'" data-a="dismiss">Dismiss</button><button class="btn sm alt" data-r="'+r.id+'" data-l="'+esc(r.lid)+'" data-a="remove">Remove listing</button></div></div>'}).join(""):'<div class="row"><div class="meta">No open reports. When a student reports a listing, it appears here.</div></div>';
}
$("adm").addEventListener("click",function(e){var b=e.target.closest("button[data-a]");if(!b)return;
 if(b.dataset.r&&DB){
  var done=function(){toast(b.dataset.a==="remove"?"Listing removed.":"Report dismissed.")};
  var close=function(){return DB.collection("reports").doc(b.dataset.r).update({open:false})};
  (b.dataset.a==="remove"?DB.collection("listings").doc(b.dataset.l).delete().then(close):close()).then(done).catch(fail);return}
 var r=b.closest(".row");r.classList.add("done");r.querySelectorAll("button").forEach(function(x){x.disabled=true});toast(b.dataset.a+".")});
function mode(t){$("mode").textContent=t;$("formNote").textContent=DB?"Listings you publish are shared live with everyone who opens this page. You can delete your own listings.":"New listings exist only on this page and reset on reload."}
mode("Offline demo: changes reset on reload.");
(function(){if(!window.claude||!claude.use)return;
 Promise.all([claude.use("db"),claude.use("user")]).then(function(r){var d=r[0],u=r[1];if(!d)return;
  var who=u?Promise.all([u.id(),u.isOwner()]):Promise.resolve([null,false]);
  return who.then(function(x){DB=d;UID=x[0];OWNER=x[1];
   d.collection("listings").onSnapshot(function(s){
    books=s.docs.map(function(z){var o=Object.assign({},z.data());o.id=z.id;return o}).sort(function(a,b){return (b.created||0)-(a.created||0)});render()},function(){});
   d.collection("reports").onSnapshot(function(s){
    reports=s.docs.map(function(z){var o=Object.assign({},z.data());o.id=z.id;return o}).filter(function(o){return o.open});renderAdmin()},function(){});
   mode("Live mode: listings are shared with everyone who opens this page. The first six are sample data.");render();renderAdmin()})
 }).catch(function(){})})();
render();