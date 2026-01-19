import SoundManager from './audio.js';

function buildUI() {
  Array.prototype.slice.call(document.querySelectorAll('.generated-component')).forEach(function (el) { el.remove() });
  var host = document.getElementById('app') || document.body;
  var root = document.createElement('div');
  root.className = 'generated-component scale-up';
  root.style.width = '620px';
  root.style.padding = '20px 24px 24px 24px';

  var top = document.createElement('div');
  top.style.display = 'flex';
  top.style.alignItems = 'center';
  top.style.justifyContent = 'space-between';
  top.style.marginBottom = '12px';

  var level = document.createElement('div');
  level.style.fontFamily = 'JetBrains Mono, monospace';
  level.style.color = 'var(--cyber-blue)';
  level.textContent = 'Level: 1';

  function mkBtn(t){ var b=document.createElement('button'); b.textContent=t; b.style.border='1px solid rgba(0,243,255,0.4)'; b.style.borderRadius='10px'; b.style.padding='8px 12px'; b.style.background='rgba(0,0,0,0.25)'; b.style.color='var(--neon-green)'; b.style.cursor='pointer'; b.style.fontFamily='JetBrains Mono, monospace'; return b }
  var startBtn = mkBtn('Start Game');
  var exitBtn = mkBtn('Exit');

  top.appendChild(level);
  top.appendChild(startBtn);
  top.appendChild(exitBtn);

  var grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
  grid.style.gap = '12px';
  grid.style.width = '100%';
  grid.style.marginTop = '10px';

  var colors = [
    { base: 'rgba(255,60,60,0.35)', active: '#ff3c3c', glow: 'rgba(255,60,60,0.8)' },
    { base: 'rgba(0,150,255,0.35)', active: '#2693ff', glow: 'rgba(0,150,255,0.8)' },
    { base: 'rgba(0,255,65,0.35)', active: '#00ff41', glow: 'rgba(0,255,65,0.8)' },
    { base: 'rgba(255,215,0,0.35)', active: '#ffd700', glow: 'rgba(255,215,0,0.8)' }
  ];

  var tiles = [];
  for (var i=0;i<4;i++){
    var t = document.createElement('div');
    t.style.height = '160px';
    t.style.border = '1px solid rgba(0,243,255,0.3)';
    t.style.borderRadius = '12px';
    t.style.background = colors[i].base;
    t.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
    t.style.cursor = 'pointer';
    t.setAttribute('data-idx', i);
    grid.appendChild(t);
    tiles.push(t);
  }

  root.appendChild(top);
  root.appendChild(grid);
  host.appendChild(root);

  var sound = new SoundManager();
  function unlockOnce() { sound.unlock() }
  window.addEventListener('pointerdown', unlockOnce, { once: true });
  window.addEventListener('keydown', unlockOnce, { once: true });

  var seq = [];
  var levelNum = 1;
  var playing = false;
  var expectingIndex = 0;
  var timers = [];

  function setLevel(n){ levelNum = n; level.textContent = 'Level: ' + n }
  function clearTimers(){ for (var i=0;i<timers.length;i++) clearTimeout(timers[i]); timers.length = 0 }
  function randStep(){ return Math.floor(Math.random()*4) }
  function speed(){ var base = 620; var s = Math.max(220, base - (levelNum-1)*40); return s }

  function toneFor(idx){ var map = [520, 720, 600, 840]; return map[idx] }
  function activateTile(idx, dur){ var c = colors[idx]; var t = tiles[idx]; t.style.background = c.active; t.style.boxShadow = '0 0 24px ' + c.glow; sound.playTone(toneFor(idx), 'sine', (dur||0.28), { volume: 0.22 }); timers.push(setTimeout(function(){ t.style.background = c.base; t.style.boxShadow = '0 0 0 rgba(0,0,0,0)' }, Math.max(120, dur?dur*1000:240))) }

  function playSequence(){ playing = true; expectingIndex = 0; clearTimers(); var s = speed(); for (var i=0;i<seq.length;i++){ (function(ii){ timers.push(setTimeout(function(){ activateTile(seq[ii], 0.22) }, ii * s)) })(i) } timers.push(setTimeout(function(){ playing = false }, seq.length * s + 80)) }

  function reset(){ seq = []; setLevel(1); seq.push(randStep()); playSequence() }
  function next(){ setLevel(levelNum+1); seq.push(randStep()); sound.playSuccess(); playSequence() }

  function fail(){ playing = true; clearTimers(); for (var k=0;k<tiles.length;k++){ tiles[k].style.background = 'rgba(255,0,0,0.35)'; tiles[k].style.boxShadow = '0 0 28px rgba(255,0,0,0.6)' } sound.playError(); level.textContent = 'Breach Failed'; timers.push(setTimeout(function(){ for (var k2=0;k2<tiles.length;k2++){ tiles[k2].style.boxShadow = '0 0 0 rgba(0,0,0,0)'; tiles[k2].style.background = colors[k2].base } reset() }, 900)) }

  function onTileClick(e){ var idx = parseInt(e.currentTarget.getAttribute('data-idx')||'0',10); if (playing) return; activateTile(idx, 0.15); if (idx === seq[expectingIndex]){ expectingIndex++; if (expectingIndex >= seq.length){ timers.push(setTimeout(function(){ next() }, 380)) } } else { fail() } }

  for (var j=0;j<tiles.length;j++){ tiles[j].addEventListener('click', onTileClick) }
  startBtn.addEventListener('click', function(){ reset() });
  exitBtn.addEventListener('click', function(){ clearTimers(); root.remove(); var ci=document.getElementById('command-input'); if (ci) ci.focus() });
}

export default {
  activate() { buildUI() }
}
