const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(__dirname, '..', reqPath);
  if (!fs.existsSync(filePath)) { res.writeHead(404); res.end(); return; }
  const ext = path.extname(filePath);
  const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css' };
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(8095, async () => {
  const tmpDir = path.join(__dirname, 'chrome-ui-check');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9226',
    '--window-size=1280,900',
    '--user-data-dir=' + tmpDir,
    'http://localhost:8095/game/index.html'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const v = await fetch('http://localhost:9226/json');
  const tabs = await v.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('8095'));

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
    await send('Runtime.evaluate', { expression: 'finishOpeningCinematic();' });
    await send('Runtime.evaluate', { expression: 'startCombat(CHAPTERS[0].missions[0], [0, 1, 2]); document.getElementById("combat-overlay").style.display="flex"; renderAll();' });

    await new Promise(r => setTimeout(r, 500));

    const check = await send('Runtime.evaluate', {
      expression: `(() => {
        const cui = document.getElementById("combat-ui");
        const cov = document.getElementById("combat-overlay");
        const cv = document.getElementById("combat-cv");
        return {
          cui_display: cui ? cui.style.display : null,
          cui_computed_display: cui ? window.getComputedStyle(cui).display : null,
          cui_rect: cui ? cui.getBoundingClientRect() : null,
          cui_zIndex: cui ? window.getComputedStyle(cui).zIndex : null,
          cui_innerHTML_len: cui ? cui.innerHTML.length : 0,
          cov_display: cov ? cov.style.display : null,
          cov_computed_display: cov ? window.getComputedStyle(cov).display : null,
          cov_rect: cov ? cov.getBoundingClientRect() : null,
          cov_zIndex: cov ? window.getComputedStyle(cov).zIndex : null,
          window_innerHeight: window.innerHeight
        };
      })()`,
      returnByValue: true
    });

    console.log('Combat UI Check:', check.result.value);

    chrome.kill();
    server.close();
    process.exit(0);
  });
});

