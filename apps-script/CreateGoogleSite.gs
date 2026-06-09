/**
 * Run this ONCE from the Apps Script editor to create the client-facing
 * Google Site. After running, open the URL printed in Logs and publish the
 * site manually via the Sites UI (Share → Publish to web).
 *
 * Prerequisites:
 *  - Google Sites API must be enabled: Resources → Advanced Google Services →
 *    Google Sites Classic API  (OR use the new Sites via SitesApp if available)
 *  - EXPO_PUBLIC_APPS_SCRIPT_URL must be set in Script Properties as
 *    APPS_SCRIPT_URL so the order-tracking iframe knows where to call.
 */
function createGPizzaSite() {
  const TITLE       = 'GPizza — Peça sua pizza';
  const DESCRIPTION = 'A melhor pizza da cidade — peça online com entrega rápida.';

  // Try to open existing site or create new one
  let site;
  try {
    // SitesApp.createSite creates a classic Google Site
    site = SitesApp.createSite('', 'gpizza-site', TITLE, DESCRIPTION);
  } catch (e) {
    Logger.log('Site may already exist, trying to open: ' + e.message);
    try {
      site = SitesApp.getSite('', 'gpizza-site');
    } catch (e2) {
      Logger.log('ERROR: ' + e2.message);
      return;
    }
  }

  const appsScriptUrl = PropertiesService.getScriptProperties().getProperty('APPS_SCRIPT_URL')
    || ScriptApp.getService().getUrl();

  // ── Pages ──────────────────────────────────────────────────────────────────

  _upsertPage(site, 'Início', 'home', _homeHtml(appsScriptUrl));
  _upsertPage(site, 'Cardápio', 'cardapio', _menuHtml(appsScriptUrl));
  _upsertPage(site, 'Rastrear Pedido', 'rastrear', _trackHtml(appsScriptUrl));
  _upsertPage(site, 'Localização', 'localizacao', _locationHtml());
  _upsertPage(site, 'Contato', 'contato', _contactHtml());

  Logger.log('✅ Site URL: ' + site.getUrl());
  Logger.log('Next step: Open the URL above → Publish → Publish to web');
}

function _upsertPage(site, title, name, html) {
  try {
    const pages = site.getChildren();
    const existing = pages.find(p => p.getName() === name);
    if (existing) {
      existing.setHtmlContent(html);
      Logger.log('Updated page: ' + name);
    } else {
      site.createWebPage(title, name, html);
      Logger.log('Created page: ' + name);
    }
  } catch (e) {
    Logger.log('Page error (' + name + '): ' + e.message);
  }
}

// ─── Page HTML builders ───────────────────────────────────────────────────────

function _homeHtml(gasUrl) {
  return `<div style="font-family:Inter,sans-serif;max-width:1200px;margin:0 auto;padding:20px">

  <div style="background:linear-gradient(135deg,#C62828,#FF6B35);color:white;border-radius:16px;padding:60px 40px;text-align:center;margin-bottom:32px">
    <h1 style="font-size:48px;font-weight:800;margin:0 0 16px">🍕 GPizza</h1>
    <p style="font-size:20px;margin:0 0 32px;opacity:.9">A melhor pizza da cidade — pronta em 30 minutos!</p>
    <a href="/cardapio" style="background:white;color:#C62828;padding:14px 36px;border-radius:30px;font-weight:700;font-size:16px;text-decoration:none">Ver Cardápio</a>
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:32px">
    ${_featureCard('🚀','Entrega Rápida','Pedido entregue em até 30 minutos na sua porta')}
    ${_featureCard('🍕','Ingredientes Frescos','Massas artesanais e ingredientes selecionados todo dia')}
    ${_featureCard('📱','Peça Online','Pedido fácil pelo app ou pelo site, sem complicação')}
    ${_featureCard('⭐','Avaliação 4.9','Mais de 1.000 clientes satisfeitos na nossa cidade')}
  </div>

  <div style="background:#fff3e0;border-left:4px solid #FF9800;border-radius:8px;padding:20px;margin-bottom:32px">
    <b>🎁 Oferta especial:</b> Use o código <b style="color:#C62828">PIZZA10</b> e ganhe 10% de desconto no primeiro pedido!
  </div>

  <div style="text-align:center;background:#fafafa;border-radius:12px;padding:40px">
    <h2 style="margin:0 0 8px">Já fez um pedido?</h2>
    <p style="color:#666;margin:0 0 20px">Acompanhe em tempo real o status da sua pizza.</p>
    <a href="/rastrear" style="background:#C62828;color:white;padding:12px 28px;border-radius:24px;font-weight:600;text-decoration:none">Rastrear Pedido</a>
  </div>
</div>`;
}

