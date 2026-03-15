param(
    [string]$TargetTitlePart = "",
    [switch]$Maximize
)

$code = @"
using System;
using System.Text;
using System.Runtime.InteropServices;

public class Win32Helper {
    public delegate bool EnumDelegate(IntPtr hWnd, int lParam);
    
    [DllImport("user32.dll")]
    public static extern bool EnumWindows(EnumDelegate enumProc, IntPtr lParam);
    
    [DllImport("user32.dll", CharSet=CharSet.Auto)]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder strText, int maxCount);
    
    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, int dwExtraInfo);

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

    public static IntPtr FindWindowByTitle(string titlePart) {
        IntPtr found = IntPtr.Zero;
        EnumDelegate filter = delegate(IntPtr hWnd, int lParam) {
            if (IsWindowVisible(hWnd)) {
                StringBuilder sb = new StringBuilder(255);
                GetWindowText(hWnd, sb, sb.Capacity + 1);
                string title = sb.ToString();
                
                // 해당되는 IDE의 이름(폴더명)을 포함한 Antigravity 창을 정확히 수색합니다!
                if (!string.IsNullOrEmpty(title) && title.IndexOf("Antigravity", StringComparison.OrdinalIgnoreCase) >= 0) {
                    if (string.IsNullOrEmpty(titlePart) || title.IndexOf(titlePart, StringComparison.OrdinalIgnoreCase) >= 0) {
                        found = hWnd;
                        return false; // 찾았으면 순회 종료
                    }
                }
            }
            return true;
        };
        EnumWindows(filter, IntPtr.Zero);
        return found;
    }

    public static void ForceForeground(IntPtr hWnd, bool maximize) {
        // 1. 윈도우 포커스 권한 우회 트릭: 임의의 ALT 키 이벤트를 발생시켜 OS가 입력 스트림을 깨우도록 합니다.
        keybd_event(0x12, 0, 0, 0); // ALT key down
        keybd_event(0x12, 0, 2, 0); // ALT key up

        // 2. 창을 앞으로 보냅니다.
        SetForegroundWindow(hWnd);

        // 3. 상태(최대화 또는 복구) 요청 처리
        if (maximize) {
            ShowWindow(hWnd, 3); // SW_SHOWMAXIMIZED
        } else {
            ShowWindow(hWnd, 9); // SW_RESTORE
        }

        // 4. 강제로 '가장 위(TOPMOST)'로 끌어왔다가 롤백(NOTOPMOST)하여 게임 등 다른 전체화면 앱 뒤에 숨는 것을 완벽 방지
        SetWindowPos(hWnd, new IntPtr(-1), 0, 0, 0, 0, 0x0001 | 0x0002); // HWND_TOPMOST (NoSize=0x0001, NoMove=0x0002)
        SetWindowPos(hWnd, new IntPtr(-2), 0, 0, 0, 0, 0x0001 | 0x0002); // HWND_NOTOPMOST
        
        SetForegroundWindow(hWnd);
    }
}
"@

try { Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue } catch {}

$hwnd = [IntPtr]::Zero
if ($TargetTitlePart -ne "") {
    $hwnd = [Win32Helper]::FindWindowByTitle($TargetTitlePart)
}

if ($hwnd -eq [IntPtr]::Zero) {
    # 찾지 못했다면 기존대로 아무거나 하나 열기
    $p = Get-Process -Name 'Antigravity' -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowHandle -ne 0} | Select-Object -First 1
    if ($p) { $hwnd = $p.MainWindowHandle }
}

if ($hwnd -ne [IntPtr]::Zero) {
    [Win32Helper]::ForceForeground($hwnd, $Maximize)
}
