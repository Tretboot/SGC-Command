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

server.listen(8096, async () => {
  const tmpDir = path.join(__dirname, 'chrome-tmp3');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--user-data-dir=' + tmpDir,
    'http://localhost:8096/game/index.html'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const v = await fetch('http://localhost:9225/json');
  const tabs = await v.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('8096'));

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
    // Launch mission 1-1
    await send('Runtime.evaluate', { expression: 'launchMission(CHAPTERS[0].missions[0], [0, 1, 2]);' });
    // Click through briefing
    for (let i = 0; i < 4; i++) {
      await new Promise(r => setTimeout(r, 300));
      await send('Runtime.evaluate', { expression: 'document.getElementById("story-next")?.click()' });
    }
    // Skip gate animation
    await new Promise(r => setTimeout(r, 500));
    await send('Runtime.evaluate', { expression: 'skipGate()' });

    // Now check if combat is active and click story dialogue arrival
    await new Promise(r => setTimeout(r, 500));
    for (let i = 0; i < 5; i++) {
      const btn = await send('Runtime.evaluate', {
        expression: '(() => { const b = document.getElementById("story-next"); if (b && b.offsetParent !== null) { b.click(); return "clicked"; } return "none"; })()',
        returnByValue: true
      });
      console.log('Arrival dialogue click ' + i + ':', btn.result.value);
      await new Promise(r => setTimeout(r, 400));
    }

    const state = await send('Runtime.evaluate', {
      expression: '({ C_active: C.active, C_selected: C.selected?.name, C_round: C.round, moveRange: C.moveRange.length, atkRange: C.atkRange.length })',
      returnByValue: true
    });
    console.log('Combat interactive state:', state.result.value);

    chrome.kill();
    server.close();
    process.exit(0);
  });
});

