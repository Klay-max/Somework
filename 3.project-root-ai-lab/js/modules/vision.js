import SoundManager from './audio.js';

function appendLog(text, cls) {
  var out = document.getElementById('terminal-output');
  if (!out) return;
  var line = document.createElement('div');
  line.className = 'log-line' + (cls ? ' ' + cls : '');
  line.textContent = text;
  out.appendChild(line);
}

function buildUI() {
  Array.prototype.slice.call(document.querySelectorAll('.generated-component')).forEach(function (el) { el.remove() });
  var host = document.getElementById('app') || document.body;
  var root = document.createElement('div');
  root.className = 'generated-component';
  root.style.position = 'fixed';
  root.style.inset = '0';
  root.style.transform = 'none';
  root.style.padding = '0';
  root.style.border = 'none';
  root.style.backgroundColor = 'rgba(5,5,5,0.35)';
  root.style.boxShadow = '0 0 30px rgba(0,243,255,0.2) inset';
  root.style.zIndex = '12';

  var bar = document.createElement('div');
  bar.style.position = 'absolute';
  bar.style.top = '12px';
  bar.style.left = '50%';
  bar.style.transform = 'translateX(-50%)';
  bar.style.display = 'flex';
  bar.style.gap = '10px';
  bar.style.padding = '8px 12px';
  bar.style.background = 'rgba(0,0,0,0.35)';
  bar.style.border = '1px solid rgba(0,243,255,0.35)';
  bar.style.borderRadius = '10px';
  bar.style.backdropFilter = 'blur(8px)';

  function mkBtn(label){ var b=document.createElement('button'); b.textContent=label; b.style.padding='6px 10px'; b.style.border='1px solid rgba(0,243,255,0.4)'; b.style.borderRadius='8px'; b.style.background='rgba(0,0,0,0.25)'; b.style.color='var(--neon-green)'; b.style.cursor='pointer'; return b }

  var startBtn = mkBtn('Scan');
  var closeBtn = mkBtn('Close');
  bar.appendChild(startBtn);
  bar.appendChild(closeBtn);

  var canvas = document.createElement('canvas');
  canvas.id = 'vision-canvas';
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';

  root.appendChild(canvas);
  root.appendChild(bar);
  host.appendChild(root);

  var ctx = canvas.getContext('2d');
  var scanning = false;
  var lineY = 0;
  var last = 0;
  var sound = new SoundManager();
  sound.unlock();

  function setSize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight }
  setSize();
  window.addEventListener('resize', setSize);

  var targets = [];
  function seedTargets(){
    targets = [];
    var w = canvas.width, h = canvas.height;
    var count = Math.floor(8 + Math.random()*6);
    for (var i=0;i<count;i++){
      var tw = 60 + Math.random()*120;
      var th = 40 + Math.random()*100;
      var tx = Math.random()*(w - tw - 40) + 20;
      var ty = Math.random()*(h - th - 80) + 60;
      targets.push({ x: tx, y: ty, w: tw, h: th, pulse: Math.random()*Math.PI*2 });
    }
  }
  seedTargets();

  var mouse = { x: -9999, y: -9999 };
  canvas.addEventListener('mousemove', function(e){ var r=canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top });
  canvas.addEventListener('mouseleave', function(){ mouse.x = -9999; mouse.y = -9999 });

  function drawGrid(){
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = 'rgba(0,243,255,0.06)';
    ctx.lineWidth = 1;
    for (var gx=0;gx<=w;gx+=32){ ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,h); ctx.stroke() }
    for (var gy=0;gy<=h;gy+=32){ ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(w,gy); ctx.stroke() }
  }

  function drawScan(ts){
    var w = canvas.width, h = canvas.height;
    if (!last) last = ts;
    if (scanning) { lineY += Math.max(1.5, (ts - last) * 0.12); if (lineY > h) { lineY = 0; seedTargets() } }
    last = ts;
    var grad = ctx.createLinearGradient(0, Math.max(0,lineY-60), 0, Math.min(h,lineY+60));
    grad.addColorStop(0,'rgba(0,255,65,0)');
    grad.addColorStop(0.5,'rgba(0,255,65,0.25)');
    grad.addColorStop(1,'rgba(0,255,65,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, Math.max(0,lineY-60), w, 120);
    ctx.strokeStyle = 'rgba(0,255,65,0.6)';
    ctx.beginPath();
    ctx.moveTo(0, lineY);
    ctx.lineTo(w, lineY);
    ctx.stroke();
  }

  function drawTargets(ts){
    for (var i=0;i<targets.length;i++){
      var t = targets[i];
      var pulse = (Math.sin(ts/200 + t.pulse) + 1) * 0.5;
      var near = (mouse.x >= t.x && mouse.x <= t.x + t.w && mouse.y >= t.y && mouse.y <= t.y + t.h);
      var alpha = near ? 0.95 : 0.35 + 0.3*pulse;
      ctx.strokeStyle = 'rgba(0,255,65,' + alpha + ')';
      ctx.lineWidth = near ? 2 : 1;
      ctx.strokeRect(t.x, t.y, t.w, t.h);
      ctx.fillStyle = 'rgba(0,255,65,' + Math.max(0, alpha - 0.25) + ')';
      ctx.fillRect(t.x+2, t.y+2, t.w-4, t.h-4);
    }
  }

  function loop(ts){
    drawGrid();
    drawScan(ts||0);
    drawTargets(ts||0);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  startBtn.addEventListener('click', function(){ scanning = true; sound.playScan(); appendLog('Scanning...', 'muted') });
  closeBtn.addEventListener('click', function(){ scanning = false; window.removeEventListener('resize', setSize); root.remove(); var ci=document.getElementById('command-input'); if (ci) ci.focus() });

  appendLog('Visual Cortex online', 'success');
}

export default {
  init() { return 'OPTICAL_SENSORS_ONLINE' },
  activate() { buildUI() }
}
