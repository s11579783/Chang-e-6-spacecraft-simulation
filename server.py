from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import json
import socket
import sys

class ConfigHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加 CORS 头，允许跨域访问
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/config':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            config = {
                'DEEPSEEK_API_KEY': os.getenv('DEEPSEEK_API_KEY', ''),
                'DEFAULT_LANGUAGE': os.getenv('DEFAULT_LANGUAGE', 'en'),
                'DEBUG_MODE': os.getenv('DEBUG_MODE', 'false').lower() == 'true',
                'FALLBACK_TO_LOCAL': os.getenv('FALLBACK_TO_LOCAL', 'true').lower() == 'true'
            }
            
            self.wfile.write(json.dumps(config).encode())
            return
        elif self.path == '/favicon.ico':
            if os.path.exists('favicon.svg'):
                self.send_response(200)
                self.send_header('Content-type', 'image/svg+xml')
                self.end_headers()
                with open('favicon.svg', 'rb') as f:
                    self.wfile.write(f.read())
                return
            
        return super().do_GET()

def check_port_available(port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.bind(('', port))
        sock.close()
        return True
    except socket.error:
        return False

def find_available_port(start_port=8000, max_port=9000):
    for port in range(start_port, max_port):
        if check_port_available(port):
            return port
    raise RuntimeError("No available ports found")

if __name__ == '__main__':
    try:
        port = find_available_port()
        server_address = ('', port)
        httpd = HTTPServer(server_address, ConfigHandler)
        print(f"Server running on http://localhost:{port}")
        print("Press Ctrl+C to stop the server")
        print("\nTo configure the API:")
        print("1. Set DEEPSEEK_API_KEY environment variable")
        print("2. Optional: Set DEFAULT_LANGUAGE (en/zh)")
        print("3. Optional: Set DEBUG_MODE (true/false)")
        print("4. Optional: Set FALLBACK_TO_LOCAL (true/false)")
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()
        sys.exit(0)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1) 