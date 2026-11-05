#!/usr/bin/env python3
"""Run tests/ in headless Chrome with a throwaway profile. Exits non-zero on any failure."""
import functools, http.server, json, os, subprocess, sys, tempfile, threading

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TIMEOUT = 60
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
                               f"http://127.0.0.1:{server.server_port}/tests/index.html"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    finished = done.wait(TIMEOUT)
    chrome.terminate(); chrome.wait()
if not finished: sys.exit(f"No results after {TIMEOUT} s: the test page didn't finish.")
for r in got:
    print(("ok  " if r["ok"] else "FAIL"), r["name"])
    if not r["ok"]: print("    ", r["msg"])
failed = sum(not r["ok"] for r in got)
print(f"\n{len(got) - failed} of {len(got)} passed")
sys.exit(1 if failed else 0)
