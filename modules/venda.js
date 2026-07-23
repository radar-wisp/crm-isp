/* ============================================================
 * Tela: Fluxo da Venda (kanban/lista do vendedor + Próxima Ação)
 * Extraído do <script> original (bloco contíguo, ordem de execução
 * preservada). Nenhuma linha de lógica foi reescrita.
 * ============================================================ */
const STAGES=[['Nova','#64748b'],['Viabilidade','var(--accent)'],['Cadastro','var(--violet)'],['Plano e contrato','var(--accent-2)'],['Assinatura','var(--warn)'],['Venda finalizada','var(--signal)']];
const mineAll=LEADS.filter(l=>l.vend==='Renatha Loiola');
mineAll.forEach((l,i)=>{l.fstage=l.stat[0]==='Novo'?0:1+(i%(STAGES.length-1))});

/* Metas e comissões (CFG.meta): acrescenta a meta do período ao subtítulo
 * já existente, cruzando com a função do vendedor em Colaboradores (CFG.vend). */
function metaTexto(){
const vends=(typeof CFG!=='undefined'&&CFG.vend)?CFG.vend.data:[];
const v=vends.find(x=>x.nome==='Renatha Loiola');
const cargo=v?v.funcao:'Vendedor';
const metas=(typeof CFG!=='undefined'&&CFG.meta)?CFG.meta.data:[];
const m=metas.find(x=>x.cargo===cargo);
if(!m)return '';
const valor=m.meta==='Quantidade'?m.metaQtd:m.metaValor;
return valor?(' · Meta '+m.periodo+': '+valor):'';
}

const goBtn='<button class="btn-sm btn-go">Prosseguir<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>';

const vBoard=document.getElementById('vBoard');
const myLeadRows=document.getElementById('myLeadRows');
function renderVenda(){
vBoard.innerHTML='';myLeadRows.innerHTML='';
const subEl=document.querySelector('#venda .hl p');
if(subEl)subEl.textContent='Leads atribuídas a você · Renatha Loiola'+metaTexto();
STAGES.forEach((st,idx)=>{
const items=mineAll.filter(l=>l.fstage===idx);
const col=document.createElement('div');
col.className='col';
col.innerHTML='<div class="col-head"><span class="dt" style="background:'+st[1]+'"></span><h4>'+st[0]+'</h4><span class="n">'+items.length+'</span></div><div class="col-body"></div>';
const body=col.querySelector('.col-body');
items.forEach(l=>{
const k=document.createElement('div');
k.className='kcard';
k.style.borderLeftColor=st[1];
k.innerHTML='<div class="kt"><div class="av" style="background:linear-gradient(135deg,'+l.grad+')">'+l.ini+'</div><div><b>'+l.name+'</b><small>'+l.phone+'</small></div></div><span class="plan">'+l.camp+'</span><div class="kfoot"><span class="badge '+l.stat[1]+'">'+l.stat[0]+'</span>'+goBtn+'</div>';
k.querySelector('.btn-go').addEventListener('click',()=>openWizard(l));
body.appendChild(k);
});
vBoard.appendChild(col);
});
document.getElementById('myLeadCount').textContent=mineAll.length;
mineAll.forEach(l=>{
const pl=PLAT[l.plat];const st=STAGES[l.fstage];
const tr=document.createElement('tr');
tr.innerHTML='<td><div class="lead-cli"><div class="av" style="background:linear-gradient(135deg,'+l.grad+')">'+l.ini+'</div><div><b>'+l.name+'</b><small>'+l.phone+'</small></div></div></td>'
+'<td>'+l.orig+'</td>'
+'<td><span class="src"><span class="ic '+pl.c+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+pl.s+'</svg></span>'+pl.l+'</span></td>'
+'<td><span class="badge '+l.stat[1]+'">'+l.stat[0]+'</span></td>'
+'<td><span class="stage" style="background:#f1f4f8;color:var(--body-strong)"><span style="width:6px;height:6px;border-radius:50%;background:'+st[1]+';display:inline-block;margin-right:2px"></span>'+st[0]+'</span></td>'
+'<td>'+l.vend+'</td>'
+'<td>'+goBtn+'</td>';
tr.querySelector('.btn-go').addEventListener('click',()=>openWizard(l));
myLeadRows.appendChild(tr);
});
}
renderVenda();

