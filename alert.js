const path = require('path');
const http = require('http');

let msg = process.argv[2];
if (!msg || msg === '--max') {
    msg = "Antigravity 작업이 완료되었습니다! 화면을 확인하세요.";
}

let targetWorkspace = process.argv[3];
if (!targetWorkspace || targetWorkspace === '--max') {
    // 사용자가 폴더명을 명시하지 않으면 자동으로 현재 경로의 폴더명을 추적!
    targetWorkspace = path.basename(process.cwd());
}

const threadId = "Antigravity-Done"; 
const isMaximize = process.argv.includes('--max');

const data = JSON.stringify({
  threadId: threadId,
  message: msg,
  targetWorkspace: targetWorkspace,
  maximize: isMaximize
});

const options = {
  hostname: '127.0.0.1',
  port: 35000,
  path: '/api/notify',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data, 'utf8')
  }
};

const req = http.request(options);
req.on('error', (e) => {
  console.error(`알람 발송 실패 (서버가 켜져있는지 확인하세요): ${e.message}`);
});
req.write(data);
req.end();
