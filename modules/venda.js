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
/* A etapa inicial só é sorteada para leads que ainda não têm etapa.
 * Leads restaurados do armazenamento (engine/storage.js) já trazem
 * o fstage salvo e devem mantê-lo. */
const iniEtapa=(l,i,total)=>{if(l.fstage==null)l.fstage=l.stat[0]==='Novo'?0:1+(i%Math.max(1,total-1))};
const nomeEtapa=l=>{const e=RT.etapasDaLead(l)[RT.idxEtapa(l)];return e?e.nome:''};
/* Kanban: um único funil por vez (seletor "Perfil do funil"), para o
 * quadro não misturar etapas de funis diferentes. */
const funil=RT.funilSelecionado();
const STAGES=RT.etapas(funil);
const doKanban=mineAll.filter(l=>RT.funilDaLead(l)===funil);
doKanban.forEach((l,i)=>iniEtapa(l,i,STAGES.length));
STAGES.forEach(st=>{
const items=doKanban.filter(l=>nomeEtapa(l)===st.nome);
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
/* Lista: um ou vários funis ao mesmo tempo (marcadores acima da tabela).
 * Cada linha mostra o funil da Lead e a etapa dentro do funil dela. */
const funisLista=funisDaLista();
const daLista=mineAll.filter(l=>funisLista.indexOf(RT.funilDaLead(l))>-1);
daLista.forEach((l,i)=>iniEtapa(l,i,RT.etapasDaLead(l).length));
myLeadCount.textContent=daLista.length;
daLista.forEach(l=>{
const pl=PLAT[l.plat];const fl=RT.funilDaLead(l);const es=RT.etapasDaLead(l);const st=es[RT.idxEtapa(l)];
if(!st)return;
const tr=document.createElement('tr');
tr.innerHTML='<td><div class="lead-cli"><div class="av" style="background:linear-gradient(135deg,'+l.grad+')">'+l.ini+'</div><div><b>'+l.name+'</b><small>'+l.phone+'</small></div></div></td>'
+'<td><span class="chip-soft">'+esc(fl?fl.nome:'—')+'</span></td>'
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

/* ===== Perfil do funil (lista igual a Configurações > Funis > Motor do Funil > Funis) =====
 * Kanban usa o seletor (um funil por vez); a Lista usa os marcadores
 * abaixo do título do card (um ou vários funis ao mesmo tempo). */
let vFunilSelIdx=0;
let vFunilLista=null;/* null = todos os funis marcados na Lista */
const vFunilSelect=document.getElementById('vFunilSelect');
const vFunilWrap=document.getElementById('vFunilWrap');
const vFunilChecks=document.getElementById('vFunilChecks');
function funisDaLista(){
const funis=(typeof FUNIS!=='undefined')?FUNIS:[];
return vFunilLista===null?funis.slice():funis.filter((f,i)=>vFunilLista.indexOf(i)>-1);
}
function populateVendaFunilChecks(){
if(!vFunilChecks)return;
const funis=(typeof FUNIS!=='undefined')?FUNIS:[];
if(!funis.length)return;
vFunilChecks.innerHTML=funis.map((f,i)=>'<label class="cfg-check-item'+((vFunilLista===null||vFunilLista.indexOf(i)>-1)?' on':'')+'" data-vfunil="'+i+'"><span class="cbox"></span>'+esc(f.nome)+'</label>').join('');
}
function populateVendaFunilSelect(){
if(!vFunilSelect)return;
const funis=(typeof FUNIS!=='undefined')?FUNIS:[];
if(!funis.length)return;
if(vFunilSelIdx<0||vFunilSelIdx>=funis.length)vFunilSelIdx=0;
vFunilSelect.innerHTML=funis.map((f,i)=>'<option value="'+i+'"'+(i===vFunilSelIdx?' selected':'')+'>'+esc(f.nome)+'</option>').join('');
populateVendaFunilChecks();
}
/* Ao menos um funil permanece marcado na Lista. */
if(vFunilChecks)vFunilChecks.addEventListener('click',ev=>{
const el=ev.target.closest('[data-vfunil]');if(!el)return;
const funis=(typeof FUNIS!=='undefined')?FUNIS:[];
const i=parseInt(el.dataset.vfunil);
if(vFunilLista===null)vFunilLista=funis.map((f,k)=>k);
const p=vFunilLista.indexOf(i);
if(p>-1){if(vFunilLista.length<2)return;vFunilLista.splice(p,1)}else vFunilLista.push(i);
populateVendaFunilChecks();renderVenda();
});
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
/* O seletor de funil único pertence ao Kanban: na Lista quem manda são
 * os marcadores, então ele sai da barra para a tela seguir limpa. */
function vSyncFiltro(kanban){if(vFunilWrap)vFunilWrap.style.display=kanban?'':'none'}
vTabKanban.addEventListener('click',()=>{vTabKanban.classList.add('on');vTabList.classList.remove('on');vViewKanban.classList.add('on');vViewList.classList.remove('on');vSyncFiltro(true)});
vTabList.addEventListener('click',()=>{vTabList.classList.add('on');vTabKanban.classList.remove('on');vViewList.classList.add('on');vViewKanban.classList.remove('on');vSyncFiltro(false)});

