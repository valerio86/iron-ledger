#!/usr/bin/env python3
"""Run tests/ in headless Chrome with a throwaway profile. Exits non-zero on any failure.
Pages: the app suite (tests/index.html), sync against a fake Firebase (tests/sync, one scenario per load), the Strava worker (tests/worker.html)."""
import functools, http.server, json, os, subprocess, sys, tempfile, threading

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TIMEOUT = 60
PAGES = [("", "tests/index.html")] + [(f"sync {s}", f"tests/sync/index.html?s={s}") for s in ("adopt", "fresh", "del-old", "del-fail")] + [("worker", "tests/worker.html")]

def run(page):
    got, done = [], threading.Event()
    class Handler(http.server.SimpleHTTPRequestHandler):
        def do_POST(self):
            got.extend(json.loads(self.rfile.read(int(self.headers["Content-Length"]))))
            self.send_response(204); self.end_headers(); done.set()
        def log_message(self, *a): pass
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Handler, directory=ROOT))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as profile:   # Chrome can still be writing its profile as it exits
        chrome = subprocess.Popen([CHROME, "--headless=new", "--disable-gpu", f"--user-data-dir={profile}", "--no-first-run",
                                   f"http://127.0.0.1:{server.server_port}/{page}"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        finished = done.wait(TIMEOUT)
        chrome.terminate(); chrome.wait()
    server.shutdown()
    return got if finished else None

total = failed = 0
for label, page in PAGES:
    got = run(page)
    if got is None: print(f"FAIL {page}: no results after {TIMEOUT} s"); failed += 1; total += 1; continue
    for r in got:
        name = f"[{label}] {r['name']}" if label else r["name"]
        print(("ok  " if r["ok"] else "FAIL"), name)
        if not r["ok"]: print("    ", r["msg"])
    total += len(got); failed += sum(not r["ok"] for r in got)
print(f"\n{total - failed} of {total} passed")
sys.exit(1 if failed else 0)
