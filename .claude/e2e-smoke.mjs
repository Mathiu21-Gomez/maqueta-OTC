import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const BASE = 'http://localhost:3000'
const OUT = path.resolve('.claude/screenshots')
mkdirSync(OUT, { recursive: true })

const ROUTES = [
  ['dashboard', '/'],
  ['mis-tareas', '/mis-tareas'],
  ['tareas', '/tareas'],
  ['colaborativas', '/colaborativas'],
  ['nueva-tarea', '/nueva-tarea'],
  ['calendario', '/calendario'],
  ['notfound', '/esta-ruta-no-existe'],
]
const VIEWPORTS = [['desktop', 1440, 900], ['mobile', 390, 844]]

const report = { errors: [], routes: {}, interactions: {} }

const browser = await chromium.launch({ headless: true })

for (const [vname, width, height] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width, height } })
  const page = await ctx.newPage()
  let msgs = []
  page.on('console', (m) => msgs.push({ type: m.type(), text: m.text() }))
  page.on('pageerror', (e) => report.errors.push({ viewport: vname, error: String(e) }))

  for (const [name, p] of ROUTES) {
    try {
      await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
    } catch (e) {
      report.errors.push({ viewport: vname, route: p, nav_error: String(e) })
      continue
    }
    await page.waitForTimeout(800)
    const shot = path.join(OUT, `${vname}-${name}.png`)
    try { await page.screenshot({ path: shot, fullPage: true }) } catch {}
    const errs = msgs.filter((m) => m.type === 'error')
    const warns = msgs.filter((m) => m.type === 'warning')
    report.routes[p] = report.routes[p] || {}
    report.routes[p][vname] = {
      console_errors: errs.slice(-10),
      console_warnings: warns.slice(-5),
      title: await page.title(),
      url: page.url(),
    }
    msgs = []
  }
  await ctx.close()
}

// Interactions on desktop
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
const rec = (n, ok, d = '') => (report.interactions[n] = { ok, detail: d })

try {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(600)
  const toggle = page.locator('[aria-label*="tema" i], [aria-label*="theme" i]').first()
  if (await toggle.count() > 0) {
    await toggle.click()
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(OUT, 'int-theme-dark.png') })
    rec('theme-toggle', true, 'clicked')
  } else rec('theme-toggle', false, 'selector not found')
} catch (e) { rec('theme-toggle', false, String(e)) }

try {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(500)
  const bell = page.locator('[aria-label*="notifica" i]').first()
  if (await bell.count() > 0) {
    await bell.click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(OUT, 'int-notifications.png') })
    rec('notification-bell', true)
  } else rec('notification-bell', false, 'not found')
} catch (e) { rec('notification-bell', false, String(e)) }

try {
  await page.goto(BASE + '/calendario', { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(800)
  await page.screenshot({ path: path.join(OUT, 'int-calendar.png') })
  const day = page.locator('button:has-text("15"), [role="button"]:has-text("10")').first()
  if (await day.count() > 0) {
    await day.click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(OUT, 'int-calendar-day.png') })
    rec('calendar-day-click', true)
  } else rec('calendar-day-click', false, 'no day button')
} catch (e) { rec('calendar-day-click', false, String(e)) }

try {
  await page.goto(BASE + '/tareas', { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(600)
  const row = page.locator('tbody tr, [role="row"]').nth(1)
  if (await row.count() > 0) {
    await row.click()
    await page.waitForTimeout(700)
    await page.screenshot({ path: path.join(OUT, 'int-task-detail.png') })
    rec('open-task-detail', true)
  } else rec('open-task-detail', false, 'no row')
} catch (e) { rec('open-task-detail', false, String(e)) }

try {
  await page.goto(BASE + '/nueva-tarea', { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(700)
  const fields = await page.locator('input, textarea, [role="combobox"]').count()
  await page.screenshot({ path: path.join(OUT, 'int-new-task.png') })
  rec('new-task-form', fields > 2, `${fields} fields`)
} catch (e) { rec('new-task-form', false, String(e)) }

try {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(500)
  await page.keyboard.press('Control+b')
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT, 'int-sidebar-collapsed.png') })
  rec('sidebar-collapse', true)
} catch (e) { rec('sidebar-collapse', false, String(e)) }

try {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(500)
  await page.keyboard.press('Control+k')
  await page.waitForTimeout(500)
  const palette = page.locator('[role="dialog"], [cmdk-root]').first()
  rec('command-palette', await palette.count() > 0)
  if (await palette.count() > 0) {
    await page.screenshot({ path: path.join(OUT, 'int-command-palette.png') })
  }
} catch (e) { rec('command-palette', false, String(e)) }

await ctx.close()
await browser.close()

writeFileSync('.claude/e2e-report.json', JSON.stringify(report, null, 2))

const routesWithErrors = Object.entries(report.routes)
  .filter(([, v]) => Object.values(v).some((vv) => vv.console_errors.length))
  .map(([k]) => k)

console.log(JSON.stringify({
  page_errors: report.errors.length,
  page_error_samples: report.errors.slice(0, 5),
  routes_with_console_errors: routesWithErrors,
  interactions: report.interactions,
}, null, 2))
