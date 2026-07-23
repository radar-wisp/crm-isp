/* ============================================================
 * Tela: Dashboard
 * Extraído do <script> original (bloco contíguo, ordem de execução
 * preservada). Nenhuma linha de lógica foi reescrita.
 * ============================================================ */
const CARDMETA={
vendas:{label:'Vendas diárias',ico:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',cls:'i-green'},
valor:{label:'Valor diário',ico:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',cls:'i-blue'},
negociacao:{label:'Negociação',ico:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>',cls:'i-violet'},
perda:{label:'Perda diária',ico:'<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',cls:'i-amber'}
};
const PALETTE=['#0ea5b7','#7c5cf6','#22c55e','#f59e0b','#ec4899','#3b82f6'];
function dimName(d){return {vendedor:'Vendedor',area:'Área',plano:'Plano',periodo:'Período'}[d]||d}
function dimLabels(dim){
if(dim==='vendedor')return VEND;
if(dim==='area')return CFG.area.data.map(CFG.area.optLabel);
if(dim==='plano')return CFG.plan.data.map(r=>r.plano);
return ['Seg','Ter','Qua','Qui','Sex'];
}
function genVals(labels,metric){return labels.map(()=>metric==='valor'?(Math.floor(Math.random()*90)+10)*100:Math.floor(Math.random()*18)+2)}
function fmtVal(v,metric){return metric==='valor'?('R$ '+v.toLocaleString('pt-BR')):String(v)}

let dashCards=[
{metric:'vendas',value:'14',trend:'6%',up:true},
{metric:'valor',value:'R$ 12.480',trend:'8%',up:true},
{metric:'negociacao',value:'9',trend:'3%',up:true},
{metric:'perda',value:'3',trend:'2%',up:false}
];
let dashChartsData=[
{title:'Venda diária por vendedor',chartType:'bars',dimension:'vendedor',metric:'quantidade',periodo:'Diário'},
{title:'Venda diária por área',chartType:'bars',dimension:'area',metric:'quantidade',periodo:'Diário'},
{title:'Venda diária por plano',chartType:'bars',dimension:'plano',metric:'quantidade',periodo:'Diário'}
];
dashChartsData.forEach(c=>{c.labels=dimLabels(c.dimension);c.values=genVals(c.labels,c.metric)});

function renderDashCards(){
const el=document.getElementById('dashCards');
el.innerHTML=dashCards.map((c,i)=>{const m=CARDMETA[c.metric];
return '<div class="kpi"><div class="head"><div class="ico '+m.cls+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+m.ico+'</svg></div><div style="display:flex;align-items:center;gap:8px"><span class="trend '+(c.up?'up':'down')+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="'+(c.up?'18 15 12 9 6 15':'6 9 12 15 18 9')+'"/></svg>'+c.trend+'</span><button class="dw-del" data-card="'+i+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div></div><div class="val">'+esc(c.value)+'</div><div class="lbl">'+esc(c.title||m.label)+'</div></div>';
}).join('');
el.querySelectorAll('[data-card]').forEach(b=>b.addEventListener('click',()=>{dashCards.splice(parseInt(b.dataset.card),1);renderDashCards();}));
}
function chartInner(c){
if(c.chartType==='bars'){
const max=Math.max.apply(null,c.values.concat([1]));
return '<div class="d-bars">'+c.labels.map((l,i)=>{const h=Math.max(Math.round(c.values[i]/max*100),3);return '<div class="d-col"><div class="d-bar" style="height:'+h+'%"><span>'+fmtVal(c.values[i],c.metric)+'</span></div><small title="'+escA(l)+'">'+esc(l)+'</small></div>';}).join('')+'</div>';
}
if(c.chartType==='pie'){
const total=c.values.reduce((a,b)=>a+b,0)||1;let acc=0;
const segs=c.values.map((v,i)=>{const from=acc/total*100;acc+=v;return PALETTE[i%PALETTE.length]+' '+from+'% '+(acc/total*100)+'%';});
const legend=c.labels.map((l,i)=>'<div class="lg"><i style="background:'+PALETTE[i%PALETTE.length]+'"></i>'+esc(l)+'<b>'+fmtVal(c.values[i],c.metric)+'</b></div>').join('');
return '<div class="d-pie-wrap"><div class="d-pie" style="background:conic-gradient('+segs.join(',')+')"></div><div class="d-legend">'+legend+'</div></div>';
}
const max=Math.max.apply(null,c.values.concat([1]));const n=c.labels.length;
const pt=(i,v)=>[(n>1?i/(n-1)*100:50),100-(v/max*88)-6];
const pts=c.values.map((v,i)=>pt(i,v).join(',')).join(' ');
const dots=c.values.map((v,i)=>{const p=pt(i,v);return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="1.8" fill="var(--accent)"/>';}).join('');
const lbls=c.labels.map((l,i)=>{const x=n>1?i/(n-1)*100:50;return '<text x="'+x+'" y="116" font-size="5" fill="#8a97ab" text-anchor="middle">'+esc(l.length>8?l.slice(0,7)+'…':l)+'</text>';}).join('');
return '<svg class="d-line-svg" viewBox="0 0 100 120" preserveAspectRatio="none"><polyline points="'+pts+'" fill="none" stroke="var(--accent)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>'+dots+lbls+'</svg>';
}
function renderDashCharts(){
const el=document.getElementById('dashCharts');
el.innerHTML=dashChartsData.map((c,i)=>'<div class="dwidget"><div class="dw-head"><div><h3>'+esc(c.title)+'</h3><small>'+dimName(c.dimension)+' · '+(c.metric==='valor'?'Valor':'Quantidade')+' · '+(c.periodo||'Diário')+'</small></div><button class="dw-del" data-chart="'+i+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button></div><div class="dw-body">'+chartInner(c)+'</div></div>').join('');
el.querySelectorAll('[data-chart]').forEach(b=>b.addEventListener('click',()=>{dashChartsData.splice(parseInt(b.dataset.chart),1);renderDashCharts();}));
}

const dashOverlay=document.getElementById('dashOverlay');
const dashForm=document.getElementById('dashForm');
function dbVal(k){const s=dashForm.querySelector('.radio-group[data-k="'+k+'"] .radio-opt.sel');return s?s.dataset.val:''}
function updateDashFields(){const t=dbVal('itemtype');dashForm.querySelectorAll('[data-dbfield="card"]').forEach(e=>e.style.display=t==='card'?'':'none');dashForm.querySelectorAll('[data-dbfield="chart"]').forEach(e=>e.style.display=t==='chart'?'':'none');}
dashForm.querySelectorAll('.db-rg .radio-opt').forEach(opt=>opt.addEventListener('click',()=>{const g=opt.parentElement;g.querySelectorAll('.radio-opt').forEach(o=>o.classList.remove('sel'));opt.classList.add('sel');if(g.dataset.k==='itemtype')updateDashFields();}));
function closeDash(){dashOverlay.classList.remove('open')}
document.getElementById('btnNovoGrafico').addEventListener('click',()=>{updateDashFields();dashOverlay.classList.add('open')});
document.getElementById('dashCloseBtn').addEventListener('click',closeDash);
document.getElementById('dashCancel').addEventListener('click',closeDash);
dashOverlay.addEventListener('click',e=>{if(e.target===dashOverlay)closeDash()});
document.getElementById('dashSave').addEventListener('click',()=>{
const t=dbVal('itemtype');const title=document.getElementById('dbTitle').value.trim();
if(t==='card'){
const metric=dbVal('cardmetric');const isVal=metric==='valor';
const value=isVal?('R$ '+((Math.floor(Math.random()*90)+10)*100).toLocaleString('pt-BR')):String(Math.floor(Math.random()*20)+2);
dashCards.push({metric:metric,title:title||CARDMETA[metric].label,value:value,trend:(Math.floor(Math.random()*9)+1)+'%',up:Math.random()>0.4});
renderDashCards();
}else{
const dim=dbVal('dimension'),metric=dbVal('chartmetric');
const c={title:title||('Venda por '+dimName(dim).toLowerCase()),chartType:dbVal('charttype'),dimension:dim,metric:metric,periodo:dbVal('periodo')};
c.labels=dimLabels(dim);c.values=genVals(c.labels,metric);
dashChartsData.push(c);renderDashCharts();
}
document.getElementById('dbTitle').value='';closeDash();
});
renderDashCards();renderDashCharts();

/* ===== Funis de Venda ===== */
const dupIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const gearIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
const upIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
const downIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>';

