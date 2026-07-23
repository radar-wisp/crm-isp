/* ============================================================
 * Utilitários compartilhados (escape de HTML) — extraído antecipadamente
 * apenas para que outros módulos que o utilizam na carga inicial da
 * página o encontrem já definido (equivalente ao hoisting que existia
 * dentro do <script> único original). Nenhum comportamento mudou.
 * Extraído do <script> original (bloco contíguo, ordem de execução
 * preservada). Nenhuma linha de lógica foi reescrita.
 * ============================================================ */
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function escA(s){return esc(s).replace(/"/g,'&quot;')}
