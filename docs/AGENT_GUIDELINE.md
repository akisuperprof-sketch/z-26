# Z-26 Browser Agent Operational Guidelines (Anti-Loop Guard)

This document defines the rules for AI agents operating the browser to prevent infinite loops and ensure human-in-the-loop safety.

## 1. Loop Prevention Rules
- **Maximum Retries**: Any single operation (e.g., clicking a specific button, navigating to a URL) must not be attempted more than **2 times** if it fails or produces the same result.
- **Identical Response Prohibition**: Refrain from sending short, repetitive messages like "Go", "Ready", "Proceeding" multiple times. Each message should contain specific status information.
- **Stack Detection**: If the agent detects that it is performing the same sequence of actions twice without changing the state of the application, it must stop immediately.

## 2. Emergency Stop Procedure
If a loop is detected or the agent is unable to proceed after maximum retries:
1. **Stop all actions**: Do not attempt further clicks or navigation.
2. **Report to User**: Immediately send a report containing:
    - **Operation Log**: A summary of the last 5-10 actions taken.
    - **Current Position**: The current URL and the state of the UI.
    - **Reason for Stop**: Why the agent believes it is stuck.
3. **Wait for Manual Verification**: Ask the human operator to check the state and provide instructions.

## 3. Human Handover Format
When handing over to a human:
```markdown
### 🚨 ループ検知による自動停止
原因: [同一操作の繰り返し / 最大試行回数超過 / 状態変化なし]

**現在の状態:**
- URL: [URL]
- 発生箇所: [ボタン名/セクター名]

**操作ログ:**
1. [操作1]
2. [操作2]
...

**手動確認のお願い:**
[現在のスクリーンショット/ログを確認し、次の指示をください]
```

---
*Created on 2026-03-03 as part of the Routing & UI Fix task.*
