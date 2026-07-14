import re

with open("output.css", "r", encoding="utf-8") as f:
    content = f.read()

# Find all CSS selectors starting with dot
selectors = re.findall(r"\.([a-zA-Z0-9_-]+)(?:\s*,\s*\.[a-zA-Z0-9_-]+)*\s*\{", content)

print("Found selectors:", len(selectors))
print("First 20 selectors:")
for s in list(set(selectors))[:20]:
    print(f"  .{s}")
