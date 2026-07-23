/* ============================================================
 * Assistente de Venda (modal wizard) — viabilidade, cadastro, plano,
 * assinatura e conclusão. Compartilhado entre Leads, Funil e Venda.
 * Extraído do <script> original (bloco contíguo, ordem de execução
 * preservada). Nenhuma linha de lógica foi reescrita.
 * ============================================================ */
const wzOverlay=document.getElementById('wzOverlay');
const wzAv=document.getElementById('wzAv');
const wzName=document.getElementById('wzName');
const wzPhone=document.getElementById('wzPhone');
const wzBack=document.getElementById('wzBack');
const wzNext=document.getElementById('wzNext');
const viabResult=document.getElementById('viabResult');
const viabBox=document.getElementById('viabBox');
const viabEnd=document.getElementById('viabEnd');
let step=1,step1ok=false,curLead=null,coberturaStatus=null,assinado=false,contratoEnviado=false;

document.querySelectorAll('.radio-group').forEach(group=>{
group.querySelectorAll('.radio-opt').forEach(opt=>{
opt.addEventListener('click',()=>{
group.querySelectorAll('.radio-opt').forEach(o=>o.classList.remove('sel'));
opt.classList.add('sel');
if(group.dataset.radio==='categoria')fillPlanos(opt.dataset.val);
if(group.dataset.radio==='contrato'||group.dataset.radio==='envio')updateSidebar();
});
});
});
const PLANOS={
fibra:['Fibra 300 Mega — R$ 79,90','Fibra 500 Mega — R$ 99,90','Fibra 1 Giga — R$ 249,90'],
wireless:['Wireless 100 Mega — R$ 69,90','Wireless 200 Mega — R$ 89,90','Wireless 300 Mega — R$ 119,90'],
streaming:['Radar Play — R$ 19,90','Combo Play+ — R$ 29,90'],
gamer:['Radar Games — R$ 29,90','Combo Games+ — R$ 39,90']
};
const planoSelect=document.getElementById('planoSelect');
function fillPlanos(cat){
planoSelect.innerHTML=(PLANOS[cat]||[]).map(p=>'<option>'+p+'</option>').join('');
updateSidebar();
}
fillPlanos('fibra');
planoSelect.addEventListener('change',updateSidebar);

/* ===== Etapa 1 — Consultar Cobertura ===== */
function computeCoverage(raw){
const digits=(raw.match(/\d/g)||[]).map(Number);
if(!digits.length)return 'ok';
const sum=digits.reduce((a,b)=>a+b,0);
const r=sum%3;
return r===0?'ok':r===1?'amp':'sem';
}
document.getElementById('btnViab').addEventListener('click',()=>{
const cep=document.getElementById('viabCep').value.trim();
const num=document.getElementById('viabNum').value.trim();
coberturaStatus=computeCoverage(cep+num);
viabResult.style.display='block';
renderViab();
});
function renderViab(){
const sel=coberturaStatus;
let cls,desc,ok=false,icon;
if(sel==='ok'){cls='res-ok';desc=' Cobertura disponível. Você pode prosseguir com a venda.';ok=true;icon='<polyline points="20 6 9 17 4 12"/>';}
else if(sel==='amp'){cls='res-warn';desc=' Ampliação de rede necessária para atender este endereço.';ok=true;icon='<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>';}
else{cls='res-no';desc=' Sem cobertura disponível neste endereço.';icon='<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>';}
viabBox.innerHTML='<div class="result-box '+cls+'"><span class="ri"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">'+icon+'</svg></span><div><b>'+desc+'</b></div></div>'+(sel==='ok'?renderCoberturaExtra():'');
viabEnd.style.display=sel==='ok'?'none':'flex';
document.getElementById('btnAgendar').style.display=sel==='amp'?'inline-flex':'none';
step1ok=ok;
if(step===1){wzNext.disabled=!ok;}
updateSidebar();
}
function renderCoberturaExtra(){
const digits=((document.getElementById('viabCep').value||'')+(document.getElementById('viabNum').value||'')).match(/\d/g)||['5'];
const seed=digits.map(Number).reduce((a,b)=>a+b,0);
const tec=seed%2===0?'Fibra':'Wireless';
const ctos=[17,33,58].map((base,i)=>({nome:'CTO '+String(((seed*7+i*23)%90)+10).padStart(3,'0'),dist:base+(seed%10)}));
const ctosHtml=tec==='Fibra'?('<ul style="margin:8px 0 0 18px;padding:0">'+ctos.map(c=>'<li>'+c.nome+' — '+c.dist+' metros</li>').join('')+'</ul>'):'';
return '<div style="margin-top:10px;font-size:12.5px;color:var(--body)"><b style="color:var(--body-strong)">Tecnologia:</b> '+tec+ctosHtml+'</div>';
}
document.getElementById('btnEncerrar').addEventListener('click',closeWizard);
document.getElementById('btnAgendar').addEventListener('click',closeWizard);

