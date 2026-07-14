import urllib.request
import re

url = "http://localhost:3000/"
try:
    # Fetch home page HTML
    with urllib.request.urlopen(url) as response:
        html = response.read().decode('utf-8')
    
    # Find CSS link
    css_match = re.search(r'href="(/_next/static/css/[^"]+\.css)"', html)
    if css_match:
        css_url = f"http://localhost:3000{css_match.group(1)}"
        print("CSS URL found:", css_url)
        with urllib.request.urlopen(css_url) as css_response:
            css_content = css_response.read().decode('utf-8')
        
        print("CSS size:", len(css_content))
        # Search for text-white
        if "text-white" in css_content:
            print("text-white is in CSS!")
        else:
            print("text-white is MISSING from CSS!")
            
        if "btn-primary" in css_content:
            print("btn-primary is in CSS!")
        else:
            print("btn-primary is MISSING from CSS!")
    else:
        print("No compiled static CSS URL found in HTML! Running in CSS-in-JS or dev chunk mode.")
        # In next dev, CSS might be loaded via JS chunks or inline styles.
        # Let's search for layout.css chunks or JS files containing CSS.
except Exception as e:
    print("Error:", e)
