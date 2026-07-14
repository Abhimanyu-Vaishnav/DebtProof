import os

path = ".next/dev/static/css/app/layout.css"
if os.path.exists(path):
    print("layout.css exists. Size:", os.path.getsize(path))
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "text-white" in content:
        print("text-white is in layout.css!")
    else:
        print("text-white is MISSING from layout.css!")
        
    if "btn-primary" in content:
        print("btn-primary is in layout.css!")
    else:
        print("btn-primary is MISSING from layout.css!")
        
    # Print first 20 lines
    print("First 20 lines:")
    print("\n".join(content.splitlines()[:20]))
else:
    print("layout.css does not exist at:", path)
