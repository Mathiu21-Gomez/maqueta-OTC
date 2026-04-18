import { expect, test } from '@playwright/test'

test('la ruta nueva tarea crea una tarea y vuelve a la lista principal', async ({ page }) => {
  const taskName = `Tarea QA ${Date.now()}`

  await page.goto('/nueva-tarea')

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth || document.body.scrollWidth > window.innerWidth,
  )

  expect(hasHorizontalOverflow).toBeFalsy()

  await expect(page.getByText('Creacion guiada')).toBeVisible()
  await expect(page.getByText('Informacion general')).toBeVisible()
  await expect(page.getByText('Fechas y areas')).toBeVisible()
  await expect(page.getByText('Listo para guardar')).toBeVisible()

  await page.locator('#nombre').fill(taskName)
  await page.locator('#descripcion').fill('Creada desde Playwright para validar el flujo modular.')
  await page.locator('#fechaInicio').fill('2026-01-20')
  await page.locator('#fechaFin').fill('2026-01-28')

  const areaChip = page.getByTestId('new-task-area-Seguridad')
  await areaChip.focus()
  await expect(areaChip).toBeFocused()
  await expect(areaChip).toHaveAttribute('aria-pressed', 'false')
  await page.keyboard.press('Space')
  await expect(areaChip).toHaveAttribute('aria-pressed', 'true')

  await page.getByRole('switch', { name: 'Requiere apoyo de otras areas' }).click()
  const supportChip = page.getByTestId('new-task-support-area-Legal')
  await supportChip.focus()
  await expect(supportChip).toBeFocused()
  await expect(supportChip).toHaveAttribute('aria-pressed', 'false')
  await page.keyboard.press('Enter')
  await expect(supportChip).toHaveAttribute('aria-pressed', 'true')

  await page.getByTestId('new-task-activity-0').fill('Actividad creada desde e2e')
  await page.getByRole('button', { name: 'Guardar tarea' }).click()

  await page.waitForURL('**/tareas')

  const searchInput = page.getByPlaceholder('Buscar por nombre o descripcion...')
  await searchInput.fill(taskName)

  await expect(page.getByText(taskName)).toBeVisible()
})
