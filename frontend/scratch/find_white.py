with open("output.css", "r", encoding="utf-8") as f:
    content = f.read()

# Check for text-white
import re
matches = [m.start() for m in re.finditer("text-white", content)]
print("Matches found:", len(matches))
for idx, m in enumerate(matches):
    start = max(0, m - 50)
    end = min(len(content), m + 100)
    print(f"Match {idx+1}: {repr(content[start:end])}")
