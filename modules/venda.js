/* ============================================================
 * Tela: Fluxo da Venda (kanban/lista do vendedor — apenas organização das Leads)
 * As etapas do Kanban e da Lista são construídas dinamicamente a partir
 * do funil selecionado (engine/funnel-runtime.js). Nenhuma etapa fixa.
 * ============================================================ */
const mineAll=LEADS.filter(l=>l.vend==='Renatha Loiola');

/* Metas e comissões (CFG.meta): acrescenta a meta do período ao subtítulo
 * já existente, cruzando com a função do vendedor em Colaboradores (CFG.vend). */
function metaTexto(){
const vends=(typeof CFG!=='undefined'&&CFG.vend)?CFG.vend.data:[];
const v=vends.find(x=>x.nome==='Renatha Loiola');
const cargo=v?v.funcao:'Vendedor';
const metas=(typeof CFG!=='undefined'&&CFG.meta)?CFG.meta.data:[];
const m=metas.find(x=>x.cargo===cargo);
if(!m)return '';
const valor=m.meta==='Quantidade'?m.metaQtd:m.metaValor;
return valor?(' · Meta '+m.periodo+': '+valor):'';
}

const goBtn='<button class="btn-sm btn-go">Prosseguir<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>';

const vBoard=document.getElementById('vBoard');
const myLeadRows=document.getElementById('myLeadRows');
/* Kanban e Lista são construídos exclusivamente com as etapas cadastradas
 * em Configurações > Motor do Funil para o funil selecionado: quantidade,
 * ordem, nome e cor das colunas vêm de lá. Nenhuma etapa é fixa. */
function renderVenda(){
vBoard.innerHTML='';myLeadRows.innerHTML='';
const subEl=document.querySelector('#venda .hl p');
if(subEl)subEl.textContent='Leads atribuídas a você · Renatha Loiola'+metaTexto();
const myLeadCount=document.getElementById('myLeadCount');
myLeadCount.textContent='0';
const RT=window.FunnelRuntime;
if(!RT)return;
const funil=RT.funilSelecionado();
/* Perfil do funil: com "Todos os funis" (vFunilSelIdx = -1) as colunas são
 * a união das etapas de todos os funis (mesmo nome = mesma coluna); com um
 * funil escolhido, apenas as etapas dele. */
const todosFunis=vFunilSelIdx<0;
const STAGES=[];const vistas={};
(todosFunis?RT.funis():[funil]).forEach(f=>RT.etapas(f).forEach(e=>{if(!vistas[e.nome]){vistas[e.nome]=1;STAGES.push(e)}}));
if(!STAGES.length)return;
/* A etapa inicial só é sorteada para leads que ainda não têm etapa.
 * Leads restaurados do armazenamento (engine/storage.js) já trazem
 * o fstage salvo e devem mantê-lo. */
const mine=todosFunis?mineAll.slice():mineAll.filter(l=>RT.funilDaLead(l)===funil);
mine.forEach((l,i)=>{if(l.fstage==null)l.fstage=l.stat[0]==='Novo'?0:1+(i%Math.max(1,STAGES.length-1))});
/* A coluna da Lead é sempre a etapa do funil dela (pelo nome), o que
 * mantém o Kanban correto também com vários funis na mesma tela. */
const nomeEtapa=l=>{const e=RT.etapasDaLead(l)[RT.idxEtapa(l)];return e?e.nome:''};
STAGES.forEach((st,idx)=>{
const items=mine.filter(l=>nomeEtapa(l)===st.nome);
const col=document.createElement('div');
col.className='col';
col.innerHTML='<div class="col-head"><span class="dt" style="background:'+st.cor+'"></span><h4>'+esc(st.nome)+'</h4><span class="n">'+items.length+'</span></div><div class="col-body"></div>';
const body=col.querySelector('.col-body');
items.forEach(l=>{
const k=document.createElement('div');
k.className='kcard';
k.style.borderLeftColor=st.cor;
k.innerHTML='<div class="kt"><div class="av" style="background:linear-gradient(135deg,'+l.grad+')">'+l.ini+'</div><div><b>'+l.name+'</b><small>'+l.phone+'</small></div></div><span class="plan">'+l.camp+'</span><div class="kfoot"><span class="badge '+l.stat[1]+'">'+l.stat[0]+'</span>'+goBtn+'</div>';
k.querySelector('.btn-go').addEventListener('click',()=>openWizard(l));
body.appendChild(k);
});
vBoard.appendChild(col);
});
myLeadCount.textContent=mine.length;
mine.forEach(l=>{
const pl=PLAT[l.plat];const st=STAGES.filter(x=>x.nome===nomeEtapa(l))[0]||STAGES[0];
const tr=document.createElement('tr');
tr.innerHTML='<td><div class="lead-cli"><div class="av" style="background:linear-gradient(135deg,'+l.grad+')">'+l.ini+'</div><div><b>'+l.name+'</b><small>'+l.phone+'</small></div></div></td>'
+'<td>'+l.orig+'</td>'
+'<td><span class="src"><span class="ic '+pl.c+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+pl.s+'</svg></span>'+pl.l+'</span></td>'
+'<td><span class="badge '+l.stat[1]+'">'+l.stat[0]+'</span></td>'
+'<td><span class="stage" style="background:#f1f4f8;color:var(--body-strong)"><span style="width:6px;height:6px;border-radius:50%;background:'+st.cor+';display:inline-block;margin-right:2px"></span>'+esc(st.nome)+'</span></td>'
+'<td>'+l.vend+'</td>'
+'<td>'+goBtn+'</td>';
tr.querySelector('.btn-go').addEventListener('click',()=>openWizard(l));
myLeadRows.appendChild(tr);
});
}
renderVenda();

/* ===== Funil Atual (lista igual a Configurações > Funis > Motor do Funil > Funis) ===== */
let vFunilSelIdx=0;
const vFunilSelect=document.getElementById('vFunilSelect');
function populateVendaFunilSelect(){
if(!vFunilSelect)return;
const funis=(typeof FUNIS!=='undefined')?FUNIS:[];
if(!funis.length)return;
if(vFunilSelIdx>=funis.length)vFunilSelIdx=0;
vFunilSelect.innerHTML='<option value="-1"'+(vFunilSelIdx<0?' selected':'')+'>Todos os funis</option>'+funis.map((f,i)=>'<option value="'+i+'"'+(i===vFunilSelIdx?' selected':'')+'>'+esc(f.nome)+'</option>').join('');
}
populateVendaFunilSelect();
if(vFunilSelect)vFunilSelect.addEventListener('change',()=>{vFunilSelIdx=parseInt(vFunilSelect.value);renderVenda();});
/* Cada funil tem seu próprio Kanban/Lista: ao voltar para a tela, as
 * etapas são relidas do Motor do Funil (podem ter mudado). */
const vNavItem=document.querySelector('.nav-item[data-view="venda"]');
if(vNavItem)vNavItem.addEventListener('click',()=>{populateVendaFunilSelect();renderVenda();});

const vTabKanban=document.getElementById('vTabKanban');
const vTabList=document.getElementById('vTabList');
const vViewKanban=document.getElementById('vViewKanban');
const vViewList=document.getElementById('vViewList');
vTabKanban.addEventListener('click',()=>{vTabKanban.classList.add('on');vTabList.classList.remove('on');vViewKanban.classList.add('on');vViewList.classList.remove('on')});
vTabList.addEventListener('click',()=>{vTabList.classList.add('on');vTabKanban.classList.remove('on');vViewList.classList.add('on');vViewKanban.classList.remove('on')});

