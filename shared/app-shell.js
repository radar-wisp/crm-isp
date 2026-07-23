/* ============================================================
 * App Shell — recolher/expandir menu lateral e navegação entre telas
 * Extraído do <script> original (bloco contíguo, ordem de execução
 * preservada). Nenhuma linha de lógica foi reescrita.
 * ============================================================ */
const app=document.getElementById('app');
const toggle=document.getElementById('toggle');
const scrim=document.getElementById('scrim');
toggle.addEventListener('click',()=>{
if(window.innerWidth<=820){app.classList.toggle('mobile-open')}
else{app.classList.toggle('collapsed')}
});
scrim.addEventListener('click',()=>app.classList.remove('mobile-open'));

const navItems=document.querySelectorAll('.nav-item[data-view]');
const views=document.querySelectorAll('.view');
navItems.forEach(item=>{
item.addEventListener('click',()=>{
const id=item.dataset.view;
document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
item.classList.add('active');
views.forEach(v=>v.classList.toggle('active',v.id===id));
document.querySelector('.page-title h1').textContent=item.dataset.title;
document.querySelector('.page-title p').textContent=item.dataset.sub;
document.querySelector('.content').scrollTop=0;
app.classList.remove('mobile-open');
});
});