function _featureCard(icon, title, desc) {
  return `<div style="background:white;border-radius:12px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,.06);text-align:center">
    <div style="font-size:36px;margin-bottom:12px">${icon}</div>
    <h3 style="margin:0 0 8px;font-size:16px">${title}</h3>
    <p style="margin:0;color:#666;font-size:14px">${desc}</p>
  </div>`;
}

function _menuHtml(gasUrl) {
  return `<div style="font-family:Inter,sans-serif;max-width:1200px;margin:0 auto;padding:20px">
  <h1 style="font-size:32px;font-weight:800;margin:0 0 8px">🍕 Cardápio</h1>
  <p style="color:#666;margin:0 0 24px">Escolha sua pizza favorita — todas feitas na hora com ingredientes frescos.</p>
  <div id="menu-root" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px">
    <div style="text-align:center;padding:40px;color:#999">Carregando cardápio…</div>
  </div>
  <script>
  fetch('${gasUrl}?action=menu')
    .then(r=>r.json()).then(d=>{
      if(!d.ok){document.getElementById('menu-root').innerHTML='<p>Erro ao carregar cardápio.</p>';return;}
      const items=d.data.items;
      document.getElementById('menu-root').innerHTML=items.map(i=>\`
        <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06)">
          \${i.image_url?'<img src="'+i.image_url+'" style="width:100%;height:180px;object-fit:cover">':'<div style="height:120px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;font-size:48px">🍕</div>'}
          <div style="padding:16px">
            <h3 style="margin:0 0 6px;font-size:16px">\${i.name}</h3>
            <p style="margin:0 0 12px;font-size:13px;color:#666">\${i.description||''}</p>
            <div style="display:flex;align-items:center;justify-content:space-between">
              <b style="color:#C62828;font-size:18px">R$ \${Number(i.price).toFixed(2)}</b>
              <span style="background:#C62828;color:white;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600">\${i.category}</span>
            </div>
          </div>
        </div>\`).join('');
    }).catch(()=>{document.getElementById('menu-root').innerHTML='<p>Erro ao carregar cardápio.</p>';});
  </scr\`+'ipt>'}`;
  // Note: split to avoid Apps Script treating </script> as end of GS string
}

function _menuHtml2(gasUrl) {
  return _menuHtml(gasUrl);
}

function _trackHtml(gasUrl) {
  return `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;text-align:center">
  <h1 style="font-size:32px;font-weight:800;margin:0 0 8px">📦 Rastrear Pedido</h1>
  <p style="color:#666;margin:0 0 32px">Digite o número do pedido para ver o status em tempo real.</p>
  <div style="display:flex;gap:10px;margin-bottom:32px">
    <input id="oid" placeholder="Ex: ORD-1234567890"
      style="flex:1;height:48px;padding:0 16px;border:2px solid #e0e0e0;border-radius:12px;font-size:15px;font-family:inherit;outline:none"
      onfocus="this.style.borderColor='#C62828'" onblur="this.style.borderColor='#e0e0e0'">
    <button onclick="track()"
      style="height:48px;padding:0 24px;background:#C62828;color:white;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">
      Rastrear
    </button>
  </div>
  <div id="result"></div>
  <script>
  const GAS='${gasUrl}';
  const STEPS=['received','preparing','baking','ready','out_for_delivery','completed'];
  const LABELS={'received':'Pedido Recebido','preparing':'Em Preparo','baking':'No Forno','ready':'Pronto','out_for_delivery':'Saiu para Entrega','completed':'Entregue','cancelled':'Cancelado'};
  const ICONS={'received':'📋','preparing':'👨‍🍳','baking':'🔥','ready':'✅','out_for_delivery':'🛵','completed':'🎉','cancelled':'❌'};
  function track(){
    const id=document.getElementById('oid').value.trim();
    if(!id)return;
    document.getElementById('result').innerHTML='<p style="color:#999">Buscando pedido…</p>';
    fetch(GAS+'?action=order&id='+encodeURIComponent(id))
      .then(r=>r.json()).then(d=>{
        if(!d.ok){document.getElementById('result').innerHTML='<div style="background:#ffebee;color:#C62828;padding:16px;border-radius:12px">Pedido não encontrado.</div>';return;}
        const o=d.data;
        const si=STEPS.indexOf(o.status);
        const steps=STEPS.map((s,i)=>
          '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f0f0f0">'+
          '<span style="font-size:22px">'+(i<=si&&o.status!=='cancelled'?ICONS[s]:'⬜')+'</span>'+
          '<span style="font-size:15px;font-weight:'+(s===o.status?'700':'400')+';color:'+(s===o.status?'#C62828':'#333')+'">'+LABELS[s]+'</span>'+
          (s===o.status?'<span style="margin-left:auto;background:#C62828;color:white;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700">Atual</span>':'')+
          '</div>').join('');
        document.getElementById('result').innerHTML=
          '<div style="background:white;border-radius:16px;padding:20px;box-shadow:0 4px 20px rgba(0,0,0,.08);text-align:left">'+
          '<div style="display:flex;justify-content:space-between;margin-bottom:16px">'+
          '<div><b style="font-size:18px">'+o.order_id+'</b><br><span style="color:#666;font-size:13px">'+o.customer_name+'</span></div>'+
          '<b style="font-size:20px;color:#C62828">R$ '+Number(o.total).toFixed(2)+'</b></div>'+
          steps+'</div>';
      }).catch(()=>{document.getElementById('result').innerHTML='<p style="color:red">Erro ao buscar pedido.</p>';});
  }
  document.getElementById('oid').onkeydown=e=>{if(e.key==='Enter')track();};
  </scr`+'ipt>';
}

