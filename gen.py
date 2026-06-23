import base64, json, os, sys, time, urllib.request, urllib.error

KEY = open(os.path.join(os.path.dirname(__file__), ".oai_key")).read().strip()
OUT = os.path.join(os.path.dirname(__file__), "assets", "img")
os.makedirs(OUT, exist_ok=True)

STYLE = ("Warm golden-hour palette of amber, honey-yellow, terracotta orange with deep "
         "wine-red and soft rose accents. Elegant editorial travel-and-wine aesthetic, "
         "rich natural light, painterly yet photographic, inviting and premium. "
         "No text, no letters, no words, no watermark, no logo.")

def gen(name, prompt, size="1536x1024", quality="medium", tries=12):
    body = json.dumps({
        "model": "gpt-image-2",
        "prompt": f"{prompt}. {STYLE}",
        "size": size,
        "quality": quality,
        "n": 1,
    }).encode()
    for t in range(1, tries + 1):
        req = urllib.request.Request(
            "https://api.openai.com/v1/images/generations", data=body,
            headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                data = json.load(r)
            b64 = data["data"][0]["b64_json"]
            path = os.path.join(OUT, name)
            with open(path, "wb") as f:
                f.write(base64.b64decode(b64))
            print(f"OK   {name}  ({os.path.getsize(path)//1024} KB) try {t}")
            return True
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:160]
            geo = "unsupported_country" in msg
            print(f"..   {name} try {t} HTTP {e.code} {'GEO' if geo else msg}")
            time.sleep(6 if geo else 12)
        except Exception as e:
            print(f"..   {name} try {t} ERR {str(e)[:120]}")
            time.sleep(8)
    print(f"FAIL {name}")
    return False

if __name__ == "__main__":
    # name, prompt, size
    JOBS = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else []
    ok = 0
    for j in JOBS:
        if gen(j["name"], j["prompt"], j.get("size", "1536x1024"), j.get("quality", "medium")):
            ok += 1
    print(f"=== {ok}/{len(JOBS)} generated ===")
