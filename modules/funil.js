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
});
tabList.addEventListener('click',()=>{
tabList.classList.add('on');tabKanban.classList.remove('on');
viewList.classList.add('on');viewKanban.classList.remove('on');
});

/* ============================================================
 * Perfil do funil (mesma função do Fluxo da Venda)
 * ------------------------------------------------------------
 * O seletor lista "Todos os funis" + cada funil cadastrado em
 * Configurações > Motor do Funil. Escolhendo um funil, o Kanban e a
 * Lista passam a exibir somente as etapas configuradas nele; em
 * "Todos os funis" nada é filtrado. Nenhuma coluna ou linha é
 * recriada — apenas exibida ou ocultada — e o seletor reutiliza o
 * componente .select sm já usado nas demais telas.
 * FUNIS só existe depois de engine/funnel-engine.js, que carrega
 * bem depois deste arquivo: por isso a lista é montada no clique do
 * item de menu (única forma de abrir esta tela), como já é feito em
 * modules/venda.js.
 * ============================================================ */
const fFunilSelect=document.getElementById('fFunilSelect');
let fFunilSelIdx=-1;/* -1 = Todos os funis */
function fNorm(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
/* Compara nomes de etapa tolerando variações de cadastro
 * ("Novo" / "Novo Lead", "Concluído" / "Venda Concluída"). */
function fMesmaEtapa(a,b){
const wa=fNorm(a).split(/\s+/),wb=fNorm(b).split(/\s+/);
return wa.some(x=>x.length>3&&wb.some(y=>y.length>3&&x.slice(0,5)===y.slice(0,5)));
}
function fEtapasDoFunil(f){
const nomes=[];
(f&&f.etapas||[]).forEach(e=>{if(e.ativa!=='Não')nomes.push(e.nome);(e.avancarPara||[]).forEach(n=>nomes.push(n))});
return nomes;
}
function aplicarFunilFiltro(){
const funis=(typeof FUNIS!=='undefined')?FUNIS:[];
const f=(fFunilSelIdx>=0)?funis[fFunilSelIdx]:null;
const nomes=f?fEtapasDoFunil(f):null;
const visivel=n=>!nomes||nomes.some(x=>fMesmaEtapa(x,n));
viewKanban.querySelectorAll('.col').forEach(col=>{
const h=col.querySelector('.col-head h4');
col.style.display=(h&&visivel(h.textContent))?'':'none';
});
let n=0;
viewList.querySelectorAll('tbody tr').forEach(tr=>{
const on=visivel(tr.children[1]?tr.children[1].textContent:'');
tr.style.display=on?'':'none';
if(on)n++;
});
const cnt=viewList.querySelector('.card-head .count b');
if(cnt)cnt.textContent=n;
}
function populateFunilSelect(){
if(!fFunilSelect)return;
const funis=(typeof FUNIS!=='undefined')?FUNIS:[];
if(!funis.length)return;
if(fFunilSelIdx>=funis.length)fFunilSelIdx=-1;
fFunilSelect.innerHTML='<option value="-1"'+(fFunilSelIdx<0?' selected':'')+'>Todos os funis</option>'+funis.map((f,i)=>'<option value="'+i+'"'+(i===fFunilSelIdx?' selected':'')+'>'+esc(f.nome)+'</option>').join('');
aplicarFunilFiltro();
}
if(fFunilSelect)fFunilSelect.addEventListener('change',()=>{fFunilSelIdx=parseInt(fFunilSelect.value);aplicarFunilFiltro();});
const fNavItem=document.querySelector('.nav-item[data-view="funil"]');
if(fNavItem)fNavItem.addEventListener('click',populateFunilSelect);
