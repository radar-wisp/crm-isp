/* ============================================================
 * Motor de Funil — funis, etapas, tipos, ações automáticas, validações
 * e próximas ações (aba Funis dentro de Configurações).
 * Extraído do <script> original (bloco contíguo, ordem de execução
 * preservada). Nenhuma linha de lógica foi reescrita.
 * ============================================================ */
/* Converte prazos legados ("2 horas", "1 dia", "15 minutos") para hh:mm:ss e
 * aplica máscara de relógio nos inputs de prazo (SLA e Próxima Ação). */
function toClock(v){const s=String(v||'').trim();if(/^\d{1,2}:\d{2}:\d{2}$/.test(s))return s;const m=s.match(/(\d+)\s*(min|hora|dia)/i);if(!m)return '';const n=parseInt(m[1]);if(/min/i.test(m[2]))return '00:'+String(n).padStart(2,'0')+':00';return String(/dia/i.test(m[2])?n*24:n).padStart(2,'0')+':00:00'}
function clockMask(el){if(!el||el.dataset.clock)return;el.dataset.clock='1';el.addEventListener('input',()=>{const d=el.value.replace(/\D/g,'').slice(0,6);el.value=d.replace(/^(\d{1,2})(\d{0,2})(\d{0,2})$/,(x,a,b,c)=>a+(b?':'+b:'')+(c?':'+c:''));});}
function etapa(nome,cor,icone,descricao,sla,obrig,ativa,avancar,campos,tipo){return {nome,cor,icone,descricao,sla,obrigatoria:obrig,ativa,avancarQualquer:avancar,campos,tipo:tipo||''}}

/* Ícones usados nesta aba. Definidos aqui (e não reaproveitados de
 * modules/dashboard.js) porque aquele arquivo falha ao carregar — ele
 * redeclara "const dupIco", que já existe em engine/config-engine.js,
 * o que gera um erro de sintaxe e impede dashboard.js de rodar. Sem
 * isso, gearIco/upIco/downIco ficavam undefined e renderFunisPanel()
 * quebrava antes de desenhar qualquer coisa em #cfg-funis. Mesmos SVGs
 * já usados no restante do projeto — nenhuma mudança visual.
 */
const gearIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
const upIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
const downIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>';

let FUNIS=[
{nome:'Funil Residencial',grupo:'Residencial Fibra',tipo:'Pessoa Física',status:'Ativo',visualizacao:'Kanban',etapas:[
etapa('Novo Lead','#0ea5b7','user-plus','Lead recém-cadastrado no sistema','2 horas','Sim','Sim','Não',['Nome','Telefone'],'Comercial'),
etapa('Contato','#7c5cf6','phone','Primeiro contato realizado com o lead','1 dia','Sim','Sim','Não',['Nome','Telefone','Endereço'],'Comercial'),
etapa('Qualificado','#f59e0b','check','Lead qualificado para negociação','2 dias','Sim','Sim','Não',['Nome','CPF','Telefone'],'Qualificação'),
etapa('Viabilidade','#14c8dd','map-pin','Consulta de viabilidade técnica no endereço','1 dia','Sim','Sim','Não',['Endereço'],'Técnica'),
etapa('Proposta','#3b82f6','file-text','Proposta comercial enviada ao cliente','3 dias','Não','Sim','Sim',['Plano'],'Comercial'),
etapa('Contrato','#f97316','file-text','Contrato gerado para assinatura','2 dias','Sim','Sim','Não',['Contrato'],'Contratual'),
etapa('Assinado','#22c55e','check','Contrato assinado pelo cliente','1 dia','Sim','Sim','Não',['Assinatura'],'Contratual'),
etapa('Concluído','#16a34a','flag','Venda concluída','—','Sim','Sim','Não',[],'Finalizadora')]},
{nome:'Funil Empresarial',grupo:'Empresarial',tipo:'Pessoa Jurídica',status:'Ativo',visualizacao:'Lista',etapas:[
etapa('Novo Lead','#0ea5b7','user-plus','Lead corporativo recebido','4 horas','Sim','Sim','Não',['Nome','Telefone'],'Comercial'),
etapa('Diagnóstico','#7c5cf6','map-pin','Levantamento das necessidades do cliente','2 dias','Sim','Sim','Não',['Endereço'],'Técnica'),
etapa('Proposta','#3b82f6','file-text','Proposta comercial corporativa','5 dias','Não','Sim','Sim',['Plano'],'Comercial'),
etapa('Negociação','#f59e0b','phone','Ajustes comerciais e contratuais','5 dias','Não','Sim','Sim',[],'Comercial'),
etapa('Fechamento','#22c55e','check','Contrato assinado e ativado','2 dias','Sim','Sim','Não',['Contrato','Assinatura'],'Contratual')]},
{nome:'Funil de Retenção',grupo:'Combos',tipo:'Retenção',status:'Inativo',visualizacao:'Kanban',etapas:[
etapa('Solicitação','#ef4444','file-text','Cliente solicitou cancelamento','1 dia','Sim','Sim','Não',['Nome'],'Comercial'),
etapa('Contato de Retenção','#f59e0b','phone','Contato para entender o motivo','2 dias','Sim','Sim','Não',[],'Comercial'),
etapa('Oferta','#3b82f6','file-text','Oferta de retenção enviada','2 dias','Não','Sim','Sim',[],'Comercial'),
etapa('Resolvido','#22c55e','flag','Caso finalizado','—','Sim','Sim','Não',[],'Finalizadora')]}
];
const MASTER_CAMPOS=['Nome','CPF','CNPJ','Telefone','Whatsapp','E-mail','Nome social','Nome fantasia','Data de fundação','Data de nascimento','Telefone secundário','Telefone comercial','Pai','Inscrição municipal','Mãe','Inscrição estadual','CEP','Cidade','Bairro','Logradouro','Número','Complemento','Consulta de cobertura','Endereço','Plano','Contrato','Forma de envio','Assinatura','Conclusão'];
const AUTO_ACOES=['Criar atividade','Criar Follow-up','Alterar Status','Enviar E-mail','Enviar WhatsApp','Gerar Auditoria','Criar Ordem de Serviço','Notificar Supervisor','Agendar Instalação','Criar Pendência'];
const DEFAULT_CAMPOS_MAP={'Novo Lead':['Nome','Telefone'],'Contato':['Nome','Telefone'],'Qualificado':['Nome','CPF','E-mail'],'Viabilidade':['CEP','Cidade','Bairro','Número','Consulta de cobertura'],'Diagnóstico':['CEP','Cidade','Bairro','Número','Consulta de cobertura'],'Proposta':['Plano'],'Negociação':['Plano'],'Contrato':['Contrato','Forma de envio'],'Fechamento':['Contrato','Forma de envio','Assinatura','Conclusão'],'Assinado':['Assinatura'],'Concluído':['Conclusão'],'Resolvido':['Conclusão']};
const DEFAULT_ACOES_MAP={'Novo Lead':['Criar atividade'],'Proposta':['Enviar E-mail'],'Contrato':['Enviar E-mail','Gerar Auditoria'],'Assinado':['Criar Ordem de Serviço','Notificar Supervisor'],'Concluído':['Criar Pendência']};
const VALID_GROUPS=[
{title:'Dados do Cliente',items:['Nome obrigatório','CPF obrigatório','Documento válido','Data de nascimento obrigatória','Telefone principal obrigatório','E-mail obrigatório','Endereço obrigatório','CEP obrigatório','Cidade obrigatória','Bairro obrigatório','Número obrigatório']},
{title:'Validação Comercial',items:['Lead Qualificada','Vendedor responsável definido','Origem da Lead obrigatória','Campanha obrigatória','Plano selecionado','Contrato selecionado','Tabela de preço definida']},
{title:'Validação Técnica',items:['Viabilidade obrigatória','Cobertura aprovada','Porta disponível','CTO disponível','Caixa disponível','Ampliação de rede aprovada']},
{title:'Validação Contratual',items:['Contrato enviado','Contrato visualizado','Contrato assinado','Documento anexado']},
{title:'Validação Financeira',items:['Forma de pagamento definida','Primeira cobrança gerada','Aprovação financeira']},
{title:'Permissões',items:['Permitir avanço mesmo com pendências','Apenas Supervisor pode ignorar validações','Apenas Gerente pode ignorar validações']}
];
const VALID_TOTAL_ITEMS=VALID_GROUPS.reduce((s,g)=>s+g.items.length,0);
const VALID_ACOES=['Apenas informar','Bloquear avanço','Solicitar aprovação','Criar pendência'];
const DEFAULT_VALID_MAP={'Novo Lead':['Nome obrigatório','Telefone principal obrigatório'],'Qualificado':['Lead Qualificada','Origem da Lead obrigatória'],'Viabilidade':['Viabilidade obrigatória','Cobertura aprovada'],'Proposta':['Plano selecionado','Tabela de preço definida'],'Contrato':['Contrato enviado','Documento anexado'],'Assinado':['Contrato assinado']};

