/* ============================================================
 * Motor de Configurações — tabelas dinâmicas (CFG) usadas na tela Configurações
 * Extraído do <script> original (bloco contíguo, ordem de execução
 * preservada). Nenhuma linha de lógica foi reescrita.
 * ============================================================ */
const AREA_MAP={'UF':'uf','CEP':'cep','Cidade':'cidade','Bairro':'bairro','Condomínio':'condominio','Logradouro':'logradouro'};
const CFG={
vend:{title:'Colaboradores',cols:[
{key:'nome',label:'Nome',type:'text'},
{key:'funcao',label:'Função',type:'radio',options:['Vendedor','Supervisor','Coordenador','Diretor','Atendente']},
{key:'limitar',label:'Limitação de planos',type:'radio',options:['Sim','Não']},
{key:'planos',label:'Selecionar planos',type:'checkdrop',source:'grupo',showIf:{key:'limitar',eq:'Sim'}},
{key:'status',label:'Status',type:'radio',options:['Ativo','Inativo']}],data:[
{nome:'Renatha Loiola',funcao:'Vendedor',limitar:'Sim',planos:['Residencial Fibra'],status:'Ativo'},
{nome:'Ana Lima',funcao:'Supervisor',limitar:'Não',planos:[],status:'Ativo'},
{nome:'João Prado',funcao:'Atendente',limitar:'Sim',planos:['Combos'],status:'Inativo'}]},
plan:{title:'Planos',cols:[
{key:'plano',label:'Plano',type:'text'},
{key:'tecnologia',label:'Tecnologia',type:'radio',options:['Fibra','Wireless'],hideInTable:true},
{key:'tipo',label:'Tipo',type:'radio',options:['Internet','Streaming','HUB SVA','Transporte','Link dedicado']},
{key:'veldown',label:'Velocidade down',type:'text',hideInTable:true},
{key:'velup',label:'Velocidade up',type:'text',hideInTable:true},
{key:'mensalidades',label:'Mensalidades',type:'text',hideInTable:true},
{key:'valor',label:'Valor',type:'text'},
{key:'limarea',label:'Limitação de áreas',type:'radio',options:['Sim','Não']},
{key:'selarea',label:'Selecionar áreas',type:'checkdrop',source:'area',showIf:{key:'limarea',eq:'Sim'},hideInTable:true},
{key:'vendaapp',label:'Venda app CRM',type:'radio',options:['Sim','Não']},
{key:'fiscal',label:'Composição fiscal',type:'text',hideInTable:true},
{key:'status',label:'Status',type:'radio',options:['Ativo','Inativo']}],data:[
{plano:'Fibra 300',tecnologia:'Fibra',tipo:'Internet',veldown:'300 Mega',velup:'150 Mega',mensalidades:'12x',valor:'R$ 79,90',limarea:'Sim',selarea:['Setor Central'],vendaapp:'Sim',fiscal:'SCM',status:'Ativo'},
{plano:'Fibra 500',tecnologia:'Fibra',tipo:'Internet',veldown:'500 Mega',velup:'250 Mega',mensalidades:'12x',valor:'R$ 99,90',limarea:'Sim',selarea:['Setor Central','Anápolis'],vendaapp:'Sim',fiscal:'SCM',status:'Ativo'},
{plano:'Radar Play',tecnologia:'Wireless',tipo:'Streaming',veldown:'—',velup:'—',mensalidades:'Mensal',valor:'R$ 19,90',limarea:'Não',selarea:[],vendaapp:'Não',fiscal:'SVA',status:'Ativo'}]},
meta:{title:'Metas e comissões',cols:[
{key:'cargo',label:'Cargo',type:'radio',options:['Atendente','Vendedor','Supervisor','Coordenador','Diretor']},
{key:'meta',label:'Meta',type:'radio',options:['Quantidade','Valor']},
{key:'metaQtd',label:'Quantidade',type:'text',showIf:{key:'meta',eq:'Quantidade'}},
{key:'metaValor',label:'Valor (R$)',type:'text',showIf:{key:'meta',eq:'Valor'}},
{key:'faixas',label:'Faixas de comissão',type:'tiers'},
{key:'periodo',label:'Período',type:'radio',options:['Diário','Semanal','Mensal']}],data:[
{cargo:'Vendedor',meta:'Quantidade',metaQtd:'25 vendas',metaValor:'',faixas:[{at:'< 100%',com:'R$ 0,00'},{at:'>= 100%',com:'R$ 1.000,00'},{at:'>= 125%',com:'R$ 1.500,00'},{at:'>= 150%',com:'R$ 2.000,00'}],periodo:'Mensal'},
{cargo:'Supervisor',meta:'Valor',metaQtd:'',metaValor:'R$ 120.000,00',faixas:[{at:'< 100%',com:'0%'},{at:'>= 100%',com:'1,2%'}],periodo:'Mensal'},
{cargo:'Atendente',meta:'Quantidade',metaQtd:'40 atendimentos',metaValor:'',faixas:[{at:'>= 100%',com:'R$ 500,00'}],periodo:'Semanal'}]},
area:{title:'Área de vendas',optLabel:r=>{const k=AREA_MAP[r.considerar];return (k&&r[k]?r[k]:(r.considerar||'—'))},cols:[
{key:'considerar',label:'Considerar',type:'radio',options:['UF','CEP','Cidade','Bairro','Condomínio','Logradouro']},
{key:'uf',label:'UF',type:'text'},
{key:'cep',label:'CEP',type:'text'},
{key:'cidade',label:'Cidade',type:'text'},
{key:'bairro',label:'Bairro',type:'text'},
{key:'condominio',label:'Condomínio',type:'text'},
{key:'logradouro',label:'Logradouro',type:'text'}],data:[
{considerar:'Bairro',uf:'GO',cep:'74000-000',cidade:'Goiânia',bairro:'Setor Central',condominio:'',logradouro:'Rua 10'},
{considerar:'Cidade',uf:'GO',cep:'75100-000',cidade:'Anápolis',bairro:'Jundiaí',condominio:'',logradouro:'Av. Brasil'},
{considerar:'Condomínio',uf:'GO',cep:'76330-000',cidade:'Jaraguá',bairro:'Centro',condominio:'Res. das Águas',logradouro:'Rua 3'}]},
grupo:{title:'Grupo de planos',cols:[
{key:'grupo',label:'Grupo',type:'text'},
{key:'planos',label:'Planos',type:'checkdrop',source:'plan'},
{key:'status',label:'Status',type:'radio',options:['Ativo','Inativo']}],data:[
{grupo:'Residencial Fibra',planos:['Fibra 300','Fibra 500'],status:'Ativo'},
{grupo:'Empresarial',planos:['Fibra 500'],status:'Ativo'},
{grupo:'Combos',planos:['Fibra 300','Radar Play'],status:'Ativo'}]},
pagamento:{title:'Formas de pagamento',cols:[
{key:'tipo',label:'Tipo',type:'radio',options:['Adesão','Mensalidade']},
{key:'descricao',label:'Descrição',type:'text'},
{key:'parcelas',label:'Parcelas',type:'text'},
{key:'valor',label:'Valor',type:'text'},
{key:'cobranca',label:'Tipo',type:'radio',options:['À vista','Parcelado']},
{key:'limitar',label:'Limitação de planos',type:'radio',options:['Sim','Não']},
{key:'selplanos',label:'Selecionar planos',type:'checkdrop',source:'plan',showIf:{key:'limitar',eq:'Sim'},hideInTable:true},
{key:'derivacao',label:'Plano de composição de derivação',type:'text',hideInTable:true}],data:[
{tipo:'Adesão',descricao:'Taxa de adesão',parcelas:'1x',valor:'R$ 99,90',cobranca:'À vista',limitar:'Não',selplanos:[],derivacao:''},
{tipo:'Mensalidade',descricao:'Mensalidade recorrente',parcelas:'até 12x',valor:'R$ 99,90',cobranca:'Parcelado',limitar:'Sim',selplanos:['Fibra 500'],derivacao:'SCM 60%'},
{tipo:'Mensalidade',descricao:'Serviço SVA',parcelas:'Mensal',valor:'R$ 19,90',cobranca:'À vista',limitar:'Sim',selplanos:['Radar Play'],derivacao:'SVA 100%'}]},
perda:{title:'Motivos de perda',cols:[
{key:'motivo',label:'Motivo',type:'text'},
{key:'status',label:'Status',type:'radio',options:['Ativo','Inativo']}],data:[
{motivo:'Preço acima do esperado',status:'Ativo'},
{motivo:'Sem cobertura no endereço',status:'Ativo'},
{motivo:'Optou por concorrente',status:'Ativo'}]},
nf:{title:'NF',steps:['Composição de valor e Imposto','Serviço e tributos NFCom'],cols:[
{key:'descDerivacao',label:'Descrição derivação',type:'text',step:1,group:'Composição de valor'},
{key:'fracao',label:'Fração',type:'text',step:1,group:'Composição de valor',hideInTable:true},
{key:'tipoDocumento',label:'Tipo do documento',type:'select',step:1,group:'Composição de valor',options:['NFCom','NF21','NF22','NFS-e','NF-e (livros digitais)','Outros']},
{key:'tributacao',label:'Tributação',type:'select',step:1,group:'Composição de valor',options:['Tributar conforme alíquota','Isentar integralmente','Outros valores']},
{key:'excedente',label:'Excedente base de cálculo',type:'radio',step:1,group:'Composição de valor',options:['Isentar','Não isentar'],hideInTable:true},
{key:'tabelaIsencoes',label:'Tabela de isenções/reduções',type:'select',step:1,group:'Composição de valor',hideInTable:true,options:['Nenhuma redução/isenção','Programa Governo Eletrônico','Programa Internet Popular','Programa de internet destinado a escolas','Programa de acesso Individual Classe Especial','Prestação de serviço de TV Assinatura','Prestação de serviço e provimento de acesso a internet','Outros']},
{key:'emitente',label:'Emitente',type:'select',step:1,group:'Imposto',source:'vend',hideInTable:true},
{key:'tipoServico',label:'Tipo de serviço utilizado',type:'select',step:1,group:'Imposto',hideInTable:true,options:['TV por assinatura','Multimídia','Provimento de acesso à internet','Outros']},
{key:'pctBaseCalculo',label:'% Base de cálculo',type:'text',step:1,group:'Imposto',hideInTable:true},
{key:'pctICMS1',label:'% ICMS',type:'text',step:1,group:'Imposto',hideInTable:true},
{key:'aliqPIS1',label:'Alíquota PIS',type:'text',step:1,group:'Imposto',hideInTable:true},
{key:'aliqCONFINS1',label:'Alíquota CONFINS',type:'text',step:1,group:'Imposto',hideInTable:true},
{key:'cst',label:'CST',type:'text',step:1,group:'Imposto',hideInTable:true},
{key:'csll',label:'CSLL',type:'text',step:1,group:'Imposto',hideInTable:true},
{key:'irpj',label:'IRPJ',type:'text',step:1,group:'Imposto',hideInTable:true},
{key:'pctIR',label:'% IR',type:'text',step:1,group:'Imposto',hideInTable:true},
{key:'descServico',label:'Descrição',type:'text',step:2,group:'Informações do serviço',hideInTable:true},
{key:'unidadeNFCom',label:'Unidade NFCom',type:'select',step:2,group:'Informações do serviço',hideInTable:true,options:['MIN','MB','GB','UN']},
{key:'tipoServico2',label:'Tipo de serviço utilizado',type:'select',step:2,group:'Informações do serviço',hideInTable:true,options:['TV por assinatura','Multimídia','Provimento de acesso à internet','Outros']},
{key:'descTributos',label:'Descrição',type:'text',step:2,group:'Composição dos tributos NFCom',hideInTable:true},
{key:'classifItem',label:'Classificação do item',type:'text',step:2,group:'Composição dos tributos NFCom',hideInTable:true},
{key:'sitTribPIS',label:'Situação tributária PIS',type:'text',step:2,group:'PIS e CONFINS',hideInTable:true},
{key:'sitTribCONFINS',label:'Situação tributária CONFINS',type:'text',step:2,group:'PIS e CONFINS',hideInTable:true},
{key:'aliqPIS2',label:'Alíquota PIS',type:'text',step:2,group:'PIS e CONFINS',hideInTable:true},
{key:'aliqCONFINS2',label:'Alíquota CONFINS',type:'text',step:2,group:'PIS e CONFINS',hideInTable:true},
{key:'aliqFUST',label:'Alíquota FUST',type:'text',step:2,group:'FUST e FUNTTEL',hideInTable:true},
{key:'aliqFUNTTEL',label:'Alíquota FUNTTEL',type:'text',step:2,group:'FUST e FUNTTEL',hideInTable:true},
{key:'sitTribICMS',label:'Situação tributária ou situação da operação',type:'text',step:2,group:'ICMS',hideInTable:true},
{key:'aliqICMS',label:'Alíquota ICMS',type:'text',step:2,group:'ICMS',hideInTable:true},
{key:'pctFCP',label:'% FCP',type:'text',step:2,group:'ICMS',hideInTable:true},
{key:'pctRetPIS',label:'% Retenção PIS',type:'text',step:2,group:'Informações de retenção de tributos federais',hideInTable:true},
{key:'pctRetCONFINS',label:'% Retenção CONFINS',type:'text',step:2,group:'Informações de retenção de tributos federais',hideInTable:true},
{key:'pctRetCSLL',label:'% Retenção CSLL',type:'text',step:2,group:'Informações de retenção de tributos federais',hideInTable:true},
{key:'pctRetIRRF',label:'% Retenção IRRF',type:'text',step:2,group:'Informações de retenção de tributos federais',hideInTable:true},
{key:'pctIBSMunicipal',label:'% IBS Municipal',type:'text',step:2,group:'Informações de retenção de tributos federais',hideInTable:true},
{key:'pctIBSEstadual',label:'% IBS Estadual',type:'text',step:2,group:'Informações de retenção de tributos federais',hideInTable:true},
{key:'pctCBS',label:'% CBS',type:'text',step:2,group:'Informações de retenção de tributos federais',hideInTable:true},
{key:'classifTributaria',label:'Classificação tributária',type:'text',step:2,group:'Informações de retenção de tributos federais',hideInTable:true},
{key:'status',label:'Status',type:'radio',step:2,group:'Informações de retenção de tributos federais',options:['Ativo','Inativo']}],data:[
{descDerivacao:'SCM Internet',fracao:'1/1',tipoDocumento:'NFCom',tributacao:'Tributar conforme alíquota',excedente:'Isentar',tabelaIsencoes:'Nenhuma redução/isenção',emitente:'Renatha Loiola',tipoServico:'Provimento de acesso à internet',pctBaseCalculo:'100%',pctICMS1:'18%',aliqPIS1:'0,65%',aliqCONFINS1:'3%',cst:'01',csll:'9%',irpj:'15%',pctIR:'1,5%',descServico:'Internet fibra residencial',unidadeNFCom:'MB',tipoServico2:'Provimento de acesso à internet',descTributos:'Tributos sobre serviço de internet',classifItem:'001',sitTribPIS:'01',sitTribCONFINS:'01',aliqPIS2:'0,65%',aliqCONFINS2:'3%',aliqFUST:'1%',aliqFUNTTEL:'0,5%',sitTribICMS:'00',aliqICMS:'18%',pctFCP:'2%',pctRetPIS:'0%',pctRetCONFINS:'0%',pctRetCSLL:'0%',pctRetIRRF:'0%',pctIBSMunicipal:'0%',pctIBSEstadual:'0%',pctCBS:'0%',classifTributaria:'000001',status:'Ativo'}]},
camp:{title:'Campanhas promocionais',cols:[
{key:'campanha',label:'Campanha',type:'text'},
{key:'dtini',label:'Data inicial',type:'date'},
{key:'dtfim',label:'Data final',type:'date'},
{key:'tipodesc',label:'Tipo de desconto',type:'radio',options:['Porcentagem','Valor']},
{key:'descPct',label:'Porcentagem',type:'text',showIf:{key:'tipodesc',eq:'Porcentagem'}},
{key:'descVal',label:'Valor',type:'text',showIf:{key:'tipodesc',eq:'Valor'}},
{key:'mensalidades',label:'Quantidade de mensalidades com desconto',type:'text'},
{key:'limitar',label:'Limitação de planos',type:'radio',options:['Sim','Não']},
{key:'selplanos',label:'Selecionar planos',type:'checkdrop',source:'plan',showIf:{key:'limitar',eq:'Sim'},hideInTable:true}],data:[
{campanha:'Fibra 500 · Julho',dtini:'2026-07-01',dtfim:'2026-07-31',tipodesc:'Porcentagem',descPct:'50%',descVal:'',mensalidades:'3',limitar:'Sim',selplanos:['Fibra 500']},
{campanha:'Black Friday Internet',dtini:'2026-11-20',dtfim:'2026-11-30',tipodesc:'Porcentagem',descPct:'50%',descVal:'',mensalidades:'3',limitar:'Não',selplanos:[]},
{campanha:'Indique e Ganhe',dtini:'2026-01-01',dtfim:'2026-12-31',tipodesc:'Valor',descPct:'',descVal:'R$ 50,00',mensalidades:'1',limitar:'Sim',selplanos:['Fibra 300','Fibra 500']}]}
};
function cK(c){return Array.isArray(c)?c[0]:c.key}
function cL(c){return Array.isArray(c)?c[1]:c.label}
function cT(c){return Array.isArray(c)?'text':(c.type||'text')}
function cOpts(c){if(c.source){const s=CFG[c.source];if(s.optLabel)return s.data.map(s.optLabel);const kk=cK(s.cols[0]);return s.data.map(r=>r[kk]);}return c.options||[]}
function cfgBadge(v){const g=/ativ/i.test(v),r=/inativ|cancel/i.test(v),n=/agend/i.test(v);return '<span class="badge '+(g?'b-won':r?'b-lost':n?'b-new':'b-contact')+'">'+esc(v)+'</span>'}
function tierRow(r){return '<div class="tier-row"><input class="tier-at" placeholder="Atingimento (ex.: >= 100%)" value="'+escA(r.at||'')+'"><input class="tier-com" placeholder="Comissão" value="'+escA(r.com||'')+'"><button type="button" class="tier-del"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:15px;height:15px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'}
const editIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
const delIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
const plusIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" style="width:16px;height:16px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
const dupIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
function cfgCell(col,row,first){
const k=cK(col),v=row[k];
if(k==='status')return cfgBadge(v);
if(Array.isArray(v))return v.length?(typeof v[0]==='object'?'<span class="chip-soft">'+v.length+' faixa(s)</span>':v.map(x=>'<span class="chip-soft">'+esc(x)+'</span>').join(' ')):'—';
return '<span style="font-weight:'+(first?'600':'400')+';color:'+(first?'var(--body-strong)':'var(--body)')+'">'+esc(v)+'</span>';
}
function renderCfg(key){
const c=CFG[key];const panel=document.getElementById('cfg-'+key);
const isNf=key==='nf';
const tcols=c.cols.filter(col=>!col.hideInTable);
let html='<div class="card"><div class="card-head"><h3>'+c.title+'</h3><button class="btn-primary" id="new-'+key+'">'+plusIco+'Novo</button></div><div class="table-wrap"><table class="cfg-table"><thead><tr>'+tcols.map(col=>'<th>'+cL(col)+'</th>').join('')+'<th></th></tr></thead><tbody>';
html+=c.data.map((row,i)=>'<tr>'+tcols.map((col,ci)=>'<td>'+cfgCell(col,row,ci===0)+'</td>').join('')+'<td><div class="cfg-acts">'+(isNf?'<button class="row-act" data-dup="'+i+'">'+dupIco+'</button>':'')+'<button class="row-act" data-edit="'+i+'">'+editIco+'</button><button class="row-act del" data-del="'+i+'">'+delIco+'</button></div></td></tr>').join('');
html+='</tbody></table></div></div>';
panel.innerHTML=html;
document.getElementById('new-'+key).addEventListener('click',()=>openCfgEdit(key,null));
panel.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>openCfgEdit(key,parseInt(b.dataset.edit))));
panel.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',()=>{if(confirm('Excluir este registro?')){c.data.splice(parseInt(b.dataset.del),1);renderCfg(key);}}));
panel.querySelectorAll('[data-dup]').forEach(b=>b.addEventListener('click',()=>{const i=parseInt(b.dataset.dup);c.data.splice(i+1,0,JSON.parse(JSON.stringify(c.data[i])));renderCfg(key);}));
}
Object.keys(CFG).forEach(renderCfg);

