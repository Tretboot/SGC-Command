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

server.listen(8090, async () => {
  const tmpDir = path.join(__dirname, 'chrome-tmp-prof');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--window-size=1920,1080',
    '--remote-debugging-port=9231',
    '--user-data-dir=' + tmpDir,
    'http://localhost:8090/game/index.html'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const v = await fetch('http://localhost:9231/json');
  const tabs = await v.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('8090'));
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

    // Profile the frame function step by step in combat
    const profRes = await send('Runtime.evaluate', {
      expression: `(() => {
        let stats = {
          renderCombatTotal: 0,
          renderCombatUI: 0,
          resizeCombatViewport: 0,
          winampVis: 0,
          other: 0
        };

        // Measure 30 frames
        let times = [];
        for (let i = 0; i < 30; i++) {
          let t0 = performance.now();
          renderCombat(document.getElementById('combat-cv'));
          let t1 = performance.now();
          renderCombatUI();
          let t2 = performance.now();
          resizeCombatViewport();
          let t3 = performance.now();
          if (typeof WINAMP !== 'undefined' && WINAMP.drawVis) WINAMP.drawVis();
          let t4 = performance.now();

          stats.renderCombatTotal += (t1 - t0);
          stats.renderCombatUI += (t2 - t1);
          stats.resizeCombatViewport += (t3 - t2);
          stats.winampVis += (t4 - t3);
        }
        for (let k in stats) stats[k] = (stats[k] / 30).toFixed(2);
        return {
          stats,
          gfxMode: getGfxMode(),
          activeCode: STRUDEL.activeCode ? STRUDEL.activeCode.slice(0, 50) : null
        };
      })()`,
      returnByValue: true
    });
    console.log('Synchronous Profiler Results:', profRes.result.value);

    // Now let's check what is happening in the actual requestAnimationFrame loop:
    const rafProfile = await send('Runtime.evaluate', {
      expression: `new Promise(resolve => {
        let originalFrame = window.frame;
        let measurements = [];
        let framesCount = 0;
        let lastRaf = performance.now();

        // Monkey-patch frame function to measure each call
        window.frame = function(now) {
          let tStart = performance.now();
          let gap = tStart - lastRaf;
          lastRaf = tStart;

          let t0 = performance.now();
          if (C.active) {
            renderCombat(document.getElementById('combat-cv'));
            let t1 = performance.now();
            renderCombatUI();
            let t2 = performance.now();
            resizeCombatViewport();
            let t3 = performance.now();
            document.getElementById('combat-end').style.display = C.result ? 'inline-block' : 'none';
            let t4 = performance.now();
            measurements.push({ gap, tRender: t1 - t0, tUI: t2 - t1, tResize: t3 - t2, tTotal: t4 - t0 });
          }
          framesCount++;
          if (framesCount >= 30) {
            window.frame = originalFrame;
            resolve(measurements);
          } else {
            requestAnimationFrame(window.frame);
          }
        };
      })`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('RAF Measurements sample (first 5):', rafProfile.result.value.slice(0, 5));
    let avgGap = rafProfile.result.value.reduce((a, b) => a + b.gap, 0) / rafProfile.result.value.length;
    let avgRender = rafProfile.result.value.reduce((a, b) => a + b.tRender, 0) / rafProfile.result.value.length;
    let avgUI = rafProfile.result.value.reduce((a, b) => a + b.tUI, 0) / rafProfile.result.value.length;
    let avgResize = rafProfile.result.value.reduce((a, b) => a + b.tResize, 0) / rafProfile.result.value.length;
    console.log('RAF Averages:', { avgGap: avgGap.toFixed(2), avgRender: avgRender.toFixed(2), avgUI: avgUI.toFixed(2), avgResize: avgResize.toFixed(2) });

    chrome.kill();
    server.close();
    process.exit(0);
  });
});
