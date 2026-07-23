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
