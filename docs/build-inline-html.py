#!/usr/bin/env python3
"""Rebuild cern-systems-1989.html with inlined d3 + geo + map (one script tag)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TEMPLATE = ROOT / "cern-systems-1989.template.html"
HTML = ROOT / "cern-systems-1989.html"

def main() -> None:
    if TEMPLATE.exists():
        shell = TEMPLATE.read_text(encoding="utf-8")
    else:
        shell = HTML.read_text(encoding="utf-8")
        start = shell.find("  <script")
        end = shell.rfind("</body>")
        shell = shell[:start] + "<!-- INLINE_SCRIPTS -->\n" + shell[end:]
        TEMPLATE.write_text(shell.replace("<!-- INLINE_SCRIPTS -->", "{{SCRIPTS}}"), encoding="utf-8")

    d3 = (ROOT / "vendor/d3.min.js").read_text(encoding="utf-8")
    bundle = (ROOT / "geo/bundle.js").read_text(encoding="utf-8").strip()
    mapjs = (ROOT / "map.js").read_text(encoding="utf-8")
    scripts = f"""  <script>
/* d3 v7.9.0 */
{d3}
{bundle}
{mapjs}
  </script>
"""
    out = TEMPLATE.read_text(encoding="utf-8").replace("{{SCRIPTS}}", scripts)
    HTML.write_text(out, encoding="utf-8")
    print(f"Wrote {HTML} ({HTML.stat().st_size} bytes)")

if __name__ == "__main__":
    main()
