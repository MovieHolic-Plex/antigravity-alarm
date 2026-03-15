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
}
"@

try { Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue } catch {}

$hwnd = [IntPtr]::Zero
if ($TargetTitlePart -ne "") {
    $hwnd = [Win32Helper]::FindWindowByTitle($TargetTitlePart)
}

if ($hwnd -eq [IntPtr]::Zero) {
    # 혹시 못 찾았을 경우 가장 첫 번째 Antigravity 창으로 포커스
    $p = Get-Process -Name 'Antigravity' -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowHandle -ne 0} | Select-Object -First 1
    if ($p) { $hwnd = $p.MainWindowHandle }
}

if ($hwnd -ne [IntPtr]::Zero) {
    if ($Maximize) {
        [Win32Helper]::ShowWindow($hwnd, 3) # SW_MAXIMIZE (최대화/전체화면)
    } else {
        [Win32Helper]::ShowWindow($hwnd, 9) # SW_RESTORE (원래 창 크기)
    }
    [Win32Helper]::SetForegroundWindow($hwnd)
}
