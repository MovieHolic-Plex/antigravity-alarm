const http = require('http');
const path = require('path');

const msg = process.argv[2] || "Antigravity 작업이 완료되었습니다! 화면을 확인하세요.";
// [핵심 변경점] 터미널에서 AI가 인자로 넘길 해당 프로젝트 이름(창 제목의 앞부분)을 받습니다.
// 예: node alert.js "작업끝" "popup"
const targetWorkspace = process.argv[3] || ""; 
const threadId = "Antigravity-Done"; 

// [핵심 변경점] 터미널 명령어 마지막에 --max 플래그를 줬는지 체크합니다.
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
