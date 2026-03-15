const { app, BrowserWindow, Notification, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const child_process = require('child_process');

let mainWindow;
const expressApp = express();
expressApp.use(express.json());

const PORT = 35000;
let notifications = [];

function updateBadge() {
  if (process.platform === 'win32') {
    app.setBadgeCount(notifications.length); // 윈도우11+ 작업표시줄 숫자 배지 지원
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 650,
    title: "Antigravity Dashboard",
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile('index.html');

  // X (닫기) 버튼을 눌렀을 때, 진짜로 끄지 않고 "작업표시줄(Taskbar)"로 단순 최소화!
  // 즉, 트레이 숨기기가 아니라 보통 프로그램처럼 화면 아래에 상주합니다.
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.minimize(); 
    }
  });
}

// 중복 실행 방지
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  // 이미 켜져있는데 또 켜려고 하면 창을 띄워줌
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    updateBadge(); // 초기화

    // 백그라운드 API 서버
    expressApp.post('/api/notify', (req, res) => {
      const { threadId, message, targetWorkspace, maximize } = req.body;
      
      const newNoti = {
        id: Date.now().toString(),
        threadId: threadId || 'N/A',
        workspace: targetWorkspace || path.basename(process.cwd()),
        message: message || '작업 완료',
        time: new Date().toLocaleTimeString(),
        maximize: maximize
      };

      notifications.unshift(newNoti); // 최신이 맨 위로
      updateBadge();

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-list', notifications);
        
        // 🔴 [핵심 피드백 반영] 알람이 오면 작업표시줄 아이콘을 주황색으로 번쩍이게(Flash) 합니다!
        if (mainWindow.isMinimized() || !mainWindow.isFocused()) {
           mainWindow.flashFrame(true); 
        }
      }

      // 우측 하단 윈도우 토스트도 계속 띄워줍니다.
      if (Notification.isSupported()) {
        const toast = new Notification({
          title: `[${newNoti.workspace}] 작업 완료!`,
          body: newNoti.message
        });
        toast.on('click', () => {
          if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
            mainWindow.flashFrame(false); // 번쩍임 끄기
          }
        });
        toast.show();
      }

      res.json({ success: true, total: notifications.length });
    });

    expressApp.listen(PORT, '127.0.0.1');

    // 렌더러(목록)에서 유저가 특정 알림을 클릭했을 때!
    ipcMain.on('click-notification', (event, id) => {
      const noti = notifications.find(n => n.id === id);
      if (noti) {
        triggerFocus(noti);
      }
    });

    // 모두 지우기
    ipcMain.on('clear-all', () => {
      notifications = [];
      updateBadge();
      mainWindow.webContents.send('update-list', notifications);
      mainWindow.flashFrame(false);
    });
  });
}

function triggerFocus(noti) {
  // 사용자가 폴더(Workspace) 명이 포함된 창만 열고, 무조건 전체 화면(-Maximize)으로 열게 요청
  const workspaceArg = noti.workspace ? ` -TargetTitlePart "${noti.workspace}"` : "";
  const maxArg = " -Maximize"; 
  const psScript = path.join(__dirname, 'focus.ps1');

  // Powershell 에 스크립트 실행
  child_process.exec(`powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File "${psScript}"${workspaceArg}${maxArg}`, (err) => {
    if (err) console.error("포커스 실행 에러(무시 가능):", err);
  });

  // 해당 알림은 클릭했으므로 삭제
  notifications = notifications.filter(n => n.id !== noti.id);
  updateBadge();
  mainWindow.webContents.send('update-list', notifications);
  mainWindow.flashFrame(false);
}
