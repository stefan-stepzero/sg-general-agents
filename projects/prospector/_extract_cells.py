import json

# Read cells
with open('P:/Projects2/sg-general-agents/projects/prospector/outputs/product-ideas/_cells.json', 'r') as f:
    cells = json.load(f)

# Extract and save cells 5-8
for i in range(4, 8):
    cell = cells[i]
    output_file = f'P:/Projects2/sg-general-agents/projects/prospector/outputs/product-ideas/cell-extracted-{cell["cellNum"]}.json'
    with open(output_file, 'w') as f:
        json.dump(cell, f, indent=2)
    print(f"Extracted Cell {cell['cellNum']} to {output_file}")