/* ===== Próxima Ação (Fluxo da Venda) ===== */
const PA_ICONE={'Ligação':'📞','WhatsApp':'💬','E-mail':'✉️','Tarefa':'✅','Visita':'📍','Outro':'🔧'};
let PA_QUEUE=[
{tipo:'Ligação',titulo:'Ligar para o cliente',quando:'Hoje · 18:00',motivo:'Cliente solicitou retorno após o expediente.',sugerida:false},
{tipo:'WhatsApp',titulo:'Enviar WhatsApp',quando:'Hoje · 19:30',motivo:'Confirmar recebimento da proposta enviada.',sugerida:false},
{tipo:'Ligação',titulo:'Confirmar assinatura',quando:'Amanhã · 10:00',motivo:'A etapa "Contrato Enviado" sugere esta ação automaticamente, com prazo de 24 horas.',sugerida:true},
{tipo:'Tarefa',titulo:'Encaminhar contrato',quando:'Amanhã · 09:00',motivo:'Confirmar geração do contrato para envio ao cliente.',sugerida:false}
];
let paIdx=0;
let paAtual=PA_QUEUE[0];
let paHistorico=['Ligação realizada','WhatsApp enviado','Contrato encaminhado'];
let paEditMode=null;
function paAvancar(registrarHistorico,textoHistorico){
if(registrarHistorico&&paAtual){paHistorico.unshift(textoHistorico||(paAtual.titulo+' concluída'));if(paHistorico.length>4)paHistorico.pop();}
paIdx++;
paAtual=paIdx<PA_QUEUE.length?PA_QUEUE[paIdx]:null;
paEditMode=null;
renderProxAcaoCard();
}
function paLibAtivas(){return (typeof PROX_ACOES!=='undefined'?PROX_ACOES.filter(p=>p.status==='Ativo'):[])}
function renderProxAcaoCard(){
const card=document.getElementById('proxAcaoCard');
if(!card)return;
let body='';
if(paEditMode==='reagendar'&&paAtual){
body='<div class="card-head"><h3>Próxima Ação</h3></div>'+
'<div class="pa-edit"><label class="cfg-flabel">Novo prazo</label><input type="text" id="paReagendaInput" value="'+escA(paAtual.quando)+'">'+
'<div class="pa-edit-foot"><button class="btn-ghost" id="paCancelEdit">Cancelar</button><button class="btn-primary" id="paSalvarReagenda">Salvar</button></div></div>';
}else if(paEditMode==='alterar'&&paAtual){
const opts=paLibAtivas().map(p=>'<option value="'+escA(p.nome)+'">'+esc(p.nome)+' ('+esc(p.tipo)+')</option>').join('');
body='<div class="card-head"><h3>Próxima Ação</h3></div>'+
'<div class="pa-edit"><label class="cfg-flabel">Selecionar nova ação</label><select id="paAlterarSelect">'+(opts||'<option value="">Nenhum modelo cadastrado</option>')+'</select>'+
'<div class="pa-edit-foot"><button class="btn-ghost" id="paCancelEdit">Cancelar</button><button class="btn-primary" id="paSalvarAlterar">Salvar</button></div></div>';
}else if(!paAtual){
body='<div class="card-head"><h3>Próxima Ação</h3></div><div class="pa-empty">Nenhuma ação pendente.</div>';
}else if(paAtual.sugerida){
body='<div class="card-head"><h3>Próxima Ação</h3></div>'+
'<div class="pa-item sug"><div class="pa-ico">'+(PA_ICONE[paAtual.tipo]||'🔔')+'</div><div><span class="pa-tag">Sugerida automaticamente</span><div class="pa-title">'+esc(paAtual.titulo)+'</div><div class="pa-when">'+esc(paAtual.quando)+'</div><div class="pa-motivo">'+esc(paAtual.motivo)+'</div></div></div>'+
'<div class="pa-foot"><button class="btn-primary btn-sm" id="paConfirmar">Confirmar</button><button class="btn-ghost btn-sm" id="paAlterarBtn">Alterar</button><button class="btn-ghost btn-sm" id="paIgnorar">Ignorar</button></div>';
}else{
body='<div class="card-head"><h3>Próxima Ação</h3></div>'+
'<div class="pa-item"><div class="pa-ico">'+(PA_ICONE[paAtual.tipo]||'🔔')+'</div><div><div class="pa-title">'+esc(paAtual.titulo)+'</div><div class="pa-when">'+esc(paAtual.quando)+'</div><div class="pa-motivo">'+esc(paAtual.motivo)+'</div></div></div>'+
'<div class="pa-foot"><button class="btn-primary btn-sm" id="paConcluir">Concluir</button><button class="btn-ghost btn-sm" id="paReagendarBtn">Reagendar</button><button class="btn-ghost btn-sm" id="paAlterarBtn">Alterar</button></div>';
}
const histItems=paHistorico.map(h=>'<li>'+esc(h)+'</li>').join('');
body+='<div class="pa-hist"><div class="lbl">Últimas ações</div><ul>'+(histItems||'<li style="color:#98a4b6">—</li>')+'</ul></div>';
card.innerHTML=body;
const bc=document.getElementById('paConcluir');if(bc)bc.addEventListener('click',()=>paAvancar(true));
const bi=document.getElementById('paIgnorar');if(bi)bi.addEventListener('click',()=>paAvancar(false));
const bcf=document.getElementById('paConfirmar');if(bcf)bcf.addEventListener('click',()=>{paAtual.sugerida=false;renderProxAcaoCard();});
const brb=document.getElementById('paReagendarBtn');if(brb)brb.addEventListener('click',()=>{paEditMode='reagendar';renderProxAcaoCard();});
const bab=document.getElementById('paAlterarBtn');if(bab)bab.addEventListener('click',()=>{paEditMode='alterar';renderProxAcaoCard();});
const bce=document.getElementById('paCancelEdit');if(bce)bce.addEventListener('click',()=>{paEditMode=null;renderProxAcaoCard();});
const bsr=document.getElementById('paSalvarReagenda');if(bsr)bsr.addEventListener('click',()=>{const v=document.getElementById('paReagendaInput').value.trim();if(v)paAtual.quando=v;paEditMode=null;renderProxAcaoCard();});
const bsa=document.getElementById('paSalvarAlterar');if(bsa)bsa.addEventListener('click',()=>{
const sel=document.getElementById('paAlterarSelect');
const escolhida=paLibAtivas().find(p=>p.nome===sel.value);
if(escolhida){paAtual.tipo=escolhida.tipo;paAtual.titulo=escolhida.nome;paAtual.motivo=escolhida.descricao||paAtual.motivo;paAtual.sugerida=false;}
paEditMode=null;renderProxAcaoCard();
});
}
renderProxAcaoCard();

