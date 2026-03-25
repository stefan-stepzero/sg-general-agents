# Data Pipeline Tools

Python scripts that agents call to process data without loading large files into context.

## Tools

### `extract_pdf.py`
Extract text from PDFs with optional page range and keyword filtering.
```bash
# Extract all pages
python extract_pdf.py report.pdf --output extracted.json

# Extract pages 5-15
python extract_pdf.py report.pdf --pages 5-15 --output extracted.json

# Only pages mentioning "enrolment"
python extract_pdf.py report.pdf --search "enrolment" --output extracted.json
```

### `filter_acara.py`
Filter ACARA school profile XLSX to specific schools and compute aggregates.
```bash
# Filter by school name list
python filter_acara.py school-profile-2025.xlsx --schools school_names.json --output filtered.json

# Filter all NSW Catholic schools
python filter_acara.py school-profile-2025.xlsx --state NSW --sector Catholic --output filtered.json
```

### `acara_trends.py`
Extract year-over-year enrolment trends from historical ACARA data.
```bash
python acara_trends.py school-profile-2008-2025.xlsx --schools school_names.json --output trends.json
```

## Dependencies
```bash
pip install pdfplumber openpyxl
```

## Output Format
All tools output JSON. Agents should call the tool via Bash, then read the output JSON file.
