import os
import json
import ssl
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse

PORT = int(os.getenv("PORT", "8787"))
API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions"

class Handler(BaseHTTPRequestHandler):
    def _send(self, status, body, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        if isinstance(body, (dict, list)):
            body = json.dumps(body).encode("utf-8")
        elif isinstance(body, str):
            body = body.encode("utf-8")
        self.wfile.write(body)

    def do_OPTIONS(self):
        req_headers = self.headers.get("Access-Control-Request-Headers", "Content-Type")
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", req_headers)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        clean_path = parsed.path or "/"
        if clean_path == "/" or clean_path == "/index.html":
            try:
                with open("index.html", "rb") as f:
                    data = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(data)
            except FileNotFoundError:
                self._send(404, {"error": {"message": "index.html not found"}})
        else:
            self._send(404, {"error": {"message": "not found"}})

    def do_POST(self):
        if self.path != "/api/chat":
            self._send(404, {"error": {"message": "not found"}})
            return
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length)
        try:
            payload = json.loads(raw.decode("utf-8")) if raw else {}
        except Exception:
            self._send(400, {"error": {"message": "invalid json"}})
            return
        if not API_KEY:
            self._send(400, {"error": {"message": "server missing API key"}})
            return
        body = json.dumps({
            "model": payload.get("model", "deepseek-chat"),
            "messages": payload.get("messages", []),
        }).encode("utf-8")
        req = Request(DEEPSEEK_URL, data=body, method="POST")
        req.add_header("Content-Type", "application/json")
        req.add_header("Authorization", f"Bearer {API_KEY}")
        try:
            ctx = ssl.create_default_context()
            with urlopen(req, timeout=25, context=ctx) as resp:
                data = resp.read()
                ct = resp.headers.get("Content-Type", "application/json")
                self.send_response(200)
                self.send_header("Content-Type", ct)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(data)
        except HTTPError as e:
            try:
                err_body = e.read().decode("utf-8")
            except Exception:
                err_body = ""
            message = err_body or f"HTTP {e.code}"
            if "Insufficient Balance" in message:
                message = "余额不足，请更换有效 API Key"
            self._send(e.code, {"error": {"message": message}})
        except URLError as e:
            reason = str(getattr(e, "reason", e))
            if "timed out" in reason.lower():
                self._send(504, {"error": {"message": "请求 DeepSeek 超时，请稍后重试"}})
            else:
                self._send(502, {"error": {"message": "网络故障或 API 不可达，请检查网络或服务状态"}})
        except Exception as e:
            self._send(500, {"error": {"message": "服务器内部错误：" + str(e)}})

def run():
    print(f"Server: http://localhost:{PORT}/")
    HTTPServer(("", PORT), Handler).serve_forever()

if __name__ == "__main__":
    run()
