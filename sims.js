/* Simulation library. Each entry: label, html (markup), init(root) (wires behaviour).
   To add a new simulation, add another S.name = {...} block and use "sim": "name" in projects.json. */
(function(){
var S={}, q=function(r,s){return r.querySelector(s)}, reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;

S.queue={label:"Job queue simulation",
html:'<div class="cap"><span>simulation · 4 workers</span><span>backoff retries, max 3</span></div><div class="wk"></div>'+
'<div class="cnt"><div><b data-k="qd">0</b><span>queue depth</span></div><div><b data-k="dn">0</b><span>done</span></div><div><b data-k="rt">0</b><span>retries</span></div><div><b data-k="dl">0</b><span>dead-letter</span></div></div>'+
'<svg class="spark" viewBox="0 0 240 56" preserveAspectRatio="none" role="img" aria-label="Queue depth over time"><polyline points=""/></svg>'+
'<div class="ctl"><button class="p" data-a="burst">Burst 40 jobs</button><label><input type="checkbox" data-a="fail" checked> inject failures</label></div>',
init:function(r){
  var wk=q(r,".wk"),W=[null,null,null,null],Q=[],d=0,rt=0,x=0,hist=[],tick=0,tm=null,seq=0,n=function(k){return q(r,'[data-k="'+k+'"]')};
  for(var i=0;i<4;i++)wk.innerHTML+="<div>idle</div>";
  function draw(){
    [].forEach.call(wk.children,function(c,i){c.className=W[i]?"busy":"";c.textContent=W[i]?"job #"+W[i].id:"idle"});
    n("qd").textContent=Q.length;n("dn").textContent=d;n("rt").textContent=rt;n("dl").textContent=x;
    q(r,"polyline").setAttribute("points",hist.map(function(v,i){return (i*240/59).toFixed(1)+","+(52-Math.min(v,48)).toFixed(1)}).join(" "));
  }
  function step(){
    tick++;
    for(var i=0;i<4;i++){
      var j=W[i];
      if(j&&--j.left<=0){
        if(q(r,'[data-a="fail"]').checked&&Math.random()<.3){if(j.t<3){j.t++;j.at=tick+Math.pow(2,j.t)*2;Q.push(j);rt++}else x++}else d++;
        W[i]=null;
      }
      if(!W[i]){var k=-1;for(var m=0;m<Q.length;m++){if(Q[m].at<=tick){k=m;break}}
        if(k>=0){W[i]=Q.splice(k,1)[0];W[i].left=3+Math.floor(Math.random()*3)}}
    }
    hist.push(Q.length);if(hist.length>60)hist.shift();draw();
    if(!Q.length&&!W.some(Boolean)){clearInterval(tm);tm=null}
  }
  q(r,'[data-a="burst"]').onclick=function(){for(var i=0;i<40;i++)Q.push({id:++seq,t:0,at:0});if(!tm)tm=setInterval(step,150)};
  draw();
}};

S.audit={label:"Dataset audit (quality, clustering, label validation)",
html:'<div class="cap"><span data-k="stage">audit of 32 sample images</span><span>flagged files are quarantined, not deleted</span></div><div class="tiles"></div><div class="bars"></div>'+
'<div class="ctl"><button class="p" data-a="run">Run audit</button><button data-a="reset">Reset</button></div>',
init:function(r){
  var kinds={3:"C",17:"C",9:"D",10:"D",25:"D",5:"B",20:"B",28:"B",30:"B",13:"L",22:"L"},mis=[2,14,27],
      names={C:"corrupted",D:"duplicate",B:"blur",L:"low-res",M:"mislabeled"},tl=q(r,".tiles"),tiles=[],tms=[],at=null,st=q(r,'[data-k="stage"]'),st0=st.textContent;
  for(var i=0;i<32;i++){var d=document.createElement("div");d.className="t";var g=22+(i*37%26);d.style.background="linear-gradient(135deg,hsl(38 6% "+(g+9)+"%),hsl(38 6% "+g+"%))";tl.appendChild(d);tiles.push(d)}
  function later(f,ms){tms.push(setTimeout(f,ms))}
  function bars(){var c={C:0,D:0,B:0,L:0,M:mis.length};for(var k in kinds)c[kinds[k]]++;
    q(r,".bars").innerHTML=["C","D","B","L","M"].map(function(k){return '<div class="br"><span>'+names[k]+'</span><i data-w="'+c[k]*20+'"></i><span>'+c[k]+'</span></div>'}).join("");
    requestAnimationFrame(function(){requestAnimationFrame(function(){[].forEach.call(r.querySelectorAll(".bars i"),function(e){e.style.width=e.dataset.w+"%"})})})}
  function reset(){clearInterval(at);tms.forEach(clearTimeout);tms=[];tiles.forEach(function(t){t.className="t";t.removeAttribute("data-k");t.removeAttribute("data-c")});q(r,".bars").innerHTML="";st.textContent=st0}
  function phase2(){
    st.textContent="2/3 clustering";
    tiles.forEach(function(t,i){if(!kinds[i]){var c=i<11?0:i<22?1:2;t.classList.add("c"+c);t.setAttribute("data-c","ABC".charAt(c))}});
    later(function(){
      st.textContent="3/3 label validation";
      mis.forEach(function(i,n){later(function(){tiles[i].classList.add("fl");tiles[i].setAttribute("data-k","M")},reduce?0:n*300)});
      later(function(){st.textContent="done: 14 flagged, 3 clusters";bars()},reduce?0:1200);
    },reduce?0:1300);
  }
  q(r,'[data-a="reset"]').onclick=reset;
  q(r,'[data-a="run"]').onclick=function(){reset();var i=0;st.textContent="1/3 quality scan";at=setInterval(function(){
    if(i>0)tiles[i-1].classList.remove("sc");
    if(i>=32){clearInterval(at);phase2();return}
    var t=tiles[i];if(kinds[i]){t.classList.add("fl");t.setAttribute("data-k",kinds[i])}else t.classList.add("sc");i++},reduce?10:80)};
}};

S.segment={label:"Document layout segmentation overlay",
html:'<div class="cap"><span>segmentation overlay</span><span>multi-class structure</span></div><div class="docw">'+
'<svg class="doc" viewBox="0 0 220 280" role="img" aria-label="Document page with segmented layout regions"><rect x="1" y="1" width="218" height="278" rx="3" fill="#1f1e1b" stroke="#2f2e2a"/><rect x="20" y="22" width="130" height="10" rx="2" fill="#5c5952"/>'+
'<g fill="#3b3935"><rect x="20" y="48" width="180" height="4"/><rect x="20" y="58" width="170" height="4"/><rect x="20" y="68" width="180" height="4"/><rect x="20" y="78" width="120" height="4"/></g>'+
'<rect x="20" y="98" width="86" height="64" rx="2" fill="#2f2e2a"/><path d="M20 162 L52 128 L72 148 L88 132 L106 154 V162Z" fill="#4a4842"/>'+
'<g fill="#3b3935"><rect x="116" y="100" width="84" height="4"/><rect x="116" y="110" width="80" height="4"/><rect x="116" y="120" width="84" height="4"/><rect x="116" y="130" width="60" height="4"/></g>'+
'<g stroke="#3b3935" fill="none"><rect x="20" y="184" width="180" height="70"/><path d="M20 202H200M20 220H200M20 238H200M80 184V254M140 184V254"/></g>'+
'<g class="seg" style="--i:0"><rect x="14" y="16" width="142" height="22" rx="2"/><text x="18" y="12">title</text></g><g class="seg" style="--i:1"><rect x="14" y="44" width="192" height="42" rx="2"/><text x="150" y="42">text</text></g>'+
'<g class="seg" style="--i:2"><rect x="14" y="94" width="98" height="74" rx="2"/><text x="18" y="91">figure</text></g><g class="seg" style="--i:3"><rect x="14" y="178" width="192" height="82" rx="2"/><text x="18" y="175">table</text></g></svg></div>'+
'<div class="ctl"><button class="p" data-a="seg">Toggle segmentation</button></div>',
init:function(r){
  var w=q(r,".docw");q(r,'[data-a="seg"]').onclick=function(){w.classList.toggle("segon")};
  new IntersectionObserver(function(es,o){if(es[0].isIntersecting){setTimeout(function(){w.classList.add("segon")},500);o.disconnect()}},{threshold:.5}).observe(w);
}};

S.deploy={label:"Deployment log (audit table)",
html:'<div class="cap"><span>deployment flow</span><span>every run is logged</span></div><div class="flow"><span>.sql script</span><em>→</em><span>split on GO</span><em>→</em><span>run batches</span><em>→</em><span>audit table</span></div>'+
'<div class="tw"><table><thead><tr><th>script</th><th>status</th><th>ms</th><th>error</th></tr></thead><tbody data-k="log"></tbody></table></div><div class="ctl"><button class="p" data-a="go">Replay deployment</button></div>',
init:function(r){
  var rows=[["01_create_db.sql","OK",412,""],["02_tables.sql","OK",233,""],["03_views.sql","FAILED",87,"invalid object name"],["03_views.sql","OK",91,""]];
  function go(){var b=q(r,'[data-k="log"]');b.innerHTML="";rows.forEach(function(x,i){setTimeout(function(){var tr=document.createElement("tr");tr.className="ni";
    tr.innerHTML="<td>"+x[0]+"</td><td class='"+(x[1]==="OK"?"ok":"er")+"'>"+x[1]+"</td><td>"+x[2]+"</td><td>"+(x[3]||"–")+"</td>";b.appendChild(tr)},reduce?0:i*550)})}
  q(r,'[data-a="go"]').onclick=go;go();
}};

window.SIMS=S;
})();
