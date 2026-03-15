Set WshShell = CreateObject("WScript.Shell")
' Electron을 윈도우 모드로 숨겨서 백그라운드에서 실행하는 스트립트 (부팅 시 활용)
WshShell.Run "cmd.exe /c set ELECTRON_RUN_AS_NODE= && ""C:\Users\hyeon\projects2\popup\antigravity-alarm\node_modules\electron\dist\electron.exe"" ""C:\Users\hyeon\projects2\popup\antigravity-alarm""", 0, False
