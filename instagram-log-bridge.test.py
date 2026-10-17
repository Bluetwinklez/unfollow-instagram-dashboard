import importlib.util
import json
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.server import HTTPServer
from pathlib import Path


class BridgeTest(unittest.TestCase):
    def test_authenticated_redacted_file_sink(self):
        spec = importlib.util.spec_from_file_location("bridge", Path("instagram-chrome-eklentisi/log-bridge.py"))
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        with tempfile.TemporaryDirectory() as temporary:
            module.LOG = Path(temporary) / "events.jsonl"
            module.TOKEN = "test-only-token"
            server = HTTPServer(("127.0.0.1", 0), module.Handler)
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            address = f"http://127.0.0.1:{server.server_port}"
            try:
                with self.assertRaises(urllib.error.HTTPError) as error:
                    urllib.request.urlopen(address + "/health")
                self.assertEqual(error.exception.code, 403)
                headers = {"Authorization": "Bearer test-only-token", "Content-Type": "application/json"}
                event = {"event": "request.end", "status": 200, "responseKind": "html", "headers": {"cookie": "secret"}, "body": "secret"}
                request = urllib.request.Request(address + "/events", data=json.dumps(event).encode(), headers=headers)
                self.assertEqual(urllib.request.urlopen(request).status, 200)
                content = module.LOG.read_text(encoding="utf-8")
                self.assertNotIn("secret", content)
                self.assertEqual(json.loads(content)["responseKind"], "html")
            finally:
                server.shutdown()
                server.server_close()


if __name__ == "__main__":
    unittest.main()