/* ===== Próximas Ações (Follow-up) ===== */
const PA_TIPOS=['Ligação','WhatsApp','E-mail','Tarefa','Visita','Outro'];
const PA_PRAZOS=['15 minutos','30 minutos','1 hora','2 horas','24 horas','48 horas','Personalizado'];
const PA_PRIORIDADES=['Baixa','Normal','Alta','Crítica'];
const PA_RESPONSAVEIS=['Vendedor','Supervisor','Administrador'];
let PROX_ACOES=[
{nome:'Confirmar recebimento do contrato',descricao:'Verificar com o cliente se o contrato enviado foi recebido.',tipo:'WhatsApp',prazo:'24 horas',prioridade:'Alta',automatica:'Sim',status:'Ativo'},
{nome:'Confirmar assinatura',descricao:'Confirmar com o cliente a assinatura do contrato enviado.',tipo:'Ligação',prazo:'24 horas',prioridade:'Alta',automatica:'Sim',status:'Ativo'},
{nome:'Enviar proposta comercial',descricao:'Encaminhar a proposta comercial ao cliente.',tipo:'E-mail',prazo:'2 horas',prioridade:'Normal',automatica:'Não',status:'Ativo'},
{nome:'Realizar primeiro contato',descricao:'Fazer o primeiro contato com o lead recém-cadastrado.',tipo:'Ligação',prazo:'2 horas',prioridade:'Alta',automatica:'Sim',status:'Ativo'},
{nome:'Agendar visita técnica',descricao:'Agendar visita para avaliação de viabilidade técnica.',tipo:'Visita',prazo:'48 horas',prioridade:'Normal',automatica:'Não',status:'Ativo'}
];
const DEFAULT_PROXACOES_MAP={'Novo Lead':[{acao:'Realizar primeiro contato',criarAuto:'Sim',prazo:'2 horas',responsavel:'Vendedor'}],'Contrato':[{acao:'Confirmar recebimento do contrato',criarAuto:'Sim',prazo:'24 horas',responsavel:'Vendedor'},{acao:'Confirmar assinatura',criarAuto:'Sim',prazo:'24 horas',responsavel:'Vendedor'}]};

FUNIS.forEach(f=>{
f.fluxo=f.fluxo||{permitirRetorno:'Não',acoes:[]};
f.direcionamentos=f.direcionamentos||[];
f.etapas.forEach((e,i)=>{
if(!e.avancarPara){
const nearEnd=i>=f.etapas.length-2;
e.avancarPara=i<f.etapas.length-1?(nearEnd?[f.etapas[i+1].nome]:[f.etapas[i+1].nome,'Perdido']):[];
}
if(!e.camposAvanco)e.camposAvanco=DEFAULT_CAMPOS_MAP[e.nome]||[];
if(!e.acoesAutomaticas)e.acoesAutomaticas=DEFAULT_ACOES_MAP[e.nome]||[];
if(!e.validacoes)e.validacoes=DEFAULT_VALID_MAP[e.nome]||[];
if(!e.validacaoAcao)e.validacaoAcao='Bloquear avanço';
if(!e.proximasAcoes)e.proximasAcoes=(DEFAULT_PROXACOES_MAP[e.nome]||[]).map(x=>({...x}));
});
});
let funilSelIdx=0;
let motorTab='funis';
let validEtapaIdx=0;

function funRow(f,i){
return '<tr><td><b style="color:var(--body-strong)">'+esc(f.nome)+'</b><br><small style="color:#8a97ab;font-size:11.5px">'+esc(f.grupo||'')+'</small></td><td>'+(f.tipo?'<span class="chip-soft">'+esc(f.tipo)+'</span>':'—')+'</td><td>'+f.etapas.length+' etapa(s)</td><td>'+cfgBadge(f.status)+'</td><td><div class="cfg-acts"><button class="row-act" data-funedit="'+i+'" title="Editar">'+editIco+'</button><button class="row-act" data-fundup="'+i+'" title="Duplicar">'+dupIco+'</button><button class="row-act del" data-fundel="'+i+'" title="Excluir">'+delIco+'</button></div></td></tr>';
}

