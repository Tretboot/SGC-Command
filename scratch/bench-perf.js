const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/game/index.html';
  const filePath = path.join(__dirname, '..', reqPath);
  if (!fs.existsSync(filePath)) { res.writeHead(404); res.end(); return; }
  const ext = path.extname(filePath);
  const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css' };
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(8091, async () => {
  const tmpDir = path.join(__dirname, 'chrome-tmp-perf');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--window-size=1920,1080',
    '--remote-debugging-port=9230',
    '--user-data-dir=' + tmpDir,
    'http://localhost:8091/game/index.html'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const v = await fetch('http://localhost:9230/json');
  const tabs = await v.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('8091'));
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise(res => {
    const msgId = id++;
    const handler = (event) => {
      const d = JSON.parse(event.data);
      if (d.id === msgId) { ws.removeEventListener('message', handler); res(d.result); }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
  ws.addEventListener('open', async () => {
    await send('Runtime.enable');
    await send('Runtime.evaluate', { expression: '(() => { const b = document.getElementById("intro-skip"); if (b) b.click(); })()' });
    await new Promise(r => setTimeout(r, 500));

    // Profile base view frame times
    const perfBase = await send('Runtime.evaluate', {
      expression: `new Promise(resolve => {
        let frames = 0;
        let times = [];
        let last = performance.now();
        function loop() {
          let now = performance.now();
          times.push(now - last);
          last = now;
          frames++;
          if (frames >= 60) {
            let avg = times.reduce((a,b)=>a+b,0)/times.length;
            let max = Math.max(...times);
            resolve({ avgMs: avg.toFixed(2), maxMs: max.toFixed(2), fps: (1000/avg).toFixed(1) });
          } else {
            requestAnimationFrame(loop);
          }
        }
        requestAnimationFrame(loop);
      })`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Base View Frame Times:', perfBase.result.value);

    // Launch combat
    await send('Runtime.evaluate', { expression: 'launchMission(CHAPTERS[0].missions[0], [0, 1, 2]);' });
    for (let i = 0; i < 4; i++) {
      await new Promise(r => setTimeout(r, 200));
      await send('Runtime.evaluate', { expression: 'document.getElementById("story-next")?.click()' });
    }
    await new Promise(r => setTimeout(r, 500));
    await send('Runtime.evaluate', { expression: 'skipGate()' });
    await new Promise(r => setTimeout(r, 500));
    for (let i = 0; i < 5; i++) {
      await send('Runtime.evaluate', { expression: 'document.getElementById("story-next")?.click()' });
      await new Promise(r => setTimeout(r, 200));
    }

    // Profile combat view frame times
    const perfCombat = await send('Runtime.evaluate', {
      expression: `new Promise(resolve => {
        let frames = 0;
        let times = [];
        let last = performance.now();
        function loop() {
          let now = performance.now();
          times.push(now - last);
          last = now;
          frames++;
          if (frames >= 60) {
            let avg = times.reduce((a,b)=>a+b,0)/times.length;
            let max = Math.max(...times);
            resolve({ avgMs: avg.toFixed(2), maxMs: max.toFixed(2), fps: (1000/avg).toFixed(1) });
          } else {
            requestAnimationFrame(loop);
          }
        }
        requestAnimationFrame(loop);
      })`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Combat View Frame Times:', perfCombat.result.value);

    // Detailed function breakdown in combat frame
    const profile = await send('Runtime.evaluate', {
      expression: `(() => {
        const cv = document.getElementById('combat-cv');
        let t0 = performance.now();
        renderCombat(cv);
        let tRender = performance.now() - t0;

        let t1 = performance.now();
        renderCombatUI();
        let tUI = performance.now() - t1;

        let t2 = performance.now();
        resizeCombatViewport();
        let tResize = performance.now() - t2;

        return { tRenderMs: tRender.toFixed(2), tUIMs: tUI.toFixed(2), tResizeMs: tResize.toFixed(2) };
      })()`,
      returnByValue: true
    });
    console.log('Combat breakdown (1 frame):', profile.result.value);

    chrome.kill();
    server.close();
    process.exit(0);
  });
});
