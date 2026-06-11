#!/usr/bin/env python3
"""
Generate the illustrative Sample Intelligence Report PDF.
Intelligence Brief aesthetic: ink/paper, mono telemetry, thermal-orange
signal, ILLUSTRATIVE watermark on every page. All findings are
demonstration analyses — no real client data exists or is implied.
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

W, H = letter
INK = HexColor('#121210')
INK2 = HexColor('#4a4a46')
INK3 = HexColor('#8a8a84')
PAPER = HexColor('#F7F6F3')
SIGNAL = HexColor('#C23A00')
RULE = HexColor('#d8d6d0')
DARK = HexColor('#0A0A0A')
LIGHTINK = HexColor('#F4F4F2')

M = 0.85 * inch  # margin

def watermark(c, dark=False):
    c.saveState()
    c.setFont('Courier-Bold', 9)
    c.setFillColor(HexColor('#FF4F00') if dark else SIGNAL)
    c.drawCentredString(W / 2, H - 0.45 * inch, 'ILLUSTRATIVE — DEMONSTRATION ANALYSIS — NOT A CLIENT ENGAGEMENT')
    c.restoreState()

def footer(c, page, total=6, dark=False):
    c.saveState()
    c.setFont('Courier', 7.5)
    c.setFillColor(INK3 if not dark else HexColor('#888884'))
    c.drawString(M, 0.5 * inch, 'JINKI AERIAL INTELLIGENCE · SAMPLE REPORT · WATERMARKED ILLUSTRATIVE')
    c.drawRightString(W - M, 0.5 * inch, f'{page:02d} / {total:02d}')
    c.setStrokeColor(RULE if not dark else HexColor('#2a2a2a'))
    c.setLineWidth(0.5)
    c.line(M, 0.62 * inch, W - M, 0.62 * inch)
    c.restoreState()

def rule(c, y, strong=False):
    c.setStrokeColor(HexColor('#b8b6b0') if strong else RULE)
    c.setLineWidth(0.8 if strong else 0.5)
    c.line(M, y, W - M, y)

def mono_label(c, x, y, text, color=INK3, size=8):
    c.setFont('Courier-Bold', size)
    c.setFillColor(color)
    c.drawString(x, y, text)

c = canvas.Canvas('public/docs/jinki-sample-intelligence-report.pdf', pagesize=letter)
c.setTitle('Jinki — Sample Facility Intelligence Report (Illustrative)')
c.setAuthor('Jinki Aerial Intelligence')

# ============ PAGE 1 — COVER (dark) ============
c.setFillColor(DARK)
c.rect(0, 0, W, H, fill=1, stroke=0)
watermark(c, dark=True)

mono_label(c, M, H - 1.4 * inch, 'JINKI AERIAL INTELLIGENCE', HexColor('#FF4F00'), 9)
c.setStrokeColor(HexColor('#3a3a3a')); c.setLineWidth(0.8)
c.line(M, H - 1.55 * inch, W - M, H - 1.55 * inch)

c.setFont('Helvetica', 40)
c.setFillColor(LIGHTINK)
c.drawString(M, H - 2.6 * inch, 'Facility Intelligence')
c.drawString(M, H - 3.2 * inch, 'Report')

c.setFont('Helvetica', 13)
c.setFillColor(HexColor('#b8b8b4'))
c.drawString(M, H - 3.8 * inch, 'Severity-ranked findings · Thermal evidence · Chain of custody')

fields = [
    ('SITE', 'DEMONSTRATION FACILITY — DATA CENTER CLASS'),
    ('SCAN DATE', '2026-05-28 · PRE-DAWN WINDOW · DELTA-T FAVORABLE'),
    ('SCOPE', 'ROOFTOP ARRAY + PERIMETER · SINGLE MISSION'),
    ('SENSOR', 'RADIOMETRIC THERMAL ±0.5°C + HD VISUAL'),
    ('FINDINGS', '11 TOTAL · 2 SEV-1 · 4 SEV-2 · 5 SEV-3'),
    ('DELIVERED', 'T+46H FROM CAPTURE'),
]
y = H - 4.9 * inch
for k, v in fields:
    mono_label(c, M, y, k, HexColor('#777'), 8)
    c.setFont('Courier', 9.5)
    c.setFillColor(LIGHTINK)
    c.drawString(M + 1.5 * inch, y, v)
    y -= 0.32 * inch

# thermal band strip
band = [('#2B0B5E', .18), ('#8B1E9B', .20), ('#E33F1E', .24), ('#FF8A00', .18), ('#FFD24A', .12), ('#FFF8E0', .08)]
bx = M
for col, frac in band:
    bw = (W - 2 * M) * frac
    c.setFillColor(HexColor(col))
    c.rect(bx, 1.05 * inch, bw, 3, fill=1, stroke=0)
    bx += bw
footer(c, 1, dark=True)
c.showPage()

# ============ PAGE 2 — EXECUTIVE SUMMARY ============
c.setFillColor(PAPER); c.rect(0, 0, W, H, fill=1, stroke=0)
watermark(c)
mono_label(c, M, H - 1.0 * inch, '01 / EXECUTIVE SUMMARY', SIGNAL)
mono_label(c, W - M - 1.5 * inch, H - 1.0 * inch, 'ONE PAGE', INK3)
rule(c, H - 1.12 * inch, strong=True)

c.setFont('Helvetica', 24); c.setFillColor(INK)
c.drawString(M, H - 1.75 * inch, '11 findings. Two need attention this month.')

body = [
    'A single pre-dawn aerial pass captured the full rooftop array and perimeter at',
    '0.5°C radiometric sensitivity. Analysis classified 11 thermal anomalies against',
    'NFPA 70B severity classes and ASHRAE operational thresholds.',
    '',
    'Two SEV-1 findings — a CRAH unit bearing signature and a switchgear connection',
    'heat rise — warrant scheduled intervention within 30 days. Four SEV-2 findings',
    'indicate early-stage degradation suitable for next-quarter planning. Five SEV-3',
    'observations establish the thermal baseline for trend comparison.',
]
y = H - 2.3 * inch
c.setFont('Helvetica', 10.5); c.setFillColor(INK2)
for line in body:
    c.drawString(M, y, line); y -= 0.24 * inch

# Summary table
y -= 0.3 * inch
mono_label(c, M, y, 'FINDINGS BY SEVERITY', INK3); y -= 0.18 * inch
rows = [
    ('SEV-1', 'IMMEDIATE — SCHEDULE WITHIN 30 DAYS', '02', '#C23A00'),
    ('SEV-2', 'PLANNED — NEXT MAINTENANCE QUARTER', '04', '#8B5A00'),
    ('SEV-3', 'BASELINE — MONITOR FOR TREND', '05', '#5a5a56'),
]
for sev, desc, n, col in rows:
    rule(c, y)
    y -= 0.3 * inch
    c.setFont('Courier-Bold', 10); c.setFillColor(HexColor(col))
    c.drawString(M, y, sev)
    c.setFont('Helvetica', 10); c.setFillColor(INK2)
    c.drawString(M + 1.0 * inch, y, desc)
    c.setFont('Helvetica-Bold', 16); c.setFillColor(INK)
    c.drawRightString(W - M, y - 2, n)
    y -= 0.18 * inch
rule(c, y)
footer(c, 2)
c.showPage()

# ============ PAGE 3 — SEVERITY-RANKED FINDINGS ============
c.setFillColor(PAPER); c.rect(0, 0, W, H, fill=1, stroke=0)
watermark(c)
mono_label(c, M, H - 1.0 * inch, '02 / SEVERITY-RANKED FINDINGS', SIGNAL)
mono_label(c, W - M - 2.1 * inch, H - 1.0 * inch, 'TOP 5 OF 11 SHOWN', INK3)
rule(c, H - 1.12 * inch, strong=True)

findings = [
    ('F-01', 'SEV-1', 'CRAH-7 bearing heat signature', 'DELTA-T +14.2°C vs unit baseline', '39.0211N 77.4501W', '0.94', 'Schedule bearing inspection; vibration analysis to confirm'),
    ('F-02', 'SEV-1', 'Switchgear connection heat rise', 'DELTA-T +11.8°C at lug, phase B', '39.0214N 77.4498W', '0.91', 'IR-verified torque check at next shutdown window'),
    ('F-03', 'SEV-2', 'Membrane moisture path, NW quadrant', 'Evaporative cooling signature 4.1m run', '39.0209N 77.4506W', '0.87', 'Core sample at path origin; reseal before freeze cycle'),
    ('F-04', 'SEV-2', 'Condenser coil fouling, CRAC-3', 'DELTA-T −6.3°C airflow differential', '39.0212N 77.4495W', '0.85', 'Coil cleaning; verify post-clean delta on next pass'),
    ('F-05', 'SEV-2', 'Parapet flashing gap, E elevation', 'Thermal bridging 2.2m section', '39.0210N 77.4492W', '0.82', 'Visual close-out inspection; seal per detail spec'),
]
y = H - 1.55 * inch
for fid, sev, title, delta, coord, conf, action in findings:
    c.setFont('Courier-Bold', 9)
    c.setFillColor(SIGNAL if sev == 'SEV-1' else HexColor('#8B5A00'))
    c.drawString(M, y, f'{fid} · {sev}')
    c.setFont('Courier', 8); c.setFillColor(INK3)
    c.drawRightString(W - M, y, f'CONF {conf}')
    y -= 0.22 * inch
    c.setFont('Helvetica-Bold', 12); c.setFillColor(INK)
    c.drawString(M, y, title)
    y -= 0.2 * inch
    c.setFont('Courier', 8.5); c.setFillColor(INK2)
    c.drawString(M, y, f'{delta}  ·  {coord}')
    y -= 0.2 * inch
    c.setFont('Helvetica', 9.5); c.setFillColor(INK2)
    c.drawString(M, y, f'Action: {action}')
    y -= 0.16 * inch
    rule(c, y)
    y -= 0.28 * inch
footer(c, 3)
c.showPage()

# ============ PAGE 4 — THERMAL EVIDENCE FRAME ============
c.setFillColor(PAPER); c.rect(0, 0, W, H, fill=1, stroke=0)
watermark(c)
mono_label(c, M, H - 1.0 * inch, '03 / THERMAL EVIDENCE', SIGNAL)
mono_label(c, W - M - 1.8 * inch, H - 1.0 * inch, 'FRAME F-01 OF 11', INK3)
rule(c, H - 1.12 * inch, strong=True)

# Stylized evidence frame (vector placeholder standing in for radiometric still)
fx, fy, fw, fh = M, H - 5.6 * inch, W - 2 * M, 4.1 * inch
c.setFillColor(HexColor('#16161a')); c.rect(fx, fy, fw, fh, fill=1, stroke=0)
# gradient blobs suggesting thermal field
for cx, cy, r, col in [(0.3, 0.55, 1.1, '#2B0B5E'), (0.52, 0.48, 0.75, '#8B1E9B'), (0.62, 0.42, 0.5, '#E33F1E'), (0.66, 0.40, 0.28, '#FF8A00'), (0.68, 0.39, 0.13, '#FFD24A')]:
    c.setFillColor(HexColor(col))
    c.circle(fx + cx * fw, fy + cy * fh, r * inch, fill=1, stroke=0)
# registration ticks
c.setStrokeColor(HexColor('#666')); c.setLineWidth(1)
t = 10
for (cx, cy, dx, dy) in [(fx+4, fy+fh-4, t, -t), (fx+fw-4, fy+fh-4, -t, -t), (fx+4, fy+4, t, t), (fx+fw-4, fy+4, -t, t)]:
    c.line(cx, cy, cx + dx, cy)
    c.line(cx, cy, cx, cy + dy)
# bounding box on the hotspot
bx, by, bw_, bh_ = fx + 0.56 * fw, fy + 0.28 * fh, 0.24 * fw, 0.3 * fh
c.setStrokeColor(HexColor('#FF4F00')); c.setLineWidth(1.2)
c.rect(bx, by, bw_, bh_, fill=0, stroke=1)
c.setFont('Courier-Bold', 8.5); c.setFillColor(HexColor('#FF4F00'))
c.drawString(bx, by + bh_ + 6, 'F-01 · DELTA-T +14.2°C · CONF 0.94')
# scale bar
mono_label(c, fx + 8, fy + 10, '18.4°C', HexColor('#9999ff'), 7)
mono_label(c, fx + fw - 60, fy + 10, '41.7°C', HexColor('#FFD24A'), 7)

# caption bar
c.setStrokeColor(RULE); c.setLineWidth(0.5)
c.rect(fx, fy - 0.32 * inch, fw, 0.32 * inch, fill=0, stroke=1)
c.setFont('Courier', 7.5); c.setFillColor(INK3)
c.drawString(fx + 8, fy - 0.21 * inch, 'F-01 · CRAH-7 BEARING SIGNATURE · CAPTURED 04:42 ET · EMISSIVITY 0.95 · DEMONSTRATION RENDER')

c.setFont('Helvetica', 10); c.setFillColor(INK2)
yy = fy - 0.85 * inch
for line in [
    'Production reports pair every finding with the calibrated radiometric still and its',
    'visible-light frame, temperature scale, and capture parameters. This page is a vector',
    'demonstration render — layout and data structure are exactly as delivered.',
]:
    c.drawString(M, yy, line); yy -= 0.22 * inch
footer(c, 4)
c.showPage()

# ============ PAGE 5 — METHODOLOGY ============
c.setFillColor(PAPER); c.rect(0, 0, W, H, fill=1, stroke=0)
watermark(c)
mono_label(c, M, H - 1.0 * inch, '04 / METHODOLOGY & CHAIN OF CUSTODY', SIGNAL)
rule(c, H - 1.12 * inch, strong=True)

sections = [
    ('CAPTURE', [
        'Pre-dawn window selected via solar geometry for maximum DELTA-T contrast.',
        'Radiometric thermal (±0.5°C NETD class) + HD visual, single grid pass.',
        'Wind, ambient, and emissivity parameters logged per frame.',
    ]),
    ('ANALYSIS', [
        'Detection and classification pipeline ranks anomalies by severity',
        'against NFPA 70B classes and ASHRAE thermal guidelines.',
        'Every finding carries a confidence value; sub-0.80 findings are',
        'flagged for human review before inclusion.',
    ]),
    ('DATA HANDLING', [
        'AES-256 at rest, TLS 1.3 in transit. On-premises processing available.',
        'Mutual NDA precedes every engagement. Chain-of-custody record',
        'accompanies the deliverable; raw data retention per client policy.',
    ]),
    ('OPERATING AUTHORITY', [
        'FAA Part 107 certificated operations; DC SFRA authorization held.',
        '$5M liability coverage per operation.',
    ]),
]
y = H - 1.6 * inch
for label, lines in sections:
    mono_label(c, M, y, label, INK3); y -= 0.24 * inch
    c.setFont('Helvetica', 10); c.setFillColor(INK2)
    for line in lines:
        c.drawString(M, y, line); y -= 0.22 * inch
    y -= 0.1 * inch
    rule(c, y); y -= 0.3 * inch
footer(c, 5)
c.showPage()

# ============ PAGE 6 — NEXT STEP (dark) ============
c.setFillColor(DARK); c.rect(0, 0, W, H, fill=1, stroke=0)
watermark(c, dark=True)
mono_label(c, M, H - 1.4 * inch, 'NEXT STEP', HexColor('#FF4F00'), 9)
c.setStrokeColor(HexColor('#3a3a3a')); c.line(M, H - 1.55 * inch, W - M, H - 1.55 * inch)

c.setFont('Helvetica', 30); c.setFillColor(LIGHTINK)
c.drawString(M, H - 2.5 * inch, 'This report, for your facility,')
c.drawString(M, H - 3.0 * inch, '48 hours after the pass.')

c.setFont('Helvetica', 12); c.setFillColor(HexColor('#b8b8b4'))
c.drawString(M, H - 3.7 * inch, 'Q3 2026 founding cohort — locked rate, priority scheduling,')
c.drawString(M, H - 3.95 * inch, 'direct founder involvement on every engagement.')

c.setFont('Courier-Bold', 11); c.setFillColor(HexColor('#FF4F00'))
c.drawString(M, H - 4.7 * inch, 'JINKI.AI/#LEAD-GEN')
c.setFont('Courier', 10); c.setFillColor(LIGHTINK)
c.drawString(M, H - 5.0 * inch, 'INFO@JINKI.AI · RESPONSE < 1 BUSINESS DAY')

bx = M
for col, frac in band:
    bw = (W - 2 * M) * frac
    c.setFillColor(HexColor(col))
    c.rect(bx, 1.05 * inch, bw, 3, fill=1, stroke=0)
    bx += bw
footer(c, 6, dark=True)
c.save()
print('OK public/docs/jinki-sample-intelligence-report.pdf')
