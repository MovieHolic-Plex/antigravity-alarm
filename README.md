# Antigravity Workspace Alarm & Focus Tools
[![Korean](https://img.shields.io/badge/Language-Korean-blue)](#korean) [![English](https://img.shields.io/badge/Language-English-red)](#english)

<a name="korean"></a>
## 🇰🇷 한국어

**AI 자동화 코딩 창(IDE)이 여러 개 띄워져 있을 때, 작업이 완료되면 알림을 띄우고 알림을 클릭하면 해당 프로젝트 창을 윈도우 최상단으로 끌어올려 주는 툴입니다.**

### 🎯 어떤 사람이 쓰면 좋은가요?
- **AI AI 코딩 에디터(Antigravity, Cursor, 복수의 VSCode) 유저**: 컴퓨터 한 대로 여러 개의 프로젝트(워크스페이스)를 열어두고 AI에게 백그라운드로 지시를 내리는 분
- **작업 완료를 놓치고 싶지 않은 분**: AI가 긴 작업을 하는 동안 유튜브를 보거나 다른 문서를 작성하다가, 알림 하나로 정확히 작업이 끝난 그 창으로 복귀하고 싶으신 분
- **Windows 환경 프로그래머**: 바탕화면 알림과 자동 화면 전환(Focus) 기능이 필요하신 윈도우 유저

### 🚀 핵심 기능
1. **백그라운드 알람 서버**: 상시 대기하면서 HTTP Request(API)가 날아오면 윈도우 네이티브 Toast 알림을 발생시킵니다.
2. **알람 클릭 시 화면 스위칭**: 여러 IDE가 열려있어 똑같이 생겼어도, 알림을 보낸 '정확히 그 프로젝트 워크스페이스'를 추적하여 화면 최상단으로 꺼내옵니다.

### ⚙️ 설치 및 윈도우 부팅 시 자동 실행 방법
1. 저장소 클론 및 패키지 설치
   ```bash
   git clone <이 저장소 주소>
   cd antigravity-alarm
   npm install
   ```
2. **부팅 시 백그라운드 상주(영구 실행) 방법**
   - 현재 폴더 안의 `startup.vbs` 파일을 복사(Ctrl+C)합니다.
   - 키보드에서 `Win + R`을 누르고 `shell:startup`을 입력한 뒤 엔터를 누릅니다. (시작 프로그램 폴더가 열림)
   - 그 폴더에 "바로 가기 붙여넣기"를 해두시면 컴퓨터를 켤 때마다 까만 콘솔 창 없이 투명하게 백그라운드에서 상주하게 됩니다!

### 💻 사용 방법 (단말 IDE 프롬프트 설정)
AI 코딩 도구의 "전역 규칙(Global Rule)"이나 커스텀 프롬프트 설정에 아래 문장을 추가해 두면 AI가 작업 후 알아서 호출합니다.

> "너에게 부여된 작업(코딩, 질문 등)이 끝나면 마지막으로 터미널에서 `node <절대경로>\antigravity-alarm\alert.js "작업 완료!" "<현재_프로젝트_폴더명>" --max` 명령어를 실행해서 나에게 알람을 띄워줘. `--max` 옵션을 넣으면 창 복귀 시 내 화면이 전체화면으로 커질거야."

---

<br>

<a name="english"></a>
## 🇺🇸 English

**A Windows system tray tool that pops a notification when your AI IDE completes a task, and instantly focuses the exact workspace window when clicked.**

### 🎯 Who is this for?
- **AI AI Editor Users (Antigravity, Cursor, multiple VSCode windows)**: If you run multiple AI coding instances in the background.
- **Multitaskers**: Let the AI code in the background while you do other things. Get notified when it's done and jump right back to the exact project window.
- **Windows Developers**: Anyone needing a quick background API to trigger Windows Toast notifications and automatic window focus manipulation.

### 🚀 Features
1. **Background Server**: Runs silently in the system tray, listening for POST requests to trigger native Windows notifications.
2. **Smart Window Focus**: Uses C# native API (`EnumWindows`) to scan and find the exact IDE window that triggered the alarm based on the workspace name, bringing it to the absolute front.

### ⚙️ Installation & Autostart
1. Clone and install
   ```bash
   git clone <REPO_URL>
   cd antigravity-alarm
   npm install
   ```
2. **Run automatically on Windows Boot (Silent Mode)**
   - Copy `startup.vbs`.
   - Press `Win + R`, type `shell:startup`, and press Enter.
   - "Paste shortcut" into the Startup folder. It will now run completely invisibly every time you boot.

### 💻 How to use (AI Prompt Setup)
Add the following rule to your AI Editor's Global Rules or instructions:

> "When you finish your assigned task, run the following command in the terminal:
> `node <ABSOLUTE_PATH>\antigravity-alarm\alert.js "Task Completed!" "<CURRENT_WORKSPACE_FOLDER_NAME>" --max` 
> The `--max` option will force the window to open in full screen mode."
