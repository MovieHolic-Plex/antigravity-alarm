const http = require('http');

const data = JSON.stringify({
  threadId: "Thread-Korean",
  message: "안녕하세요! 한글이 완벽하게 전송되었습니다. 클릭하면 Antigravity 에디터가 열립니다."
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

const req = http.request(options, (res) => {
  res.on('data', (chunk) => {
    console.log(`응답: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`요청 오류: ${e.message}`);
});

req.write(data);
req.end();
console.log('테스트 알람(한글)을 전송했습니다!');