function etapaRow(f,e,i,total){
return '<tr><td><b>'+(i+1)+'</b></td><td><span style="display:inline-flex;align-items:center;gap:8px"><i style="width:10px;height:10px;border-radius:3px;background:'+e.cor+';display:inline-block;flex-shrink:0"></i><b style="color:var(--body-strong)">'+esc(e.nome)+'</b></span></td><td><i style="width:20px;height:20px;border-radius:6px;background:'+e.cor+';display:inline-block"></i></td><td>'+esc(e.sla)+'</td><td>'+(e.obrigatoria==='Sim'?'<span class="badge b-won">Sim</span>':'<span class="chip-soft">Não</span>')+'</td><td>'+(e.ativa==='Sim'?'<span class="badge b-won">Ativa</span>':'<span class="badge b-lost">Inativa</span>')+'</td><td><div class="cfg-acts"><button class="row-act" data-etpup="'+i+'" title="Subir"'+(i===0?' disabled style="opacity:.35;cursor:default"':'')+'>'+upIco+'</button><button class="row-act" data-etpdown="'+i+'" title="Descer"'+(i===total-1?' disabled style="opacity:.35;cursor:default"':'')+'>'+downIco+'</button><button class="row-act" data-etpedit="'+i+'" title="Editar">'+editIco+'</button><button class="row-act del" data-etpdel="'+i+'" title="Excluir">'+delIco+'</button></div></td></tr>';
}

function fluxoRow(f,e,i,total){
const opts=f.etapas.filter((x,xi)=>xi!==i).map(x=>x.nome).concat(['Perdido']);
const checked=e.avancarPara||[];
const items=opts.map(o=>'<label class="cfg-check-item'+(checked.includes(o)?' on':'')+'" data-fluxo-origin="'+i+'" data-val="'+escA(o)+'"><span class="cbox"></span>'+esc(o)+'</label>').join('');
return '<div style="display:flex;gap:24px;padding:16px 20px;align-items:flex-start'+(i<total-1?';border-bottom:1px solid var(--surface-line)':'')+'">'+
'<div style="min-width:170px;flex-shrink:0;padding-top:2px"><b style="color:var(--body-strong);font-size:13.5px">'+esc(e.nome)+'</b></div>'+
'<div style="flex:1"><div style="font-size:12px;color:#68758a;font-weight:600;margin-bottom:9px">Pode avançar para:</div><div class="cfg-checks">'+items+'</div></div>'+
'</div>';
}

function renderFluxoCard(f){
if(!f)return '';
const rows=f.etapas.map((e,i)=>fluxoRow(f,e,i,f.etapas.length)).join('');
const fx=f.fluxo||{permitirRetorno:'Não',acoes:[]};
return '<div class="card" style="margin-bottom:18px" id="fluxoCard">'+
'<div class="card-head"><h3>Fluxo entre Etapas</h3></div>'+
'<div style="padding:14px 20px 4px;font-size:13px;color:#8a97ab">Configure quais movimentações são permitidas entre as etapas deste funil.</div>'+
'<div>'+rows+'</div>'+
'<div class="cfg-form" style="padding:18px 20px;border-top:1px solid var(--surface-line)">'+
'<div class="cfg-field"><label class="cfg-flabel">Permitir retorno para etapa anterior</label><div class="radio-group" id="fluxoRetornoRG"><div class="radio-opt'+(fx.permitirRetorno==='Sim'?' sel':'')+'" data-val="Sim"><span class="rd"></span>Sim</div><div class="radio-opt'+(fx.permitirRetorno==='Não'?' sel':'')+'" data-val="Não"><span class="rd"></span>Não</div></div></div>'+
'</div>'+
'<div class="cfg-modal-foot" style="justify-content:space-between;align-items:center">'+
'<span id="fluxoSavedMsg" style="font-size:12.5px;color:var(--signal);font-weight:600;opacity:0;transition:.25s">Fluxo salvo com sucesso!</span>'+
'<button class="btn-primary" id="saveFluxoBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Salvar Fluxo</button>'+
'</div>'+
'</div>';
}

function renderCamposTab(f){
if(!f)return '<div class="card"><div class="card-head"><h3>Campos obrigatórios para avanço</h3></div></div>';
const rows=f.etapas.map((e,i)=>{
const checked=e.camposAvanco||[];
const items=MASTER_CAMPOS.map(c=>'<label class="cfg-check-item'+(checked.includes(c)?' on':'')+'" data-campos-origin="'+i+'" data-val="'+escA(c)+'"><span class="cbox"></span>'+esc(c)+'</label>').join('');
return '<div style="padding:16px 20px'+(i<f.etapas.length-1?';border-bottom:1px solid var(--surface-line)':'')+'"><div style="font-size:13.5px;font-weight:700;color:var(--body-strong);margin-bottom:10px">'+esc(e.nome)+'</div><div class="cfg-checks">'+items+'</div></div>';
}).join('');
return '<div class="card"><div class="card-head"><h3>Campos obrigatórios para avanço</h3></div>'+
'<div style="padding:14px 20px 0;font-size:13px;color:#8a97ab">Defina quais informações precisam estar preenchidas para permitir o avanço de cada etapa.</div>'+
'<div>'+rows+'</div>'+
'<div class="cfg-modal-foot" style="justify-content:space-between;align-items:center">'+
'<span id="camposSavedMsg" style="font-size:12.5px;color:var(--signal);font-weight:600;opacity:0;transition:.25s">Configuração salva com sucesso!</span>'+
'<button class="btn-primary" id="saveCamposBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Salvar Campos Obrigatórios</button>'+
'</div></div>';
}

