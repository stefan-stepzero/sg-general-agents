"""Build a standalone HTML report with tabbed navigation for a single organisation.

Usage:
  python build-standalone.py <org_id>

Output: A single self-contained HTML file that can be opened in any browser.
All CSS/JS/data is inlined — no external dependencies except Google Fonts.
"""
import json, sys, os, html as h

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(BASE, 'public', 'data')

def load(path):
    with open(path, encoding='utf-8') as f: return json.load(f)

def load_keyed(filename, key):
    d = load(os.path.join(DATA, 'companies', filename))
    return d.get(key, {})

def esc(s): return h.escape(str(s)) if s else ''

# ─── Tab renderers ───

def render_summary(pitch, profile, metrics):
    if not pitch: return '<p class="muted">No pitch data available.</p>'
    out = f'<p class="lead">{esc(pitch.get("situation", profile.get("executive_summary", "")))}</p>'
    if metrics:
        out += '<div class="metric-row">'
        for m in metrics[:6]:
            out += f'<div class="metric-card"><div class="mono val">{esc(m.get("value",""))}</div><div class="meta">{esc(m.get("label",""))}</div></div>'
        out += '</div>'
    for section, key, title, cls in [
        ('investments', 'investments', "What They've Already Built", 'green'),
        ('peers', 'peers', "What Their Peers Are Doing", 'accent'),
    ]:
        items = pitch.get(key, [])
        if items:
            out += f'<h3>{title}</h3>'
            for item in items:
                if isinstance(item, dict):
                    out += f'<div class="bar-card {cls}"><strong>{esc(item.get("name",""))}</strong><br>{esc(item.get("detail",""))}</div>'
                else:
                    out += f'<div class="bar-card {cls}">{esc(item)}</div>'
    if pitch.get('pains'):
        out += '<h3>What Keeps Them Up at Night</h3>'
        for p in pitch['pains']:
            out += f'<div style="margin-bottom:16px"><div style="font-size:15px;font-weight:700;margin-bottom:6px">{esc(p["title"])}</div><div class="pain-loss">{esc(p["loss"])}</div></div>'
    if pitch.get('recommendations'):
        out += '<h3>Where We Come In</h3>'
        for r in pitch['recommendations']:
            out += f'<div class="bar-card green"><div class="rec-header"><strong>{esc(r["title"])}</strong><span class="accent">{esc(r["who"])}</span></div><p>{esc(r["detail"])}</p></div>'
    if pitch.get('timing'):
        out += '<h3>Why Now</h3>'
        for t in pitch['timing']:
            out += f'<div class="bar-card amber">{esc(t)}</div>'
    if pitch.get('starters'):
        out += '<h3>Conversation Starters</h3>'
        for s in pitch['starters']:
            out += f'<div class="quote-card">{esc(s)}</div>'
    return out

def render_profile(profile):
    out = f'<div class="bar-card accent"><div class="meta">EXECUTIVE SUMMARY</div><p style="color:#e8eaf0">{esc(profile.get("executive_summary",""))}</p></div>'
    leaders = profile.get('leadership_team', [])
    if leaders:
        out += '<h3>Leadership Team</h3><div class="grid-3">'
        for l in leaders:
            out += f'<div class="small-card"><strong>{esc(l.get("name",""))}</strong><br><span class="muted">{esc(l.get("title",""))}</span></div>'
        out += '</div>'
    dims = profile.get('dimensions', {})
    if dims:
        out += '<h3>Profile Dimensions</h3>'
        for dk, dv in dims.items():
            label = dk.replace('_', ' ').title()
            if isinstance(dv, dict) and 'value' in dv:
                out += f'<div class="dim-row"><span class="dim-label">{esc(label)}</span><span>{esc(dv["value"])}</span></div>'
            elif isinstance(dv, dict):
                out += f'<div class="dim-group"><div class="dim-header">{esc(label)} <span class="muted">{len(dv)} properties</span></div>'
                for sk, sv in dv.items():
                    val = sv.get('value', sv) if isinstance(sv, dict) else sv
                    out += f'<div class="dim-row sub"><span class="dim-label">{esc(sk.replace("_"," ").title())}</span><span>{esc(val)}</span></div>'
                out += '</div>'
    gaps = profile.get('gaps', [])
    if gaps:
        out += '<h3>Future Research Opportunities</h3>'
        for g in gaps: out += f'<div class="dim-row"><span class="muted">{esc(g)}</span></div>'
    return out