/* ===== Etapa 2 — Dados do Cliente ===== */
const btnMaisInfo=document.getElementById('btnMaisInfo');
const maisInfoBlock=document.getElementById('maisInfoBlock');
const maisInfoIco=document.getElementById('maisInfoIco');
const btnEndereco=document.getElementById('btnEndereco');
const enderecoBlock=document.getElementById('enderecoBlock');
btnEndereco.addEventListener('click',()=>{
const open=enderecoBlock.style.display!=='none';
enderecoBlock.style.display=open?'none':'grid';
btnEndereco.lastChild.textContent=open?'Endereço':'Ocultar Endereço';
});
document.querySelectorAll('[data-radio="tipoCadastro"] .radio-opt').forEach(opt=>{
opt.addEventListener('click',()=>{
const cpf=opt.dataset.val==='cpf';
document.getElementById('cadCpfLabel').textContent=cpf?'CPF':'CNPJ';
document.getElementById('cadCpf').placeholder=cpf?'000.000.000-00':'00.000.000/0000-00';
document.getElementById('lblNomeSocial').textContent=cpf?'Nome Social':'Nome Fantasia';
document.getElementById('lblNasc').textContent=cpf?'Data de nascimento':'Data de fundação';
document.getElementById('lblPai').textContent=cpf?'Pai':'Inscrição municipal';
document.getElementById('lblMae').textContent=cpf?'Mãe':'Inscrição estadual';
});
});
btnMaisInfo.addEventListener('click',()=>{
const open=maisInfoBlock.style.display!=='none';
maisInfoBlock.style.display=open?'none':'grid';
btnMaisInfo.lastChild.textContent=open?'Mais Informações':'Ocultar Informações';
maisInfoIco.style.transform=open?'rotate(0deg)':'rotate(180deg)';
});
['cadNome','cadTel1','cadEmail'].forEach(id=>document.getElementById(id).addEventListener('input',updateSidebar));
document.getElementById('cadTel1').addEventListener('input',e=>{wzPhone.textContent=e.target.value||'--';});
['cadCep','cadUf','cadCidade','cadBairro','cadLogradouro','cadNumero','cadComplemento','cadReferencia'].forEach(id=>document.getElementById(id).addEventListener('input',updateSidebar));

/* ===== Etapa 3 — Plano e Contrato ===== */
function canalLabel(v){return v==='email'?'E-mail':v==='link'?'Link':'WhatsApp'}
const envioMsg=document.getElementById('envioMsg');
document.getElementById('btnEnviarContrato').addEventListener('click',()=>{
contratoEnviado=true;
envioMsg.style.display='flex';
const envioSel=document.querySelector('[data-radio="envio"] .radio-opt.sel').dataset.val;
document.getElementById('assinTitle').textContent='Aguardando assinatura';
document.getElementById('assinUltimo').textContent='Enviado agora por '+canalLabel(envioSel);
if(step===3)wzNext.disabled=false;
updateSidebar();
});

