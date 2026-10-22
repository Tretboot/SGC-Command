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

server.listen(8093, async () => {
  const tmpDir = path.join(__dirname, 'chrome-tmp-click');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--window-size=1920,1080',
    '--remote-debugging-port=9228',
    '--user-data-dir=' + tmpDir,
    'http://localhost:8093/game/index.html'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const v = await fetch('http://localhost:9228/json');
  const tabs = await v.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('8093'));

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
    await send('Log.enable');

    ws.addEventListener('message', (event) => {
      const d = JSON.parse(event.data);
      if (d.method === 'Runtime.consoleAPICalled') {
        console.log('[BROWSER LOG]', d.params.type, d.params.args.map(a => a.value || a.description).join(' '));
      } else if (d.method === 'Runtime.exceptionThrown') {
        console.error('[BROWSER ERR]', d.params.exceptionDetails.text, JSON.stringify(d.params.exceptionDetails.exception));
      }
    });

    // Skip intro
    await send('Runtime.evaluate', { expression: '(() => { const b = document.getElementById("intro-skip"); if (b) b.click(); })()' });
    await new Promise(r => setTimeout(r, 500));

    // Set topdown mode like in user's screenshot
    await send('Runtime.evaluate', { expression: 'setGfxMode("topdown");' });

    // Launch mission 1-1
    console.log('1. Launching mission 1-1...');
    await send('Runtime.evaluate', { expression: 'launchMission(CHAPTERS[0].missions[0], [0, 1, 2]);' });
    for (let i = 0; i < 4; i++) {
      await new Promise(r => setTimeout(r, 200));
      await send('Runtime.evaluate', { expression: 'document.getElementById("story-next")?.click()' });
    }
    await new Promise(r => setTimeout(r, 500));
    await send('Runtime.evaluate', { expression: 'skipGate()' });

    // Arrival dialogue
    await new Promise(r => setTimeout(r, 500));
    for (let i = 0; i < 5; i++) {
      await send('Runtime.evaluate', { expression: 'document.getElementById("story-next")?.click()' });
      await new Promise(r => setTimeout(r, 200));
    }

    // Kill enemies to reach victory state
    console.log('2. Defeating enemies...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        Object.values(C.units).forEach(u => {
          if (u.side === 'enemy') { u.hp = 0; u.dead = true; }
        });
        checkEnd();
      })()`
    });

    await new Promise(r => setTimeout(r, 500));

    // Check button coordinates
    const btnRect = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.getElementById('combat-end');
        const r = btn.getBoundingClientRect();
        const elAtPoint = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
        return {
          left: r.left, top: r.top, width: r.width, height: r.height,
          elTag: elAtPoint ? elAtPoint.tagName : null,
          elId: elAtPoint ? elAtPoint.id : null,
          zIndex: window.getComputedStyle(btn).zIndex,
          display: window.getComputedStyle(btn).display
        };
      })()`,
      returnByValue: true
    });
    console.log('Button rect & hit test:', btnRect.result.value);

    // Send real hardware mouse click via CDP to the button center!
    const bx = Math.round(btnRect.result.value.left + btnRect.result.value.width / 2);
    const by = Math.round(btnRect.result.value.top + btnRect.result.value.height / 2);
    console.log('3. Dispatching CDP mouse click to (' + bx + ',' + by + ')...');

    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: bx, y: by, button: 'left', clickCount: 1 });
    await new Promise(r => setTimeout(r, 100));
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: bx, y: by, button: 'left', clickCount: 1 });

    await new Promise(r => setTimeout(r, 500));

    // Check game state after click
    const afterClick = await send('Runtime.evaluate', {
      expression: `({
        C_active: C.active,
        C_result: C.result,
        combatOverlayDisplay: document.getElementById('combat-overlay').style.display,
        modalDisplay: document.getElementById('modal').style.display,
        modalHTML: document.getElementById('modal').innerHTML.slice(0, 150)
      })`,
      returnByValue: true
    });
    console.log('State after CDP click:', afterClick.result.value);

    chrome.kill();
    server.close();
    process.exit(0);
  });
});
