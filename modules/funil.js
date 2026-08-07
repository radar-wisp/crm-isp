/* ============================================================
 * Tela: Funil Comercial (alternância Kanban/Lista)
 * Extraído do <script> original (bloco contíguo, ordem de execução
 * preservada). Nenhuma linha de lógica foi reescrita.
 * ============================================================ */
const tabKanban=document.getElementById('tabKanban');
const tabList=document.getElementById('tabList');
const viewKanban=document.getElementById('viewKanban');
const viewList=document.getElementById('viewList');
tabKanban.addEventListener('click',()=>{
tabKanban.classList.add('on');tabList.classList.remove('on');
viewKanban.classList.add('on');viewList.classList.remove('on');
fSyncFiltro(true);
});
tabList.addEventListener('click',()=>{
tabList.classList.add('on');tabKanban.classList.remove('on');
viewList.classList.add('on');viewKanban.classList.remove('on');
fSyncFiltro(false);
});

/* ============================================================
 * Perfil do funil (mesma função do Fluxo da Venda)
 * ------------------------------------------------------------
 * Kanban: um único funil por vez, escolhido no seletor .select sm da
 * barra de ações — o quadro exibe apenas as etapas desse funil.
 * Lista: um ou vários funis ao mesmo tempo, pelos marcadores acima da
 * tabela (componente .cfg-checks já usado em Configurações).
 * Nenhuma coluna ou linha é recriada: apenas exibida ou ocultada.
 * FUNIS só existe depois de engine/funnel-engine.js, que carrega bem
 * depois deste arquivo: por isso as listas são montadas no clique do
 * item de menu (única forma de abrir esta tela), como em venda.js.
 * ============================================================ */
const fFunilSelect=document.getElementById('fFunilSelect');
const fFunilWrap=document.getElementById('fFunilWrap');
const fFunilChecks=document.getElementById('fFunilChecks');
let fFunilSelIdx=0;/* funil do Kanban */
let fFunilLista=null;/* null = todos os funis marcados na Lista */
function fFunis(){return (typeof FUNIS!=='undefined')?FUNIS:[]}
function fNorm(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
/* Compara nomes de etapa tolerando variações de cadastro
 * ("Novo" / "Novo Lead", "Concluído" / "Venda Concluída"). */
function fMesmaEtapa(a,b){
const wa=fNorm(a).split(/\s+/),wb=fNorm(b).split(/\s+/);
return wa.some(x=>x.length>3&&wb.some(y=>y.length>3&&x.slice(0,5)===y.slice(0,5)));
}
function fEtapasDoFunil(f){
const nomes=[];
((f&&f.etapas)||[]).forEach(e=>{if(e.ativa!=='Não')nomes.push(e.nome);(e.avancarPara||[]).forEach(n=>nomes.push(n))});
return nomes;
}
function fSyncFiltro(kanban){if(fFunilWrap)fFunilWrap.style.display=kanban?'':'none'}
function aplicarFunilFiltro(){
const funis=fFunis();
if(!funis.length)return;
/* Kanban — só o funil selecionado. */
const nomesK=fEtapasDoFunil(funis[fFunilSelIdx]);
viewKanban.querySelectorAll('.col').forEach(col=>{
const h=col.querySelector('.col-head h4');
col.style.display=(h&&nomesK.some(x=>fMesmaEtapa(x,h.textContent)))?'':'none';
});
/* Lista — união das etapas dos funis marcados. */
const nomesL=[];
funis.forEach((f,i)=>{if(fFunilLista===null||fFunilLista.indexOf(i)>-1)fEtapasDoFunil(f).forEach(n=>nomesL.push(n))});
let n=0;
viewList.querySelectorAll('tbody tr').forEach(tr=>{
const et=tr.children[1]?tr.children[1].textContent:'';
const on=nomesL.some(x=>fMesmaEtapa(x,et));
tr.style.display=on?'':'none';
if(on)n++;
});
const cnt=viewList.querySelector('.card-head .count b');
if(cnt)cnt.textContent=n;
}
function populateFunilChecks(){
if(!fFunilChecks)return;
const funis=fFunis();
if(!funis.length)return;
fFunilChecks.innerHTML=funis.map((f,i)=>'<label class="cfg-check-item'+((fFunilLista===null||fFunilLista.indexOf(i)>-1)?' on':'')+'" data-ffunil="'+i+'"><span class="cbox"></span>'+esc(f.nome)+'</label>').join('');
}
function populateFunilSelect(){
if(!fFunilSelect)return;
const funis=fFunis();
if(!funis.length)return;
if(fFunilSelIdx<0||fFunilSelIdx>=funis.length)fFunilSelIdx=0;
fFunilSelect.innerHTML=funis.map((f,i)=>'<option value="'+i+'"'+(i===fFunilSelIdx?' selected':'')+'>'+esc(f.nome)+'</option>').join('');
populateFunilChecks();
aplicarFunilFiltro();
}
if(fFunilSelect)fFunilSelect.addEventListener('change',()=>{fFunilSelIdx=parseInt(fFunilSelect.value);aplicarFunilFiltro();});
/* Ao menos um funil permanece marcado na Lista. */
if(fFunilChecks)fFunilChecks.addEventListener('click',ev=>{
const el=ev.target.closest('[data-ffunil]');if(!el)return;
const i=parseInt(el.dataset.ffunil);
if(fFunilLista===null)fFunilLista=fFunis().map((f,k)=>k);
const p=fFunilLista.indexOf(i);
if(p>-1){if(fFunilLista.length<2)return;fFunilLista.splice(p,1)}else fFunilLista.push(i);
populateFunilChecks();aplicarFunilFiltro();
});
const fNavItem=document.querySelector('.nav-item[data-view="funil"]');
if(fNavItem)fNavItem.addEventListener('click',populateFunilSelect);