function proxAcaoLibRow(p,i){
return '<tr><td><b style="color:var(--body-strong)">'+esc(p.nome)+'</b>'+(p.descricao?'<br><small style="color:#8a97ab;font-size:11.5px">'+esc(p.descricao)+'</small>':'')+'</td><td>'+(p.etapa?'<span class="chip-soft">'+esc(p.etapa)+'</span>':'—')+'</td><td><span class="chip-soft">'+esc(p.tipo)+'</span></td><td>'+esc(p.prazo)+'</td><td>'+esc(p.prioridade)+'</td><td>'+(p.automatica==='Sim'?'<span class="badge b-won">Sim</span>':'<span class="chip-soft">Não</span>')+'</td><td>'+cfgBadge(p.status)+'</td><td><div class="cfg-acts"><button class="row-act" data-paedit="'+i+'" title="Editar">'+editIco+'</button><button class="row-act del" data-padel="'+i+'" title="Excluir">'+delIco+'</button></div></td></tr>';
}
function renderProxAcoesTab(){
const rows=PROX_ACOES.map((p,i)=>proxAcaoLibRow(p,i)).join('');
return '<div class="card"><div class="card-head"><h3>Biblioteca de Próximas Ações</h3><button class="btn-primary" id="newProxAcaoBtn">'+plusIco+'Nova Próxima Ação</button></div>'+
'<div style="padding:14px 20px 0;font-size:13px;color:#8a97ab">Cadastre os modelos de ação que poderão ser sugeridos automaticamente durante o Fluxo da Venda. Internamente este recurso representa o Follow-up do CRM; para o vendedor, ele é sempre chamado de "Próxima Ação".</div>'+
'<div class="table-wrap" style="margin-top:14px"><table class="cfg-table"><thead><tr><th>Nome</th><th>Etapa</th><th>Tipo</th><th>Prazo Padrão</th><th>Prioridade</th><th>Automática</th><th>Status</th><th></th></tr></thead><tbody>'+(rows||'')+'</tbody></table></div></div>';
}

function renderAcoesTab(f){
if(!f)return '<div class="card"><div class="card-head"><h3>Ações automáticas</h3></div></div>';
const rows=f.etapas.map((e,i)=>{
const checked=e.acoesAutomaticas||[];
const items=AUTO_ACOES.map(c=>'<label class="cfg-check-item'+(checked.includes(c)?' on':'')+'" data-acao-origin="'+i+'" data-val="'+escA(c)+'"><span class="cbox"></span>'+esc(c)+'</label>').join('');
return '<div style="padding:16px 20px'+(i<f.etapas.length-1?';border-bottom:1px solid var(--surface-line)':'')+'"><div style="font-size:13.5px;font-weight:700;color:var(--body-strong);margin-bottom:10px">'+esc(e.nome)+'</div><div class="cfg-checks">'+items+'</div></div>';
}).join('');
return '<div class="card"><div class="card-head"><h3>Ações automáticas</h3></div>'+
'<div style="padding:14px 20px 0;font-size:13px;color:#8a97ab">Configure quais ações ocorrerão automaticamente ao entrar em cada etapa.</div>'+
'<div>'+rows+'</div>'+
'<div class="cfg-modal-foot" style="justify-content:space-between;align-items:center">'+
'<span id="acoesSavedMsg" style="font-size:12.5px;color:var(--signal);font-weight:600;opacity:0;transition:.25s">Configuração salva com sucesso!</span>'+
'<button class="btn-primary" id="saveAcoesBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Salvar Ações Automáticas</button>'+
'</div></div>';
}

function renderValidacoesTab(f){
if(!f||!f.etapas.length)return '<div class="card"><div class="card-head"><h3>Regras de Validação</h3></div><div style="padding:18px 20px;font-size:13px;color:#8a97ab">Cadastre etapas para configurar validações.</div></div>';
if(validEtapaIdx>=f.etapas.length)validEtapaIdx=0;
const e=f.etapas[validEtapaIdx];
const checked=e.validacoes||[];
const etapaOptions=f.etapas.map((et,i)=>'<option value="'+i+'"'+(i===validEtapaIdx?' selected':'')+'>'+esc(et.nome)+'</option>').join('');
const etapaSelector='<div class="card" style="margin-bottom:18px"><div class="card-head" style="border-bottom:none"><h3>Etapa</h3>'+
'<div class="select sm" style="min-width:220px"><select id="validEtapaSelect">'+etapaOptions+'</select><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg></div></div></div>';
const groupsHtml=VALID_GROUPS.map(g=>'<div style="padding:16px 20px;border-top:1px solid var(--surface-line)"><div style="font-size:12.5px;font-weight:700;color:var(--body-strong);margin-bottom:10px">'+esc(g.title)+'</div><div class="cfg-checks">'+g.items.map(it=>'<label class="cfg-check-item'+(checked.includes(it)?' on':'')+'" data-valid-item data-val="'+escA(it)+'"><span class="cbox"></span>'+esc(it)+'</label>').join('')+'</div></div>').join('');
const acaoHtml='<div style="padding:16px 20px;border-top:1px solid var(--surface-line)"><div class="cfg-flabel" style="margin-bottom:9px">Quando uma validação não for atendida</div><div class="radio-group" id="validAcaoRG">'+VALID_ACOES.map(a=>'<div class="radio-opt'+(e.validacaoAcao===a?' sel':'')+'" data-val="'+escA(a)+'"><span class="rd"></span>'+esc(a)+'</div>').join('')+'</div></div>';
const regrasCard='<div class="card" style="flex:1;min-width:320px"><div class="card-head"><h3>Regras de Validação</h3></div>'+
'<div style="padding:14px 20px 0;font-size:13px;color:#8a97ab">Configure quais condições deverão ser atendidas antes de permitir o avanço para a próxima etapa.</div>'+
groupsHtml+acaoHtml+
'<div class="cfg-modal-foot" style="justify-content:space-between;align-items:center">'+
'<span id="validSavedMsg" style="font-size:12.5px;color:var(--signal);font-weight:600;opacity:0;transition:.25s">Validações salvas com sucesso!</span>'+
'<button class="btn-primary" id="saveValidBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Salvar Validações</button>'+
'</div></div>';
const obrig=checked.length,opc=VALID_TOTAL_ITEMS-obrig;
const resumoCard='<div class="card" style="width:260px;flex-shrink:0"><div class="card-head"><h3>Resumo da Etapa</h3></div>'+
'<div style="padding:16px 20px;display:flex;flex-direction:column;gap:14px">'+
'<div><div class="cfg-flabel">Etapa</div><b style="font-size:13.5px;color:var(--body-strong)">'+esc(e.nome)+'</b></div>'+
'<div><div class="cfg-flabel">Quantidade de validações</div><b style="font-size:13.5px;color:var(--body-strong)">'+VALID_TOTAL_ITEMS+'</b></div>'+
'<div><div class="cfg-flabel">Quantidade obrigatória</div><b style="font-size:13.5px;color:var(--accent)">'+obrig+'</b></div>'+
'<div><div class="cfg-flabel">Quantidade opcional</div><b style="font-size:13.5px;color:var(--body-strong)">'+opc+'</b></div>'+
'<div><div class="cfg-flabel">Status</div>'+(obrig>0?'<span class="badge b-won">Configurada</span>':'<span class="badge b-lost">Pendente</span>')+'</div>'+
'</div></div>';
return etapaSelector+'<div style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap">'+regrasCard+resumoCard+'</div>';
}

