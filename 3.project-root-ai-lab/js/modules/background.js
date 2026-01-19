export function initBackground() {
  var layer = document.getElementById('background-layer');
  if (!layer || typeof THREE === 'undefined') return;
  while (layer.firstChild) layer.removeChild(layer.firstChild);
  var canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.zIndex = '0';
  canvas.style.pointerEvents = 'none';
  layer.appendChild(canvas);

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  var isMobile = ('ontouchstart' in window) || (navigator && navigator.maxTouchPoints > 0);
  var maxDPR = isMobile ? 1.5 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDPR));
  renderer.setClearColor(0x000000, 1);

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 80, 600);
  var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2000);
  camera.position.set(0, 65, 180);

  function setSize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  setSize();
  window.addEventListener('resize', setSize);

  var base = { cols: 140, rows: 70, sep: 12 };
  var cols = base.cols, rows = base.rows, sep = base.sep;
  var geometry = null, material = null, points = null;
  var halfW = 0, halfH = 0;

  function buildGrid() {
    var count = cols * rows;
    var positions = new Float32Array(count * 3);
    var colors = new Float32Array(count * 3);
    var idx = 0;
    halfW = (cols - 1) * sep * 0.5;
    halfH = (rows - 1) * sep * 0.5;
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var px = x * sep - halfW;
        var py = 0;
        var pz = y * sep - halfH - 300;
        positions[idx * 3 + 0] = px;
        positions[idx * 3 + 1] = py;
        positions[idx * 3 + 2] = pz;
        var t = cols>1 ? (x / (cols - 1)) : 0;
        var r = (0x00) / 255;
        var g = (0xff * t + 0xf3 * (1 - t)) / 255;
        var b = (0x41 * t + 0xff * (1 - t)) / 255;
        colors[idx * 3 + 0] = r;
        colors[idx * 3 + 1] = g;
        colors[idx * 3 + 2] = b;
        idx++;
      }
    }
    if (geometry) { try { geometry.dispose() } catch (_) {} }
    if (material) { try { material.dispose() } catch (_) {} }
    if (points) { try { scene.remove(points) } catch (_) {} }
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    material = new THREE.PointsMaterial({ size: 2.2, transparent: true, opacity: 0.95, vertexColors: true });
    points = new THREE.Points(geometry, material);
    scene.add(points);
  }
  buildGrid();

  var mouse = { x: 0, y: 0 };
  var targetRotX = 0, targetRotY = 0;

  var clock = new THREE.Clock();
  var travel = 0;
  var running = true;
  var rafId = 0;
  var fpsNow = performance.now();
  var fpsLast = fpsNow;
  var lowFpsDuration = 0;
  var degraded = false;

  function animate() {
    if (!running) return;
    var t = clock.getElapsedTime();
    var pos = geometry.attributes.position.array;
    var i = 0;
    for (var ry = 0; ry < rows; ry++) {
      for (var rx = 0; rx < cols; rx++) {
        var baseX = rx * sep - halfW;
        var baseZ = ry * sep - halfH - 300;
        var yWave = Math.sin((rx * 0.16) + (ry * 0.22) + t * 1.6) * 4.5;
        pos[i + 0] = baseX;
        pos[i + 1] = yWave;
        pos[i + 2] = baseZ + travel;
        i += 3;
      }
    }
    geometry.attributes.position.needsUpdate = true;

    travel += 0.9;
    if (travel > 240) travel = 0;

    camera.rotation.x += (targetRotX - camera.rotation.x) * 0.06;
    camera.rotation.y += (targetRotY - camera.rotation.y) * 0.06;

    renderer.render(scene, camera);
    var now = performance.now();
    var dt = now - fpsLast;
    var fps = dt > 0 ? (1000 / dt) : 60;
    fpsLast = now;
    if (fps < 30) { lowFpsDuration += dt / 1000 } else { lowFpsDuration = Math.max(0, lowFpsDuration - dt / 1000) }
    if (!degraded && lowFpsDuration > 3) {
      degraded = true;
      cols = Math.max(60, Math.floor(cols * 0.6));
      rows = Math.max(30, Math.floor(rows * 0.6));
      sep = Math.min(sep * 1.15, 16);
      if (material) { try { material.size = 1.8 } catch (_) {} }
      buildGrid();
    }
    rafId = requestAnimationFrame(animate);
  }
  rafId = requestAnimationFrame(animate);

  function pause(){ if (!running) return; running = false; if (rafId) { try { cancelAnimationFrame(rafId) } catch (_) {} rafId = 0 } }
  function resume(){ if (running) return; running = true; fpsLast = performance.now(); rafId = requestAnimationFrame(animate) }

  function cleanup(){
    try { pause() } catch (_) {}
    window.removeEventListener('resize', setSize);
    window.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('visibilitychange', visHandler);
    if (io) { try { io.disconnect() } catch (_) {} }
    if (points) { try { scene.remove(points) } catch (_) {} }
    if (geometry) { try { geometry.dispose() } catch (_) {} }
    if (material) { try { material.dispose() } catch (_) {} }
    try { renderer.dispose() } catch (_) {}
    try { if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas) } catch (_) {}
  }

  function mouseMoveHandler(e){
    var w = window.innerWidth, h = window.innerHeight;
    mouse.x = (e.clientX / w) * 2 - 1;
    mouse.y = (e.clientY / h) * 2 - 1;
    targetRotY = mouse.x * 0.08;
    targetRotX = -mouse.y * 0.06;
  }
  document.removeEventListener('visibilitychange', function(){});
  window.removeEventListener('mousemove', function(){});
  window.addEventListener('mousemove', mouseMoveHandler);

  function visHandler(){ if (document.hidden) pause(); else resume() }
  document.addEventListener('visibilitychange', visHandler);

  var io = null;
  try {
    io = new IntersectionObserver(function(entries){
      var e = entries && entries[0];
      if (!e) return;
      if (e.isIntersecting) resume(); else pause();
    }, { root: null, threshold: 0 });
    io.observe(layer);
  } catch (_) {}

  if (!window.PROMETHEUS) window.PROMETHEUS = {};
  window.PROMETHEUS.backgroundPause = pause;
  window.PROMETHEUS.backgroundResume = resume;
  window.PROMETHEUS.backgroundCleanup = cleanup;
  window.addEventListener('beforeunload', cleanup);
}
