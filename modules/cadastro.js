/* ============================================================
 * Tela: Cadastro
 * Extraído do <script> original (bloco contíguo, ordem de execução
 * preservada). Nenhuma linha de lógica foi reescrita.
 * ============================================================ */
const sameAddr=document.getElementById('sameAddr');
const addr=document.getElementById('addr');
const billAddr=document.getElementById('billAddr');
sameAddr.addEventListener('change',()=>{
if(sameAddr.checked){billAddr.value=addr.value;billAddr.setAttribute('disabled','')}
else{billAddr.removeAttribute('disabled')}
});
addr.addEventListener('input',()=>{if(sameAddr.checked)billAddr.value=addr.value});