/* ===== Funil Atual (lista igual a Configurações > Funis > Motor do Funil > Funis) ===== */
let vFunilSelIdx=0;
const vFunilSelect=document.getElementById('vFunilSelect');
function populateVendaFunilSelect(){
if(!vFunilSelect)return;
const funis=(typeof FUNIS!=='undefined')?FUNIS:[];
if(!funis.length)return;
if(vFunilSelIdx>=funis.length)vFunilSelIdx=0;
vFunilSelect.innerHTML=funis.map((f,i)=>'<option value="'+i+'"'+(i===vFunilSelIdx?' selected':'')+'>'+esc(f.nome)+'</option>').join('');
}
populateVendaFunilSelect();
if(vFunilSelect)vFunilSelect.addEventListener('change',()=>{vFunilSelIdx=parseInt(vFunilSelect.value);});
const vNavItem=document.querySelector('.nav-item[data-view="venda"]');
if(vNavItem)vNavItem.addEventListener('click',populateVendaFunilSelect);

const vTabKanban=document.getElementById('vTabKanban');
const vTabList=document.getElementById('vTabList');
const vViewKanban=document.getElementById('vViewKanban');
const vViewList=document.getElementById('vViewList');
vTabKanban.addEventListener('click',()=>{vTabKanban.classList.add('on');vTabList.classList.remove('on');vViewKanban.classList.add('on');vViewList.classList.remove('on')});
vTabList.addEventListener('click',()=>{vTabList.classList.add('on');vTabKanban.classList.remove('on');vViewList.classList.add('on');vViewKanban.classList.remove('on')});

