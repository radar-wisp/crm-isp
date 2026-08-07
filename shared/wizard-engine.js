/* ============================================================
 * Assistente de Venda (modal wizard). Compartilhado entre Leads, Funil
 * e Venda. Etapas, campos, validações, ações automáticas e progresso são
 * construídos a partir do Motor do Funil (engine/funnel-runtime.js).
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

/* ============================================================
 * Etapas dinâmicas (Configurações > Motor do Funil)
 * ------------------------------------------------------------
 * O assistente não possui nenhuma etapa fixa. A barra de etapas, a
 * quantidade, a ordem, os nomes, a etapa atual e os campos exibidos
 * são construídos a cada abertura a partir das etapas cadastradas
 * para o funil da Lead.
 *
 * Os componentes de tela originais (viabilidade, cadastro, plano,
 * assinatura, conclusão) não foram reescritos: ficam guardados em um
 * "pool" oculto e são movidos para a etapa que os declarar em
 * "Campos Obrigatórios" — preservando IDs, eventos, CSS e layout.
 * ============================================================ */
const wzBodyEl=document.querySelector('.wz-body');
const wzStepsBar=document.querySelector('.wz-steps');
const wzDyn=document.createElement('div');
const wzPool=document.createElement('div');
wzPool.id='wzPool';wzPool.style.display='none';
const wzFg=id=>()=>document.getElementById(id).closest('.fg');
const wzOb=r=>()=>document.querySelector('[data-radio="'+r+'"]').closest('.opt-block');
const wzRz=id=>()=>document.getElementById(id).closest('.resumo');
/* g = bloco de origem (mantém o CSS de compactação já existente por etapa);
 * l = layout dentro do bloco; c = campos que fazem o componente aparecer. */
const WZ_COMPS=[
{g:1,l:'viab',c:['CEP'],s:[wzFg('viabCep')]},
{g:1,l:'viab',c:['Cidade'],s:[wzFg('viabCidade')]},
{g:1,l:'viab',c:['Bairro'],s:[wzFg('viabBairro')]},
{g:1,l:'viab',c:['Logradouro'],s:[wzFg('viabLogradouro')]},
{g:1,l:'viab',c:['Número'],s:[wzFg('viabNum')]},
{g:1,l:'viab',c:['Complemento'],s:[wzFg('viabCompl')]},
{g:1,l:'viab',c:['Consulta de cobertura'],s:['#btnViab']},
{g:1,l:'block',c:['Consulta de cobertura'],s:['#viabResult']},
{g:2,l:'block',c:['CPF','CNPJ'],s:['[data-radio="tipoCadastro"]']},
{g:2,l:'grid',c:['Nome'],s:[wzFg('cadNome')]},
{g:2,l:'grid',c:['CPF','CNPJ'],s:[wzFg('cadCpf')]},
{g:2,l:'grid',c:['Telefone','Whatsapp'],s:[wzFg('cadTel1')]},
{g:2,l:'grid',c:['E-mail'],s:[wzFg('cadEmail')]},
{g:2,l:'block',c:['CPF','CNPJ'],s:['#consultaMsg','#btnAbrirCadastro']},
{g:2,l:'block',c:['Nome social','Nome fantasia','Data de nascimento','Data de fundação','Telefone secundário','Telefone comercial','Pai','Mãe','Inscrição municipal','Inscrição estadual'],s:['#btnMaisInfo','#maisInfoBlock']},
{g:2,l:'block',c:['Endereço'],s:['#btnEndereco','#enderecoBlock']},
{g:3,l:'block',c:['Plano'],s:['[data-radio="categoria"]','#planoBlock']},
{g:3,l:'block',c:['Contrato'],s:[wzOb('contrato')]},
{g:3,l:'block',c:['Forma de envio'],s:[wzOb('envio'),'#btnEnviarContrato','#envioMsg']},
{g:4,l:'block',c:['Assinatura'],s:['#assinBox',()=>document.getElementById('btnReenviar').closest('.end-actions'),()=>document.querySelector('.wstep[data-step="4"] p')]},
{g:5,l:'block',c:['Conclusão'],s:['.final-head',wzRz('resumoList'),wzRz('checklistList')]}
];
WZ_COMPS.forEach(c=>{c.nos=c.s.map(s=>typeof s==='function'?s():document.querySelector(s)).filter(Boolean);});
WZ_COMPS.forEach(c=>c.nos.forEach(n=>wzPool.appendChild(n)));
wzBodyEl.querySelectorAll('.wstep').forEach(w=>w.remove());
wzBodyEl.appendChild(wzDyn);wzBodyEl.appendChild(wzPool);