def render_scorecard(sc):
    if not sc: return '<p class="muted">No scorecard data available.</p>'
    sev = {'strong':'green','on-track':'accent','watch':'amber','gap':'muted','at-risk':'red'}
    out = f'<p class="muted">{esc(sc.get("subtitle",""))}</p>'
    for cat in sc.get('categories', []):
        out += f'<div class="category-header">{cat.get("icon","")} {esc(cat["label"])}</div>'
        for m in cat.get('metrics', []):
            s = m.get('status','gap'); c = sev.get(s,'muted')
            out += f'<div class="scorecard-row"><div class="sc-bar {c}"></div><div class="sc-content"><div class="sc-label">{esc(m["label"])}</div><div class="muted" style="font-size:11px">{esc(m.get("note",""))}</div></div>'
            out += f'<div class="sc-val mono">{esc(m.get("value",""))}<div class="meta">Observed</div></div>'
            t = m.get('target','')
            out += f'<div class="sc-val mono dim">{esc(t) if t and t != "—" else ""}<div class="meta">{"Benchmark" if t and t != "—" else ""}</div></div>'
            out += f'<div style="text-align:center;padding:12px"><span class="sc-badge {c}">{esc(s.replace("-"," ").title())}</span></div></div>'
    return out

def render_signals(sig):
    if not sig: return '<p class="muted">No signals data available.</p>'
    sm = {'positive':'green','negative':'red','watch':'amber','neutral':'muted'}
    ln = {'positive':'Tailwind','negative':'Headwind','watch':'Watch','neutral':'Neutral'}
    out = ''
    for ind in sig.get('external_indicators',[]) + sig.get('internal_indicators',[]):
        s = ind.get('signal','neutral'); c = sm.get(s,'muted')
        out += f'<div class="signal-row"><div class="sc-bar {c}"></div><div class="sig-content"><strong>{esc(ind["indicator"])}</strong><div class="muted">{esc(ind.get("detail",""))}</div></div><div class="mono sig-val">{esc(ind.get("value",""))}</div><div style="text-align:center;padding:12px"><span class="sc-badge {c}">{ln.get(s,"Neutral")}</span></div></div>'
    for lbl, risks, c in [('External Risks',sig.get('external_risks',[]),'red'),('Internal Risks',sig.get('internal_risks',[]),'amber')]:
        if risks:
            out += f'<h3>{lbl}</h3>'
            for r in risks[:10]:
                out += f'<div class="bar-card {c}"><strong>{esc(r.get("label",""))}</strong> <span class="mono {c}">{int(r.get("score",0)*100)}</span><div class="muted">{esc(r.get("reasoning",""))}</div></div>'
    news = sig.get('news_items',[])
    if news:
        out += '<h3>Recent Signals</h3>'
        for n in news: out += f'<div class="bar-card accent"><strong>{esc(n.get("headline",""))}</strong> <span class="muted mono">{esc(n.get("date",""))}</span><div class="muted">{esc(n.get("summary",""))}</div></div>'
    return out

def render_lookalikes(la):
    if not la or not la.get('lookalikes'): return '<p class="muted">No lookalike data available.</p>'
    out = f'<div class="bar-card accent"><strong>{esc(la.get("sub_archetype",""))}</strong><br>{esc(la.get("sub_archetype_detail",""))}</div><h3>Peer Organisations</h3>'
    for l in la['lookalikes']:
        out += f'<div class="peer-card"><strong>{esc(l["name"])}</strong> <span class="muted">{esc(l.get("hq",""))}</span><div class="muted">{esc(l.get("detail",""))}</div></div>'
    return out

