#!/usr/bin/env python3
"""Generate competitive-landscape.json for the Next Steps page."""
import json

landscape = {
    "acasus": {
        "name": "Acasus",
        "market": "International development consulting for public sector reform (health & education) in LMICs",
        "market_size": "~$45.5B global education consulting by 2031; LMIC reform niche is a small, donor-funded slice",
        "position": "Niche specialist",
        "position_detail": "Founder-built boutique with embedded-delivery model. Competes on field presence and measurable outcomes, not scale.",
        "advantages": [
            {"label": "Embedded delivery model", "detail": "80% local talent, on-the-ground in 10+ countries. Competitors often fly in/fly out."},
            {"label": "Track record with proof points", "detail": "Punjab vaccination 50% to 90% in 2 years. Quantifiable results that win government trust."},
            {"label": "Budapest data engineering hub", "detail": "24-person technical team (AWS, Tableau, ETL). Unusual capability for a development consultancy."},
            {"label": "Founder credibility", "detail": "Fenton Whelan is a recognized voice in impact consulting. World Health Summit, Harvard Africa Health Conference."}
        ],
        "disadvantages": [
            {"label": "Scale limitation", "detail": "~265 staff vs thousands at Big 4 / MBB impact practices. Cannot compete on volume bids."},
            {"label": "Aid-funding dependency", "detail": "Revenue tied to ODA cycles. US foreign aid contraction is a direct threat to contract pipeline."},
            {"label": "No product revenue", "detail": "Pure services model. No recurring SaaS or platform revenue to smooth contract lumpiness."},
            {"label": "CEO transition risk", "detail": "Founder stepped back 2025. New CEO still establishing. Relationship-based business depends on leadership continuity."}
        ],
        "competitors": [
            {"name": "Palladium", "positioning": "Large-scale development management", "differentiation": "Bigger (5,000+ staff), broader, but less embedded. More program management than reform delivery."},
            {"name": "DAI", "positioning": "International development company", "differentiation": "Larger, US-headquartered, strong USAID relationships. More traditional development contractor."},
            {"name": "Oxford Policy Management", "positioning": "Research + advisory for developing countries", "differentiation": "More research-oriented. Less operational delivery. Overlaps on evidence-based reform."},
            {"name": "McKinsey Social Impact", "positioning": "MBB impact practice", "differentiation": "Brand and scale advantage. But higher cost, shorter engagements, less embedded presence."},
            {"name": "BCG Public Sector", "positioning": "MBB government practice", "differentiation": "Growing impact portfolio. Threatens at the premium end of the market."}
        ],
        "metrics": [
            {"label": "Revenue", "value": "~$35M", "context": "Mid-range for development boutiques. Growing with headcount."},
            {"label": "Headcount", "value": "~265", "context": "+22% YoY. Small vs Big 4 but large for niche."},
            {"label": "Country footprint", "value": "10+ active", "context": "Pakistan, Chad, DRC, Mozambique, Somalia, Afghanistan, Ethiopia, Nigeria, Sudan, Bahrain."},
            {"label": "Data team size", "value": "24 (Budapest)", "context": "Unusual technical depth for a development consultancy."}
        ]
    },
    "cspd": {
        "name": "Catholic Schools Parramatta Diocese",
        "market": "K-12 education in Western Sydney, Australia (Catholic systemic sector)",
        "market_size": "~$3.65B Australian Catholic education sector (2024). CSPD is second-largest Catholic diocesan system in NSW.",
        "position": "Market leader",
        "position_detail": "Dominant Catholic education provider in Western Sydney. Non-selective, mission-driven, government-funded. Competes with government, independent, and other Catholic systems.",
        "advantages": [
            {"label": "Geographic catchment lock-in", "detail": "80 schools across Western Sydney. Families choose based on proximity + faith. Hard for competitors to replicate campus density."},
            {"label": "Government funding stability", "detail": "~75% government funded via Gonski 2.0 needs-based model. Recession-resistant revenue base."},
            {"label": "Pricing advantage", "detail": "$2-4K/yr fees vs $15-30K for independent schools. Cost-of-living pressures push families toward Catholic system."},
            {"label": "Multi-generational loyalty", "detail": "Catholic families enroll across generations. Faith formation creates emotional switching costs beyond academics."},
            {"label": "Rising academic outcomes", "detail": "NAPLAN scores improving. Uplift evidence-based teaching framework launched 2025."}
        ],
        "disadvantages": [
            {"label": "Teacher shortage", "detail": "Australia-wide crisis, acute in Western Sydney. Limits specialist subjects and affects class sizes."},
            {"label": "Technology fragmentation", "detail": "80 schools with likely inconsistent data systems. Integration is a multi-year challenge."},
            {"label": "Enrolment pressure from growth", "detail": "Western Sydney growing +2.1% p.a. Demand outpaces capacity. Capex-intensive to build new schools."},
            {"label": "Governance complexity", "detail": "Nonprofit + Catholic Church governance + government accountability. Multiple masters slow decision-making."}
        ],
        "competitors": [
            {"name": "NSW Department of Education", "positioning": "Government K-12 (free)", "differentiation": "Free schooling. Larger scale. But overcrowded, less agile, no faith formation."},
            {"name": "Sydney Catholic Schools (Archdiocese)", "positioning": "Catholic systemic (Eastern Sydney)", "differentiation": "Same model, different geography. Overlaps at margins. Larger by school count."},
            {"name": "Independent schools (ISA)", "positioning": "Premium private K-12", "differentiation": "Higher fees, selective entry, stronger resourcing. Target different SES segment."},
            {"name": "CECG (Canberra-Goulburn)", "positioning": "Catholic systemic (regional NSW/ACT)", "differentiation": "Smaller, regional. Patrick Ellis hired from CECG to lead CSPD learning outcomes."}
        ],
        "metrics": [
            {"label": "Schools", "value": "80 + 6 ELC", "context": "Second-largest Catholic diocesan system in NSW."},
            {"label": "Students", "value": "~43,000", "context": "Stable enrollment in a high-growth corridor."},
            {"label": "Staff", "value": "~4,500", "context": "~9.5:1 total staff-to-student ratio."},
            {"label": "ACARA student-teacher ratio", "value": "~15:1 (Catholic sector avg)", "context": "National benchmark. CSPD likely near average."},
            {"label": "Fee level", "value": "$2,000-4,000/yr", "context": "vs $15,000-30,000 for independent sector."},
            {"label": "Government funding share", "value": "~75%", "context": "Needs-based (Gonski 2.0). Stable but politically sensitive."}
        ]
    },
    "ipeople": {
        "name": "iPeople Inc",
        "market": "Philippine private higher education (STEM-focused, dual-tier: premium + affordable)",
        "market_size": "$154M (2025) growing to $847M by 2034 at 20.23% CAGR",
        "position": "Market leader in STEM private HE",
        "position_detail": "Conglomerate-backed (Yuchengco + Ayala) education holding company. Differentiated by Mapua brand prestige and STEM focus.",
        "advantages": [
            {"label": "Mapua University brand", "detail": "Philippines top engineering school. 100+ year legacy. Brand is the primary competitive moat."},
            {"label": "Dual-tier pricing", "detail": "Premium (Mapua) + affordable (NTC/APEC). Captures both segments of the market."},
            {"label": "Conglomerate backing", "detail": "Yuchengco Group + Ayala Corporation. Deep pockets for expansion and technology investment."},
            {"label": "Public listing (PSE:IPO)", "detail": "Capital markets access for growth. Governance discipline from public reporting requirements."},
            {"label": "K-12 pipeline", "detail": "Own K-12 feeds into HE institutions. Integrated enrollment funnel."}
        ],
        "disadvantages": [
            {"label": "Thin margins", "detail": "2-3.6% net margin on PHP 5.32B revenue. Little buffer for investment or downturns."},
            {"label": "Scale gap vs PHINMA", "detail": "74,000 students vs PHINMA's 177,851. Half the enrollment, similar market positioning."},
            {"label": "Dual-parent governance", "detail": "Joint Yuchengco + Ayala ownership. Strategic alignment risk if parent priorities diverge."},
            {"label": "Geographic concentration", "detail": "Primarily Metro Manila and Luzon. Less provincial penetration than PHINMA."}
        ],
        "competitors": [
            {"name": "PHINMA Education", "positioning": "Largest Philippine private HE network", "differentiation": "2.4x enrollment. Provincial focus. Lower price point. PE-backed (KKR). Direct threat in affordable segment."},
            {"name": "University of Santo Tomas", "positioning": "Oldest university in Asia", "differentiation": "Prestige brand. But single-campus, not a network operator."},
            {"name": "AMA Education System", "positioning": "IT-focused private HE network", "differentiation": "Overlaps on tech education. Broader geographic spread but lower prestige."},
            {"name": "STI Education Systems", "positioning": "ICT and business vocational", "differentiation": "More vocational focus. Listed (PSE:STI). Competes in affordable tech education."}
        ],
        "metrics": [
            {"label": "Enrollment", "value": "74,000", "context": "Growing +10% YoY. vs PHINMA 177,851."},
            {"label": "Revenue", "value": "PHP 5.32B (~$95M)", "context": "FY2024. Public company financials."},
            {"label": "Net margin", "value": "2-3.6%", "context": "Thin. PHP 351M net income."},
            {"label": "Institutions", "value": "7+", "context": "Across STEM HE, K-12, and blended learning."},
            {"label": "Board exam pass rates", "value": "Top-tier (engineering)", "context": "Primary quality signal in Philippine HE market."}
        ]
    },
    "kinetic": {
        "name": "Kinetic Software",
        "market": "Vertical SaaS for higher education operations (accommodation, conferencing, catering, student engagement)",
        "market_size": "UK PBSA is a 50B+ GBP asset class. 180M+ bed-nights/year under management. Growing internationally.",
        "position": "Market leader (UK/Europe)",
        "position_detail": "85% UK university penetration. Dominant in home market. Two-player global market with geographic splits.",
        "advantages": [
            {"label": "85% UK market penetration", "detail": "Near-monopoly in home market. APUC #1 framework ranking means Scottish universities can buy without tender."},
            {"label": "Deep switching costs", "detail": "Embedded in university HR/finance/accommodation workflows with 25+ years of institutional configuration."},
            {"label": "Multi-product platform", "detail": "Accommodation + conferencing + catering + student engagement. Cross-sell within existing customers."},
            {"label": "Data scale", "detail": "700,000+ managed bed-spaces. Aggregate benchmarking data is a competitive advantage."},
            {"label": "Domain expertise", "detail": "28 years in HE operations. Generic PropTech cant replicate institutional knowledge overnight."}
        ],
        "disadvantages": [
            {"label": "UK saturation ceiling", "detail": "85% = near-maximum. Growth must come from ARPU, new modules, or international markets."},
            {"label": "Small team", "detail": "~86 employees. Capacity-constrained for product development, support, and international expansion simultaneously."},
            {"label": "Geographic concentration", "detail": "Primary revenue from UK. International expansion is early-stage with different regulatory environments."},
            {"label": "Platform risk", "detail": "Generic PropTech (Yardi, RealPage) could move downstream into education. Scale disadvantage if they do."}
        ],
        "competitors": [
            {"name": "StarRez", "positioning": "Global student accommodation software", "differentiation": "Dominates North America and Australia (1,400 customers, 3M+ beds). The other half of the duopoly. Stronger internationally."},
            {"name": "Yardi", "positioning": "Generic property management software", "differentiation": "Massive scale ($500M+ revenue). Could enter education vertical. But lacks HE domain expertise."},
            {"name": "RealPage", "positioning": "US property management platform", "differentiation": "Large platform player. Student housing is one vertical of many. Possible competitive threat."},
            {"name": "Campus Living Villages", "positioning": "PBSA operator + software", "differentiation": "Operator that builds own tools. Vertical integration threat but niche."}
        ],
        "metrics": [
            {"label": "UK market share", "value": "~85%", "context": "Dominant. Near-saturation."},
            {"label": "Customers", "value": "350+", "context": "Institutional clients across UK/Europe and growing internationally."},
            {"label": "Bed-spaces managed", "value": "700,000+", "context": "425,000-700,000+ student bed-spaces under management."},
            {"label": "Bed-nights/year", "value": "180M+", "context": "Transaction volume metric. Scale advantage."},
            {"label": "Team size", "value": "~86", "context": "Efficient but capacity-constrained for growth ambitions."},
            {"label": "Company age", "value": "28 years", "context": "Founded 1998. Deep institutional knowledge."}
        ]
    },
    "phinma": {
        "name": "PHINMA Education",
        "market": "Affordable private higher education in Southeast Asia (Philippines + Indonesia)",
        "market_size": "$154M (2025) growing to $847M by 2034 at 20.23% CAGR (Philippine HE market)",
        "position": "Market leader",
        "position_detail": "Largest private higher education provider in Southeast Asia by enrollment. Acquisition-and-turnaround model targeting underserved provincial markets.",
        "advantages": [
            {"label": "Scale dominance", "detail": "177,851 students. Largest private HE network in SEA. 20-year head start in acquisition model."},
            {"label": "Regulatory moat (PACUCOA Level III)", "detail": "Highest accreditation tier. 3-5 year process for new entrants. CHED recognition is mandatory for degree-granting."},
            {"label": "Board exam brand flywheel", "detail": "#1 Nursing (99.16%), #1 Criminology (92.80%). Results attract students, better students produce better results."},
            {"label": "Provincial network density", "detail": "13 campuses embedded in communities across Luzon/Visayas/Mindanao. Geographic switching costs for students."},
            {"label": "PE backing (KKR)", "detail": "P4.5B from KKR Global Impact Fund. Funds acquisition pipeline and digital transformation mandate."},
            {"label": "Cost discipline", "detail": "'Bare-bones, no-frills, brass knuckles' philosophy. 23% net margin is exceptional for education."}
        ],
        "disadvantages": [
            {"label": "Faculty pipeline constraint", "detail": "Structural shortage of licensed healthcare educators in provincial markets. Growth ceiling."},
            {"label": "Early-stage technology", "detail": "Basic LMS app. CIO in place but digital maturity lags enrollment scale. KKR mandate to fix this."},
            {"label": "Indonesia execution risk", "detail": "50K student target in 5yr. JV structures (Yayasan) add complexity. Different regulatory environment."},
            {"label": "Government subsidy dependency", "detail": "Free HE Act is a material revenue floor. Policy reversal would directly impact affordability model."}
        ],
        "competitors": [
            {"name": "iPeople Inc (PSE:IPO)", "positioning": "STEM-focused Philippine private HE", "differentiation": "74,000 students (42% of PHINMA). Stronger in engineering/STEM. Thinner margins. Metro Manila focused."},
            {"name": "AMA Education System", "positioning": "IT-focused private HE network", "differentiation": "Broader geographic spread. IT/computer science focus. Lower prestige than PHINMA board exam results."},
            {"name": "STI Education Systems", "positioning": "ICT and business vocational", "differentiation": "Vocational focus. Listed (PSE:STI). Different segment but overlaps in affordable tech education."},
            {"name": "University of the Philippines", "positioning": "State university system", "differentiation": "Free tuition (government-funded). Highly selective. Not a direct competitor for PHINMA target market."},
            {"name": "Universitas Ciputra (Indonesia)", "positioning": "Indonesian private university", "differentiation": "Potential competitor in Indonesia expansion. Established brand in entrepreneurship education."}
        ],
        "metrics": [
            {"label": "Enrollment", "value": "177,851", "context": "Largest private HE in SEA. +14% YoY revenue growth."},
            {"label": "Revenue", "value": "P6.5B (~$115M)", "context": "FY2024-2025. Growing 14% YoY."},
            {"label": "Net margin", "value": "~23%", "context": "P1.5B net income. Exceptional for education sector."},
            {"label": "Institutions", "value": "13", "context": "11 Philippines + 2 Indonesia. Pipeline: 4 more Philippine cities."},
            {"label": "Retention rate", "value": "89%", "context": "High for affordable segment. Each 1% = ~1,780 students."},
            {"label": "Nursing pass rate", "value": "99.16% (#1 nationally)", "context": "Key brand metric. Self-reinforcing quality signal."},
            {"label": "PE capital", "value": "P4.5B ($80M)", "context": "KKR + Kaizenvest. Closed Aug 2025."}
        ]
    },
    "rising": {
        "name": "Rising Academies",
        "market": "Affordable education delivery and AI tutoring in Sub-Saharan Africa",
        "market_size": "$7.3B (2025) growing to $19.2B by 2034 (SSA education market). 250M+ out-of-school children globally.",
        "position": "Niche specialist",
        "position_detail": "Evidence-led, B-Corp certified education social enterprise. Differentiates on RCT-validated learning outcomes and WhatsApp-native AI tutoring.",
        "advantages": [
            {"label": "Published RCT evidence", "detail": "arXiv:2402.09809 shows 0.36 SD effect size. One of very few SSA operators with peer-reviewed impact evidence."},
            {"label": "WhatsApp-native AI (Rori/Tari)", "detail": "150,000+ users. Zero friction distribution via WhatsApp. Works in low-bandwidth environments."},
            {"label": "Government partnerships", "detail": "4 national MoUs (Sierra Leone, Liberia, Ghana, Rwanda). Institutional relationships are a high-switching-cost moat."},
            {"label": "B-Corp + mission alignment", "detail": "Certified B-Corp. Avoids the political backlash that hits pure-profit school chains in Africa."},
            {"label": "Data network effect", "detail": "Rori AI improves with each interaction. Compounding accuracy advantage over new entrants."}
        ],
        "disadvantages": [
            {"label": "Not yet profitable", "detail": "Grant-subsidized. $2-8M budget dependent on philanthropic and impact capital. Revenue sustainability unproven."},
            {"label": "Quality at 900+ sites", "detail": "300,000+ students across 4 countries. Consistency challenge as operations outpace infrastructure."},
            {"label": "Government payment risk", "detail": "B2G contracts = political risk + payment delays. Budget cycles in SSA are unreliable."},
            {"label": "Narrow geographic base", "detail": "West Africa concentrated. Expansion to East/Southern Africa would require new government relationships."}
        ],
        "competitors": [
            {"name": "Bridge International Academies", "positioning": "Low-cost private school chain (Africa, India)", "differentiation": "Larger scale but controversial. Political backlash in Kenya, Uganda. Rising's evidence-led positioning is a direct counter."},
            {"name": "NewGlobe", "positioning": "School management platform (Bridge spin-off)", "differentiation": "Government partnership model similar to Rising. Larger operations. Less AI-focused."},
            {"name": "Eneza Education", "positioning": "Mobile learning platform (East Africa)", "differentiation": "SMS/app-based tutoring. Overlaps on mobile delivery but less school-level integration."},
            {"name": "Ubongo", "positioning": "Edutainment media (East Africa)", "differentiation": "Content/media approach vs Rising's school operations. Different model, similar mission."},
            {"name": "Anthropic / ChatGPT", "positioning": "General AI tutoring", "differentiation": "Rising partnered with Anthropic for Rori. But generic AI chatbots could disintermediate if WhatsApp integration improves."}
        ],
        "metrics": [
            {"label": "Students", "value": "300,000+", "context": "Across 900+ schools in 4 countries."},
            {"label": "Rori AI users", "value": "150,000+", "context": "WhatsApp-native. Key differentiator."},
            {"label": "Government partnerships", "value": "4 national", "context": "Sierra Leone, Liberia, Ghana, Rwanda."},
            {"label": "Funding raised", "value": "~$6-10M cumulative", "context": "Series A $4.25M (2024). Impact investors."},
            {"label": "RCT effect size", "value": "0.36 SD", "context": "Published, peer-reviewed. Rare in the sector."},
            {"label": "Team size", "value": "501-1,000", "context": "Mostly field staff across 4 countries."}
        ]
    },
    "school-for-life": {
        "name": "School for Life Foundation",
        "market": "International education charity (Australian fundraising, Ugandan delivery)",
        "market_size": "Australian international development charity sector. ~$1.4B total DGR donations to international causes (2024).",
        "position": "Niche specialist",
        "position_detail": "Small, deep, locally-led model. Competes for Australian philanthropic dollars against other education charities and broader international development causes.",
        "advantages": [
            {"label": "17-year track record", "detail": "Founded 2008. Longevity builds donor trust. Holistic model (primary + secondary + vocational) over full lifecycle."},
            {"label": "Founder personal brand", "detail": "Annabelle Chauncy OAM. Keynote circuit (Saxton/Halogen). Personal credibility drives major donor relationships."},
            {"label": "Premium donor events", "detail": "Gala Ball is a high-touch, exclusive experience. Attracts HNW individuals in Sydney finance/real estate."},
            {"label": "Locally-led model", "detail": "250 staff in Uganda, majority local. Authenticity narrative resonates with donors. 43 acres of owned land."},
            {"label": "Dramatically better student-teacher ratio", "detail": "~18:1 vs Uganda national average of ~50:1 (government schools). Clear differentiation."}
        ],
        "disadvantages": [
            {"label": "Revenue concentration", "detail": "Gala Ball + small number of major donors = high concentration risk. One bad year could be material."},
            {"label": "Scale ceiling", "detail": "10 schools, 4,500 students. Growth constrained by fundraising capacity, not demand."},
            {"label": "FX exposure", "detail": "Revenue in AUD, costs in UGX. Currency movements directly impact operational budget."},
            {"label": "Dual-geography management", "detail": "~30 Australia + 250 Uganda. Coordination overhead for a small organization."}
        ],
        "competitors": [
            {"name": "One Girl", "positioning": "Australian charity for girls education in Africa", "differentiation": "Similar donor base (Australian women). Different model (scholarships vs school operation). Competes for same philanthropic dollars."},
            {"name": "Room to Read", "positioning": "Global literacy and girls education", "differentiation": "Massive scale (39 countries). Better known internationally. More institutional funding."},
            {"name": "PEAS (Promoting Equality in African Schools)", "positioning": "UK charity operating schools in Uganda", "differentiation": "Direct overlap: charity-run schools in Uganda. Larger (35 schools). UK donor base, not Australian."},
            {"name": "Opportunity International", "positioning": "Education finance in developing countries", "differentiation": "Different model (microfinance for school fees). Some donor base overlap in Australia."}
        ],
        "metrics": [
            {"label": "Schools", "value": "10", "context": "Primary + secondary + vocational in rural Uganda."},
            {"label": "Students", "value": "4,500+", "context": "Deep engagement per student over full education lifecycle."},
            {"label": "Staff (Uganda)", "value": "~250", "context": "Locally led. 18:1 student-staff ratio."},
            {"label": "Land owned", "value": "43 acres", "context": "Physical asset base in Uganda. Rare for education charity."},
            {"label": "Est. annual revenue", "value": "$2-5M AUD", "context": "Gala Ball + major donors + recurring giving."},
            {"label": "Organization age", "value": "17 years", "context": "Founded 2008. Longevity signals sustainability."}
        ]
    },
    "wise": {
        "name": "WISE",
        "market": "Global education innovation convening and policy influence",
        "market_size": "Niche. Global education summit/convening space is not a traditional market. Value is measured in policy influence, not revenue.",
        "position": "Category leader (Gulf-backed education convening)",
        "position_detail": "Qatar Foundation-backed global platform. Unique positioning at intersection of Gulf soft power, education innovation, and Global South policy.",
        "advantages": [
            {"label": "Qatar Foundation sovereign backing", "detail": "~$405M/yr QF total spend. Removes financial pressure competitors face. Can invest in long-term programming."},
            {"label": "Sheikha Moza patronage", "detail": "UNESCO Special Envoy for Basic and Higher Education. Structurally unreplicable personal endorsement."},
            {"label": "WISE Prize prestige", "detail": "$500K prize called 'Nobel Prize for Education.' Key brand asset. 12,000+ cumulative summit attendees."},
            {"label": "Global South focus", "detail": "Differentiates from Western-centric convenings (OECD, World Bank). Attracts diverse policymaker audience."},
            {"label": "15+ year brand equity", "detail": "35,000+ community members. 150,000+ engaged followers. Network effects in policy influence."}
        ],
        "disadvantages": [
            {"label": "Single-funder dependency", "detail": "Qatar Foundation = ~100% of operational funding. Strategic misalignment with QF leadership is existential."},
            {"label": "Tiny team", "detail": "~36 FTE. Cannot sustain year-round programming, deep research, and community engagement simultaneously."},
            {"label": "Impact measurement gap", "detail": "Convening ROI is hard to prove. Relies on soft metrics (attendees, media mentions) vs hard outcomes."},
            {"label": "Geopolitical perception risk", "detail": "Gulf-state backing can be perceived as soft power tool. May affect credibility with some Western institutions."}
        ],
        "competitors": [
            {"name": "UNESCO", "positioning": "UN education agency", "differentiation": "Institutional authority and global mandate. But bureaucratic, slow-moving. WISE is more agile."},
            {"name": "World Bank Education", "positioning": "Multilateral development + education", "differentiation": "Massive funding and research capacity. But focused on lending, not innovation convening."},
            {"name": "ASU+GSV Summit", "positioning": "EdTech investment summit", "differentiation": "US-centric, commercially focused. WISE is policy-focused, Global South-oriented."},
            {"name": "HundrED", "positioning": "Education innovation platform (Finland)", "differentiation": "Innovation focus overlaps. Smaller. Nordic credibility. Less policy clout."},
            {"name": "OECD Education", "positioning": "Education policy research (PISA)", "differentiation": "Data authority (PISA). Western-focused. WISE differentiates on practitioner engagement and Global South."}
        ],
        "metrics": [
            {"label": "Community members", "value": "35,000+", "context": "Global network of education stakeholders."},
            {"label": "Summit attendees (cumulative)", "value": "12,000+", "context": "Across 12 editions since 2009."},
            {"label": "WISE Prize value", "value": "$500K", "context": "Largest education-specific prize globally."},
            {"label": "Team size", "value": "~36 FTE", "context": "Very small for global ambition."},
            {"label": "Engaged followers", "value": "150,000+", "context": "Social/digital reach for policy influence."},
            {"label": "QF backing", "value": "~$405M/yr (total QF)", "context": "WISE share undisclosed. Operational stability guaranteed."}
        ]
    }
}

out_path = "P:/Projects2/sg-general-agents/projects/prospector/site/public/data/companies/competitive-landscape.json"
with open(out_path, "w") as f:
    json.dump(landscape, f, indent=2)
print(f"Wrote {out_path}")
