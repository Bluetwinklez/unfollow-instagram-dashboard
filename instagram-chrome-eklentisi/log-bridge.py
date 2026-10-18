"""Authenticated, loopback-only sink for redacted extension diagnostics."""
import json
import os
import secrets
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CONFIG = json.loads((ROOT / "log-bridge-settings.json").read_text(encoding="utf-8"))
TOKEN = CONFIG["token"]
LOG = ROOT.parent / "instagram-canli-log.jsonl"
WRITE_LOCK = threading.Lock()
ALLOWED = {"at", "tabId", "event", "level", "method", "route", "status", "durationMs", "loaded", "total", "confirmed", "reason", "outcome", "requestId", "responseKind", "redirected", "code"}

class Handler(BaseHTTPRequestHandler):
    def setup(self):
        super().setup()
        self.connection.settimeout(3)

    def log_message(self, *_args):
        pass

    def authorized(self):
        value = self.headers.get("Authorization", "")
        return secrets.compare_digest(value, "Bearer " + TOKEN)

    def reply(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if not self.authorized():
            return self.reply(403, {"ok": False})
        if self.path != "/health":
            return self.reply(404, {"ok": False})
        self.reply(200, {"ok": True})

    def do_POST(self):
        if not self.authorized():
            return self.reply(403, {"ok": False})
        if self.path != "/events":
            return self.reply(404, {"ok": False})
        try:
            size = int(self.headers.get("Content-Length", "0"))
            if size < 1 or size > 4096:
                return self.reply(413, {"ok": False})
            data = json.loads(self.rfile.read(size))
            if not isinstance(data, dict):
                raise ValueError("not an event")
            event = {key: value for key, value in data.items() if key in ALLOWED and isinstance(value, (str, int, float, bool))}
            for key, value in event.items():
                if isinstance(value, str):
                    event[key] = value[:120]
            with WRITE_LOCK:
                if LOG.exists() and LOG.stat().st_size > 2_000_000:
                    os.replace(LOG, LOG.with_suffix(".previous.jsonl"))
                with LOG.open("a", encoding="utf-8") as stream:
                    stream.write(json.dumps(event, ensure_ascii=False) + "\n")
            self.reply(200, {"ok": True})
        except (ValueError, OSError):
            self.reply(400, {"ok": False})

if __name__ == "__main__":
    LOG.touch(exist_ok=True)
    server = ThreadingHTTPServer(("127.0.0.1", 18765), Handler)
    server.timeout = 2
    server.serve_forever()