def render_competitors(comp):
    if not comp or not comp.get('competitors'): return '<p class="muted">No competitor data available.</p>'
    out = f'<div class="bar-card red"><strong>{esc(comp.get("position",""))}</strong><br>{esc(comp.get("position_detail",""))}</div>'
    advs, disadvs = comp.get('advantages',[]), comp.get('disadvantages',[])
    if advs or disadvs:
        out += '<div class="grid-2">'
        if advs:
            out += '<div><h3 class="green">Advantages</h3>'
            for a in advs: out += f'<div class="bar-card green"><strong>{esc(a["label"])}</strong><div class="muted">{esc(a["detail"])}</div></div>'
            out += '</div>'
        if disadvs:
            out += '<div><h3 class="red">Vulnerabilities</h3>'
            for d in disadvs: out += f'<div class="bar-card red"><strong>{esc(d["label"])}</strong><div class="muted">{esc(d["detail"])}</div></div>'
            out += '</div>'
        out += '</div>'
    out += '<h3>Landscape</h3>'
    for c in comp['competitors']:
        out += f'<div class="bar-card amber"><strong>{esc(c["name"])}</strong> <span class="muted">{esc(c.get("positioning",""))}</span><div class="muted">{esc(c.get("differentiation",""))}</div></div>'
    return out

def render_pain_points(pp):
    if not pp or not pp.get('domains'): return '<p class="muted">No pain point data available.</p>'
    sm = {'critical':'red','significant':'amber','moderate':'secondary','low':'muted'}
    counts = {}
    for d in pp['domains']:
        for p in d.get('pain_points',[]): counts[p.get('severity','moderate')] = counts.get(p.get('severity','moderate'),0)+1
    out = '<div class="summary-strip">'
    for s in ['critical','significant','moderate','low']:
        if s in counts: out += f'<div class="summary-cell"><div class="summary-num {sm[s]}">{counts[s]}</div><div class="meta">{s.title()}</div></div>'
    out += '</div>'
    for domain in pp['domains']:
        out += f'<div class="category-header">{esc(domain["domain"])} <span class="muted">{len(domain["pain_points"])} pain points</span></div>'
        for p in domain['pain_points']:
            c = sm.get(p.get('severity','moderate'),'muted')
            out += f'<div class="pain-detail" style="border-left-color:var(--{c},#6b7194)"><div class="pp-header"><strong>{esc(p["title"])}</strong><span class="sc-badge {c}">{esc(p.get("severity","").upper())}</span></div>'
            out += f'<div class="label accent">EVIDENCE</div><p class="muted">{esc(p.get("evidence",""))}</p>'
            if p.get('unknowns'): out += f'<div class="label">WHAT WE DON\'T KNOW</div><p class="muted italic">{esc(p["unknowns"])}</p>'
            for src in p.get('sources',[]): out += f'<span class="source-tag">{esc(src)}</span> '
            out += '</div>'
    return out

def render_market_solutions(ms):
    if not ms or not ms.get('solutions'): return '<p class="muted">No market solutions data available.</p>'
    out = ''
    for p in ms.get('patterns',[]):
        out += f'<div class="bar-card accent"><div class="rec-header"><strong>{esc(p["label"])}</strong><span class="mono accent">{p.get("count",0)} orgs</span></div><p class="muted">{esc(p["detail"])}</p></div>'
    out += '<h3>Peer Responses</h3>'
    for s in ms['solutions']:
        c = 'accent' if s.get('relationship')=='lookalike' else 'amber'
        oc = 'green' if s.get('outcome')=='successful' else 'amber' if s.get('outcome')=='mixed' else 'muted'
        out += f'<div class="bar-card {c}"><div class="rec-header"><strong>{esc(s["org_name"])}</strong><span class="sc-badge {oc}">{esc(s.get("outcome","unknown"))}</span></div>'
        out += f'<p><strong>{esc(s.get("solution",""))}</strong></p><p class="muted">{esc(s.get("detail",""))}</p>'
        if s.get('implication'): out += f'<div class="implication">{esc(s["implication"])}</div>'
        out += '</div>'
    gaps = ms.get('gaps',[])
    if gaps:
        out += '<h3>Unaddressed Gaps</h3>'
        for g in gaps: out += f'<div class="bar-card" style="border-left-color:#6b7194">{esc(g)}</div>'
    return out

