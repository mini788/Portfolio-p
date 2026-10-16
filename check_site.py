"""Check local links and fragment targets in the published site."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent
DIST = ROOT / 'docs'

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.links, self.errors, self.headings = set(), [], [], []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                self.errors.append('Duplicate ID: ' + attrs['id'])
            self.ids.add(attrs['id'])
        if tag == 'a' and 'href' in attrs:
            self.links.append(attrs['href'])
        if tag in ('script', 'img', 'link'):
            target = attrs.get('src') or attrs.get('href')
            if target: self.links.append(target)
        if tag == 'img' and 'alt' not in attrs:
            self.errors.append('Image has no alt attribute')
        if tag == 'button' and attrs.get('type') != 'button':
            self.errors.append('Button has no explicit type')

pages = {}
for path in DIST.glob('*.html'):
    page = Page()
    page.feed(path.read_text())
    pages[path] = page

errors = []
if not pages:
    errors.append('No HTML pages found in docs/')
if list(DIST.rglob('*.md')):
    errors.append('Markdown source files must not be published in docs/')
for path, page in pages.items():
    errors.extend(f'{path.name}: {message}' for message in page.errors)
    for link in page.links:
        url = urlparse(link)
        if url.scheme or url.netloc: continue
        target = (path.parent / unquote(url.path)).resolve() if url.path else path
        if not target.exists():
            errors.append(f'{path.name}: missing {link}')
        elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
            errors.append(f'{path.name}: missing fragment {link}')

if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} pages; all local links, fragment targets, and image alternatives checked.')
