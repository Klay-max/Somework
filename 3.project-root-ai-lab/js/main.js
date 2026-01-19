import Fabricator from './modules/fabricator.js';
import Vision from './modules/vision.js';
import { initBackground } from './modules/background.js';
import NeuralQR from './modules/neural-qr.js';
import Genesis from './modules/genesis.js';
import Sonic from './modules/sonic.js';
import { MODULES } from './data/modules.js';

function createModal(title, content, onClose){
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  var root = document.createElement('div');
  root.className = 'modal-root';
  var header = document.createElement('div');
  header.className = 'modal-header';
  var htitle = document.createElement('div');
  htitle.className = 'modal-title';
  htitle.textContent = title || 'Module';
  var close = document.createElement('button');
  close.className = 'modal-close';
  close.textContent = '✖';
  var body = document.createElement('div');
  body.className = 'modal-body';
  header.appendChild(htitle);
  header.appendChild(close);
  if (content) body.appendChild(content);
  root.appendChild(header);
  root.appendChild(body);
  overlay.appendChild(root);
  var host = document.getElementById('app') || document.body;
  host.appendChild(overlay);

  function remove(){
    try { root.style.animation = 'modalOut .18s ease-in forwards' } catch (_) {}
    setTimeout(function(){
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (typeof onClose === 'function') onClose();
    }, 160);
  }
  close.addEventListener('click', remove);
  return { overlay: overlay, root: root, close: remove };
}

if (!window.PROMETHEUS) window.PROMETHEUS = {};
window.PROMETHEUS.createModal = createModal;

function initChromaticAberration(){
  var doc = document.documentElement;
  var ax = 0, sx = 0, ta = 0, ts = 0;
  var lx = 0, ly = 0, lt = 0;
  function onMove(e){
    var t = performance.now();
    if (!lt){ lt = t; lx = e.clientX; ly = e.clientY; return }
    var dt = t - lt; if (dt <= 0) dt = 16;
    var dx = e.clientX - lx; var dy = e.clientY - ly;
    var v = Math.sqrt(dx*dx + dy*dy) / dt;
    var shift = Math.max(0, Math.min(9, v * 35));
    var alpha = Math.max(0, Math.min(0.35, v * 0.6));
    ts = shift; ta = alpha; lt = t; lx = e.clientX; ly = e.clientY;
    doc.style.setProperty('--spot-x', e.clientX + 'px');
    doc.style.setProperty('--spot-y', e.clientY + 'px');
  }
  function tick(){
    sx += (ts - sx) * 0.15;
    ax += (ta - ax) * 0.15;
    ts *= 0.86; ta *= 0.92;
    doc.style.setProperty('--rgb-shift', sx.toFixed(2) + 'px');
    doc.style.setProperty('--rgb-alpha', ax.toFixed(3));
    requestAnimationFrame(tick);
  }
  window.addEventListener('mousemove', onMove);
  requestAnimationFrame(tick);
}

function renderModules() {
  var grid = document.getElementById('modules-grid');
  if (!grid) return;
  grid.innerHTML = '';
  try {
    var seen = localStorage.getItem('toc_onboard_seen');
    if (!seen) {
      var tip = document.createElement('div');
      tip.textContent = 'Select a module to initialize...';
      tip.setAttribute('role', 'status');
      tip.style.margin = '0 0 8px 0';
      tip.style.padding = '6px 10px';
      tip.style.border = '1px solid rgba(255,255,255,0.15)';
      tip.style.borderRadius = '10px';
      tip.style.background = 'rgba(0,0,0,0.35)';
      tip.style.color = '#ffffff';
      tip.style.fontFamily = 'JetBrains Mono, monospace';
      tip.style.fontSize = '12px';
      tip.style.textAlign = 'center';
      tip.style.backdropFilter = 'blur(8px)';
      grid.appendChild(tip);
      setTimeout(function(){ try { tip.remove(); localStorage.setItem('toc_onboard_seen', '1') } catch (_) {} }, 3000);
    }
  } catch (_) {}
  MODULES.forEach(function (m, i) {
    var card = document.createElement('article');
    card.className = 'module-card card-appear';
    card.dataset.action = m.action;
    card.setAttribute('style', 'animation-delay: ' + (i * 100) + 'ms');
    card.innerHTML = '<div class="card-content">' +
                       '<h3 class="card-title">' + m.name + '</h3>' +
                       '<p class="card-desc">' + m.desc + '</p>' +
                     '</div>' +
                     '<div class="icon-watermark">' + (m.icon || '') + '</div>';
    var sx=0, sy=0, tx=0, ty=0, raf=0;
    function step(){
      sx += (tx - sx) * 0.18;
      sy += (ty - sy) * 0.18;
      card.style.transform = 'translate(' + sx.toFixed(2) + 'px,' + sy.toFixed(2) + 'px)';
      raf = requestAnimationFrame(step);
    }
    card.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect();
      var cx = r.left + r.width/2; var cy = r.top + r.height/2;
      var dx = e.clientX - cx; var dy = e.clientY - cy;
      tx = Math.max(-12, Math.min(12, dx * 0.06));
      ty = Math.max(-12, Math.min(12, dy * 0.06));
      var px = ((e.clientX - r.left) / r.width * 100).toFixed(2) + '%';
      var py = ((e.clientY - r.top) / r.height * 100).toFixed(2) + '%';
      card.style.setProperty('--mx', px);
      card.style.setProperty('--my', py);
      if (!raf) raf = requestAnimationFrame(step);
    });
    card.addEventListener('mouseleave', function(){
      tx = 0; ty = 0;
      function settle(){
        sx += (tx - sx) * 0.18; sy += (ty - sy) * 0.18;
        card.style.transform = (Math.abs(sx)+Math.abs(sy) < 0.4) ? '' : 'translate(' + sx.toFixed(2) + 'px,' + sy.toFixed(2) + 'px)';
        if (Math.abs(sx)+Math.abs(sy) < 0.4) { cancelAnimationFrame(raf); raf = 0; return }
        raf = requestAnimationFrame(settle);
      }
      cancelAnimationFrame(raf); raf = requestAnimationFrame(settle);
    });
    card.addEventListener('click', function(){
      var a = m.action;
      if (a === 'ui') Fabricator.activate();
      else if (a === 'scan') Vision.activate();
      else if (a === 'qr') NeuralQR.activate();
      else if (a === 'life') Genesis.activate();
      else if (a === 'audio-viz') Sonic.activate();
    });
    grid.appendChild(card);
  });
}

