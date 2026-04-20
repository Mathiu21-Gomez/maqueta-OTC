import { chromium } from '@playwright/test'
const browser = await chromium.launch({ headless: true })

// Desktop
let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
let page = await ctx.newPage()
await page.goto('http://localhost:3000/tareas', { waitUntil: 'networkidle', timeout: 20000 })
await page.waitForTimeout(800)
await page.getByRole('button', { name: /abrir detalle/i }).first().click()
await page.waitForTimeout(900)
await page.screenshot({ path: '.claude/screenshots/verify-task-detail-light.png' })
// Second task (likely atrasada)
await page.keyboard.press('Escape')
await page.waitForTimeout(400)
const btns = page.getByRole('button', { name: /abrir detalle/i })
const count = await btns.count()
for (let i = 0; i < Math.min(count, 8); i++) {
  await btns.nth(i).click()
  await page.waitForTimeout(500)
  const text = await page.locator('[data-slot="sheet-content"]').textContent()
  if (text && text.includes('atraso')) {
    await page.screenshot({ path: '.claude/screenshots/verify-task-detail-atrasada.png' })
    break
  }
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
}
await ctx.close()

// Mobile
ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
page = await ctx.newPage()
await page.goto('http://localhost:3000/tareas', { waitUntil: 'networkidle', timeout: 20000 })
await page.waitForTimeout(800)
await page.getByRole('button', { name: /abrir detalle/i }).first().click()
await page.waitForTimeout(900)
await page.screenshot({ path: '.claude/screenshots/verify-task-detail-mobile.png', fullPage: true })
await ctx.close()
await browser.close()
console.log('ok')
