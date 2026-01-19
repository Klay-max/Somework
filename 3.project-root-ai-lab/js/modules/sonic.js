function buildUI(){
  Array.prototype.slice.call(document.querySelectorAll('.generated-component')).forEach(function (el) { el.remove() });
  var host = document.getElementById('app') || document.body;
  var root = document.createElement('div');
  root.className = 'generated-component scale-up';
  root.style.width = '720px';
  root.style.padding = '18px 22px 22px 22px';

  function mkBtn(t){ var b=document.createElement('button'); b.textContent=t; b.style.border='1px solid rgba(0,243,255,0.4)'; b.style.borderRadius='10px'; b.style.padding='8px 12px'; b.style.background='rgba(0,0,0,0.25)'; b.style.color='var(--neon-green)'; b.style.cursor='pointer'; b.style.fontFamily='JetBrains Mono, monospace'; return b }

  var top = document.createElement('div');
  top.style.display = 'flex';
  top.style.alignItems = 'center';
  top.style.justifyContent = 'space-between';
  top.style.marginBottom = '10px';
  var title = document.createElement('div');
  title.textContent = 'Sonic Analyzer';
  title.style.fontFamily = 'JetBrains Mono, monospace';
  title.style.color = 'var(--cyber-blue)';
  var startBtn = mkBtn('Start Listen');
  var exitBtn = mkBtn('Exit');
  top.appendChild(title);
  top.appendChild(startBtn);
  top.appendChild(exitBtn);
  var status = document.createElement('div');
  status.style.margin = '6px 0 10px 0';
  status.style.fontFamily = 'JetBrains Mono, monospace';
  status.style.color = 'rgba(255,255,255,0.8)';
  status.textContent = '';
  var canvas = document.createElement('canvas');
  canvas.width = 680; canvas.height = 360;
  canvas.style.display = 'block';
  canvas.style.border = '1px solid rgba(0,243,255,0.3)';
  canvas.style.borderRadius = '10px';
  canvas.style.background = 'rgba(0,0,0,0.25)';
  root.appendChild(top);
  root.appendChild(status);
  root.appendChild(canvas);
  host.appendChild(root);

  var ctx = canvas.getContext('2d');
  var ac = null, analyser = null, micStream = null, running = false, raf = 0;

  function cleanup(){
    running = false;
    if (raf) { cancelAnimationFrame(raf); raf = 0 }
    if (analyser && analyser.disconnect) try{ analyser.disconnect() }catch(_){}
    if (ac) { try{ ac.close() }catch(_){} ac = null }
    if (micStream) { try{ micStream.getTracks().forEach(function(t){ t.stop() }) }catch(_){} micStream = null }
  }

  function drawRing(data){
    var w = canvas.width, h = canvas.height;
    var cx = w/2, cy = h/2, R = Math.min(cx, cy) - 24;
    ctx.save();
    ctx.clearRect(0,0,w,h);
    ctx.translate(cx, cy);
    ctx.strokeStyle = 'rgba(0,255,65,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i=0;i<data.length;i++){
      var ang = (i / data.length) * Math.PI * 2;
      var amp = data[i] / 255;
      var r = R + Math.sin(ang*2) * 3 + amp * 28;
      var x = Math.cos(ang) * r;
      var y = Math.sin(ang) * r;
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function drawBars(data){
    var w = canvas.width, h = canvas.height;
    var bw = Math.max(2, Math.floor(w / data.length));
    ctx.save();
    var grad = ctx.createLinearGradient(0, h-80, 0, h);
    grad.addColorStop(0, 'rgba(0,255,65,0.85)');
    grad.addColorStop(1, 'rgba(0,243,255,0.65)');
    for (var i=0;i<data.length;i++){
      var v = data[i]/255; var bh = v * 120;
      ctx.fillStyle = grad;
      ctx.fillRect(i*bw, h-4-bh, bw-1, bh);
    }
    ctx.restore();
  }

  function loop(){
    if (!running) return;
    var len = analyser.frequencyBinCount;
    var arr = new Uint8Array(len);
    analyser.getByteFrequencyData(arr);
    drawRing(arr);
    drawBars(arr.slice(0, Math.min(96, arr.length)));
    raf = requestAnimationFrame(loop);
  }

  function start(){
    if (running) return;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream){
      micStream = stream;
      ac = new (window.AudioContext||window.webkitAudioContext)();
      var src = ac.createMediaStreamSource(stream);
      analyser = ac.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.85;
      src.connect(analyser);
      running = true;
      status.textContent = 'Listening...';
      loop();
    }).catch(function(){
      var w = canvas.width, h = canvas.height;
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle = 'rgba(255,77,77,0.9)';
      ctx.font = '18px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🔇  Microphone Access Denied - Click to Retry', w/2, h/2);
      canvas.style.cursor = 'pointer';
      canvas.addEventListener('click', function(){ canvas.style.cursor='default'; status.textContent=''; start() }, { once: true });
    });
  }

  startBtn.addEventListener('click', start);
  exitBtn.addEventListener('click', function(){ cleanup(); root.remove(); var ci=document.getElementById('command-input'); if (ci) ci.focus() });
}

export default {
  activate(){ buildUI() }
}
