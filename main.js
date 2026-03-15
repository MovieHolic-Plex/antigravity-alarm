const { app, BrowserWindow, Tray, Menu, Notification, nativeImage } = require('electron');
const path = require('path');
const express = require('express');

 

let mainWindow;
let tray;
const expressApp = express();
expressApp.use(express.json());

const PORT = 35000;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    show: false, // 프로그램 시작 시 창을 띄우지 않고 백그라운드(트레이)에 숨겨둡니다.
    title: "Antigravity 클라이언트",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');

  // 최소화 또는 닫기 버튼 클릭 시 진짜로 끄지 않고 트레이로 숨기기
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

// 프로그램 중복 실행 방지
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  // 이미 실행 중인데 또 켰을 경우 기존 창을 맨 앞으로 띄움
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    
    // 트레이 아이콘 세팅 (1x1 임시 투명 픽셀 생성)
    const icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
    tray = new Tray(icon);
    
    // 우클릭 메뉴
    const contextMenu = Menu.buildFromTemplate([
      { label: '클라이언트 열기', click: () => mainWindow.show() },
      { label: '완전 종료', click: () => {
          app.isQuiting = true;
          app.quit();
        } 
      }
    ]);
    tray.setToolTip('Antigravity 대기 상태');
    tray.setContextMenu(contextMenu);
    
    // 트레이 아이콘 더블클릭 시 메인 윈도우 표시
    tray.on('double-click', () => {
      mainWindow.show();
    });

    // ----------------------------------------------------
    // [백그라운드 API 서버 설정] 다른 앱에서 POST로 쏴줍니다.
    expressApp.post('/api/notify', (req, res) => {
      const { threadId, message, targetWorkspace } = req.body;

      if (!Notification.isSupported()) {
        return res.status(500).json({ error: '알림을 지원하지 않는 환경입니다.' });
      }

      // 우측 하단 윈도우 토스트 알림 띄우기
      const notification = new Notification({
        title: '새로운 메시지 도착!',
        body: message || `쓰레드 아이디 [${threadId}]에서 호출이 왔습니다.`
      });

      // 🔴 [핵심 로직] 사용자가 알림을 '클릭'했을 때의 이벤트
      notification.on('click', () => {
        // 1. Antigravity 에디터 중, 자신을 호출한 작업 공간(폴더명)이 들어간 진짜 창을 뽑아옵니다!
        const workspaceArg = targetWorkspace ? ` -TargetTitlePart "${targetWorkspace}"` : "";
        require('child_process').exec('powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + path.join(__dirname, 'focus.ps1') + '"' + workspaceArg, (err) => {
          if (err) console.error("Antigravity 포커스 스크립트 실행 실패:", err);
        });

        // 2. 혹시 몰라 트레이용 미니 창에도 쓰레드 정보를 넘겨둡니다 (옵션)
        mainWindow.webContents.send('open-thread', threadId);
      });

      notification.show();
      res.json({ success: true, message: '알림이 정상적으로 윈도우에 표시되었습니다.' });
    });

    // 서버 시작 (백그라운드 포트 35000)
    expressApp.listen(PORT, '127.0.0.1', () => {
      console.log(`[서버 준비 완료] http://127.0.0.1:${PORT} 에서 대기 중입니다.`);
      // 처음 실행 시 잘 켜졌다고 알림 출력
      new Notification({ title: 'Antigravity Alarm', body: '프로그램이 시작되어 트레이에 상주합니다.' }).show();
    });
  });
}