/* ===== Etapa 4 — Assinatura ===== */
const assinBox=document.getElementById('assinBox');
const assinIco=document.getElementById('assinIco');
function renderAssinatura(){
if(assinado){
assinBox.style.background='rgba(34,197,94,.08)';
assinIco.style.background='var(--signal)';assinIco.style.color='#fff';
assinIco.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
document.getElementById('assinTitle').textContent='Contrato assinado';
const now=new Date();
const dd=String(now.getDate()).padStart(2,'0'),mm=String(now.getMonth()+1).padStart(2,'0'),hh=String(now.getHours()).padStart(2,'0'),mi=String(now.getMinutes()).padStart(2,'0');
const envioSelA=document.querySelector('[data-radio="envio"] .radio-opt.sel');
const canal=envioSelA?canalLabel(envioSelA.dataset.val):'WhatsApp';
document.getElementById('assinUltimo').textContent='Assinado em '+dd+'/'+mm+'/'+now.getFullYear()+' · '+hh+':'+mi+' · via '+canal;
if(step===4)wzNext.disabled=false;
}else{
assinBox.style.background='#f1f4f8';
assinIco.style.background='#e2e7ee';assinIco.style.color='#68758a';
assinIco.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
document.getElementById('assinTitle').textContent='Aguardando assinatura';
if(step===4)wzNext.disabled=true;
}
updateSidebar();
}
assinBox.classList.add('clickable');
assinBox.style.cursor='pointer';
assinBox.addEventListener('click',()=>{assinado=!assinado;renderAssinatura();});
document.getElementById('btnReenviar').addEventListener('click',()=>{
const envioSel=document.querySelector('[data-radio="envio"] .radio-opt.sel').dataset.val;
document.getElementById('assinUltimo').textContent='Reenviado agora por '+canalLabel(envioSel);
});

/* ===== Etapa 5 — Concluir Venda ===== */
function selText(g){const e=document.querySelector('[data-radio="'+g+'"] .radio-opt.sel');return e?e.textContent.trim():'—';}
function enderecoTexto(){
if(!curLead)return '—';
const rua=document.getElementById('cadLogradouro').value||curLead.rua||'—';
const num=document.getElementById('cadNumero').value||document.getElementById('viabNum').value||curLead.num||'—';
const compl=document.getElementById('cadComplemento').value||document.getElementById('viabCompl').value;
const bairro=document.getElementById('cadBairro').value||curLead.bairro||'—';
const cidade=document.getElementById('cadCidade').value||curLead.cidade||'—';
const uf=document.getElementById('cadUf').value||curLead.uf||'—';
const ref=document.getElementById('cadReferencia').value;
return rua+', '+num+(compl?' ('+compl+')':'')+' — '+bairro+', '+cidade+'/'+uf+(ref?' (Ref: '+ref+')':'');
}
function coberturaTexto(){
return coberturaStatus==='ok'?'Cobertura disponível':coberturaStatus==='amp'?'Ampliação de rede':coberturaStatus==='sem'?'Sem cobertura':'—';
}
function buildResumo(){
const ck='<span class="ck"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>';
const items=[
['Cliente',document.getElementById('cadNome').value||'—'],
['Endereço',enderecoTexto()],
['Plano',planoSelect.value||'—'],
['Contrato',selText('contrato')],
['Status da assinatura',assinado?'Assinado':'Aguardando assinatura']
];
document.getElementById('resumoList').innerHTML=items.map(it=>'<li class="resumo-item">'+ck+'<span class="lbl">'+it[0]+'</span><b>'+it[1]+'</b></li>').join('');
document.querySelectorAll('#checklistList .check-item').forEach(li=>li.classList.remove('done'));
}
document.getElementById('wzLoss').addEventListener('click',()=>{
if(curLead){curLead.stat=['Perdido','b-lost'];renderVenda();}
closeWizard();
});
document.getElementById('wzSave').addEventListener('click',()=>{
if(curLead)curLead.fstage=step;
closeWizard();
});
function runChecklist(cb){
const items=[...document.querySelectorAll('#checklistList .check-item')];
let i=0;
(function next(){
if(i>=items.length){cb();return;}
items[i].classList.add('done');
i++;
setTimeout(next,320);
})();
}

