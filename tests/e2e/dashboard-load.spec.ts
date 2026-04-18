import { expect, test } from '@playwright/test'

test('dashboard carga dentro del shell modular', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  const mainContent = page.locator('#main-content')

  await expect(page.getByRole('heading', { name: 'Dashboard operacional' })).toBeVisible()
  await expect(mainContent.getByRole('heading', { name: 'Dashboard de cartera OTC' })).toBeVisible()
  await expect(mainContent.getByText('Resumen ejecutivo')).toBeVisible()
  await expect(mainContent.getByText('Siguiente foco')).toBeVisible()
  await expect(page.getByRole('link', { name: /Tareas/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Nueva tarea' }).first()).toBeVisible()
})

test('dashboard premium conserva jerarquia y ancho estable en mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const mainContent = page.locator('#main-content')

  await expect(page.getByRole('heading', { name: 'Dashboard de cartera OTC' })).toBeVisible()
  await expect(mainContent.getByText('Resumen ejecutivo')).toBeVisible()

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth || document.body.scrollWidth > window.innerWidth,
  )

  expect(hasHorizontalOverflow).toBeFalsy()
})