let wzTotal=1;
function wzEtapas(){return window.FunnelRuntime?FunnelRuntime.etapasDaLead(curLead):[]}
/* Redesenha a barra de etapas e o corpo do assistente para o funil atual. */
function wzMontarEtapas(){
const etapas=wzEtapas();
wzStepsBar.innerHTML=etapas.map((e,i)=>'<div class="fstep" id="wzs'+(i+1)+'"><span class="bub">'+(i+1)+'</span><div class="fl"><b>'+esc(e.nome)+'</b></div></div>'+(i<etapas.length-1?'<div class="fline" id="wzl'+(i+1)+'"></div>':'')).join('');
WZ_COMPS.forEach(c=>c.nos.forEach(n=>wzPool.appendChild(n)));
wzDyn.innerHTML='';
const usados=[];
etapas.forEach((e,i)=>{
const campos=(e.camposAvanco||[]);
const comps=WZ_COMPS.filter(c=>usados.indexOf(c)===-1&&c.c.some(x=>campos.indexOf(x)>-1));
comps.forEach(c=>usados.push(c));
const box=document.createElement('div');
box.className='wzstep';box.dataset.idx=i+1;
box.insertAdjacentHTML('beforeend','<div class="wz-title">'+esc(e.nome)+'</div>'+(e.descricao?'<div class="wz-sub">'+esc(e.descricao)+'</div>':''));
if(!comps.length)box.insertAdjacentHTML('beforeend','<div class="pa-empty">Nenhum campo configurado para esta etapa.</div>');
let bloco=null,bg=null,wrap=null,wl=null;
comps.forEach(c=>{
if(!bloco||bg!==c.g){bloco=document.createElement('div');bloco.className='wstep on';bloco.dataset.step=c.g;bg=c.g;wrap=null;wl=null;box.appendChild(bloco);}
if(c.l==='viab'||c.l==='grid'){
if(!wrap||wl!==c.l){wrap=document.createElement('div');wrap.className=c.l==='viab'?'viab-tools':'fgrid2';wl=c.l;bloco.appendChild(wrap);}
c.nos.forEach(n=>wrap.appendChild(n));
}else{wrap=null;wl=null;c.nos.forEach(n=>bloco.appendChild(n));}
});
wzDyn.appendChild(box);
});
wzTotal=etapas.length||1;
return wzTotal;
}
/* Regras internas de cada componente (cobertura consultada, contrato
 * enviado, contrato assinado) valem apenas na etapa em que o componente
 * foi configurado — e não em uma posição fixa. */
function wzNaEtapa(el){const b=wzDyn.querySelector('.wzstep[data-idx="'+step+'"]');return !!(b&&el&&b.contains(el))}
function wzEtapaLiberada(){
if(wzNaEtapa(document.getElementById('btnViab'))&&!step1ok)return false;
if(wzNaEtapa(document.getElementById('btnEnviarContrato'))&&!contratoEnviado)return false;
if(wzNaEtapa(document.getElementById('assinBox'))&&!assinado)return false;
return true;
}
function wzAtualizarNext(){wzNext.disabled=(step===wzTotal)?false:!wzEtapaLiberada()}

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
/* Planos exibidos aqui vêm de Configurações > Planos (CFG.plan), filtrados
 * por categoria e por status "Ativo" — mudanças feitas em Configurações
 * refletem automaticamente no Fluxo da Venda. */
const CATEGORIA_CFG={fibra:{tecnologia:'Fibra'},wireless:{tecnologia:'Wireless'},streaming:{tipo:'Streaming'},gamer:{tipo:'Streaming'}};
const planoSelect=document.getElementById('planoSelect');
/* Colaboradores (CFG.vend) + Grupo de planos (CFG.grupo): se o vendedor da
 * lead estiver com "Limitação de planos = Sim" em Configurações, o wizard
 * só oferece planos dos grupos liberados para ele. */
