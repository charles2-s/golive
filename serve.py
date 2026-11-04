#!/usr/bin/env python3
"""Simple SPA static server for the golive-asia mirror with /api proxy."""
import http.server
import socketserver
import os
import shutil
import urllib.request
import urllib.error
import gzip
import io
import time

WEB_DIR = "/home/charles-003/golive_asia_backup/golive4"
PORT = 8081
API_BASE = "https://www.golive-asia.com"

ASSET_PREFIXES = ("/assets/", "/scripts/", "/styles/", "/images/", "/favicon.ico")

COMPRESSIBLE_TYPES = ("text/html", "text/css", "application/javascript", "text/javascript", "application/json")

LONG_CACHE_EXTENSIONS = (".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".woff", ".woff2")

# API response cache: {url: (timestamp, data, content_type)}
API_CACHE = {}
API_CACHE_TTL = 300  # 5 minutes


def gzip_data(data: bytes) -> bytes:
    buf = io.BytesIO()
    with gzip.GzipFile(fileobj=buf, mode="wb", compresslevel=6) as f:
        f.write(data)
    return buf.getvalue()


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def _proxy_request(self, method):
        """Proxy an API request to the live site."""
        url = API_BASE + self.path

        # Serve GET API responses from cache if fresh
        if method == "GET" and url in API_CACHE:
            ts, data, content_type = API_CACHE[url]
            if time.time() - ts < API_CACHE_TTL:
                self.send_response(200)
                self.send_header("Content-Type", content_type)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("X-Cache", "HIT")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                return

        try:
            # HEAD requests have no body
            body = None
            if method != "HEAD":
                content_length = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_length) if content_length > 0 else None

            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json",
                "Origin": "http://127.0.0.1:8081",
            }
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
                content_type = resp.headers.get("Content-Type", "application/json")

                # Cache GET responses
                if method == "GET":
                    API_CACHE[url] = (time.time(), data, content_type)

                self.send_response(resp.status)
                self.send_header("Content-Type", content_type)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("X-Cache", "MISS")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                if method != "HEAD":
                    self.wfile.write(data)
        except urllib.error.HTTPError as e:
            data = e.read() if e.fp else b""
            self.send_response(e.code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            if method != "HEAD":
                self.wfile.write(data)
        except Exception as e:
            self.send_response(502)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            if method != "HEAD":
                self.wfile.write(str(e).encode())

    def do_HEAD(self):
        """HEAD requests delegate to GET for API proxying."""
        if self.path.startswith("/api/"):
            return self._proxy_request("HEAD")
        # For static files, let the parent handle it
        path = self.translate_path(self.path)
        if not os.path.exists(path) or os.path.isdir(path):
            self.path = "/index.html"
        return super().do_HEAD()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, Origin, Accept")
        self.send_header("Access-Control-Allow-Credentials", "true")
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/api/"):
            return self._proxy_request("GET")

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

    def send_head(self):
        """Override to add caching headers and gzip compression."""
        path = self.translate_path(self.path)
        if not os.path.exists(path):
            self.send_error(404, "File not found")
            return None
        if os.path.isdir(path):
            self.send_error(404, "Directory not found")
            return None

        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(404, "File not found")
            return None

        try:
            self.send_response(200)
            self.send_header("Content-Type", self.guess_type(path))

            # Long cache for immutable assets
            ext = os.path.splitext(path)[1].lower()
            if ext in LONG_CACHE_EXTENSIONS:
                self.send_header("Cache-Control", "public, max-age=31536000, immutable")
            else:
                self.send_header("Cache-Control", "public, max-age=3600")

            # Gzip compressible text files
            accept_encoding = self.headers.get("Accept-Encoding", "")
            content_type = self.guess_type(path)
            if "gzip" in accept_encoding and any(ct in content_type for ct in COMPRESSIBLE_TYPES):
                f.seek(0)
                data = f.read()
                compressed = gzip_data(data)
                self.send_header("Content-Encoding", "gzip")
                self.send_header("Content-Length", str(len(compressed)))
                self.end_headers()
                self.wfile.write(compressed)
                return None
            else:
                self.send_header("Content-Length", str(os.path.getsize(path)))
                self.end_headers()
                return f
        except Exception:
            f.close()
            raise

    def copyfile(self, source, outputfile):
        shutil.copyfileobj(source, outputfile)



with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    print(f"Serving golive-asia mirror at http://0.0.0.0:{PORT}")
    httpd.serve_forever()
