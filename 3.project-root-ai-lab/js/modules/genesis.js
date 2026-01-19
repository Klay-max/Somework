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

  function mkBtn(label) {
    var b = document.createElement('button');
    b.textContent = label;
    b.style.border = '1px solid rgba(0,243,255,0.35)';
    b.style.borderRadius = '8px';
    b.style.padding = '6px 12px';
    b.style.background = 'rgba(0,0,0,0.25)';
    b.style.color = 'var(--neon-green)';
    b.style.fontFamily = 'JetBrains Mono, monospace';
    b.style.cursor = 'pointer';
    return b;
  }
  var startBtn = mkBtn('Start');
  var pauseBtn = mkBtn('Pause');
  var clearBtn = mkBtn('Clear');
  var randBtn = mkBtn('Randomize');
  var closeBtn = mkBtn('Close');
  bar.appendChild(startBtn);
  bar.appendChild(pauseBtn);
  bar.appendChild(clearBtn);
  bar.appendChild(randBtn);
  bar.appendChild(closeBtn);

  var canvas = document.createElement('canvas');
  canvas.id = 'life-canvas';
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';

  root.appendChild(canvas);
  root.appendChild(bar);
  host.appendChild(root);

  function Genesis() {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.cell = 12;
    this.running = false;
    this._alive = true;
    this.painting = false;
    this.cols = 0;
    this.rows = 0;
    this.grid = [];
    this.trail = [];
    this.last = 0;
    this.interval = 0; // rAF paced
    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);
    this.onMouse = this.onMouse.bind(this);
    this.onLeave = this.onLeave.bind(this);
    window.addEventListener('resize', this.resize);
    this.canvas.addEventListener('mousedown', function(){ g.painting = true });
    this.canvas.addEventListener('mouseup', function(){ g.painting = false });
    this.canvas.addEventListener('mousemove', this.onMouse);
    this.canvas.addEventListener('mouseleave', this.onLeave);
    startBtn.addEventListener('click', function(){ g.running = true });
    pauseBtn.addEventListener('click', function(){ g.running = false });
    clearBtn.addEventListener('click', function(){ for (var i=0;i<g.grid.length;i++) g.grid[i]=0; for (var j=0;j<g.trail.length;j++) g.trail[j]=0; });
    randBtn.addEventListener('click', function(){ for (var i=0;i<g.grid.length;i++) g.grid[i] = Math.random() < 0.12 ? 1 : 0 });
    this.resize();
    requestAnimationFrame(this.loop);
    this.canvas.focus();
  }

  Genesis.prototype.index = function(x,y){ return y * this.cols + x };
  Genesis.prototype.resize = function(){
    var w = window.innerWidth, h = window.innerHeight;
    this.canvas.width = w;
    this.canvas.height = h;
    this.cols = Math.floor(w / this.cell);
    this.rows = Math.floor(h / this.cell);
    var size = this.cols * this.rows;
    this.grid = new Array(size);
    this.trail = new Array(size);
    for (var i=0;i<size;i++){ this.grid[i]=0; this.trail[i]=0 }
  };

  Genesis.prototype.onMouse = function(e){
    var rect = this.canvas.getBoundingClientRect();
    var cx = Math.floor((e.clientX - rect.left) / this.cell);
    var cy = Math.floor((e.clientY - rect.top) / this.cell);
    if (cx<0||cy<0||cx>=this.cols||cy>=this.rows) return;
    for (var k=0;k<26;k++) {
      var rx = cx + Math.floor((Math.random()*7)|0) - 3;
      var ry = cy + Math.floor((Math.random()*7)|0) - 3;
      if (rx>=0 && ry>=0 && rx<this.cols && ry<this.rows) {
        var idx = this.index(rx,ry);
        this.grid[idx] = 1;
        this.trail[idx] = 1;
      }
    }
  };
  Genesis.prototype.onLeave = function(){ this.painting = false };

  Genesis.prototype.step = function(){
    var next = new Array(this.grid.length);
    for (var y=0;y<this.rows;y++) {
      for (var x=0;x<this.cols;x++) {
        var idx = this.index(x,y);
        var alive = this.grid[idx];
        var n=0;
        for (var j=-1;j<=1;j++){
          for (var i=-1;i<=1;i++){
            if (i===0 && j===0) continue;
            var nx = x+i, ny=y+j;
            if (nx>=0 && nx<this.cols && ny>=0 && ny<this.rows) { n += this.grid[this.index(nx,ny)] }
          }
        }
        var nv = 0;
        if (alive) nv = (n===2||n===3)?1:0; else nv = (n===3)?1:0;
        next[idx] = nv;
        if (nv && !alive) this.trail[idx] = 1;
        if (!nv && alive) this.trail[idx] = Math.max(this.trail[idx], 0.6);
      }
    }
    this.grid = next;
  };

  Genesis.prototype.draw = function(){
    var w = this.canvas.width, h = this.canvas.height;
    var ctx = this.ctx;
    ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
    ctx.fillRect(0,0,w,h);
    for (var y=0;y<this.rows;y++){
      for (var x=0;x<this.cols;x++){
        var idx = this.index(x,y);
        if (this.grid[idx]){
          var hx = x / this.cols;
          var hy = y / this.rows;
          var hue = ((hx * 220) + (hy * 140)) % 360;
          var fs = 'hsla(' + hue + ', 100%, 60%, 0.95)';
          var sc = 'hsla(' + hue + ', 100%, 60%, 0.75)';
          ctx.shadowBlur = 10;
          ctx.shadowColor = sc;
          ctx.fillStyle = fs;
          ctx.fillRect(x*this.cell+1, y*this.cell+1, this.cell-2, this.cell-2);
        }
      }
    }
    ctx.shadowBlur = 0;
  };

  Genesis.prototype.loop = function(ts){
    if (!this._alive) return;
    if (this.running) this.step();
    this.draw();
    requestAnimationFrame(this.loop);
  };

  Genesis.prototype.destroy = function(){
    this._alive = false;
    window.removeEventListener('resize', this.resize);
  };

  var g = new Genesis();
  closeBtn.addEventListener('click', function(){ g.destroy(); root.remove(); var ci=document.getElementById('command-input'); if (ci) ci.focus() });
  appendLog('Neon Evolution online', 'success');
}

export default {
  activate() { buildUI() }
}