function planosPermitidosVendedor(){
const vends=(typeof CFG!=='undefined'&&CFG.vend)?CFG.vend.data:[];
const v=curLead?vends.find(x=>x.nome===curLead.vend):null;
if(!v||v.limitar!=='Sim')return null;
const grupos=(typeof CFG!=='undefined'&&CFG.grupo)?CFG.grupo.data:[];
const nomes=new Set();
(v.planos||[]).forEach(g=>{const gr=grupos.find(x=>x.grupo===g);if(gr)(gr.planos||[]).forEach(p=>nomes.add(p));});
return nomes;
}
function fillPlanos(cat){
const crit=CATEGORIA_CFG[cat]||{};
const source=(typeof CFG!=='undefined'&&CFG.plan)?CFG.plan.data:[];
let list=source.filter(p=>p.status==='Ativo'&&Object.keys(crit).every(k=>p[k]===crit[k]));
const permitidos=planosPermitidosVendedor();
if(permitidos)list=list.filter(p=>permitidos.has(p.plano));
planoSelect.innerHTML=list.length?list.map(p=>'<option>'+p.plano+' — '+p.valor+'</option>').join(''):'<option value="">Nenhum plano cadastrado</option>';
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
/* Área de vendas (CFG.area): se o endereço informado bater com alguma área
 * cadastrada em Configurações, a cobertura é considerada disponível. Sem
 * correspondência, mantém a simulação padrão (comportamento original). */
function coberturaPorAreaCfg(){
const areas=(typeof CFG!=='undefined'&&CFG.area)?CFG.area.data:[];
const map=(typeof AREA_MAP!=='undefined')?AREA_MAP:{};
const vals={cep:document.getElementById('viabCep').value.trim(),cidade:document.getElementById('viabCidade').value.trim(),bairro:document.getElementById('viabBairro').value.trim(),logradouro:document.getElementById('viabLogradouro').value.trim()};
return areas.some(a=>{
const k=map[a.considerar];
const need=k?(a[k]||'').trim().toLowerCase():'';
const got=k?(vals[k]||'').toLowerCase():'';
return need&&got&&got.indexOf(need)>-1;
});
}
document.getElementById('btnViab').addEventListener('click',()=>{
const cep=document.getElementById('viabCep').value.trim();
const num=document.getElementById('viabNum').value.trim();
coberturaStatus=coberturaPorAreaCfg()?'ok':computeCoverage(cep+num);
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
wzAtualizarNext();
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
wzAtualizarNext();
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
wzAtualizarNext();
}else{
assinBox.style.background='#f1f4f8';
assinIco.style.background='#e2e7ee';assinIco.style.color='#68758a';
assinIco.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
document.getElementById('assinTitle').textContent='Aguardando assinatura';
wzAtualizarNext();
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
function planoAtualNome(){return planoSelect.value?planoSelect.value.split(' — ')[0]:'';}
/* Formas de pagamento (CFG.pagamento): mostra a mensalidade aplicável ao
 * plano selecionado, priorizando formas limitadas a esse plano. */
function formaPagamentoTexto(){
const src=(typeof CFG!=='undefined'&&CFG.pagamento)?CFG.pagamento.data:[];
const plano=planoAtualNome();
const mens=src.filter(p=>p.tipo==='Mensalidade');
const match=mens.find(p=>p.limitar==='Sim'&&(p.selplanos||[]).includes(plano))||mens.find(p=>p.limitar!=='Sim')||mens[0];
return match?(match.descricao+' · '+match.cobranca+(match.parcelas?' · '+match.parcelas:'')):'—';
}
/* Campanhas promocionais (CFG.camp): mostra a campanha ativa hoje que se
 * aplica ao plano selecionado, se houver. */
function campanhaTexto(){
const src=(typeof CFG!=='undefined'&&CFG.camp)?CFG.camp.data:[];
const plano=planoAtualNome();
const hoje=new Date().toISOString().slice(0,10);
const ativa=src.find(c=>c.dtini<=hoje&&c.dtfim>=hoje&&(c.limitar!=='Sim'||(c.selplanos||[]).includes(plano)));
if(!ativa)return 'Nenhuma campanha ativa';
const desc=ativa.tipodesc==='Porcentagem'?ativa.descPct:ativa.descVal;
return ativa.campanha+' ('+desc+(ativa.mensalidades?' · '+ativa.mensalidades+'x':'')+')';
}
function buildResumo(){
const ck='<span class="ck"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>';
const items=[
['Cliente',document.getElementById('cadNome').value||'—'],
['Endereço',enderecoTexto()],
['Plano',planoSelect.value||'—'],
['Forma de pagamento',formaPagamentoTexto()],
['Campanha promocional',campanhaTexto()],
['Contrato',selText('contrato')],
['Status da assinatura',assinado?'Assinado':'Aguardando assinatura']
];
document.getElementById('resumoList').innerHTML=items.map(it=>'<li class="resumo-item">'+ck+'<span class="lbl">'+it[0]+'</span><b>'+it[1]+'</b></li>').join('');
document.querySelectorAll('#checklistList .check-item').forEach(li=>li.classList.remove('done'));
}
document.getElementById('wzLoss').addEventListener('click',()=>{
if(curLead){
const motivos=((typeof CFG!=='undefined'&&CFG.perda)?CFG.perda.data:[]).filter(m=>m.status==='Ativo').map(m=>m.motivo);
let motivo='';
if(motivos.length){
const resp=prompt('Motivo da perda:\n'+motivos.map((m,i)=>(i+1)+'. '+m).join('\n'));
const idx=resp?parseInt(resp):NaN;
motivo=(!isNaN(idx)&&motivos[idx-1])?motivos[idx-1]:(resp||'');
}
curLead.stat=['Perdido','b-lost'];
curLead.motivoPerda=motivo;
renderVenda();
}
closeWizard();
});
document.getElementById('wzSave').addEventListener('click',()=>{
if(curLead)curLead.fstage=step-1;
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
wzDyn.querySelectorAll('.wzstep').forEach(s=>s.classList.toggle('on',parseInt(s.dataset.idx)===n));
for(let i=1;i<=wzTotal;i++){
const fs=document.getElementById('wzs'+i);
if(!fs)continue;
fs.classList.remove('active','done');
if(i<n)fs.classList.add('done');else if(i===n)fs.classList.add('active');
const ln=document.getElementById('wzl'+i);
if(ln)ln.classList.toggle('on',i<n);
}
wzBack.style.visibility=n===1?'hidden':'visible';
document.getElementById('wzLoss').style.visibility=n===wzTotal?'hidden':'visible';
wzNext.textContent=n===wzTotal?'Concluir Venda':'Continuar';
wzAtualizarNext();
document.querySelector('.wz-body').scrollTop=0;
if(n===wzTotal)buildResumo();
/* Ações Automáticas da etapa: executadas sozinhas ao entrar nela. */
if(curLead&&window.FunnelRuntime)FunnelRuntime.executarAcoes(wzCurEtapa(),curLead,'entrada');
updateSidebar();
renderWzProxAcao();
}
wzNext.addEventListener('click',()=>{
if(step===wzTotal){
wzNext.disabled=true;
if(curLead&&window.FunnelRuntime)FunnelRuntime.executarAcoes(wzCurEtapa(),curLead,'conclusao');
runChecklist(()=>{
if(curLead){curLead.fstage=wzTotal-1;curLead.stat=['Convertido','b-won'];renderVenda();}
closeWizard();
});
return;
}
if(!wzEtapaLiberada())return;
if(!wzChecarAvanco())return;
if(curLead&&window.FunnelRuntime)FunnelRuntime.executarAcoes(wzCurEtapa(),curLead,'conclusao');
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
}
/* Ícones em SVG (mesmo padrão de traço usado nos demais ícones do projeto). */
const wzIco=(d,w)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:'+(w||18)+'px;height:'+(w||18)+'px;vertical-align:-3px">'+d+'</svg>';
const WZ_PA_ICO={
'Ligação':wzIco('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>'),
'WhatsApp':wzIco('<path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 8.9 8.9 0 0 1-4-.9L3 20l1-3.4A8.3 8.3 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/>'),
'E-mail':wzIco('<rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22 6 12 13 2 6"/>'),
'Tarefa':wzIco('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>'),
'Visita':wzIco('<path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'),
'Outro':wzIco('<line x1="12" y1="17" x2="12" y2="22"/><path d="M9 2h6l-1 6 3 3v2H7v-2l3-3z"/>')
};

/* ===== Card da Próxima Ação =====
 * Todo o conteúdo vem de Configurações > Motor do Funil > Próximas Ações
 * (etapa.proximasAcoes + Biblioteca PROX_ACOES). Nada é fixo no código:
 * qualquer alteração feita pelo administrador reflete aqui automaticamente.
 * O card é apenas um direcionamento: não exige nenhum check do vendedor e
 * acompanha automaticamente a etapa atual. A barra de progresso usa
 * Etapa Atual / Total de Etapas do funil, sem valores fixos. */
function renderWzProxAcao(){
const card=document.getElementById('wzProxAcaoCard');
if(!card)return;
const RT=window.FunnelRuntime;
const e=wzCurEtapa();
const pa=RT?RT.proximaAcao(e):null;
const pct=Math.round(step/wzTotal*100);
const modelo=pa?RT.modeloProxAcao(pa.acao):null;
let body='<div class="card-head"><h3>'+wzIco('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',16)+' '+esc(pa?pa.acao:'Próxima ação')+'</h3></div>';
if(!pa){
body+='<div class="pa-empty">Nenhuma próxima ação configurada para esta etapa.</div>';
}else{
const tipo=modelo?modelo.tipo:'Outro';
const prazo=pa.prazo||(modelo?modelo.prazo:'')||'—';
const prio=modelo?modelo.prioridade:'—';
body+='<div class="pa-item"><div class="pa-ico">'+(WZ_PA_ICO[tipo]||WZ_PA_ICO['Outro'])+'</div><div>'+
'<div class="pa-title">'+esc(modelo&&modelo.descricao?modelo.descricao:'—')+'</div>'+
'<div class="pa-when">Prazo: '+esc(prazo)+' · Prioridade: '+esc(prio)+'</div>'+
'</div></div>';
}
body+='<div class="chk-prog" style="flex:1 1 170px"><div class="bar"><i style="width:'+pct+'%"></i></div><b>Etapa '+step+' de '+wzTotal+'</b></div>';
card.innerHTML=body;
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
const catSel=document.querySelector('[data-radio="categoria"] .radio-opt.sel');
fillPlanos(catSel?catSel.dataset.val:'fibra');
viabResult.style.display='none';step1ok=false;coberturaStatus=null;
assinado=false;contratoEnviado=false;
envioMsg.style.display='none';
document.getElementById('assinUltimo').textContent='Nenhum envio realizado ainda';
/* A Lead passa a pertencer ao funil em que foi trabalhada. */
if(window.FunnelRuntime){const fl=FunnelRuntime.funilDaLead(l);if(fl)l.funil=fl.nome;}
wzMontarEtapas();
showStep(Math.min(wzTotal,(l.fstage||0)+1));
renderAssinatura();
wzOverlay.classList.add('open');
}
/* Etapa do funil (Configurações > Funis de Venda > Motor do Funil) que
 * corresponde à etapa atual do wizard, usada para checar Campos
 * obrigatórios, Validações, Fluxo, Ações Automáticas e Próximas Ações. */
function wzCurEtapa(){return wzEtapas()[step-1]||null}
const WZ_CAMPO_CHECK={'Nome':()=>!!document.getElementById('cadNome').value.trim(),'CPF':()=>!!document.getElementById('cadCpf').value.trim(),'CNPJ':()=>!!document.getElementById('cadCpf').value.trim(),'Telefone':()=>!!document.getElementById('cadTel1').value.trim(),'Whatsapp':()=>!!document.getElementById('cadTel1').value.trim(),'CEP':()=>!!document.getElementById('viabCep').value.trim(),'Cidade':()=>!!document.getElementById('viabCidade').value.trim(),'Bairro':()=>!!document.getElementById('viabBairro').value.trim(),'Logradouro':()=>!!document.getElementById('viabLogradouro').value.trim(),'Número':()=>!!document.getElementById('viabNum').value.trim(),'Consulta de cobertura':()=>!!coberturaStatus,'E-mail':()=>!!document.getElementById('cadEmail').value.trim(),'Endereço':()=>!!document.getElementById('cadLogradouro').value.trim(),'Plano':()=>!!planoSelect.value,'Contrato':()=>!!document.querySelector('[data-radio="contrato"] .radio-opt.sel'),'Forma de envio':()=>!!document.querySelector('[data-radio="envio"] .radio-opt.sel'),'Assinatura':()=>assinado};
const WZ_VALID_CHECK={'Nome obrigatório':()=>!!document.getElementById('cadNome').value.trim(),'CPF obrigatório':()=>!!document.getElementById('cadCpf').value.trim(),'Telefone principal obrigatório':()=>!!document.getElementById('cadTel1').value.trim(),'E-mail obrigatório':()=>!!document.getElementById('cadEmail').value.trim(),'Endereço obrigatório':()=>!!document.getElementById('cadLogradouro').value.trim(),'Plano selecionado':()=>!!planoSelect.value,'Contrato selecionado':()=>!!document.querySelector('[data-radio="contrato"] .radio-opt.sel'),'Viabilidade obrigatória':()=>!!coberturaStatus,'Cobertura aprovada':()=>coberturaStatus==='ok'||coberturaStatus==='amp','Contrato enviado':()=>contratoEnviado,'Contrato assinado':()=>assinado};
function wzPendencias(e,map,campo){return window.FunnelRuntime?FunnelRuntime.pendencias(e&&e[campo],map):[];}
/* Fluxo (Configurações > Funis de Venda > Motor do Funil > Fluxo): só
 * permite avançar se a próxima etapa ativa constar em avancarPara. */
function wzFluxoPermite(e){return window.FunnelRuntime?FunnelRuntime.fluxoPermite(e,wzEtapas()[step]):true}
/* Checagem executada ao clicar "Continuar"/"Prosseguir" dentro do wizard,
 * antes das regras internas de cada etapa (comportamento original
 * preservado). Reflete Campos obrigatórios, Validações e Fluxo
 * configurados em Configurações > Funis de Venda > Motor do Funil. */
function wzChecarAvanco(){
const e=wzCurEtapa();
if(!e)return true;
const camposPend=wzPendencias(e,WZ_CAMPO_CHECK,'camposAvanco');
if(camposPend.length){alert('Preencha os campos obrigatórios para avançar: '+camposPend.join(', '));return false;}
const validPend=wzPendencias(e,WZ_VALID_CHECK,'validacoes');
if(validPend.length){
const acao=e.validacaoAcao||'Bloquear avanço';
if(acao==='Bloquear avanço'){alert('Não é possível avançar. Pendências de validação: '+validPend.join(', '));return false;}
if(acao==='Solicitar aprovação'&&!confirm('Validações pendentes: '+validPend.join(', ')+'. Solicitar aprovação e avançar mesmo assim?'))return false;
if(acao==='Criar pendência')alert('Pendência registrada: '+validPend.join(', ')+'. A venda seguirá com pendências em aberto.');
}
if(!wzFluxoPermite(e)){alert('O fluxo configurado para esta etapa não permite avançar para a próxima.');return false;}
return true;
}
function closeWizard(){wzOverlay.classList.remove('open')}
document.getElementById('wzClose').addEventListener('click',closeWizard);
wzOverlay.addEventListener('click',e=>{if(e.target===wzOverlay)closeWizard()});

const consultaMsg=document.getElementById('consultaMsg');
const btnAbrirCadastro=document.getElementById('btnAbrirCadastro');
document.getElementById('btnConsultaCpf').addEventListener('click',()=>{
const v=document.getElementById('cadCpf').value.trim();
if(v&&curLead&&v===curLead.cpf){
consultaMsg.innerHTML=wzIco('<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',14)+' Cliente já cadastrado.';
consultaMsg.className='consulta-msg no';
btnAbrirCadastro.style.display='inline-flex';
}else if(v){
consultaMsg.innerHTML=wzIco('<polyline points="20 6 9 17 4 12"/>',14)+' Cliente novo.';
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

