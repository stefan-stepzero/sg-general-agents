"""Extract text from a PDF file, optionally filtering by page range or keyword.

Usage:
  python extract_pdf.py <pdf_path> [--pages 1-10] [--search "keyword"] [--output output.json]

Output: JSON with { pages: [{ page: 1, text: "..." }, ...], metadata: { total_pages, file } }
If --search is used, only pages containing the keyword are returned.
"""
import argparse
import json
import sys

def extract(pdf_path, page_range=None, search=None):
    import pdfplumber

    result = {"pages": [], "metadata": {}}

    with pdfplumber.open(pdf_path) as pdf:
        total = len(pdf.pages)
        result["metadata"] = {"total_pages": total, "file": pdf_path}

        # Determine page range
        if page_range:
            start, end = page_range.split("-")
            start, end = int(start) - 1, int(end)
            pages = range(start, min(end, total))
        else:
            pages = range(total)

        for i in pages:
            page = pdf.pages[i]
            text = page.extract_text() or ""

            if search and search.lower() not in text.lower():
                continue

            result["pages"].append({
                "page": i + 1,
                "text": text.strip()
            })

    return result

def main():
    parser = argparse.ArgumentParser(description="Extract text from PDF")
    parser.add_argument("pdf_path", help="Path to PDF file")
    parser.add_argument("--pages", help="Page range (e.g. 1-10)", default=None)
    parser.add_argument("--search", help="Only return pages containing this keyword", default=None)
    parser.add_argument("--output", help="Output JSON file path", default=None)
    args = parser.parse_args()

    result = extract(args.pdf_path, args.pages, args.search)

    output = json.dumps(result, ensure_ascii=False, indent=2)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(output)
        print(f"Extracted {len(result['pages'])} pages to {args.output}")
    else:
        print(output)

if __name__ == "__main__":
    main()
