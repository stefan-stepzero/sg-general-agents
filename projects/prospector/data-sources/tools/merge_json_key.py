"""Merge a JSON file into a specific key of a target JSON file.

Usage:
  python merge_json_key.py <target_file> <key> <source_file>

If target doesn't exist, creates it with { key: source_data }.
If target exists, reads it, sets target[key] = source_data, writes back.
"""
import json
import sys
import os

def main():
    if len(sys.argv) != 4:
        print("Usage: python merge_json_key.py <target_file> <key> <source_file>")
        sys.exit(1)

    target_path, key, source_path = sys.argv[1], sys.argv[2], sys.argv[3]

    # Read source
    with open(source_path, encoding="utf-8") as f:
        source_data = json.load(f)

    # Read or create target
    if os.path.exists(target_path):
        with open(target_path, encoding="utf-8") as f:
            target_data = json.load(f)
    else:
        target_data = {}

    # Merge
    target_data[key] = source_data

    # Write
    with open(target_path, "w", encoding="utf-8") as f:
        json.dump(target_data, f, ensure_ascii=False, indent=2)

    print(f"Merged {source_path} into {target_path}[{key}]")

if __name__ == "__main__":
    main()