/* ===== Direcionamento (Estrutura Condicional) ===== */
const DIREC_TIPOS=['Funis','Etapas','Fluxo','Campos obrigatórios','Próximas ações','Ações automáticas','Validações'];
function direcOpcoes(tipo,f){
const etapas=(f&&f.etapas?f.etapas:[]).map(e=>e.nome);
if(tipo==='Funis')return FUNIS.map(x=>x.nome);
if(tipo==='Etapas')return etapas;
if(tipo==='Fluxo')return etapas.concat(['Perdido']);
if(tipo==='Campos obrigatórios')return MASTER_CAMPOS;
if(tipo==='Próximas ações')return PROX_ACOES.map(p=>p.nome);
if(tipo==='Ações automáticas')return AUTO_ACOES;
if(tipo==='Validações')return VALID_GROUPS.reduce((a,g)=>a.concat(g.items),[]);
return [];
}
function direcSel(campo,i,opts,cur,ph,w){
return '<div class="select sm" style="min-width:'+w+'px"><select data-direc="'+campo+'" data-i="'+i+'"><option value="">'+esc(ph)+'</option>'+opts.map(o=>'<option value="'+escA(o)+'"'+(o===cur?' selected':'')+'>'+esc(o)+'</option>').join('')+'</select><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg></div>';
}
function direcTag(t){return '<span style="font-size:12px;color:#68758a;font-weight:700">'+esc(t)+'</span>'}
function direcRow(f,r,i,total){
return '<div style="display:flex;gap:9px;align-items:center;flex-wrap:wrap;padding:14px 20px'+(i<total-1?';border-bottom:1px solid var(--surface-line)':'')+'">'+
direcTag('SE')+
direcSel('etapa',i,(f.etapas||[]).map(e=>e.nome),r.etapa,'Etapa',180)+
direcTag('·')+
direcSel('condTipo',i,DIREC_TIPOS,r.condTipo,'Condição',180)+
direcSel('condValor',i,direcOpcoes(r.condTipo,f),r.condValor,'Valor',190)+
direcTag('DIRECIONAR PARA')+
direcSel('destTipo',i,DIREC_TIPOS,r.destTipo,'Destino',180)+
direcSel('destValor',i,direcOpcoes(r.destTipo,f),r.destValor,'Valor',190)+
'<button class="row-act del" data-direcdel="'+i+'" title="Excluir">'+delIco+'</button>'+
'</div>';
}
function renderDirecionamentoTab(f){
if(!f)return '<div class="card"><div class="card-head"><h3>Direcionamento</h3></div></div>';
f.direcionamentos=f.direcionamentos||[];
const rows=f.direcionamentos.length?f.direcionamentos.map((r,i)=>direcRow(f,r,i,f.direcionamentos.length)).join(''):'<div style="padding:18px 20px;font-size:13px;color:#8a97ab">Nenhuma condição cadastrada.</div>';
return '<div class="card"><div class="card-head"><h3>Direcionamento</h3><button class="btn-primary" id="newDirecBtn">'+plusIco+'Nova Condição</button></div>'+
'<div style="padding:14px 20px 4px;font-size:13px;color:#8a97ab">Monte estruturas condicionais ilimitadas para direcionar a venda conforme o que for preenchido em cada etapa.</div>'+
'<div>'+rows+'</div>'+
'<div class="cfg-modal-foot" style="justify-content:space-between;align-items:center">'+
'<span id="direcSavedMsg" style="font-size:12.5px;color:var(--signal);font-weight:600;opacity:0;transition:.25s">Direcionamentos salvos com sucesso!</span>'+
'<button class="btn-primary" id="saveDirecBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Salvar Direcionamentos</button>'+
'</div></div>';
}
function saveDirecionamentos(){
const msg=document.getElementById('direcSavedMsg');
if(msg){msg.style.opacity='1';setTimeout(()=>{msg.style.opacity='0';},2200);}
}

function renderMotorTabs(){
const tabs=[['funis','Funis'],['etapas','Etapas'],['direcionamento','Direcionamento'],['fluxo','Fluxo'],['campos','Campos Obrigatórios'],['proxacoes','Próximas Ações'],['acoes','Ações Automáticas'],['validacoes','Validações']];
return tabs.map(t=>'<button class="'+(motorTab===t[0]?'on':'')+'" data-tab="'+t[0]+'">'+t[1]+'</button>').join('');
}

