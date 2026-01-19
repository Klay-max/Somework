import SoundManager from './audio.js';

function appendLog(text, cls) {
  var out = document.getElementById('terminal-output');
  if (!out) return;
  var line = document.createElement('div');
  line.className = 'log-line' + (cls ? ' ' + cls : '');
  line.textContent = text;
  out.appendChild(line);
}

function createProcessing() {
  var out = document.getElementById('terminal-output');
  if (!out) return null;
  var wrap = document.createElement('div');
  wrap.className = 'log-line';
  var span = document.createElement('span');
  span.textContent = 'Processing logic matrix...';
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

function buildGame() {
  var content = document.createElement('div');
  content.style.width = '640px';
  content.style.padding = '8px 12px 12px 12px';

  var score = document.createElement('div');
  score.style.fontFamily = 'JetBrains Mono, monospace';
  score.style.color = 'var(--cyber-blue)';
  score.style.marginBottom = '10px';
  score.textContent = 'Score: 0';

  var canvas = document.createElement('canvas');
  canvas.id = 'game-canvas';
  canvas.style.display = 'block';
  canvas.style.border = '1px solid rgba(0,243,255,0.3)';
  canvas.style.borderRadius = '10px';
  canvas.style.background = 'rgba(0,0,0,0.25)';
  canvas.style.touchAction = 'none';
  canvas.setAttribute('tabindex', '0');

  content.appendChild(score);
  content.appendChild(canvas);

  var sound = new SoundManager();
  function unlockOnce() { sound.unlock() }
  window.addEventListener('pointerdown', unlockOnce, { once: true });
  window.addEventListener('keydown', unlockOnce, { once: true });

  function SnakeGame() {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 600;
    this.canvas.height = 400;
    this.canvas.style.width = '600px';
    this.canvas.style.height = '400px';
    this.cell = 20;
    this.cols = Math.floor(this.canvas.width / this.cell);
    this.rows = Math.floor(this.canvas.height / this.cell);
    this.scoreEl = score;
    this.sound = sound;
    this.interval = 130;
    this.last = 0;
    this.running = true;
    this._alive = true;
    this.reset();
    this._keyHandler = this.onKey.bind(this);
    window.addEventListener('keydown', this._keyHandler, { passive: false });
    this.canvas.focus();
    this.loop = this.loop.bind(this);
    this._rafId = requestAnimationFrame(this.loop);
  }

  SnakeGame.prototype.reset = function () {
    this.dir = { x: 1, y: 0 };
    var cx = Math.floor(this.cols / 2), cy = Math.floor(this.rows / 2);
    this.snake = [ { x: cx - 1, y: cy }, { x: cx, y: cy }, { x: cx + 1, y: cy } ];
    this.food = this.spawnFood();
    this.score = 0;
    this.updateScore();
  };

  SnakeGame.prototype.updateScore = function () {
    this.scoreEl.textContent = 'Score: ' + this.score;
  };

  SnakeGame.prototype.spawnFood = function () {
    var pos;
    for (var tries = 0; tries < 100; tries++) {
      pos = { x: Math.floor(Math.random() * this.cols), y: Math.floor(Math.random() * this.rows) };
      var collides = false;
      for (var i = 0; i < this.snake.length; i++) { if (this.snake[i].x === pos.x && this.snake[i].y === pos.y) { collides = true; break } }
      if (!collides) return pos;
    }
    return { x: 1, y: 1 };
  };

  SnakeGame.prototype.onKey = function (e) {
    var k = e.key;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].indexOf(k) >= 0) e.preventDefault();
    if (!this.running && k === ' ') { this.running = true; this.reset(); return }
    if (k === 'ArrowUp' && this.dir.y !== 1) { this.dir = { x: 0, y: -1 } }
    else if (k === 'ArrowDown' && this.dir.y !== -1) { this.dir = { x: 0, y: 1 } }
    else if (k === 'ArrowLeft' && this.dir.x !== 1) { this.dir = { x: -1, y: 0 } }
    else if (k === 'ArrowRight' && this.dir.x !== -1) { this.dir = { x: 1, y: 0 } }
  };

  SnakeGame.prototype.step = function () {
    if (!this.running) return;
    var head = this.snake[this.snake.length - 1];
    var nx = head.x + this.dir.x;
    var ny = head.y + this.dir.y;
    if (nx < 0 || ny < 0 || nx >= this.cols || ny >= this.rows) { this.gameOver(); return }
    for (var i = 0; i < this.snake.length; i++) { if (this.snake[i].x === nx && this.snake[i].y === ny) { this.gameOver(); return } }
    var ate = (nx === this.food.x && ny === this.food.y);
    this.snake.push({ x: nx, y: ny });
    if (!ate) { this.snake.shift() } else { this.score += 10; this.updateScore(); this.food = this.spawnFood(); this.sound.playEat() }
  };

  SnakeGame.prototype.draw = function (t) {
    var w = this.canvas.width, h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.strokeStyle = 'rgba(0,243,255,0.07)';
    this.ctx.lineWidth = 1;
    for (var gx = 0; gx <= w; gx += this.cell) { this.ctx.beginPath(); this.ctx.moveTo(gx, 0); this.ctx.lineTo(gx, h); this.ctx.stroke() }
    for (var gy = 0; gy <= h; gy += this.cell) { this.ctx.beginPath(); this.ctx.moveTo(0, gy); this.ctx.lineTo(w, gy); this.ctx.stroke() }
    this.ctx.fillStyle = 'rgba(0,255,65,0.95)';
    for (var i = 0; i < this.snake.length; i++) {
      var s = this.snake[i];
      this.ctx.fillRect(s.x * this.cell + 1, s.y * this.cell + 1, this.cell - 2, this.cell - 2);
    }
    var pulse = (Math.sin(t / 120) + 1) * 0.5;
    this.ctx.fillStyle = 'rgba(255,60,60,' + (0.5 + 0.5 * pulse) + ')';
    this.ctx.fillRect(this.food.x * this.cell + 2, this.food.y * this.cell + 2, this.cell - 4, this.cell - 4);
    if (!this.running) {
      this.ctx.fillStyle = 'rgba(5,5,5,0.6)';
      this.ctx.fillRect(0, h/2 - 28, w, 56);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '16px JetBrains Mono, monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER - Press Space to Restart', w/2, h/2 + 6);
    }
  };

  SnakeGame.prototype.gameOver = function () {
    this.running = false;
    this.sound.playCrash();
    appendLog('GAME OVER', 'error');
  };

  SnakeGame.prototype.loop = function (ts) {
    if (!this._alive) return;
    if (this.running) {
      if (!this.last) this.last = ts;
      if (ts - this.last >= this.interval) { this.step(); this.last = ts }
    }
    this.draw(ts || 0);
    this._rafId = requestAnimationFrame(this.loop);
  };

  SnakeGame.prototype.destroy = function () {
    this._alive = false;
    if (this._rafId) { try { cancelAnimationFrame(this._rafId) } catch (_) {} }
    window.removeEventListener('keydown', this._keyHandler);
  };

  var game = new SnakeGame();
  var isTouch = ('ontouchstart' in window) || (navigator && navigator.maxTouchPoints > 0);
  if (isTouch) {
    var pad = document.createElement('div');
    pad.style.width = '200px';
    pad.style.margin = '10px auto 0 auto';
    pad.style.display = 'grid';
    pad.style.gridTemplateColumns = 'repeat(3, 60px)';
    pad.style.gridTemplateRows = 'repeat(3, 60px)';
    pad.style.gap = '8px';
    function mkBtn(txt){
      var b = document.createElement('button');
      b.textContent = txt;
      b.style.background = 'rgba(0,0,0,0.25)';
      b.style.border = '1px solid rgba(0,243,255,0.4)';
      b.style.borderRadius = '10px';
      b.style.color = 'var(--neon-green)';
      b.style.fontFamily = 'JetBrains Mono, monospace';
      b.style.fontSize = '20px';
      b.style.backdropFilter = 'blur(6px)';
      b.style.webkitBackdropFilter = 'blur(6px)';
      b.style.touchAction = 'none';
      return b;
    }
    var up = mkBtn('↑');
    var down = mkBtn('↓');
    var left = mkBtn('←');
    var right = mkBtn('→');
    pad.appendChild(document.createElement('div'));
    pad.appendChild(up);
    pad.appendChild(document.createElement('div'));
    pad.appendChild(left);
    pad.appendChild(document.createElement('div'));
    pad.appendChild(right);
    pad.appendChild(document.createElement('div'));
    pad.appendChild(down);
    pad.appendChild(document.createElement('div'));
    function setUp(e){ e.preventDefault(); if (game.dir.y !== 1) game.dir = { x: 0, y: -1 } }
    function setDown(e){ e.preventDefault(); if (game.dir.y !== -1) game.dir = { x: 0, y: 1 } }
    function setLeft(e){ e.preventDefault(); if (game.dir.x !== 1) game.dir = { x: -1, y: 0 } }
    function setRight(e){ e.preventDefault(); if (game.dir.x !== -1) game.dir = { x: 1, y: 0 } }
    up.addEventListener('pointerdown', setUp);
    down.addEventListener('pointerdown', setDown);
    left.addEventListener('pointerdown', setLeft);
    right.addEventListener('pointerdown', setRight);
    content.appendChild(pad);
  }
  var modalApi = (window.PROMETHEUS && window.PROMETHEUS.createModal) ? window.PROMETHEUS.createModal('Cyber Snake', content, function(){ game.destroy() }) : null;
}

export default {
  init() { return 'UI_SYSTEM_READY'; },
  activate() {
    var proc = createProcessing();
    setTimeout(function () {
      removeProcessing(proc);
      buildGame();
      appendLog('UI component deployed', 'success');
    }, 1500);
  }
}
