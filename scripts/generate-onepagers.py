#!/usr/bin/env python3
"""
Outbound one-pagers — the founder's leave-behind / cold-email attachments.
Same Intelligence Brief system as the sample report & security brief:
ink/paper, Helvetica editor voice + Courier instrument voice, thermal-
orange signal, thermal-ramp strip. Two single-page PDFs:
  1. jinki-capabilities-brief.pdf  — the prospect-facing capabilities sheet
  2. jinki-partner-brief.pdf       — the MEP/roofing/broker referral sheet
No fabricated proof, no locking language (targets, not guarantees).
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.pdfbase.pdfmetrics import stringWidth

W, H = letter
INK = HexColor('#121210')
INK2 = HexColor('#3f3f3b')
INK3 = HexColor('#8a8a84')
PAPER = HexColor('#F7F6F3')
SIGNAL = HexColor('#C23A00')
RULE = HexColor('#d8d6d0')
RULE_STRONG = HexColor('#b8b6b0')
M = 0.85 * inch
CW = W - 2 * M

THERMAL = [('#2B0B5E', .18), ('#8B1E9B', .20), ('#E33F1E', .24),
           ('#FF8A00', .18), ('#FFD24A', .12), ('#FFF8E0', .08)]


def wrap(text, font, size, maxw):
    out, cur = [], ''
    for word in text.split():
        t = (cur + ' ' + word).strip()
        if stringWidth(t, font, size) <= maxw:
            cur = t
        else:
            if cur:
                out.append(cur)
            cur = word
    if cur:
        out.append(cur)
    return out


def para(c, x, y, text, font='Helvetica', size=10.5, color=INK2, maxw=CW, leading=None):
    leading = leading or size * 1.5
    c.setFont(font, size)
    c.setFillColor(color)
    for ln in wrap(text, font, size, maxw):
        c.drawString(x, y, ln)
        y -= leading
    return y


def mono(c, x, y, text, color=INK3, size=8.5, bold=True):
    c.setFont('Courier-Bold' if bold else 'Courier', size)
    c.setFillColor(color)
    c.drawString(x, y, text)


def mono_right(c, x_right, y, text, color=INK3, size=8.5):
    mono(c, x_right - stringWidth(text, 'Courier-Bold', size), y, text, color, size)


def rule(c, y, strong=False):
    c.setStrokeColor(RULE_STRONG if strong else RULE)
    c.setLineWidth(0.8 if strong else 0.5)
    c.line(M, y, W - M, y)


def thermal_strip(c, y, h=3):
    bx = M
    for col, frac in THERMAL:
        bw = CW * frac
        c.setFillColor(HexColor(col))
        c.rect(bx, y, bw, h, fill=1, stroke=0)
        bx += bw


def header(c, right_label):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    mono(c, M, H - 0.95 * inch, 'JINKI AERIAL INTELLIGENCE', SIGNAL, 9.5)
    mono_right(c, W - M, H - 0.95 * inch, right_label, INK3, 8.5)
    thermal_strip(c, H - 1.14 * inch)


def footer(c):
    rule(c, 0.82 * inch)
    mono(c, M, 0.62 * inch, 'INFO@JINKI.AI · JINKI.AI · FOUNDER-DIRECT', SIGNAL, 8.5)
    mono_right(c, W - M, 0.62 * inch, 'MID-ATLANTIC · BOOKING Q3 2026', INK3, 8.5)


def zone(c, y, label):
    mono(c, M, y, label, SIGNAL, 8.5)
    return y - 0.21 * inch


def headline(c, y, lines, size=21):
    c.setFont('Helvetica', size)
    c.setFillColor(INK)
    for ln in lines:
        c.drawString(M, y, ln)
        y -= 0.42 * inch
    return y


def bullets(c, y, items, maxw=CW - 0.24 * inch):
    for it in items:
        mono(c, M, y, '+', SIGNAL, 10)
        y = para(c, M + 0.24 * inch, y, it, maxw=maxw)
        y -= 0.06 * inch
    return y


# ============================================================ CAPABILITIES
def capabilities():
    c = canvas.Canvas('public/docs/jinki-capabilities-brief.pdf', pagesize=letter)
    c.setTitle('Jinki — Capabilities Brief')
    c.setAuthor('Jinki Aerial Intelligence')
    header(c, 'CAPABILITIES BRIEF · 2026')

    y = headline(c, H - 1.7 * inch, [
        'Find the failure before it becomes',
        'an outage — or a claim.',
    ])
    mono(c, M, y + 0.1 * inch, 'AERIAL AI THERMAL INTELLIGENCE · DATA CENTERS & THE GRID', INK3, 8.5)
    y -= 0.22 * inch
    y = para(c, M, y,
             'We fly your facility, our AI finds and ranks every thermal and structural problem, '
             'and you get a report in 48 hours — then we baseline it and track the trend. The same '
             'report owners maintain on, insurers underwrite on, and lenders close on.',
             size=11, color=INK2, leading=0.24 * inch)

    y -= 0.22 * inch
    y = zone(c, y, 'THE DELIVERABLE')
    y = para(c, M, y,
             'Not footage. Not a dashboard login. A geolocated, severity-ranked findings document — '
             'each anomaly classified against NFPA 70B and ASHRAE thresholds, with a recommended '
             'action and a 48-hour target. Re-scans on cadence track degradation velocity into a '
             'living condition-of-record.')

    y -= 0.2 * inch
    y = zone(c, y, 'WHAT WE SCAN')
    c.setFont('Courier', 10)
    c.setFillColor(INK)
    c.drawString(M, y, 'Data centers · Energy & the grid')
    y -= 0.2 * inch
    mono(c, M, y, 'ALSO FLYING: PERIMETER SECURITY · REAL ESTATE · AGRICULTURE · MARITIME', INK3, 8.5)

    y -= 0.26 * inch
    y = zone(c, y, 'WHY JINKI')
    y = bullets(c, y, [
        'AI-ranked radiometric thermal at 0.5°C — full array, single aerial pass.',
        'Emergency repairs run 4–8× planned ones; one prevented outage pays for years.',
        'Founder-led: CISSP, CCSP, AIGP, AAISM, AAIR; former cyber risk senior consultant at Deloitte.',
        '$5M liability per operation · mutual NDA · AES-256 · on-premises processing available.',
        "FAA Part 107 · authorized in the DC Special Flight Rules Area, where most can't fly.",
    ])

    y -= 0.16 * inch
    y = zone(c, y, 'THE FOUNDING ENGAGEMENT')
    y = para(c, M, y,
             'Founding Scan — one mission at founding-cohort terms: full facility pass, severity-'
             'ranked report on a 48-hour target, zero integration. We baseline it; re-scans build '
             'the condition-of-record owners, insurers, and lenders rely on.')

    footer(c)
    c.showPage()
    c.save()
    print('wrote public/docs/jinki-capabilities-brief.pdf')


# ================================================================= PARTNER
def partner():
    c = canvas.Canvas('public/docs/jinki-partner-brief.pdf', pagesize=letter)
    c.setTitle('Jinki — Partner Program Brief')
    c.setAuthor('Jinki Aerial Intelligence')
    header(c, 'PARTNER PROGRAM · REFERRAL')

    y = headline(c, H - 1.75 * inch, [
        "You're already in the building.",
        "We're the layer above it.",
    ])
    y -= 0.06 * inch
    y = para(c, M, y,
             'Add an aerial thermal layer to the engagements you already run. Your client '
             'relationship stays yours — and because we perform no remediation, every finding '
             'in the report is scope for your firm, not ours.', size=11, color=INK2, leading=0.24 * inch)

    y -= 0.22 * inch
    y = zone(c, y, 'WHO REFERS US')
    y = para(c, M, y,
             'MEP & commissioning · Roofing consultants · Insurance loss control · Commercial '
             'property brokers · Facility management · Property-condition & diligence',
             font='Courier', size=9.5, color=INK)

    y -= 0.24 * inch
    y = zone(c, y, 'HOW IT WORKS')
    steps = [
        ('01', 'You refer the site', 'A name and a contact — or bring us in as a subconsultant under your own engagement.'),
        ('02', 'We fly and analyze', 'Mission, AI analysis, severity-ranked findings on a 48-hour target. The mutual NDA covers everyone.'),
        ('03', 'You deliver the value', 'Findings feed your deliverable — your scope grows, your client relationship stays exactly yours.'),
    ]
    for n, t, d in steps:
        mono(c, M, y, n, SIGNAL, 10)
        c.setFont('Helvetica-Bold', 11)
        c.setFillColor(INK)
        c.drawString(M + 0.4 * inch, y, t)
        y -= 0.22 * inch
        y = para(c, M + 0.4 * inch, y, d, maxw=CW - 0.4 * inch)
        y -= 0.1 * inch

    y -= 0.12 * inch
    y = zone(c, y, 'THE TERMS')
    y = bullets(c, y, [
        'No tiers, no quotas, no fee to participate.',
        'Referral terms agreed in writing, per engagement — talk to the founder.',
        'Delivered as a named subconsultant under your engagement, or direct to the client with you credited.',
        "We never hide a fee in the client's price.",
    ])

    footer(c)
    c.showPage()
    c.save()
    print('wrote public/docs/jinki-partner-brief.pdf')


if __name__ == '__main__':
    capabilities()
    partner()