function renderFunisPanel(){
const panel=document.getElementById('cfg-funis');
const selFunil=FUNIS[funilSelIdx];
const funOptions=FUNIS.map((f,i)=>'<option value="'+i+'"'+(i===funilSelIdx?' selected':'')+'>'+esc(f.nome)+'</option>').join('');
const topSelector='<div class="card" style="margin-bottom:18px"><div class="card-head" style="border-bottom:none"><h3>Funil Atual</h3>'+
(FUNIS.length?'<div class="select sm" style="min-width:220px"><select id="funilAtualSelect">'+funOptions+'</select><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg></div>':'')+
'</div></div>';

const listRows=FUNIS.map((f,i)=>funRow(f,i)).join('');
const tabFunis='<div class="card"><div class="card-head"><h3>Funis de venda</h3><button class="btn-primary" id="newFunilBtn">'+plusIco+'Novo Funil</button></div>'+
'<div class="table-wrap"><table class="cfg-table"><thead><tr><th>Nome do Funil</th><th>Tipo</th><th>Qtd. Etapas</th><th>Status</th><th></th></tr></thead><tbody>'+listRows+'</tbody></table></div></div>';

const etapasRows=selFunil?selFunil.etapas.map((e,i)=>etapaRow(selFunil,e,i,selFunil.etapas.length)).join(''):'';
const tabEtapas='<div class="card"><div class="card-head"><h3>Configuração das etapas</h3><button class="btn-primary" id="newEtapaBtn">'+plusIco+'Nova Etapa</button></div>'+
'<div class="table-wrap"><table class="cfg-table"><thead><tr><th>Ordem</th><th>Nome da Etapa</th><th>Cor</th><th>SLA</th><th>Obrigatória</th><th>Ativa</th><th></th></tr></thead><tbody>'+etapasRows+'</tbody></table></div></div>';

const tabDirecionamento=renderDirecionamentoTab(selFunil);
const tabFluxo=renderFluxoCard(selFunil);
const tabCampos=renderCamposTab(selFunil);
const tabAcoes=renderAcoesTab(selFunil);
const tabProxAcoes=renderProxAcoesTab();
const tabValidacoes=renderValidacoesTab(selFunil);
const tabContentMap={funis:tabFunis,etapas:tabEtapas,direcionamento:tabDirecionamento,fluxo:tabFluxo,campos:tabCampos,acoes:tabAcoes,proxacoes:tabProxAcoes,validacoes:tabValidacoes};

const motorCard='<div class="card" style="margin-bottom:18px" id="motorFunilCard"><div class="card-head"><h3>Motor do Funil</h3></div>'+
'<div style="padding:14px 20px 0"><div class="seg" id="motorTabs" style="overflow-x:auto;max-width:100%">'+renderMotorTabs()+'</div></div>'+
'<div id="motorTabContent" style="padding:18px 20px 20px">'+(tabContentMap[motorTab]||'')+'</div></div>';

const preview=selFunil?selFunil.etapas.map(e=>'<div class="col" style="min-width:200px;flex:0 0 200px"><div class="col-head"><i class="dt" style="background:'+e.cor+'"></i><h4>'+esc(e.nome)+'</h4></div><div class="col-sum">SLA: '+esc(e.sla)+'</div></div>').join(''):'';
const previewCard='<div class="card"><div class="card-head"><h3>Pré-visualização do funil</h3><span class="count">Ilustrativo · <b>'+esc(selFunil?selFunil.nome:'—')+'</b></span></div>'+
'<div style="padding:18px 20px"><div class="board">'+preview+'</div></div></div>';

panel.innerHTML=topSelector+previewCard+motorCard;
attachFunisEvents();
}

function attachFunisEvents(){
const panel=document.getElementById('cfg-funis');
const nf=document.getElementById('newFunilBtn');if(nf)nf.addEventListener('click',()=>openFunilModal(null));
panel.querySelectorAll('[data-funsel]').forEach(b=>b.addEventListener('click',()=>{funilSelIdx=parseInt(b.dataset.funsel);renderFunisPanel();}));
panel.querySelectorAll('[data-funedit]').forEach(b=>b.addEventListener('click',()=>openFunilModal(parseInt(b.dataset.funedit))));
panel.querySelectorAll('[data-fundup]').forEach(b=>b.addEventListener('click',()=>{const i=parseInt(b.dataset.fundup);const c=JSON.parse(JSON.stringify(FUNIS[i]));c.nome=c.nome+' (cópia)';FUNIS.splice(i+1,0,c);renderFunisPanel();}));
panel.querySelectorAll('[data-fundel]').forEach(b=>b.addEventListener('click',()=>{const i=parseInt(b.dataset.fundel);if(confirm('Excluir este funil?')){FUNIS.splice(i,1);if(funilSelIdx>=FUNIS.length)funilSelIdx=Math.max(0,FUNIS.length-1);renderFunisPanel();}}));
const fp=document.getElementById('funilAtualSelect');if(fp)fp.addEventListener('change',()=>{funilSelIdx=parseInt(fp.value);validEtapaIdx=0;renderFunisPanel();});
panel.querySelectorAll('#motorTabs [data-tab]').forEach(b=>b.addEventListener('click',()=>{motorTab=b.dataset.tab;renderFunisPanel();}));
const ne=document.getElementById('newEtapaBtn');if(ne)ne.addEventListener('click',()=>openEtapaModal(null));
panel.querySelectorAll('[data-etpup]').forEach(b=>b.addEventListener('click',()=>{const i=parseInt(b.dataset.etpup);if(i>0){const arr=FUNIS[funilSelIdx].etapas;[arr[i-1],arr[i]]=[arr[i],arr[i-1]];renderFunisPanel();}}));
panel.querySelectorAll('[data-etpdown]').forEach(b=>b.addEventListener('click',()=>{const i=parseInt(b.dataset.etpdown);const arr=FUNIS[funilSelIdx].etapas;if(i<arr.length-1){[arr[i+1],arr[i]]=[arr[i],arr[i+1]];renderFunisPanel();}}));
panel.querySelectorAll('[data-etpedit]').forEach(b=>b.addEventListener('click',()=>openEtapaModal(parseInt(b.dataset.etpedit))));
panel.querySelectorAll('[data-etpdel]').forEach(b=>b.addEventListener('click',()=>{const i=parseInt(b.dataset.etpdel);if(confirm('Excluir esta etapa?')){FUNIS[funilSelIdx].etapas.splice(i,1);renderFunisPanel();}}));
panel.querySelectorAll('[data-fluxo-origin]').forEach(ci=>ci.addEventListener('click',e=>{e.preventDefault();ci.classList.toggle('on');}));
panel.querySelectorAll('#fluxoRetornoRG .radio-opt').forEach(opt=>opt.addEventListener('click',()=>{opt.parentElement.querySelectorAll('.radio-opt').forEach(o=>o.classList.remove('sel'));opt.classList.add('sel');}));
panel.querySelectorAll('[data-fluxo-acao]').forEach(ci=>ci.addEventListener('click',e=>{e.preventDefault();ci.classList.toggle('on');}));
const ndb=document.getElementById('newDirecBtn');if(ndb)ndb.addEventListener('click',()=>{const f=FUNIS[funilSelIdx];f.direcionamentos=f.direcionamentos||[];f.direcionamentos.push({etapa:'',condTipo:'',condValor:'',destTipo:'',destValor:''});renderFunisPanel();});
panel.querySelectorAll('[data-direcdel]').forEach(b=>b.addEventListener('click',()=>{FUNIS[funilSelIdx].direcionamentos.splice(parseInt(b.dataset.direcdel),1);renderFunisPanel();}));
panel.querySelectorAll('select[data-direc]').forEach(sl=>sl.addEventListener('change',()=>{const r=FUNIS[funilSelIdx].direcionamentos[parseInt(sl.dataset.i)];if(!r)return;r[sl.dataset.direc]=sl.value;if(sl.dataset.direc==='condTipo')r.condValor='';if(sl.dataset.direc==='destTipo')r.destValor='';renderFunisPanel();}));
const sdb=document.getElementById('saveDirecBtn');if(sdb)sdb.addEventListener('click',saveDirecionamentos);
const sfb=document.getElementById('saveFluxoBtn');if(sfb)sfb.addEventListener('click',saveFluxo);
panel.querySelectorAll('[data-campos-origin]').forEach(ci=>ci.addEventListener('click',e=>{e.preventDefault();ci.classList.toggle('on');}));
const scb=document.getElementById('saveCamposBtn');if(scb)scb.addEventListener('click',saveCampos);
panel.querySelectorAll('[data-acao-origin]').forEach(ci=>ci.addEventListener('click',e=>{e.preventDefault();ci.classList.toggle('on');}));
const sab=document.getElementById('saveAcoesBtn');if(sab)sab.addEventListener('click',saveAcoes);
const ves=document.getElementById('validEtapaSelect');if(ves)ves.addEventListener('change',()=>{validEtapaIdx=parseInt(ves.value);renderFunisPanel();});
panel.querySelectorAll('[data-valid-item]').forEach(ci=>ci.addEventListener('click',e=>{e.preventDefault();ci.classList.toggle('on');}));
panel.querySelectorAll('#validAcaoRG .radio-opt').forEach(opt=>opt.addEventListener('click',()=>{opt.parentElement.querySelectorAll('.radio-opt').forEach(o=>o.classList.remove('sel'));opt.classList.add('sel');}));
const svb=document.getElementById('saveValidBtn');if(svb)svb.addEventListener('click',saveValidacoes);
const npa=document.getElementById('newProxAcaoBtn');if(npa)npa.addEventListener('click',()=>openProxAcaoModal(null));
panel.querySelectorAll('[data-paedit]').forEach(b=>b.addEventListener('click',()=>openProxAcaoModal(parseInt(b.dataset.paedit))));
panel.querySelectorAll('[data-padel]').forEach(b=>b.addEventListener('click',()=>{const i=parseInt(b.dataset.padel);if(confirm('Excluir esta Próxima Ação da biblioteca?')){PROX_ACOES.splice(i,1);renderFunisPanel();}}));
}

