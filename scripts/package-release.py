"""Package a clean, tested Git revision; never include private helper credentials."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import zipfile

ROOT = Path(__file__).resolve().parent.parent
EXTENSION = ROOT / "extension"
manifest = json.loads((EXTENSION / "manifest.json").read_text(encoding="utf-8-sig"))
version = manifest["version"]
report = json.loads((ROOT / "instagram-magaza-hazirlik/TUM-TEST-SONUCLARI.json").read_text(encoding="utf-8"))
if report["version"] != version or not report["results"] or not all(item["passed"] for item in report["results"]):
    raise SystemExit("Run npm run build and npm test successfully before packaging.")
current_files = json.loads(subprocess.check_output(["node", str(ROOT / "scripts/test-fingerprint.cjs")], cwd=ROOT, text=True))
if not report.get("unchanged") or report.get("testedFiles") != current_files:
    raise SystemExit("Files have changed since the successful test run. Rebuild and rerun npm test before packaging.")
if subprocess.check_output(["git", "status", "--porcelain"], cwd=ROOT, text=True).strip():
    raise SystemExit("Commit reviewed changes before packaging the exact source revision.")
if set(manifest["permissions"]) != {"activeTab", "scripting", "storage"} or manifest.get("host_permissions"):
    raise SystemExit("Release must contain the browser-only build.")

allowed = {"manifest.json", "content.js", "platform.js", "service-worker.js", "CREDITS.md", "privacy.html"}
for stem in ("help", "logs"):
    allowed.update(stem + suffix for suffix in (".html", ".css", ".js"))
allowed.update(manifest["icons"].values())
actual = {p.relative_to(EXTENSION).as_posix() for p in EXTENSION.rglob("*") if p.is_file()}
if actual != allowed:
    raise SystemExit("Unexpected or missing extension files: " + str(actual ^ allowed))
for name in ("content.js", "platform.js", "service-worker.js", "logs.js"):
    content = (EXTENSION / name).read_text(encoding="utf-8-sig")
    if "127.0.0.1" in content or "IU_LOG_BRIDGE" in content:
        raise SystemExit("Private helper remains in browser-only build.")

out = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT.parent / ("takip-paneli-release-" + version)
out.mkdir(parents=True, exist_ok=True)
install = out / ("takip-paneli-chrome-" + version + ".zip")
source = out / ("takip-paneli-source-" + version + ".zip")
with zipfile.ZipFile(install, "w", zipfile.ZIP_DEFLATED) as archive:
    for name in sorted(allowed):
        archive.write(EXTENSION / name, name)
with zipfile.ZipFile(install) as archive:
    assert archive.testzip() is None
    assert "manifest.json" in archive.namelist()
subprocess.run(["git", "archive", "--format=zip", "--prefix=takip-paneli-" + version + "/", "-o", str(source), "HEAD"], cwd=ROOT, check=True)
with zipfile.ZipFile(source) as archive:
    assert archive.testzip() is None
    assert not any("log-bridge-settings.json" in name or "log-bridge-config.js" in name or "/node_modules/" in name or "/.env" in name for name in archive.namelist())
(out / "SHA256SUMS.txt").write_text("".join(hashlib.sha256(p.read_bytes()).hexdigest() + "  " + p.name + "\n" for p in (install, source)), encoding="utf-8")
print(json.dumps({"version": version, "directory": str(out), "files": [install.name, source.name, "SHA256SUMS.txt"]}, ensure_ascii=True, indent=2))