def render_opportunities(opps):
    if not opps or not opps.get('opportunities'): return '<p class="muted">No opportunities data available.</p>'
    out = ''
    for opp in opps['opportunities']:
        conf = opp.get('confidence','medium')
        c = 'green' if conf=='high' else 'amber' if conf=='medium' else 'muted'
        out += f'<div class="opp-block"><div class="opp-header"><strong>{esc(opp["title"])}</strong><span class="sc-badge {c}">{conf.upper()} CONFIDENCE</span></div><div class="opp-body">'
        out += f'<div class="label red">PAIN POINT</div><p class="muted">{esc(opp.get("pain_point",""))}</p>'
        out += f'<div class="label accent">MARKET EVIDENCE</div><p class="muted">{esc(opp.get("market_evidence",""))}</p>'
        out += f'<div class="opp-highlight"><div class="label green">OPPORTUNITY</div><p style="color:#e8eaf0;font-weight:500">{esc(opp.get("opportunity",""))}</p></div>'
        out += f'<div class="label amber">WHY NOW</div><p class="muted">{esc(opp.get("why_now",""))}</p>'
        for cap in opp.get('ai_capabilities',[]):
            out += f'<div style="font-size:11px;margin-bottom:4px"><span class="accent" style="font-weight:600">{esc(cap["capability"])}</span> <span class="muted">{esc(cap["application"])}</span></div>'
        wc = opp.get('who_cares',{})
        if wc: out += f'<div class="grid-2" style="margin-top:12px"><div><div class="meta">Buyer</div><strong>{esc(wc.get("buyer",""))}</strong></div><div><div class="meta">User</div><strong>{esc(wc.get("user",""))}</strong></div></div>'
        for src in opp.get('sources',[]): out += f'<span class="source-tag">{esc(src)}</span> '
        out += '</div></div>'
    return out