function saveCampos(){
const f=FUNIS[funilSelIdx];const panel=document.getElementById('cfg-funis');
f.etapas.forEach((e,i)=>{e.camposAvanco=[...panel.querySelectorAll('[data-campos-origin="'+i+'"].on')].map(x=>x.dataset.val);});
const msg=document.getElementById('camposSavedMsg');
if(msg){msg.style.opacity='1';setTimeout(()=>{msg.style.opacity='0';},2200);}
}

function saveAcoes(){
const f=FUNIS[funilSelIdx];const panel=document.getElementById('cfg-funis');
f.etapas.forEach((e,i)=>{e.acoesAutomaticas=[...panel.querySelectorAll('[data-acao-origin="'+i+'"].on')].map(x=>x.dataset.val);});
const msg=document.getElementById('acoesSavedMsg');
if(msg){msg.style.opacity='1';setTimeout(()=>{msg.style.opacity='0';},2200);}
}

function saveValidacoes(){
const f=FUNIS[funilSelIdx];const panel=document.getElementById('cfg-funis');
const e=f.etapas[validEtapaIdx];if(!e)return;
e.validacoes=[...panel.querySelectorAll('[data-valid-item].on')].map(x=>x.dataset.val);
const acaoSel=panel.querySelector('#validAcaoRG .radio-opt.sel');
e.validacaoAcao=acaoSel?acaoSel.dataset.val:'Bloquear avanço';
renderFunisPanel();
const msg=document.getElementById('validSavedMsg');
if(msg){msg.style.opacity='1';setTimeout(()=>{msg.style.opacity='0';},2200);}
}

function saveFluxo(){
const f=FUNIS[funilSelIdx];const panel=document.getElementById('cfg-funis');
f.etapas.forEach((e,i)=>{e.avancarPara=[...panel.querySelectorAll('[data-fluxo-origin="'+i+'"].on')].map(x=>x.dataset.val);});
const retornoSel=panel.querySelector('#fluxoRetornoRG .radio-opt.sel');
f.fluxo={permitirRetorno:retornoSel?retornoSel.dataset.val:'Não',acoes:(f.fluxo&&f.fluxo.acoes)||[]};
const msg=document.getElementById('fluxoSavedMsg');
if(msg){msg.style.opacity='1';setTimeout(()=>{msg.style.opacity='0';},2200);}
}

/* Modal Funil */
const funilOverlay=document.getElementById('funilOverlay');
let funilEditIdx=null;
function rgSet(id,val){document.querySelectorAll('#'+id+' .radio-opt').forEach(o=>o.classList.toggle('sel',o.dataset.val===val));}
function rgVal(id){const s=document.querySelector('#'+id+' .radio-opt.sel');return s?s.dataset.val:'';}
document.querySelectorAll('#funStatusRG .radio-opt').forEach(opt=>opt.addEventListener('click',()=>{opt.parentElement.querySelectorAll('.radio-opt').forEach(o=>o.classList.remove('sel'));opt.classList.add('sel');}));
function openFunilModal(idx){
funilEditIdx=idx;
const f=idx!=null?FUNIS[idx]:{nome:'',grupo:'',tipo:'Pessoa Física',status:'Ativo'};
document.getElementById('funilModalTitle').textContent=idx==null?'Novo Funil':'Editar Funil';
document.getElementById('funNome').value=f.nome;
const funGrupoEl=document.getElementById('funGrupo');
if(funGrupoEl){
const grupos=((typeof CFG!=='undefined'&&CFG.grupo&&CFG.grupo.data)||[]).map(g=>g.grupo);
funGrupoEl.innerHTML='<option value="">Selecione o grupo de plano</option>'+grupos.map(n=>'<option value="'+escA(n)+'">'+esc(n)+'</option>').join('');
funGrupoEl.value=f.grupo||'';
}
rgSet('funStatusRG',f.status);
funilOverlay.classList.add('open');
}
function closeFunilModal(){funilOverlay.classList.remove('open')}
document.getElementById('funilCloseBtn').addEventListener('click',closeFunilModal);
document.getElementById('funilCancel').addEventListener('click',closeFunilModal);
funilOverlay.addEventListener('click',e=>{if(e.target===funilOverlay)closeFunilModal()});
document.getElementById('funilSave').addEventListener('click',()=>{
const nome=document.getElementById('funNome').value.trim();
if(!nome){document.getElementById('funNome').classList.add('err');return}
document.getElementById('funNome').classList.remove('err');
const rec={nome:nome,grupo:(document.getElementById('funGrupo')||{value:''}).value,tipo:(funilEditIdx!=null?FUNIS[funilEditIdx].tipo:''),status:rgVal('funStatusRG')};
if(funilEditIdx==null){rec.etapas=[];rec.direcionamentos=[];FUNIS.push(rec);funilSelIdx=FUNIS.length-1;}
else{Object.assign(FUNIS[funilEditIdx],rec);}
closeFunilModal();renderFunisPanel();
});

