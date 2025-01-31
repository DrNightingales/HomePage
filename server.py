import http.server
import socketserver
import json
from urllib.parse import urlparse, urljoin
import requests
from bs4 import BeautifulSoup

PORT = 8080
def get_favicon(url):
    try:
        # Try default favicon.ico location
        parsed = urlparse(url)
        default_icon = f"{parsed.scheme}://{parsed.netloc}/favicon.ico"
        response = requests.head(default_icon, timeout=3)
        if response.status_code == 200:
            return default_icon
            
        # Parse page for icon link
        page = requests.get(url, timeout=3, headers={'User-Agent': 'Mozilla/5.0'})
        soup = BeautifulSoup(page.content, 'html.parser')
        icon_link = soup.find("link", rel=lambda x: x and x.lower() in ["icon", "shortcut icon"])
        
        if icon_link and icon_link.get('href'):
            return urljoin(url, icon_link['href'])
            
        # Fallback to Google favicon service
        return f"https://www.google.com/s2/favicons?domain={parsed.netloc}"
        
    except Exception as e:
        print(f"Error fetching favicon for {url}: {str(e)}")
        return ""
class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        http.server.SimpleHTTPRequestHandler.end_headers(self)
        
    def do_GET(self):
        if self.path == '/config':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            with open('config.json') as f:
                self.wfile.write(f.read().encode())
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/save':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            config_data = json.loads(post_data)
            
            # Add favicons where missing
            for column in config_data['columns']:
                for section in column['sections']:
                    for link in section['links']:
                        if not link.get('favicon'):
                            link['favicon'] = get_favicon(link['url'])
            
            with open('config.json', 'w') as f:
                json.dump(config_data, f, indent=2)
            
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'Config saved successfully')
        else:
            super().do_POST()

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()