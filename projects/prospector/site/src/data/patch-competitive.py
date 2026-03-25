#!/usr/bin/env python3
"""Patch competitive-landscape.json to add relationship types to competitor entries."""
import json

path = "P:/Projects2/sg-general-agents/projects/prospector/site/public/data/companies/competitive-landscape.json"
data = json.load(open(path))

# Add relationship type: "direct competitor", "resource competitor", "structural peer", "adjacent player"
relationships = {
    "acasus": {
        "Palladium": "direct competitor",
        "DAI": "direct competitor",
        "Oxford Policy Management": "structural peer",
        "McKinsey Social Impact": "resource competitor",
        "BCG Public Sector": "resource competitor",
    },
    "cspd": {
        "NSW Department of Education": "resource competitor",
        "Sydney Catholic Schools (Archdiocese)": "structural peer",
        "Independent schools (ISA)": "resource competitor",
        "CECG (Canberra-Goulburn)": "structural peer",
    },
    "ipeople": {
        "PHINMA Education": "direct competitor",
        "University of Santo Tomas": "resource competitor",
        "AMA Education System": "direct competitor",
        "STI Education Systems": "adjacent player",
    },
    "kinetic": {
        "StarRez": "direct competitor",
        "Yardi": "adjacent player",
        "RealPage": "adjacent player",
        "Campus Living Villages": "adjacent player",
    },
    "phinma": {
        "iPeople Inc (PSE:IPO)": "direct competitor",
        "AMA Education System": "direct competitor",
        "STI Education Systems": "adjacent player",
        "University of the Philippines": "resource competitor",
        "Universitas Ciputra (Indonesia)": "resource competitor",
    },
    "rising": {
        "NewGlobe": "direct competitor",
        "Bridge International Academies": "structural peer",
        "Eneza Education": "adjacent player",
        "Ubongo": "adjacent player",
        "Anthropic / ChatGPT": "adjacent player",
    },
    "school-for-life": {
        "PEAS (Promoting Equality in African Schools)": "structural peer",
        "One Girl": "resource competitor",
        "Room to Read": "structural peer",
        "Opportunity International": "resource competitor",
    },
    "wise": {
        "UNESCO": "structural peer",
        "World Bank Education": "structural peer",
        "ASU+GSV Summit": "adjacent player",
        "HundrED": "direct competitor",
        "OECD Education": "structural peer",
    },
}

for cid, company in data.items():
    rels = relationships.get(cid, {})
    for comp in company["competitors"]:
        comp["relationship"] = rels.get(comp["name"], "structural peer")

json.dump(data, open(path, "w"), indent=2)
print(f"Patched {path}")
