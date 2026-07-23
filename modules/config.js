/* ============================================================
 * Tela: Configurações (alternância de abas)
 * Extraído do <script> original (bloco contíguo, ordem de execução
 * preservada). Nenhuma linha de lógica foi reescrita.
 * ============================================================ */
document.querySelectorAll('.cfg-tab').forEach(tab=>{
tab.addEventListener('click',()=>{
const t=tab.dataset.cfg;
document.querySelectorAll('.cfg-tab').forEach(x=>x.classList.remove('on'));
document.querySelectorAll('.cfg-panel').forEach(p=>p.classList.remove('on'));
tab.classList.add('on');
document.getElementById('cfg-'+t).classList.add('on');
});
});
