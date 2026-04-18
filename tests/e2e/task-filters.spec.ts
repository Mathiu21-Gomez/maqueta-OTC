import { expect, test } from '@playwright/test'

test('la vista de tareas responde al filtro de busqueda principal', async ({ page }) => {
  await page.goto('/tareas')

  const searchInput = page.getByPlaceholder('Buscar por nombre o descripcion...')
  await searchInput.fill('Señalética')

  const targetRow = page.getByRole('row').filter({ hasText: 'Cambio Señalética TRM' })

  await expect(targetRow).toBeVisible()
  await expect(page.getByText('Actualización plan de emergencia El Avellano')).not.toBeVisible()

  await targetRow.getByRole('button', { name: 'Abrir detalle' }).click()

  await expect(page.getByText('Detalle operativo')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Cambio Señalética TRM' })).toBeVisible()
})
