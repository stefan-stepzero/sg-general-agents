#!/usr/bin/env python3
"""
validate_schema.py — Validate a JSON file against a JSON Schema (draft-07).

Usage:
    python validate_schema.py <json_file> <schema_file>

Exit codes:
    0 = valid
    1 = invalid (errors printed to stdout)
    2 = usage error or file not found

Example:
    python validate_schema.py cspd/analysis/pain-points.json schemas/pain-points-v3.schema.json
"""

import sys
import json
import os

def main():
    if len(sys.argv) != 3:
        print(f"Usage: python {os.path.basename(sys.argv[0])} <json_file> <schema_file>")
        sys.exit(2)

    json_file = sys.argv[1]
    schema_file = sys.argv[2]

    # Check files exist
    for path in [json_file, schema_file]:
        if not os.path.isfile(path):
            print(f"ERROR: File not found: {path}")
            sys.exit(2)

    # Load files
    try:
        with open(json_file, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON in {json_file}: {e}")
        sys.exit(1)

    try:
        with open(schema_file, "r", encoding="utf-8") as f:
            schema = json.load(f)
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON in schema {schema_file}: {e}")
        sys.exit(2)

    # Validate
    try:
        import jsonschema
        from jsonschema import validate, Draft7Validator
    except ImportError:
        print("ERROR: jsonschema not installed. Run: pip install jsonschema")
        sys.exit(2)

    validator = Draft7Validator(schema)
    errors = list(validator.iter_errors(data))

    if not errors:
        print(f"PASS  {json_file}")
        sys.exit(0)
    else:
        print(f"FAIL  {json_file}")
        for i, error in enumerate(errors, 1):
            # Build a readable path to the failing field
            path = " -> ".join(str(p) for p in error.absolute_path) if error.absolute_path else "(root)"
            print(f"  [{i}] {path}: {error.message}")
        sys.exit(1)


if __name__ == "__main__":
    main()