# ─── CSS ───

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0c10;color:#e8eaf0;line-height:1.6;-webkit-font-smoothing:antialiased}
.container{max-width:920px;margin:0 auto;padding:32px}
.mono{font-family:'DM Mono',monospace}
.muted{color:#6b7194}.secondary{color:#b0b4c4}.green{color:#34d399}.red{color:#f87171}.amber{color:#f59e0b}.accent{color:#7b93ff}
.italic{font-style:italic}
h1{font-size:24px;font-weight:800;letter-spacing:-0.03em;margin-bottom:4px}
h3{font-size:14px;font-weight:700;margin:24px 0 10px}
p{font-size:12px;color:#b0b4c4;line-height:1.7;margin-bottom:8px}
.lead{font-size:14px;color:#b0b4c4;line-height:1.8;margin-bottom:20px}
.label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin:12px 0 4px;color:#6b7194}
.label.accent{color:#7b93ff}.label.red{color:#f87171}.label.green{color:#34d399}.label.amber{color:#f59e0b}
.meta{font-size:9px;color:#6b7194;text-transform:uppercase;letter-spacing:0.06em;margin-top:2px}
.tab-bar{display:flex;gap:2px;background:#13161e;border-radius:6px;padding:2px;margin:20px 0 24px;position:sticky;top:0;z-index:10;flex-wrap:wrap}
.tab-btn{padding:7px 14px;font-size:12px;font-weight:600;border:none;cursor:pointer;border-radius:4px;color:#6b7194;background:transparent;font-family:'Inter',sans-serif}
.tab-btn.active{color:#e8eaf0;background:#232838}
.tab-btn:hover{color:#e8eaf0}
.tab-content{display:none}.tab-content.active{display:block}
.bar-card{padding:12px 16px;background:#13161e;border-radius:6px;margin-bottom:6px;border-left:3px solid #1e2230;font-size:12px;color:#b0b4c4;line-height:1.7}
.bar-card.green{border-left-color:#34d399}.bar-card.red{border-left-color:#f87171}.bar-card.amber{border-left-color:#f59e0b}.bar-card.accent{border-left-color:#7b93ff}
.bar-card strong{color:#e8eaf0}
.metric-row{display:flex;gap:10px;flex-wrap:wrap;margin:20px 0}
.metric-card{padding:10px 16px;background:#1b1f2b;border-radius:8px}
.metric-card .val{font-size:16px;font-weight:500;color:#e8eaf0}
.small-card{padding:10px 14px;background:#13161e;border:1px solid #1e2230;border-radius:8px;font-size:12px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.grid-3{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}
.rec-header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}
.quote-card{padding:14px 18px;background:#1b1f2b;border-radius:8px;font-size:13px;font-style:italic;line-height:1.7;margin-bottom:8px;color:#e8eaf0}
.pain-loss{padding:12px 16px;border-radius:6px;background:rgba(248,113,113,0.06);border-left:3px solid #f87171;font-size:12px;color:#b0b4c4;font-style:italic;line-height:1.7}
.implication{margin-top:8px;padding:8px 12px;background:rgba(52,211,153,0.06);border-radius:4px;font-size:11px;color:#34d399;line-height:1.6}
.category-header{font-size:13px;font-weight:700;margin:20px 0 8px;padding-bottom:8px;border-bottom:2px solid #7b93ff}
.scorecard-row{display:grid;grid-template-columns:6px 1fr 160px 160px 80px;background:#13161e;border-radius:6px;overflow:hidden;margin-bottom:2px;align-items:center}
.sc-bar{align-self:stretch;border-radius:6px 0 0 6px}
.sc-bar.green{background:#34d399}.sc-bar.red{background:#f87171}.sc-bar.amber{background:#f59e0b}.sc-bar.muted{background:#6b7194}.sc-bar.accent{background:#7b93ff}
.sc-content{padding:12px 16px}.sc-label{font-size:13px;font-weight:600}
.sc-val{text-align:right;padding:12px;font-size:12px;word-break:break-word}.sc-val.dim{opacity:0.6}
.sc-badge{font-size:9px;font-weight:600;padding:3px 10px;border-radius:4px;text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap;display:inline-block}
.sc-badge.green{color:#34d399;background:rgba(52,211,153,0.12)}.sc-badge.amber{color:#f59e0b;background:rgba(245,158,11,0.12)}
.sc-badge.red{color:#f87171;background:rgba(248,113,113,0.12)}.sc-badge.muted{color:#6b7194;background:#232838}.sc-badge.accent{color:#7b93ff;background:rgba(123,147,255,0.12)}
.signal-row{display:grid;grid-template-columns:6px 1fr 160px 80px;background:#13161e;border-radius:6px;overflow:hidden;margin-bottom:2px;align-items:center}
.sig-content{padding:12px 16px;font-size:12px}.sig-val{text-align:right;padding:12px;font-size:12px;word-break:break-word}
.summary-strip{display:flex;background:#13161e;border:1px solid #1e2230;border-radius:10px;overflow:hidden;margin-bottom:28px}
.summary-cell{flex:1;padding:16px 0;text-align:center;border-right:1px solid #1e2230}.summary-cell:last-child{border-right:none}
.summary-num{font-family:'DM Mono',monospace;font-size:28px;font-weight:500;line-height:1}
.pain-detail{padding:14px 18px;background:#13161e;border-radius:6px;margin-bottom:8px;border-left:3px solid #6b7194}
.pp-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.source-tag{font-size:9px;padding:2px 8px;border-radius:3px;background:#232838;color:#6b7194;display:inline-block;margin:2px}
.peer-card{padding:12px 16px;background:#13161e;border-radius:6px;margin-bottom:6px;font-size:12px}
.opp-block{background:#13161e;border:1px solid #1e2230;border-radius:10px;overflow:hidden;margin-bottom:16px}
.opp-header{padding:16px 20px;border-bottom:1px solid #1e2230;display:flex;justify-content:space-between;align-items:center}
.opp-body{padding:16px 20px}
.opp-highlight{padding:12px 16px;border-radius:6px;background:rgba(52,211,153,0.06);border-left:3px solid #34d399;margin:8px 0}
.dim-row{display:flex;justify-content:space-between;padding:8px 14px;background:#13161e;border-radius:4px;margin-bottom:2px;font-size:12px}
.dim-row.sub{padding-left:28px;background:#1b1f2b}.dim-label{color:#6b7194;font-weight:600}
.dim-group{margin-bottom:8px}.dim-header{padding:10px 14px;background:#13161e;border-radius:6px;font-size:13px;font-weight:600;margin-bottom:2px}
@media print{body{background:#fff;color:#1a1a1a}.tab-bar{display:none}.tab-content{display:block!important;page-break-inside:avoid}
.bar-card,.small-card,.scorecard-row,.signal-row,.pain-detail,.opp-block,.peer-card,.quote-card,.metric-card,.dim-row,.dim-header{background:#f9f9f7;border-color:#ddd}
h3{page-break-after:avoid}.opp-block{page-break-inside:avoid}}
"""

TABS = [('summary','Summary'),('profile','Profile'),('scorecard','Scorecard'),('signals','Signals'),
        ('lookalikes','Lookalikes'),('competitors','Competitors'),('pain-points','Pain Points'),
        ('market-solutions','Market Solutions'),('opportunities','Opportunities')]

def build_report(org_id):
    profile = load(os.path.join(DATA, 'profiles', f'{org_id}.json'))
    try: scorecard = load(os.path.join(DATA, 'profiles', f'{org_id}-scorecard.json'))
    except: scorecard = None

    data = {k: load_keyed(f, org_id) for k, f in [
        ('pp','pain-points-v3.json'),('opps','opportunities.json'),('ms','market-solutions.json'),
        ('sig','indicators.json'),('la','lookalikes.json'),('comp','competitive-landscape.json'),('pitch','pitch-data.json')
    ]}

    entity = profile.get('entity', org_id.upper())
    metrics = profile.get('key_metrics', [])

    tabs = {
        'summary': render_summary(data['pitch'], profile, metrics),
        'profile': render_profile(profile),
        'scorecard': render_scorecard(scorecard),
        'signals': render_signals(data['sig']),
        'lookalikes': render_lookalikes(data['la']),
        'competitors': render_competitors(data['comp']),
        'pain-points': render_pain_points(data['pp']),
        'market-solutions': render_market_solutions(data['ms']),
        'opportunities': render_opportunities(data['opps']),
    }

    tab_bar = ''.join(f'<button class="tab-btn{" active" if i==0 else ""}" data-tab="{tid}" onclick="showTab(\'{tid}\')">{tl}</button>' for i,(tid,tl) in enumerate(TABS))
    tab_bodies = ''.join(f'<div id="tab-{tid}" class="tab-content{" active" if i==0 else ""}">{tabs[tid]}</div>' for i,(tid,tl) in enumerate(TABS))

    html = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{esc(entity)} — Prospector Intelligence Report</title>
<style>{CSS}</style></head>
<body><div class="container">
<div class="meta">PROSPECTOR INTELLIGENCE REPORT</div>
<h1>{esc(entity)}</h1>
<div class="muted" style="font-size:11px;margin-bottom:4px">{esc(profile.get('website',''))} &middot; Profiled {esc(profile.get('profile_date',''))}</div>
<div class="tab-bar">{tab_bar}</div>
{tab_bodies}
<div style="margin-top:48px;padding-top:20px;border-top:1px solid #1e2230;font-size:10px;color:#6b7194">
Prospector Intelligence Report &middot; {esc(entity)} &middot; For internal use only
</div></div>
<script>
function showTab(id){{document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));document.getElementById('tab-'+id).classList.add('active');document.querySelector('[data-tab="'+id+'"]').classList.add('active')}}
</script></body></html>"""

    out_dir = os.path.join(BASE, 'public', 'reports')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f'{org_id}-report.html')
    with open(out_path, 'w', encoding='utf-8') as f: f.write(html)
    print(f'Report written to {out_path} ({len(html)//1024}KB)')

if __name__ == '__main__':
    if len(sys.argv) != 2: print('Usage: python build-standalone.py <org_id>'); sys.exit(1)
    build_report(sys.argv[1])
