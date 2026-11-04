#!/usr/bin/env python3
"""Simple SPA static server for the golive-asia mirror with /api proxy."""
import http.server
import socketserver
import os
import urllib.request
import urllib.error

WEB_DIR = "/home/charles-003/golive_asia_backup/golive4"
PORT = 8081
API_BASE = "https://www.golive-asia.com"

ASSET_PREFIXES = ("/assets/", "/scripts/", "/styles/", "/images/", "/favicon.ico")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def _proxy_request(self, method):
        """Proxy an API request to the live site."""
        url = API_BASE + self.path
        try:
            # Read request body for POST/PUT/etc
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length) if content_length > 0 else None

            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json",
                "Origin": "http://127.0.0.1:8081",
            }
            # Forward content-type for POST requests
            if self.headers.get("Content-Type"):
                headers["Content-Type"] = self.headers["Content-Type"]
            if self.headers.get("Authorization"):
                headers["Authorization"] = self.headers["Authorization"]
            if self.headers.get("Cookie"):
                headers["Cookie"] = self.headers["Cookie"]

            req = urllib.request.Request(
                url,
                data=body,
                headers=headers,
                method=method,
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = resp.read()
                self.send_response(resp.status)
                content_type = resp.headers.get("Content-Type", "application/json")
                self.send_header("Content-Type", content_type)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            data = e.read() if e.fp else b""
            self.send_response(e.code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            self.send_response(502)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(str(e).encode())

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, Origin, Accept")
        self.send_header("Access-Control-Allow-Credentials", "true")
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/api/"):
            return self._proxy_request("GET")

        # Serve asset/script/style/image/favicon paths from root
        if self.path == "/favicon.ico" or any(self.path.startswith(p) for p in ASSET_PREFIXES):
            file_path = os.path.join(WEB_DIR, self.path.lstrip("/"))
            if os.path.exists(file_path) and not os.path.isdir(file_path):
                self.path = self.path
                return super().do_GET()
            self.send_response(404)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"Not found")
            return

        # SPA fallback
        path = self.translate_path(self.path)
        if not os.path.exists(path) or os.path.isdir(path):
            self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/"):
            return self._proxy_request("POST")
        self.send_response(404)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"Not found")

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()


with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    print(f"Serving golive-asia mirror at http://0.0.0.0:{PORT}")
    httpd.serve_forever()
