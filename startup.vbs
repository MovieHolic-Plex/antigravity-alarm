Set WshShell = CreateObject("WScript.Shell")
' ELECTRON_RUN_AS_NODE 환경변수를 해제하고 Electron 앱을 백그라운드로 실행
WshShell.Run "cmd.exe /c set ELECTRON_RUN_AS_NODE= & ""C:\Users\hyeon\projects2\popup\antigravity-alarm\node_modules\electron\dist\electron.exe"" ""C:\Users\hyeon\projects2\popup\antigravity-alarm""", 0, False
