"""Smoke test for OTC maqueta. Visits every route, captures console errors + screenshots."""
from playwright.sync_api import sync_playwright
import sys, os, json

BASE = "http://localhost:3000"
OUT = r"C:\Users\mathi\maqueta-OTC\.claude\screenshots"
os.makedirs(OUT, exist_ok=True)

ROUTES = [
    ("dashboard", "/"),
    ("mis-tareas", "/mis-tareas"),
    ("tareas", "/tareas"),
    ("colaborativas", "/colaborativas"),
    ("nueva-tarea", "/nueva-tarea"),
    ("calendario", "/calendario"),
    ("notfound", "/esta-ruta-no-existe"),
]

VIEWPORTS = [
    ("desktop", 1440, 900),
    ("mobile", 390, 844),
]

report = {"errors": [], "warnings": [], "routes": {}}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for vname, w, h in VIEWPORTS:
        ctx = browser.new_context(viewport={"width": w, "height": h})
        page = ctx.new_page()
        console_msgs = []
        page.on("console", lambda m: console_msgs.append({"type": m.type, "text": m.text}))
        page.on("pageerror", lambda e: report["errors"].append({"viewport": vname, "error": str(e)}))

        for name, path in ROUTES:
            try:
                page.goto(BASE + path, wait_until="domcontentloaded", timeout=30000)
                page.wait_for_load_state("networkidle", timeout=15000)
            except Exception as e:
                report["errors"].append({"viewport": vname, "route": path, "nav_error": str(e)})
                continue
            page.wait_for_timeout(800)
            shot = os.path.join(OUT, f"{vname}-{name}.png")
            try:
                page.screenshot(path=shot, full_page=True)
            except Exception as e:
                report["errors"].append({"viewport": vname, "route": path, "screenshot_error": str(e)})
            # capture per-route console
            errs = [m for m in console_msgs if m["type"] == "error"]
            warns = [m for m in console_msgs if m["type"] == "warning"]
            report["routes"].setdefault(path, {})[vname] = {
                "console_errors": errs[-10:],
                "console_warnings": warns[-5:],
                "title": page.title(),
                "url": page.url,
            }
            console_msgs.clear()
        ctx.close()

    # --- Interaction tests on desktop ---
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    interactions = {}

    def record(name, ok, detail=""):
        interactions[name] = {"ok": ok, "detail": detail}

    # 1. Dashboard loads, toggle theme
    try:
        page.goto(BASE, wait_until="networkidle", timeout=20000)
        page.wait_for_timeout(600)
        # theme toggle — try aria-label
        toggle = page.locator('[aria-label*="tema" i], [aria-label*="theme" i], button:has-text("Tema")').first
        if toggle.count() > 0:
            toggle.click()
            page.wait_for_timeout(400)
            page.screenshot(path=os.path.join(OUT, "int-theme-dark.png"))
            record("theme-toggle", True, "clicked")
        else:
            record("theme-toggle", False, "selector not found")
    except Exception as e:
        record("theme-toggle", False, str(e))

    # 2. Notification bell
    try:
        page.goto(BASE, wait_until="networkidle", timeout=20000)
        page.wait_for_timeout(500)
        bell = page.locator('[aria-label*="notifica" i], button:has([class*="Bell"])').first
        if bell.count() > 0:
            bell.click()
            page.wait_for_timeout(500)
            page.screenshot(path=os.path.join(OUT, "int-notifications.png"))
            record("notification-bell", True)
        else:
            record("notification-bell", False, "not found")
    except Exception as e:
        record("notification-bell", False, str(e))

    # 3. Calendar
    try:
        page.goto(BASE + "/calendario", wait_until="networkidle", timeout=20000)
        page.wait_for_timeout(800)
        page.screenshot(path=os.path.join(OUT, "int-calendar.png"))
        # try clicking a day with tasks
        day = page.locator('[role="button"]:has-text("1"), button:has-text("15")').first
        if day.count() > 0:
            day.click()
            page.wait_for_timeout(500)
            page.screenshot(path=os.path.join(OUT, "int-calendar-day.png"))
            record("calendar-day-click", True)
        else:
            record("calendar-day-click", False, "no day button found")
    except Exception as e:
        record("calendar-day-click", False, str(e))

    # 4. Tasks list → open detail
    try:
        page.goto(BASE + "/tareas", wait_until="networkidle", timeout=20000)
        page.wait_for_timeout(600)
        # click first row
        row = page.locator('button, [role="row"], tr').nth(1)
        if row.count() > 0:
            row.click()
            page.wait_for_timeout(600)
            page.screenshot(path=os.path.join(OUT, "int-task-detail.png"))
            record("open-task-detail", True)
        else:
            record("open-task-detail", False, "no row")
    except Exception as e:
        record("open-task-detail", False, str(e))

    # 5. Nueva tarea form visible
    try:
        page.goto(BASE + "/nueva-tarea", wait_until="networkidle", timeout=20000)
        page.wait_for_timeout(700)
        inputs = page.locator("input, textarea, select").count()
        page.screenshot(path=os.path.join(OUT, "int-new-task.png"))
        record("new-task-form", inputs > 2, f"{inputs} fields")
    except Exception as e:
        record("new-task-form", False, str(e))

    # 6. Sidebar collapse via shortcut
    try:
        page.goto(BASE, wait_until="networkidle", timeout=20000)
        page.wait_for_timeout(500)
        page.keyboard.press("Control+b")
        page.wait_for_timeout(400)
        page.screenshot(path=os.path.join(OUT, "int-sidebar-collapsed.png"))
        record("sidebar-collapse", True)
    except Exception as e:
        record("sidebar-collapse", False, str(e))

    report["interactions"] = interactions
    ctx.close()
    browser.close()

with open(r"C:\Users\mathi\maqueta-OTC\.claude\e2e-report.json", "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2, ensure_ascii=False)

print(json.dumps({
    "page_errors": len(report["errors"]),
    "routes_with_console_errors": [
        r for r, v in report["routes"].items()
        if any(vv["console_errors"] for vv in v.values())
    ],
    "interactions": interactions,
}, indent=2, ensure_ascii=False))
