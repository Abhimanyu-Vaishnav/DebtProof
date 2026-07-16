import urllib.request
import urllib.error
import json

url = "http://127.0.0.1:8000/api/v1/payments/verify/"
req = urllib.request.Request(url, method="POST")
try:
    with urllib.request.urlopen(req) as response:
        status_code = response.getcode()
        body = response.read().decode("utf-8")
        print("Status Code:", status_code)
        print("Response JSON:", json.loads(body))
except urllib.error.HTTPError as e:
    print("HTTP Status Code:", e.code)
    print("Response JSON:", json.loads(e.read().decode("utf-8")))
except Exception as e:
    print("API Error:", e)
