function appendLog(text, cls) {
  var out = document.getElementById('terminal-output');
  if (!out) return;
  var line = document.createElement('div');
  line.className = 'log-line' + (cls ? ' ' + cls : '');
  line.textContent = text;
  out.appendChild(line);
}

function createProcessing(text) {
  var out = document.getElementById('terminal-output');
  if (!out) return null;
  var wrap = document.createElement('div');
  wrap.className = 'log-line';
  var span = document.createElement('span');
  span.textContent = text || 'Encoding Matrix...';
  var bar = document.createElement('div');
  bar.className = 'processing-bar';
  wrap.appendChild(span);
  wrap.appendChild(bar);
  out.appendChild(wrap);
  return { wrap: wrap, bar: bar };
}

function removeProcessing(proc) {
  if (!proc) return;
  if (proc.wrap && proc.wrap.parentNode) proc.wrap.parentNode.removeChild(proc.wrap);
}

function neonize(canvas) {
  var w = canvas.width, h = canvas.height;
  var src = canvas.getContext('2d');
  var styled = document.createElement('canvas');
  styled.width = w; styled.height = h;
  var ctx = styled.getContext('2d');
  ctx.drawImage(canvas, 0, 0);
  var img = ctx.getImageData(0, 0, w, h);
  var d = img.data;
  for (var i = 0; i < d.length; i += 4) {
    var r = d[i], g = d[i+1], b = d[i+2];
    var bright = (r + g + b) / 3;
    if (bright < 128) { d[i] = 0; d[i+1] = 255; d[i+2] = 65 } else { d[i] = 8; d[i+1] = 14; d[i+2] = 10 }
  }
  ctx.putImageData(img, 0, 0);
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(0,255,65,0.08)';
  ctx.fillRect(0,0,w,h);
  ctx.globalCompositeOperation = 'source-over';
  function glow(x,y,r){
    var g2 = ctx.createRadialGradient(x,y,4,x,y,r);
    g2.addColorStop(0,'rgba(0,255,65,0.35)');
    g2.addColorStop(1,'rgba(0,255,65,0)');
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fill();
  }
  glow(28,28,48);
  glow(w-28,28,48);
  glow(28,h-28,48);
  styled.style.boxShadow = '0 0 24px rgba(0,255,65,0.35), 0 0 48px rgba(0,255,65,0.25)';
  return styled;
}

function buildUI() {
  Array.prototype.slice.call(document.querySelectorAll('.generated-component')).forEach(function (el) { el.remove() });
  var host = document.getElementById('app') || document.body;
  var root = document.createElement('div');
  root.className = 'generated-component scale-up';
  root.style.width = '580px';
  root.style.padding = '18px 22px 22px 22px';
  var close = document.createElement('button');
  close.className = 'close-btn';
  close.textContent = 'x';
  var row = document.createElement('div');
  row.style.display = 'flex';
  row.style.gap = '10px';
  row.style.marginBottom = '12px';
  var input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'https://...';
  input.style.flex = '1';
  input.style.border = '1px solid rgba(0,243,255,0.3)';
  input.style.borderRadius = '8px';
  input.style.padding = '8px 10px';
  input.style.background = 'rgba(0,0,0,0.25)';
  input.style.color = '#fff';
  input.style.fontFamily = 'JetBrains Mono, monospace';
  var btn = document.createElement('button');
  btn.textContent = 'Generate';
  btn.style.border = '1px solid rgba(0,243,255,0.4)';
  btn.style.borderRadius = '8px';
  btn.style.padding = '8px 12px';
  btn.style.background = 'rgba(0,0,0,0.25)';
  btn.style.color = 'var(--neon-green)';
  btn.style.cursor = 'pointer';
  var busy = false;
  function setLoading(on){
    try {
      busy = !!on;
      btn.disabled = !!on;
      if (on) {
        btn.innerHTML = '<span class="btn-spinner" style="display:inline-block;width:14px;height:14px;border:2px solid rgba(0,243,255,0.35);border-top-color: var(--neon-green);border-radius:50%;margin-right:8px;vertical-align:-2px;animation: spin .9s linear infinite"></span>Generating...';
      } else {
        btn.textContent = 'Generate';
      }
    } catch (_) { btn.textContent = on ? 'Generating...' : 'Generate' }
  }
  var display = document.createElement('div');
  display.id = 'qr-display';
  display.style.display = 'grid';
  display.style.placeItems = 'center';
  display.style.minHeight = '320px';
  display.style.border = '1px solid rgba(0,243,255,0.3)';
  display.style.borderRadius = '10px';
  display.style.background = 'rgba(0,0,0,0.25)';

  row.appendChild(input);
  row.appendChild(btn);
  root.appendChild(close);
  root.appendChild(row);
  var hint = document.createElement('div');
  hint.textContent = 'Supported formats: JPG, PNG';
  hint.style.margin = '6px 0 10px 0';
  hint.style.fontSize = '12px';
  hint.style.color = 'rgba(255,255,255,0.65)';
  hint.style.fontFamily = 'JetBrains Mono, monospace';
  root.appendChild(hint);
  root.appendChild(display);
  host.appendChild(root);

  input.focus();
  close.addEventListener('click', function(){ root.remove(); var ci = document.getElementById('command-input'); if (ci) ci.focus() });

  function generate(url){
    display.innerHTML='';
    var proc = createProcessing('Encoding Matrix...');
    setTimeout(function(){
      removeProcessing(proc);
      var holder = document.createElement('div');
      display.appendChild(holder);
      var qr = new QRCode(holder, { text: url, width: 320, height: 320, correctLevel: QRCode.CorrectLevel.M, colorDark: '#000000', colorLight: '#ffffff' });
      setTimeout(function(){
        var base = holder.querySelector('canvas') || holder.querySelector('img');
        var c2;
        if (base && base.tagName.toLowerCase()==='img') {
          c2 = document.createElement('canvas');
          c2.width = 320; c2.height = 320;
          var g = c2.getContext('2d');
          g.drawImage(base,0,0,320,320);
        } else {
          c2 = base;
        }
        var styled = neonize(c2);
        display.innerHTML='';
        display.appendChild(styled);
        var dl = document.createElement('button');
        dl.textContent = 'Download Access Key';
        dl.style.marginTop = '12px';
        dl.style.border = '1px solid rgba(255,77,77,0.6)';
        dl.style.borderRadius = '8px';
        dl.style.padding = '8px 12px';
        dl.style.background = 'rgba(0,0,0,0.25)';
        dl.style.color = '#ffffff';
        dl.style.cursor = 'pointer';
        dl.style.fontFamily = 'JetBrains Mono, monospace';
        dl.addEventListener('click', function(){
          try {
            var urlData = styled.toDataURL('image/png');
            var a = document.createElement('a');
            a.href = urlData;
            a.download = 'neural-access-key.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } catch (_) { appendLog('Download failed', 'error') }
        });
        display.appendChild(dl);
        setLoading(false);
        busy = false;
      }, 60);
    }, 300);
  }

  btn.addEventListener('click', function(){
    if (busy) return;
    var url = input.value.trim();
    if (!url) { appendLog('Input required', 'error'); return }
    setLoading(true);
    generate(url);
  });
  input.addEventListener('keydown', function(e){ if (e.key==='Enter') { var url = input.value.trim(); if (!url) { appendLog('Input required', 'error'); return } generate(url) } });
}

export default {
  activate() { buildUI() }
}
