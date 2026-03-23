# Jinki.ai Lessons Learned

## Content Accuracy
- NEVER claim multispectral capability — H30T is thermal+visual only
- NEVER claim NDVI — requires near-infrared sensor not in our payload
- M400 RTK (piloted): H30T, Manifold 3, L3 LiDAR, S1 spotlight
- M4TD + Dock 3 (autonomous): integrated thermal+visual ONLY — no H30T, no LiDAR, no Manifold
- 200x zoom is HYBRID (40x optical + digital), not "200x optical"
- Report turnaround is 48 hours — standardized sitewide
- "Real-time processing" is inaccurate — say "edge AI" or "post-flight analysis"

## Design System
- Border-radius scale: 4/8/12/16px ONLY (no 6, 10, 14, 20)
- Never use transition: all (specify exact properties)
- Premium easing: cubic-bezier(0.16, 1, 0.3, 1) for transform/shadow
- Form inputs must be 16px font-size minimum (iOS auto-zoom prevention)
- Mobile sections: 4rem padding (not 7rem)

## Security
- CORS must be restricted to jinki.ai (not *)
- Honeypot field IDs must match between HTML and JS
- Web3Forms key is public by design but noted
- Footer heading tags must match (h3 open = h3 close)
- NEVER use innerHTML with user/LLM content — use textContent + createElement for safe DOM insertion
- All form inputs MUST have maxlength attributes (defense-in-depth)
- API endpoints must validate Content-Type, sanitize input (strip control chars), and limit body size
- CSP must be set: restrict script-src, style-src, font-src, connect-src, frame-ancestors
- Remove meta generator tag to prevent framework fingerprinting
- LLM responses must be HTML-stripped server-side (defense-in-depth against prompt injection)
- Block common attack paths (/wp-admin, /.env, /.git) via _redirects
- security.txt must include Contact, Expires, Policy, Canonical fields
- API must block non-POST methods with 405 response
- HSTS should use 2-year max-age with preload directive

## Conversion
- "Request a Demo" → "Get Your Facility Report" (outcome, not process)
- LeadGen: "Start Your Intelligence Scan" → "See What's Hiding on Your Rooftop"
- Headlines should describe prospect's PAIN, not Jinki's technology
- SOC 2 badge needs specific timeline, not vague "in progress"
- "Systems Operational" was fake — changed to "Accepting New Clients"

## Performance
- Material Symbols CANNOT be trivially self-hosted — ligature rendering breaks
- Google CDN subset woff2 doesn't include all icon ligatures
- Self-hosting requires full font (~2.5MB) or proper subsetting tool
- Keep Google CDN with preconnect hints for Material Symbols

## Common Mistakes
- Forgetting to check ALL instances of a string across ALL files
- Applying M400 specs to M4TD context (different platforms)
- Using transition: all instead of specific properties
- Not checking mobile rendering after desktop changes
- Duplicate code (counter animation was in Layout AND Hero)
- ALWAYS verify visual rendering after font/icon changes