/* ===== Navegação do wizard ===== */
function showStep(n){
step=n;
document.querySelectorAll('.wstep').forEach(s=>s.classList.toggle('on',parseInt(s.dataset.step)===n));
for(let i=1;i<=5;i++){
const fs=document.getElementById('wzs'+i);
fs.classList.remove('active','done');
if(i<n)fs.classList.add('done');else if(i===n)fs.classList.add('active');
if(i<5)document.getElementById('wzl'+i).classList.toggle('on',i<n);
}
wzBack.style.visibility=n===1?'hidden':'visible';
document.getElementById('wzLoss').style.visibility=n===5?'hidden':'visible';
if(n===5){wzNext.textContent='Concluir Venda';wzNext.disabled=false;}
else if(n===1){wzNext.textContent='Continuar';wzNext.disabled=!step1ok;}
else if(n===3){wzNext.textContent='Continuar';wzNext.disabled=!contratoEnviado;}
else if(n===4){wzNext.textContent='Continuar';wzNext.disabled=!assinado;}
else{wzNext.textContent='Continuar';wzNext.disabled=false;}
document.querySelector('.wz-body').scrollTop=0;
if(n===5)buildResumo();
updateSidebar();
}
wzNext.addEventListener('click',()=>{
if(step===5){
wzNext.disabled=true;
runChecklist(()=>{
if(curLead){curLead.fstage=5;curLead.stat=['Convertido','b-won'];renderVenda();}
closeWizard();
});
return;
}
if(step===1&&!step1ok)return;
if(step===3&&!contratoEnviado)return;
if(step===4&&!assinado)return;
if(curLead)curLead.fstage=step;
showStep(step+1);
});
wzBack.addEventListener('click',()=>{if(step>1)showStep(step-1)});

/* ===== Sidebar fixa — Resumo da Venda ===== */
function updateSidebar(){
if(!curLead)return;
document.getElementById('sumCliente').textContent=document.getElementById('cadNome').value||curLead.name||'—';
document.getElementById('sumEndereco').textContent=enderecoTexto();
const covEl=document.getElementById('sumCobertura');
if(coberturaStatus){
const map={ok:['ok','Disponível'],amp:['amp','Ampliação'],sem:['sem','Sem cobertura']};
covEl.innerHTML='<span class="cov-badge '+map[coberturaStatus][0]+'"><span class="dot"></span>'+map[coberturaStatus][1]+'</span>';
}else{covEl.textContent='—';}
document.getElementById('sumPlano').textContent=planoSelect.value||'—';
document.getElementById('sumContrato').textContent=selText('contrato');
document.getElementById('sumAssinatura').textContent=assinado?'Assinado':(contratoEnviado?'Aguardando assinatura':'—');
document.getElementById('sumVendedor').textContent=curLead.vend||'—';
const pa=document.getElementById('wzProxAcaoTxt');
if(pa)pa.textContent=proxAcaoWizardTexto();
}
function proxAcaoWizardTexto(){
if(step===1)return coberturaStatus?'📞 Ligar para o cliente às 18:00':'📍 Consultar cobertura no endereço do cliente';
if(step===2)return '📞 Ligar para o cliente às 18:00';
if(step===3)return contratoEnviado?'⌛ Aguardar assinatura do contrato':'📄 Enviar contrato';
if(step===4)return assinado?'📅 Agendar instalação':'⌛ Aguardar assinatura do contrato';
if(step===5)return 'Nenhuma ação pendente.';
return 'Nenhuma ação pendente.';
}

