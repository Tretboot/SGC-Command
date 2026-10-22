const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/game/index.html';
  const filePath = path.join(__dirname, '..', reqPath);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found: ' + filePath);
    return;
  }
  const ext = path.extname(filePath);
  const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json' };
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(8098, async () => {
  const tmpDir = path.join(__dirname, 'chrome-temp');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--user-data-dir=' + tmpDir,
    'http://localhost:8098/game/index.html'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const v = await fetch('http://localhost:9223/json');
  const tabs = await v.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('8098'));
  console.log('Target tab:', pageTab.id, pageTab.url);

  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => {
    return new Promise(res => {
      const msgId = id++;
      const handler = (event) => {
        const d = JSON.parse(event.data);
        if (d.id === msgId) {
          ws.removeEventListener('message', handler);
          res(d.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  };

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

    console.log('Evaluating game state in browser...');
    const res1 = await send('Runtime.evaluate', {
      expression: '({ S_day: (typeof S !== "undefined" ? S.day : null), introSeen: (typeof S !== "undefined" ? S.introSeen : null) })',
      returnByValue: true
    });
    console.log('Game state:', res1.result.value);

    // Skip opening cinematic if open
    await send('Runtime.evaluate', {
      expression: '(() => { const b = document.getElementById("intro-skip"); if (b) b.click(); })()'
    });

    // Launch mission 1-1
    console.log('Launching mission 1-1...');
    const launchRes = await send('Runtime.evaluate', {
      expression: '(() => { try { launchMission(CHAPTERS[0].missions[0], [0, 1, 2]); return "ok"; } catch(e) { return e.stack; } })()',
      returnByValue: true
    });
    console.log('Launch result:', launchRes.result.value);

    // Click through briefing dialog
    for (let step = 0; step < 6; step++) {
      await new Promise(r => setTimeout(r, 600));
      const clickRes = await send('Runtime.evaluate', {
        expression: '(() => { const b = document.getElementById("story-next"); if (b) { const t = b.textContent; b.click(); return "clicked " + t; } return "no button"; })()',
        returnByValue: true
      });
      console.log('Briefing step ' + step + ':', clickRes.result.value);
    }

    // Now gate sequence is running! Let us poll gate and combat for 12 seconds!
    for (let s = 0; s < 12; s++) {
      await new Promise(r => setTimeout(r, 1000));
      const gateStatus = await send('Runtime.evaluate', {
        expression: `({
          GR_phase: GR.phase,
          C_active: C.active,
          C_result: C.result,
          gateDisplay: document.getElementById("gate-overlay").style.display,
          combatDisplay: document.getElementById("combat-overlay").style.display,
          storyDialogueDisplay: document.getElementById("story-dialogue").style.display,
          storyDialogueHTML: document.getElementById("story-dialogue").innerHTML.slice(0, 100)
        })`,
        returnByValue: true
      });
      console.log('Gate poll ' + s + ' (' + (s + 1) + 's):', gateStatus.result.value);
    }

    chrome.kill();
    server.close();
    process.exit(0);
  });
});