/* Modal Etapa */
const etapaOverlay=document.getElementById('etapaOverlay');
let etapaEditIdx=null;
document.querySelectorAll('#etpObrigRG .radio-opt,#etpAtivaRG .radio-opt,#etpAvancarRG .radio-opt').forEach(opt=>opt.addEventListener('click',()=>{opt.parentElement.querySelectorAll('.radio-opt').forEach(o=>o.classList.remove('sel'));opt.classList.add('sel');}));
function openEtapaModal(idx){
etapaEditIdx=idx;
const arr=FUNIS[funilSelIdx].etapas;
const e=idx!=null?arr[idx]:{nome:'',cor:'#0ea5b7',descricao:'',sla:'',obrigatoria:'Sim',ativa:'Sim',avancarQualquer:'Não',tipo:''};
document.getElementById('etapaModalTitle').textContent=idx==null?'Nova Etapa':'Editar Etapa';
document.getElementById('etpNome').value=e.nome;
document.getElementById('etpCor').value=e.cor;
const etpSlaEl=document.getElementById('etpSla');etpSlaEl.value=toClock(e.sla);clockMask(etpSlaEl);
rgSet('etpObrigRG',e.obrigatoria);rgSet('etpAtivaRG',e.ativa);rgSet('etpAvancarRG',e.avancarQualquer);
etapaOverlay.classList.add('open');
}
function closeEtapaModal(){etapaOverlay.classList.remove('open')}
document.getElementById('etapaCloseBtn').addEventListener('click',closeEtapaModal);
document.getElementById('etapaCancel').addEventListener('click',closeEtapaModal);
etapaOverlay.addEventListener('click',e=>{if(e.target===etapaOverlay)closeEtapaModal()});
document.getElementById('etapaSave').addEventListener('click',()=>{
const nome=document.getElementById('etpNome').value.trim();
if(!nome){document.getElementById('etpNome').classList.add('err');return}
document.getElementById('etpNome').classList.remove('err');
const rec={nome:nome,cor:document.getElementById('etpCor').value,sla:document.getElementById('etpSla').value.trim()||'—',obrigatoria:rgVal('etpObrigRG'),ativa:rgVal('etpAtivaRG'),avancarQualquer:rgVal('etpAvancarRG')};
const arr=FUNIS[funilSelIdx].etapas;
if(etapaEditIdx==null)arr.push(rec);else Object.assign(arr[etapaEditIdx],rec);
closeEtapaModal();renderFunisPanel();
});

/* Modal Próxima Ação (Biblioteca) */
const proxAcaoOverlay=document.getElementById('proxAcaoOverlay');
let proxAcaoEditIdx=null;
function openProxAcaoModal(idx){
proxAcaoEditIdx=idx;
const p=idx!=null?PROX_ACOES[idx]:{nome:'',descricao:'',etapa:'',tipo:'Ligação',prazo:'15 minutos',prioridade:'Normal',automatica:'Não',status:'Ativo'};
document.getElementById('proxAcaoModalTitle').textContent=idx==null?'Nova Próxima Ação':'Editar Próxima Ação';
document.getElementById('paNome').value=p.nome;
document.getElementById('paDescricao').value=p.descricao||'';
const paEtapaEl=document.getElementById('paEtapa');
if(paEtapaEl){
const paEtapas=((FUNIS[funilSelIdx]&&FUNIS[funilSelIdx].etapas)||[]).map(e=>e.nome).concat(p.etapa&&!((FUNIS[funilSelIdx]&&FUNIS[funilSelIdx].etapas)||[]).some(e=>e.nome===p.etapa)?[p.etapa]:[]);
paEtapaEl.innerHTML='<option value="">Todas as etapas</option>'+paEtapas.map(n=>'<option value="'+escA(n)+'">'+esc(n)+'</option>').join('');
paEtapaEl.value=p.etapa||'';
}
document.getElementById('paTipo').value=p.tipo;
const paPrazoEl=document.getElementById('paPrazo');paPrazoEl.value=toClock(p.prazo);clockMask(paPrazoEl);
document.getElementById('paPrioridade').value=p.prioridade;
rgSet('paAutoRG',p.automatica);
rgSet('paStatusRG',p.status);
proxAcaoOverlay.classList.add('open');
}
function closeProxAcaoModal(){proxAcaoOverlay.classList.remove('open')}
document.getElementById('proxAcaoCloseBtn').addEventListener('click',closeProxAcaoModal);
document.getElementById('proxAcaoCancel').addEventListener('click',closeProxAcaoModal);
proxAcaoOverlay.addEventListener('click',e=>{if(e.target===proxAcaoOverlay)closeProxAcaoModal()});
document.getElementById('proxAcaoSave').addEventListener('click',()=>{
const nome=document.getElementById('paNome').value.trim();
if(!nome){document.getElementById('paNome').classList.add('err');return}
document.getElementById('paNome').classList.remove('err');
const rec={nome:nome,descricao:document.getElementById('paDescricao').value.trim(),etapa:(document.getElementById('paEtapa')||{value:''}).value,tipo:document.getElementById('paTipo').value,prazo:document.getElementById('paPrazo').value.trim()||'00:00:00',prioridade:document.getElementById('paPrioridade').value,automatica:rgVal('paAutoRG'),status:rgVal('paStatusRG')};
if(proxAcaoEditIdx==null)PROX_ACOES.push(rec);else Object.assign(PROX_ACOES[proxAcaoEditIdx],rec);
closeProxAcaoModal();renderFunisPanel();
});

renderFunisPanel();