function initials(n){const p=n.trim().split(/\s+/).filter(Boolean);return((p[0]?p[0][0]:'')+(p[1]?p[1][0]:'')).toUpperCase()||'--'}
function fillCadastro(l){
document.getElementById('cadNome').value=l.name;
document.getElementById('cadCpf').value=l.cpf;
document.getElementById('cadTel1').value=l.phone;
document.getElementById('cadEmail').value=l.email;
document.getElementById('cadNomeSocial').value='';
document.getElementById('cadNasc').value=l.nasc;
document.getElementById('cadTel2').value=l.tel2;
document.getElementById('cadTel3').value=l.tel3;
document.getElementById('cadPai').value=l.pai;
document.getElementById('cadMae').value=l.mae;
}
function clearCadastro(){
['cadNome','cadNomeSocial','cadNasc','cadCpf','cadPai','cadMae','cadTel1','cadTel2','cadTel3','cadEmail','cadCep','cadUf','cadCidade','cadBairro','cadLogradouro','cadNumero','cadComplemento','cadReferencia'].forEach(id=>document.getElementById(id).value='');
}
function openWizard(l){
curLead=l;
wzAv.textContent=l.ini;wzAv.style.background='linear-gradient(135deg,'+l.grad+')';
wzName.textContent=l.name;wzPhone.textContent=l.phone;
document.getElementById('viabCep').value=l.cep;
document.getElementById('viabNum').value=l.num;
document.getElementById('viabCompl').value='';
document.getElementById('consultaMsg').className='consulta-msg';
document.getElementById('btnAbrirCadastro').style.display='none';
fillCadastro(l);
maisInfoBlock.style.display='none';
btnMaisInfo.lastChild.textContent='Mais Informações';
enderecoBlock.style.display='none';
btnEndereco.lastChild.textContent='Endereço';
document.querySelector('[data-radio="envio"] .radio-opt[data-val="whatsapp"]').click();
viabResult.style.display='none';step1ok=false;coberturaStatus=null;
assinado=false;contratoEnviado=false;
envioMsg.style.display='none';
document.getElementById('assinUltimo').textContent='Nenhum envio realizado ainda';
showStep(1);
renderAssinatura();
wzOverlay.classList.add('open');
}
function closeWizard(){wzOverlay.classList.remove('open')}
document.getElementById('wzClose').addEventListener('click',closeWizard);
wzOverlay.addEventListener('click',e=>{if(e.target===wzOverlay)closeWizard()});

const consultaMsg=document.getElementById('consultaMsg');
const btnAbrirCadastro=document.getElementById('btnAbrirCadastro');
document.getElementById('btnConsultaCpf').addEventListener('click',()=>{
const v=document.getElementById('cadCpf').value.trim();
if(v&&curLead&&v===curLead.cpf){
consultaMsg.textContent='⚠ Cliente já cadastrado.';
consultaMsg.className='consulta-msg no';
btnAbrirCadastro.style.display='inline-flex';
}else if(v){
consultaMsg.textContent='✔ Cliente novo.';
consultaMsg.className='consulta-msg ok';
btnAbrirCadastro.style.display='none';
}else{
consultaMsg.className='consulta-msg';
btnAbrirCadastro.style.display='none';
}
updateSidebar();
});
btnAbrirCadastro.addEventListener('click',()=>{
if(curLead)fillCadastro(curLead);
consultaMsg.textContent='Cadastro existente aberto.';
consultaMsg.className='consulta-msg ok';
});
document.getElementById('cadNome').addEventListener('input',e=>{
const v=e.target.value;
if(curLead){
curLead.name=v;
curLead.ini=initials(v);
wzName.textContent=v||'Lead';
wzAv.textContent=curLead.ini;
renderVenda();
}
});

