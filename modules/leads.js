/* ============================================================
 * Tela: Leads
 * Extraído do <script> original (bloco contíguo, ordem de execução
 * preservada). Nenhuma linha de lógica foi reescrita.
 * ============================================================ */
const leadRows=document.getElementById('leadRows');
const perPage=document.getElementById('perPage');
const leadCount=document.getElementById('leadCount');
const pagerInfo=document.getElementById('pagerInfo');
const pgNums=document.getElementById('pgNums');
const pgPrev=document.getElementById('pgPrev');
const pgNext=document.getElementById('pgNext');
let curPage=1;
const dot3=idx=>'<button class="row-act" data-lead="'+idx+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/><circle cx="5" cy="12" r="1.6"/></svg></button>';

function renderLeads(){
const per=parseInt(perPage.value);
const total=LEADS.length;
const pages=Math.ceil(total/per);
if(curPage>pages)curPage=pages;
const start=(curPage-1)*per;
const slice=LEADS.slice(start,start+per);
leadRows.innerHTML=slice.map((l,i)=>{
const pl=PLAT[l.plat];
return '<tr><td><div class="lead-cli"><div class="av" style="background:linear-gradient(135deg,'+l.grad+')">'+l.ini+'</div><div><b>'+l.name+'</b><small>'+l.phone+'</small></div></div></td>'
+'<td>'+l.orig+'</td>'
+'<td><span class="src"><span class="ic '+pl.c+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+pl.s+'</svg></span>'+pl.l+'</span></td>'
+'<td><span class="chip-soft">'+l.camp+'</span></td>'
+'<td><span class="badge '+l.stat[1]+'">'+l.stat[0]+'</span></td>'
+'<td>'+l.vend+'</td>'
+'<td>'+l.data+'</td>'
+'<td>'+dot3(start+i)+'</td></tr>';
}).join('');
leadCount.textContent=total;
pagerInfo.innerHTML='Mostrando <b>'+(start+1)+'</b>–<b>'+(start+slice.length)+'</b> de <b>'+total+'</b>';
pgPrev.disabled=curPage===1;
pgNext.disabled=curPage===pages;
let nums='';
for(let p=1;p<=pages;p++){
if(p===1||p===pages||Math.abs(p-curPage)<=1){
nums+='<button class="pg-btn'+(p===curPage?' on':'')+'" data-pg="'+p+'">'+p+'</button>';
}else if(Math.abs(p-curPage)===2){nums+='<span class="pg-dots">…</span>';}
}
pgNums.innerHTML=nums;
pgNums.querySelectorAll('[data-pg]').forEach(b=>b.addEventListener('click',()=>{curPage=parseInt(b.dataset.pg);renderLeads()}));
leadRows.querySelectorAll('[data-lead]').forEach(b=>b.addEventListener('click',()=>openLeadDetailModal(parseInt(b.dataset.lead))));
}
perPage.addEventListener('change',()=>{curPage=1;renderLeads()});
pgPrev.addEventListener('click',()=>{if(curPage>1){curPage--;renderLeads()}});
pgNext.addEventListener('click',()=>{curPage++;renderLeads()});
renderLeads();

/* Modal Novo Lead */
const leadOverlay=document.getElementById('leadOverlay');
function openLeadModal(){
document.getElementById('ldNome').value='';
document.getElementById('ldTelefone').value='';
document.getElementById('ldEmail').value='';
document.getElementById('ldOrigem').value='Indicação de cliente';
document.getElementById('ldNome').classList.remove('err');
leadOverlay.classList.add('open');
}
function closeLeadModal(){leadOverlay.classList.remove('open')}
document.getElementById('btnNovoLead').addEventListener('click',openLeadModal);
document.getElementById('leadCloseBtn').addEventListener('click',closeLeadModal);
document.getElementById('leadCancel').addEventListener('click',closeLeadModal);
leadOverlay.addEventListener('click',e=>{if(e.target===leadOverlay)closeLeadModal()});
document.getElementById('leadSave').addEventListener('click',()=>{
const nome=document.getElementById('ldNome').value.trim();
if(!nome){document.getElementById('ldNome').classList.add('err');return}
document.getElementById('ldNome').classList.remove('err');
const partes=nome.split(' ').filter(Boolean);
const ini=((partes[0]||'')[0]||'')+((partes[partes.length-1]||'')[0]||'');
const hoje=new Date();
const data=String(hoje.getDate()).padStart(2,'0')+'/'+String(hoje.getMonth()+1).padStart(2,'0')+'/'+hoje.getFullYear();
LEADS.unshift({
name:nome,ini:ini.toUpperCase(),grad:pk(GRAD),
phone:document.getElementById('ldTelefone').value.trim(),
plat:'wa',orig:document.getElementById('ldOrigem').value,
camp:'—',stat:STAT[0],vend:'—',data:data,
email:document.getElementById('ldEmail').value.trim()
});
closeLeadModal();curPage=1;renderLeads();
});

/* Modal Detalhes do Lead */
const leadDetailOverlay=document.getElementById('leadDetailOverlay');
let leadDetailIdx=null;
function colaboradoresAtivos(){
const vends=(typeof CFG!=='undefined'&&CFG.vend)?CFG.vend.data:[];
return vends.filter(v=>v.status==='Ativo').map(v=>v.nome);
}
function openLeadDetailModal(idx){
leadDetailIdx=idx;
const l=LEADS[idx];
const pl=PLAT[l.plat];
const campos=[['Nome',esc(l.name)],['Telefone',esc(l.phone||'—')],['E-mail',esc(l.email||'—')],['Origem',esc(l.orig||'—')],['Plataforma',esc(pl?pl.l:'—')],['Campanha',esc(l.camp||'—')],['Status',esc(l.stat?l.stat[0]:'—')],['Data',esc(l.data||'—')],['CPF',esc(l.cpf||'—')],['Data de nascimento',esc(l.nasc||'—')],['Nome do pai',esc(l.pai||'—')],['Nome da mãe',esc(l.mae||'—')],['Telefone 2',esc(l.tel2||'—')],['Telefone 3',esc(l.tel3||'—')],['Endereço',esc(l.end||'—')]];
document.getElementById('leadDetailList').innerHTML=campos.map(c=>'<li class="resumo-item"><span class="lbl">'+c[0]+'</span><b>'+c[1]+'</b></li>').join('');
const nomes=colaboradoresAtivos();
const sel=document.getElementById('ldDetVendedor');
sel.innerHTML=(nomes.length?nomes:[l.vend]).map(n=>'<option value="'+escA(n)+'">'+esc(n)+'</option>').join('');
if(!nomes.includes(l.vend)&&l.vend){sel.insertAdjacentHTML('afterbegin','<option value="'+escA(l.vend)+'">'+esc(l.vend)+'</option>');}
sel.value=l.vend;
leadDetailOverlay.classList.add('open');
}
function closeLeadDetailModal(){leadDetailOverlay.classList.remove('open')}
document.getElementById('leadDetailCloseBtn').addEventListener('click',closeLeadDetailModal);
document.getElementById('leadDetailCancel').addEventListener('click',closeLeadDetailModal);
leadDetailOverlay.addEventListener('click',e=>{if(e.target===leadDetailOverlay)closeLeadDetailModal()});
document.getElementById('leadDetailSave').addEventListener('click',()=>{
if(leadDetailIdx==null)return;
LEADS[leadDetailIdx].vend=document.getElementById('ldDetVendedor').value;
closeLeadDetailModal();renderLeads();
});

