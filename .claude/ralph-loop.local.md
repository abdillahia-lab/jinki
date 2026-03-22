---
active: true
iteration: 2
session_id: 
max_iterations: 0
completion_promise: null
started_at: "2026-03-22T16:02:54Z"
---

3-hour sprint: accuracy audit then premium design. Each iteration: 1) Pick one page or component. 2) Read ALL claims and verify against equipment specs (M400+H30T for piloted, M4TD+Dock3 for autonomous). 3) Fix any inaccuracy. 4) Then improve design/style/usability. 5) Build and deploy. EQUIPMENT SPECS: M400 RTK = H30T thermal (0.5C), Manifold 3, L3 LiDAR, S1 spotlight, piloted only. M4TD + Dock 3 = integrated thermal+visual, 150-200 missions/mo, autonomous, NO H30T, NO LiDAR, NO Manifold. NEVER fabricate. PATH=/Users/aa/.nvm/versions/node/v24.12.0/bin:/usr/bin:/bin:/usr/sbin:/sbin for builds. Deploy with wrangler pages deploy dist/ --project-name jinki-ai --branch main --commit-dirty=true. --max-iterations 300