function initSystem() {
  var app = document.getElementById('app');
  if (app) { app.style.opacity = '0'; app.style.transform = 'scale(0.98)'; app.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.2, .8, .2, 1)' }
  var boot = document.createElement('div');
  boot.style.position = 'fixed';
  boot.style.inset = '0';
  boot.style.zIndex = '100';
  boot.style.display = 'grid';
  boot.style.placeItems = 'center';
  boot.style.background = 'rgba(5,5,5,0.85)';
  boot.style.backdropFilter = 'blur(12px)';
  var num = document.createElement('div');
  num.style.fontFamily = 'JetBrains Mono, monospace';
  num.style.color = '#00ff41';
  num.style.fontSize = 'clamp(42px, 10vw, 120px)';
  num.textContent = '0%';
  boot.appendChild(num);
  document.body.appendChild(boot);
  var p = 0;
  function step(){
    p += Math.max(1, Math.min(7, 2 + Math.random()*3));
    if (p >= 100) { p = 100; num.textContent = '100%';
      setTimeout(function(){ if (boot && boot.parentNode) boot.parentNode.removeChild(boot); initBackground(); renderModules(); initChromaticAberration(); if (app) { app.style.opacity = '1'; app.style.transform = 'scale(1)' } document.title = 'PROMETHEUS | Online' }, 200);
    } else { num.textContent = Math.floor(p) + '%'; requestAnimationFrame(step) }
  }
  requestAnimationFrame(step);
}

function init() { initSystem() }

function generateFavicon(){
  try {
    var c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    var g = c.getContext('2d');
    g.clearRect(0,0,64,64);
    var grd = g.createLinearGradient(0,0,64,64);
    grd.addColorStop(0,'#00ff41');
    grd.addColorStop(1,'#00f3ff');
    g.fillStyle = grd;
    g.fillRect(8,8,48,48);
    g.globalCompositeOperation = 'lighter';
    g.fillStyle = 'rgba(0,255,65,0.35)';
    g.beginPath(); g.arc(32,32,24,0,Math.PI*2); g.fill();
    var url = c.toDataURL('image/png');
    var link = document.querySelector('link[rel="icon"]') || document.createElement('link');
    link.setAttribute('rel','icon');
    link.setAttribute('type','image/png');
    link.setAttribute('href', url);
    document.head.appendChild(link);
  } catch (_) {}
}

function initFooter(){
  try {
    var footer = document.getElementById('site-footer');
    if (!footer) return;
    var year = new Date().getFullYear();
    footer.innerHTML = '© ' + year + ' PROMETHEUS Systems v1.0.4 [Stable] — ' + '<a id="system-architect" href="#">System Architect</a>';
  } catch (_) {}
}

generateFavicon();
initFooter();

// Fallback pause/resume for background renderer on tab visibility change
document.addEventListener('visibilitychange', function(){
  try {
    document.title = document.hidden ? '⚠️ Connection Lost...' : 'PROMETHEUS | Online';
    if (!window.PROMETHEUS) return;
    if (document.hidden && window.PROMETHEUS.backgroundPause) window.PROMETHEUS.backgroundPause();
    else if (!document.hidden && window.PROMETHEUS.backgroundResume) window.PROMETHEUS.backgroundResume();
  } catch (_) {}
});

// Global error boundary: show toast and attempt recovery
window.onerror = function(){
  try {
    var toast = document.createElement('div');
    toast.textContent = 'System Glitch Detected - Refreshing...';
    toast.style.position = 'fixed';
    toast.style.top = '10px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.zIndex = '1000';
    toast.style.padding = '8px 12px';
    toast.style.borderRadius = '10px';
    toast.style.background = 'rgba(255, 77, 77, 0.9)';
    toast.style.color = '#fff';
    toast.style.fontFamily = 'JetBrains Mono, monospace';
    toast.style.boxShadow = '0 10px 20px rgba(0,0,0,0.35)';
    document.body.appendChild(toast);
    setTimeout(function(){ try { toast.remove() } catch (_) {} }, 1800);
    setTimeout(function(){ location.reload() }, 2000);
  } catch (_) {}
  return true;
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