const cfgOverlay=document.getElementById('cfgOverlay');
const cfgForm=document.getElementById('cfgForm');
const cfgBackBtn=document.getElementById('cfgBack');
const cfgSaveBtn=document.getElementById('cfgSave');
const cfgSaveDefaultHtml=cfgSaveBtn.innerHTML;
let cfgEditKey=null,cfgEditIdx=null,cfgStep=1,cfgMaxStep=1;
function cfgFieldHtml(col,idx,c){
const k=cK(col),label=cL(col),type=cT(col);
const cur=idx!=null?c.data[idx][k]:((type==='checks'||type==='checkdrop')?[]:'');
if(type==='radio'){
return '<div class="cfg-field" data-field="'+k+'"><label class="cfg-flabel">'+label+'</label><div class="radio-group cfg-rg" data-k="'+k+'">'+cOpts(col).map(o=>'<div class="radio-opt'+(o===cur?' sel':'')+'" data-val="'+escA(o)+'"><span class="rd"></span>'+esc(o)+'</div>').join('')+'</div></div>';
}
if(type==='select'){
return '<div class="cfg-field" data-field="'+k+'"><label class="cfg-flabel">'+label+'</label><div class="select"><select data-k="'+k+'">'+cOpts(col).map(o=>'<option value="'+escA(o)+'"'+(o===cur?' selected':'')+'>'+esc(o)+'</option>').join('')+'</select><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg></div></div>';
}
if(type==='checks'){
const arr=Array.isArray(cur)?cur:[];
return '<div class="cfg-field" data-field="'+k+'"><label class="cfg-flabel">'+label+'</label><div class="cfg-checks" data-k="'+k+'">'+cOpts(col).map(o=>'<label class="cfg-check-item'+(arr.includes(o)?' on':'')+'" data-val="'+escA(o)+'"><span class="cbox"></span>'+esc(o)+'</label>').join('')+'</div></div>';
}
if(type==='checkdrop'){
const arr=Array.isArray(cur)?cur:[];
const sum=arr.length?arr.length+' selecionado(s)':label;
return '<div class="cfg-field" data-field="'+k+'"><label class="cfg-flabel">'+label+'</label><div class="checkdrop" data-k="'+k+'"><button type="button" class="cd-btn"><span class="cd-sum">'+esc(sum)+'</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg></button><div class="cd-panel">'+cOpts(col).map(o=>'<label class="cd-item'+(arr.includes(o)?' on':'')+'" data-val="'+escA(o)+'"><span class="cbox"></span>'+esc(o)+'</label>').join('')+'</div></div></div>';
}
if(type==='tiers'){
const rows=Array.isArray(cur)?cur:[];
return '<div class="cfg-field" data-field="'+k+'"><label class="cfg-flabel">'+label+'</label><div class="tiers" data-k="'+k+'"><div class="tier-head"><span>Atingimento</span><span>Comissão</span><span></span></div><div class="tiers-list">'+rows.map(tierRow).join('')+'</div><button type="button" class="tier-add"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" style="width:14px;height:14px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Adicionar faixa</button></div></div>';
}
if(type==='date'){
return '<div class="fg" data-field="'+k+'"><label>'+label+'</label><input type="date" data-k="'+k+'" value="'+escA(cur)+'"></div>';
}
return '<div class="fg" data-field="'+k+'"><label>'+label+'</label><input type="text" data-k="'+k+'" value="'+escA(cur)+'" placeholder="'+escA(label)+'"></div>';
}
function cfgColsHtml(cols,idx,c){
let out='',lastGroup=null;
cols.forEach(col=>{
if(col.group&&col.group!==lastGroup){out+='<div class="pb-label">'+esc(col.group)+'</div>';lastGroup=col.group;}
out+=cfgFieldHtml(col,idx,c);
});
return out;
}
function updateStepUI(){
if(cfgMaxStep>1){
cfgForm.querySelectorAll('.cfg-step').forEach(d=>d.style.display=(parseInt(d.dataset.cfgstep)===cfgStep)?'':'none');
cfgForm.querySelectorAll('.fstep').forEach(f=>{const s=parseInt(f.dataset.fstep);f.classList.toggle('active',s===cfgStep);f.classList.toggle('done',s<cfgStep);});
cfgForm.querySelectorAll('.fline').forEach(l=>l.classList.toggle('on',parseInt(l.dataset.fline)<cfgStep));
cfgBackBtn.style.display=cfgStep>1?'':'none';
cfgSaveBtn.innerHTML=cfgStep<cfgMaxStep?'Avançar<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><polyline points="9 18 15 12 9 6"/></svg>':cfgSaveDefaultHtml;
}else{
cfgBackBtn.style.display='none';
cfgSaveBtn.innerHTML=cfgSaveDefaultHtml;
}
}
function openCfgEdit(key,idx){
cfgEditKey=key;cfgEditIdx=idx;const c=CFG[key];
cfgOverlay.querySelector('.cfgmodal').classList.toggle('cfgmodal-nf',key==='nf');
document.getElementById('cfgModalTitle').textContent=(idx==null?'Novo registro':'Editar registro')+' — '+c.title;
cfgMaxStep=c.cols.reduce((m,col)=>Math.max(m,col.step||1),1);
cfgStep=1;
if(cfgMaxStep>1){
const titles=c.steps||[];
let sh='<div class="wz-steps" style="padding:0 0 7px;border-bottom:1px solid var(--surface-line);margin-bottom:7px">';
for(let s=1;s<=cfgMaxStep;s++){
sh+='<div class="fstep'+(s===1?' active':'')+'" data-fstep="'+s+'"><span class="bub">'+s+'</span><div class="fl"><b>'+esc(titles[s-1]||('Etapa '+s))+'</b></div></div>';
if(s<cfgMaxStep)sh+='<div class="fline" data-fline="'+s+'"></div>';
}
sh+='</div>';
let body='';
for(let s=1;s<=cfgMaxStep;s++){
body+='<div class="cfg-step" data-cfgstep="'+s+'" style="'+(s===1?'':'display:none')+'">'+cfgColsHtml(c.cols.filter(col=>(col.step||1)===s),idx,c)+'</div>';
}
cfgForm.innerHTML=sh+body;
}else{
cfgForm.innerHTML=cfgColsHtml(c.cols,idx,c);
}
cfgForm.querySelectorAll('.cfg-rg .radio-opt').forEach(opt=>opt.addEventListener('click',()=>{const g=opt.parentElement;g.querySelectorAll('.radio-opt').forEach(o=>o.classList.remove('sel'));opt.classList.add('sel');if(g.dataset.k==='considerar')updateAreaRequired();updateConditionals();}));
cfgForm.querySelectorAll('.cfg-check-item').forEach(ci=>ci.addEventListener('click',e=>{e.preventDefault();ci.classList.toggle('on');}));
cfgForm.querySelectorAll('.cd-btn').forEach(btn=>btn.addEventListener('click',()=>btn.closest('.checkdrop').classList.toggle('open')));
cfgForm.querySelectorAll('.cd-item').forEach(it=>it.addEventListener('click',e=>{e.preventDefault();it.classList.toggle('on');const cd=it.closest('.checkdrop');const n=cd.querySelectorAll('.cd-item.on').length;const lbl=cd.closest('.cfg-field').querySelector('.cfg-flabel').textContent;cd.querySelector('.cd-sum').textContent=n?n+' selecionado(s)':lbl;}));
cfgForm.querySelectorAll('.tiers').forEach(t=>t.addEventListener('click',e=>{
if(e.target.closest('.tier-add')){e.preventDefault();t.querySelector('.tiers-list').insertAdjacentHTML('beforeend',tierRow({at:'',com:''}));}
else if(e.target.closest('.tier-del')){e.preventDefault();e.target.closest('.tier-row').remove();}
}));
updateConditionals();
if(key==='area')updateAreaRequired();
updateStepUI();
cfgOverlay.classList.add('open');
}
function formVal(k){const rg=cfgForm.querySelector('.radio-group[data-k="'+k+'"] .radio-opt.sel');if(rg)return rg.dataset.val;const sel=cfgForm.querySelector('select[data-k="'+k+'"]');if(sel)return sel.value;const inp=cfgForm.querySelector('input[data-k="'+k+'"]');return inp?inp.value:''}
function updateConditionals(){const c=CFG[cfgEditKey];if(!c)return;c.cols.forEach(col=>{if(col.showIf){const w=cfgForm.querySelector('[data-field="'+cK(col)+'"]');if(w)w.style.display=(formVal(col.showIf.key)===col.showIf.eq)?'':'none';}});}
function updateAreaRequired(){
cfgForm.querySelectorAll('.fg').forEach(fg=>{fg.classList.remove('req-on');const st=fg.querySelector('.req-star');if(st)st.remove();});
cfgForm.querySelectorAll('input[data-k]').forEach(i=>i.classList.remove('err'));
const sel=cfgForm.querySelector('.radio-group[data-k="considerar"] .radio-opt.sel');
if(!sel)return;
const k=AREA_MAP[sel.dataset.val];
const inp=cfgForm.querySelector('input[data-k="'+k+'"]');
if(inp){const fg=inp.closest('.fg');fg.classList.add('req-on');const lb=fg.querySelector('label');if(lb&&!lb.querySelector('.req-star'))lb.insertAdjacentHTML('beforeend',' <span class="req-star">*</span>');}
}
function closeCfg(){cfgOverlay.classList.remove('open')}
document.getElementById('cfgSave').addEventListener('click',()=>{
const c=CFG[cfgEditKey];
if(cfgMaxStep>1&&cfgStep<cfgMaxStep){cfgStep++;updateStepUI();return;}
const rec={};
if(cfgEditKey==='area'){
const sc=cfgForm.querySelector('.radio-group[data-k="considerar"] .radio-opt.sel');
if(!sc){alert('Selecione o critério em "Considerar".');return;}
const rk=AREA_MAP[sc.dataset.val];
const inp=cfgForm.querySelector('input[data-k="'+rk+'"]');
if(inp&&!inp.value.trim()){inp.classList.add('err');inp.focus();return;}
}
c.cols.forEach(col=>{
const k=cK(col),type=cT(col);
if(type==='radio'){const sel=cfgForm.querySelector('.radio-group[data-k="'+k+'"] .radio-opt.sel');rec[k]=sel?sel.dataset.val:'';}
else if(type==='select'){const sel=cfgForm.querySelector('select[data-k="'+k+'"]');rec[k]=sel?sel.value:'';}
else if(type==='checks'){rec[k]=[...cfgForm.querySelectorAll('.cfg-checks[data-k="'+k+'"] .cfg-check-item.on')].map(x=>x.dataset.val);}
else if(type==='checkdrop'){rec[k]=[...cfgForm.querySelectorAll('.checkdrop[data-k="'+k+'"] .cd-item.on')].map(x=>x.dataset.val);}
else if(type==='tiers'){rec[k]=[...cfgForm.querySelectorAll('.tiers[data-k="'+k+'"] .tier-row')].map(r=>({at:r.querySelector('.tier-at').value.trim(),com:r.querySelector('.tier-com').value.trim()})).filter(x=>x.at||x.com);}
else{const inp=cfgForm.querySelector('input[data-k="'+k+'"]');rec[k]=inp?inp.value.trim():'';}
});
if(cfgEditIdx==null)c.data.push(rec);else c.data[cfgEditIdx]=rec;
renderCfg(cfgEditKey);closeCfg();
});
cfgBackBtn.addEventListener('click',()=>{if(cfgStep>1){cfgStep--;updateStepUI();}});
document.getElementById('cfgCancel').addEventListener('click',closeCfg);
document.getElementById('cfgCloseBtn').addEventListener('click',closeCfg);
cfgOverlay.addEventListener('click',e=>{if(e.target===cfgOverlay)closeCfg()});

/* config-engine.js carrega depois de Fluxo da Venda na ordem de scripts;
 * assim que CFG fica disponível, atualiza a tela de venda (meta no
 * subtítulo, KPIs) para refletir os dados de Configurações de imediato. */
if(typeof renderVenda==='function')renderVenda();