function _locationHtml() {
  const settings = SettingsService.getAll();
  const street = settings.address_street || 'Rua das Pizzas, 42';
  const city   = settings.address_city   || 'São Paulo - SP';
  const phone  = settings.phone          || '';
  const mapUrl = settings.maps_embed_url || '';

  return `<div style="font-family:Inter,sans-serif;max-width:1000px;margin:0 auto;padding:40px 20px">
  <h1 style="font-size:32px;font-weight:800;margin:0 0 8px">📍 Nossa Localização</h1>
  <p style="color:#666;margin:0 0 32px">Venha nos visitar ou peça entrega em domicílio.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start">
    <div>
      ${mapUrl
        ? `<iframe src="${mapUrl}" width="100%" height="360" style="border:0;border-radius:12px" allowfullscreen loading="lazy"></iframe>`
        : `<div style="height:360px;background:#e8f0e4;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#666">Mapa em breve</div>`
      }
    </div>
    <div style="background:white;border-radius:16px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,.06)">
      <h2 style="margin:0 0 20px;font-size:20px">GPizza</h2>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;gap:12px"><span style="font-size:20px">📌</span><div><b>Endereço</b><br>${street}<br>${city}</div></div>
        ${phone?`<div style="display:flex;gap:12px"><span style="font-size:20px">📞</span><div><b>Telefone</b><br><a href="tel:${phone}" style="color:#C62828;text-decoration:none">${phone}</a></div></div>`:''}
        <div style="display:flex;gap:12px"><span style="font-size:20px">🕐</span><div><b>Horário</b><br>Seg–Sex: 11h–23h<br>Sáb–Dom: 11h–00h</div></div>
        <div style="display:flex;gap:12px"><span style="font-size:20px">🛵</span><div><b>Entrega</b><br>Raio de até 10 km<br>Frete a partir de R$ 5,00</div></div>
      </div>
      <a href="https://wa.me/55${phone.replace(/\D/g,'')}" target="_blank"
        style="display:block;margin-top:20px;background:#25D366;color:white;text-align:center;padding:12px;border-radius:12px;font-weight:600;text-decoration:none">
        💬 Chamar no WhatsApp
      </a>
    </div>
  </div>
</div>`;
}

function _contactHtml() {
  return `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;text-align:center">
  <h1 style="font-size:32px;font-weight:800;margin:0 0 8px">📬 Fale Conosco</h1>
  <p style="color:#666;margin:0 0 32px">Dúvidas, sugestões ou elogios? Adoramos ouvir você.</p>
  <div style="background:white;border-radius:16px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,.06);text-align:left">
    <div style="display:flex;flex-direction:column;gap:16px;margin-bottom:24px">
      <div style="display:flex;align-items:center;gap:14px;padding:16px;background:#fafafa;border-radius:12px">
        <span style="font-size:28px">📱</span>
        <div><b>App de Pedidos</b><br><a href="https://gpizza-firebase.web.app" style="color:#C62828">gpizza-firebase.web.app</a></div>
      </div>
      <div style="display:flex;align-items:center;gap:14px;padding:16px;background:#fafafa;border-radius:12px">
        <span style="font-size:28px">💬</span>
        <div><b>WhatsApp</b><br><span style="color:#666">Atendimento rápido das 11h às 23h</span></div>
      </div>
      <div style="display:flex;align-items:center;gap:14px;padding:16px;background:#fafafa;border-radius:12px">
        <span style="font-size:28px">📦</span>
        <div><b>Rastrear Pedido</b><br><a href="/rastrear" style="color:#C62828">Clique aqui para acompanhar</a></div>
      </div>
    </div>
    <div style="background:#fff8e1;border-radius:12px;padding:16px;text-align:center">
      <b>🎁 Programa de Fidelidade</b><br>
      <span style="font-size:13px;color:#666">Acumule pontos a cada pedido e troque por descontos incríveis!</span>
    </div>
  </div>
</div>`;
}
