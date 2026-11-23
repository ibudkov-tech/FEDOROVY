(function(){"use strict";
const F=window.FAM,P=F.P,S=F.S,PAGE=window.PAGE;
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const enc=p=>p.split('/').map(encodeURIComponent).join('/');
function srcLinks(ks){return (ks||[]).filter(k=>S[k]).map(k=>{const s=S[k];
  const ya=s.y?`<a href="${s.y}" target="_blank" rel="noopener" title="${esc(s.sh)} — в Яндекс Архиве">Я ↗</a>`:'';
  return s.img?`<a href="${enc(s.img)}" class="scan" data-k="${k}" title="${esc(s.sh)}">${esc(s.t)} ⤢</a>`+ya:(s.y?`<a href="${s.y}" target="_blank" rel="noopener" title="${esc(s.sh)}">${esc(s.t)} ↗</a>`:`<span title="${esc(s.sh)}">${esc(s.t)}</span>`)}).join('')}
function plural(n){const a=n%10,b=n%100;if(a===1&&b!==11)return'ребёнок';if(a>=2&&a<=4&&(b<10||b>=20))return'ребёнка';return'детей'}
function xlinks(id){const x=(F.X[id]||[]).filter(l=>l.page!==PAGE);
  return x.length?`<div class="xl">${x.map(l=>`<a href="${l.href}">${esc(l.label)} →</a>`).join('')}</div>`:''}
function nodeHTML(n,kids){
  if(n.g){return `<span class="tw" aria-hidden="true"></span><span><span class="nm">${esc(n.g)}</span>${n.link?` <a href="${n.link[0]}" style="font:14px var(--s);color:var(--accent)">${esc(n.link[1])} →</a>`:''}${n.hyp?' <span class="pill p-hyp">гипотеза</span>':''}</span>`}
  const p=P[n.id];
  const img=p.ph?`<img class="ph" src="img/${p.ph}" alt="" loading="lazy">`:'';
  const info=[];
  if(n.ln)info.push('<span class="pill p-line">наша линия</span>');
  info.push((n.hyp||p.hyp)?'<span class="pill p-hyp">связь — гипотеза</span>':'<span class="pill p-known">по документам</span>');
  if(p.pl)info.push(`<span>${esc(p.pl)}</span>`);
  const sp=(n.sp||[]);
  if(sp.length)info.push('<span>∞ '+sp.map(s=>{const q=P[s];const x=(F.X[s]||[]).find(l=>l.page!==PAGE);const nm=esc(q.n)+(q.y?` <span class="yrs">${esc(q.y)}</span>`:'');return x?`<a href="${x.href}">${nm}</a>`:nm}).join('; ')+'</span>');
  if(kids)info.push(`<span>${kids} ${plural(kids)}</span>`);
  let h=`<span class="tw" aria-hidden="true"></span><span class="body">${img}<span><span class="nm">${esc(p.n)}</span>${p.y?`<span class="yrs">${esc(p.y)}</span>`:''}<span class="info" style="display:flex">${info.join('')}</span>`;
  if(p.bio)h+=`<span class="bio" style="display:block">${esc(p.bio)}</span>`;
  if(n.note)h+=`<span class="bio" style="display:block;color:var(--muted)">${esc(n.note)}</span>`;
  h+=xlinks(n.id).replace('<div','<span').replace('</div>','</span>').replace('class="xl"','class="xl" style="display:flex"');
  h+='</span></span>';
  return h;
}
// «Имя Отчество Фамилия (родство)» → имя жирным, родство плашкой (как на сайте Ступиных)
const kinText=t=>esc(t).replace(/((?:[А-ЯЁ][а-яё]+ ){1,2}[А-ЯЁ][а-яё]+) \(([^()]*(?:дяд|тёт|брат|сестр|муж |жена|родств|племян|дед|свёкр|невестк)[^()]*)\)/g,'<b>$1</b> <span class="kinp">$2</span>');
function factsHTML(p){
  if(!p.f||!p.f.length)return '';
  const items=p.f.map(([y,t,ks])=>`<li><span class="fy">${esc(y)}</span>${kinText(t).replace(/\n/g,'<br>')}<span class="src">${srcLinks(ks)}</span></li>`).join('');
  return `<details class="refs"><summary>Факты и источники: ${p.f.length}</summary><ol class="facts">${items}</ol></details>`;
}
function el(t,c,h){const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
function build(n,depth){
  const p=n.id?P[n.id]:null;
  const li=el('li','gen-'+depth+(n.g?' grp':'')+(n.ln?' ln':'')+((n.hyp||(p&&p.hyp))?' hyp':''));
  li.dataset.name=(n.g||[p.n].concat((n.sp||[]).map(s=>P[s].n)).join(' ')).toLowerCase();
  if(n.id)li.id='p-'+n.id;
  const kids=(n.ch||[]).length;
  const inner=nodeHTML(n,kids);
  if(kids){
    const d=el('details');d.open=depth<=3||!!n.open||!!(n.ch||[]).some(function f(c){return c.ln||(c.ch||[]).some(f)});
    const s=el('summary');const nd=el('span','node',inner);s.appendChild(nd);d.appendChild(s);
    const ul=el('ul');n.ch.forEach(k=>ul.appendChild(build(k,depth+1)));d.appendChild(ul);li.appendChild(d);
    if(p){const fh=factsHTML(p);if(fh){const w=el('div','node',fh);w.style.display='block';w.style.paddingTop='0';
      // свёрнутая ветка: факты остаются видны под карточкой; развёрнутая — факты внутри, перед детьми
      const place=()=>{if(d.open)d.insertBefore(w,s.nextSibling);else li.insertBefore(w,d.nextSibling)};
      place();d.addEventListener('toggle',place);}}
  }else{li.classList.add('leaf');const nd=el('span','node',inner);li.appendChild(nd);if(p){const fh=factsHTML(p);if(fh){const w=el('div','node',fh);w.style.display='block';w.style.paddingTop='0';li.appendChild(w)}}}
  return li;
}
const box=document.getElementById('trees');
(F.T[PAGE]||[]).forEach(r=>{const ul=el('ul','tree');ul.appendChild(build(r,1));const tb=el('div','treebox');tb.appendChild(ul);box.appendChild(tb)});
// ---- lightbox
const lb=document.getElementById('lb'),lbImg=document.getElementById('lbImg'),lbX=document.getElementById('lbX');let from=null;
function openLB(a){from=a;lb.classList.remove('zoom');lbImg.src=a.getAttribute('href');const s=S[a.dataset.k]||{t:a.textContent,sh:''};document.getElementById('lbCap').textContent=s.t+(s.sh?' — '+s.sh:'');lb.classList.add('on');document.body.classList.add('lb-open');lbX.focus()}
function closeLB(){lb.classList.remove('on','zoom');document.body.classList.remove('lb-open');lbImg.removeAttribute('src');if(from)from.focus()}
lbX.onclick=closeLB;
document.addEventListener('click',e=>{const rs=e.target.closest('details.refs>summary');if(rs){e.preventDefault();rs.parentElement.open=!rs.parentElement.open;return}
  const sc=e.target.closest('a.scan');if(sc){e.preventDefault();openLB(sc);return}
  const sm=e.target.closest('summary');if(sm&&e.target.closest('a,.bio,.xl'))e.preventDefault&&0},true);
lb.addEventListener('click',e=>{if(e.target===lbImg){lb.classList.toggle('zoom');return}if(e.target!==lbX)closeLB()});
document.addEventListener('keydown',e=>{if(lb.classList.contains('on')&&e.key==='Escape')closeLB()});
// ---- tools
const tog=(open)=>box.querySelectorAll('details:not(.refs)').forEach((d,i)=>d.open=open?true:i===0);
const oa=document.getElementById('openAll'),ca=document.getElementById('closeAll'),sl=document.getElementById('showLine'),q=document.getElementById('q');
if(oa)oa.onclick=()=>tog(true);if(ca)ca.onclick=()=>tog(false);
function reveal(li){let p=li.parentElement;while(p&&p!==box){if(p.tagName==='DETAILS'&&!p.classList.contains('refs'))p.open=true;p=p.parentElement}}
if(sl)sl.onclick=()=>{box.querySelectorAll('li.ln').forEach(reveal);const t=box.querySelector('li.ln:last-of-type');(box.querySelector('#p-'+(window.TARGET||''))||t).scrollIntoView({block:'center'})};
if(q)q.addEventListener('input',e=>{const v=e.target.value.trim().toLowerCase();box.querySelectorAll('li').forEach(li=>li.classList.remove('hl'));if(v.length<2)return;let first=null;box.querySelectorAll('li').forEach(li=>{if(li.dataset.name&&li.dataset.name.includes(v)){li.classList.add('hl');reveal(li);if(!first)first=li}});if(first)first.scrollIntoView({block:'center'})});
// ---- переход по хэшу (сквозные ссылки)
function go(){const h=location.hash;if(!h||h.length<3)return;const li=document.getElementById(h.slice(1));if(!li)return;reveal(li);li.classList.add('hl');setTimeout(()=>li.scrollIntoView({block:'center'}),60);setTimeout(()=>li.classList.remove('hl'),3500)}
window.addEventListener('hashchange',go);go();
})();
