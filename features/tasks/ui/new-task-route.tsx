'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Plus, Trash2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { createTask } from '@/features/tasks/application/task.commands'
import { AREAS, PRIORIDADES } from '@/features/tasks/domain/task.constants'
import {
  calculateExecutionDays,
  createActivityDraft,
  createDocumentDraft,
  createRouteTaskDraft,
  getFirstInvalidField,
  sanitizeActivities,
  validateTaskDraft,
} from '@/features/tasks/ui/new-task-form.shared'
import { TaskPageHeader } from '@/features/tasks/ui/task-page-header'
import { useSessionStore } from '@/features/session/application/session.store'
import { useToast } from '@/hooks/use-toast'

export function NewTaskRoute() {
  const router = useRouter()
  const rol = useSessionStore((state) => state.rol)
  const areaUsuario = useSessionStore((state) => state.areaUsuario)
  const { toast } = useToast()
  const [draft, setDraft] = useState(createRouteTaskDraft)
  const [errors, setErrors] = useState<ReturnType<typeof validateTaskDraft>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const executionDays = useMemo(() => calculateExecutionDays(draft.fechaInicio, draft.fechaFin), [draft.fechaFin, draft.fechaInicio])

  useEffect(() => {
    if (!isSaved) return
    const timer = window.setTimeout(() => router.push('/tareas'), 1200)
    return () => window.clearTimeout(timer)
  }, [isSaved, router])

  const focusFirstError = (validationErrors: ReturnType<typeof validateTaskDraft>) => {
    const firstField = getFirstInvalidField(validationErrors)
    if (!firstField) return

    const element = document.getElementById(firstField)
    if (element instanceof HTMLElement) {
      element.focus()
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationErrors = validateTaskDraft({
      actividades: draft.actividades,
      fechaFin: draft.fechaFin,
      fechaInicio: draft.fechaInicio,
      nombre: draft.nombre,
      primarySelectionCount: draft.areas.length,
    })

    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      toast({ title: 'Error de validacion', description: 'Revisa los campos obligatorios y corrige el primer error marcado.', variant: 'destructive' })
      focusFirstError(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await createTask(
        {
          actividades: sanitizeActivities(draft.actividades),
          areas: draft.areas,
          areasApoyo: draft.requiereApoyo ? draft.areasApoyo : [],
          descripcion: draft.descripcion,
          diasEjecutar: executionDays,
          documentos: draft.documentos,
          fechaFin: draft.fechaFin,
          fechaInicio: draft.fechaInicio,
          nombre: draft.nombre,
          prioridad: draft.prioridad,
          requiereApoyo: draft.requiereApoyo,
        },
        { areaUsuario, rol },
      )
      setIsSaved(true)
      toast({ title: 'Tarea creada', description: 'La tarea ya esta disponible en la vista principal.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (rol !== 'Administrador') {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Card className="otc-panel w-full max-w-xl border-border/70 [--otc-panel-accent:linear-gradient(135deg,var(--chart-4),#d35f55)]">
          <CardContent className="flex flex-col gap-3 pt-6 text-center">
            <h2 className="text-xl font-semibold text-foreground">Acceso restringido</h2>
            <p className="text-sm text-muted-foreground">Solo administradores pueden crear tareas nuevas desde esta ruta.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <TaskPageHeader
        eyebrow="Creacion guiada"
        title="Nueva tarea"
        description="Flujo completo para cargar una tarea con alcance, apoyo y actividades base. La jerarquia acompana una lectura ejecutiva sin perder claridad operativa."
        meta={[
          { label: 'Estado', value: isSaved ? 'Guardada' : 'En edicion' },
          { label: 'Duracion', value: executionDays > 0 ? `${executionDays} dias` : 'Pendiente' },
          { label: 'Actividades', value: draft.actividades.length.toString() },
        ]}
        narrative="Carga primero alcance y fechas. Despues define prioridad y apoyo, y recien al final baja a actividades y evidencia."
      />

      <form className="otc-form-shell mx-auto flex w-full max-w-5xl flex-col gap-6" onSubmit={handleSubmit} noValidate>
        {Object.keys(errors).length > 0 ? (
          <div className="otc-soft-panel rounded-[calc(var(--radius)+0.125rem)] px-4 py-3" role="alert" aria-live="polite">
            <p className="text-sm font-semibold text-foreground">Hay campos pendientes antes de guardar.</p>
            <p className="mt-1 text-sm text-muted-foreground">Se marco el primer error para que puedas corregirlo sin buscarlo manualmente.</p>
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
          <div className="flex flex-col gap-6">
            <FormSection title="Informacion general" description="Define el compromiso con nombre claro y una descripcion que le de contexto al equipo.">
              <FieldBlock fieldId="nombre" htmlFor="nombre" label="Nombre de la tarea *" error={errors.nombre} helper="Usa un nombre concreto y accionable para que la tabla se entienda de un vistazo.">
                  <Input
                  id="nombre"
                  name="nombre"
                  autoComplete="off"
                  aria-describedby="nombre-help nombre-error"
                  aria-invalid={Boolean(errors.nombre)}
                  placeholder="Ej.: Regularizar expediente prioritario…"
                  value={draft.nombre}
                  onChange={(event) => setDraft((current) => ({ ...current, nombre: event.target.value }))}
                />
              </FieldBlock>

              <FieldBlock fieldId="descripcion" htmlFor="descripcion" label="Descripcion" helper="Resume objetivo, evidencia esperada y cualquier restriccion relevante para quien ejecute la tarea.">
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  autoComplete="off"
                  placeholder="Describe alcance, contexto y criterio de cierre…"
                  rows={5}
                  value={draft.descripcion}
                  onChange={(event) => setDraft((current) => ({ ...current, descripcion: event.target.value }))}
                />
              </FieldBlock>
            </FormSection>

            <FormSection title="Fechas y areas" description="Fija la ventana de trabajo y deja claro quien lidera la ejecucion desde el inicio.">
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldBlock fieldId="fechaInicio" htmlFor="fechaInicio" label="Fecha de inicio *" error={errors.fechaInicio} helper="Marca cuando el equipo puede empezar efectivamente.">
                  <Input
                    id="fechaInicio"
                    name="fechaInicio"
                    type="date"
                    autoComplete="off"
                    aria-describedby="fechaInicio-help fechaInicio-error"
                    aria-invalid={Boolean(errors.fechaInicio)}
                    value={draft.fechaInicio}
                    onChange={(event) => setDraft((current) => ({ ...current, fechaInicio: event.target.value }))}
                  />
                </FieldBlock>

                <FieldBlock fieldId="fechaFin" htmlFor="fechaFin" label="Fecha de fin *" error={errors.fechaFin} helper="Debe ser posterior a la fecha de inicio.">
                  <Input
                    id="fechaFin"
                    name="fechaFin"
                    type="date"
                    autoComplete="off"
                    aria-describedby="fechaFin-help fechaFin-error"
                    aria-invalid={Boolean(errors.fechaFin)}
                    value={draft.fechaFin}
                    onChange={(event) => setDraft((current) => ({ ...current, fechaFin: event.target.value }))}
                  />
                </FieldBlock>
              </div>

              {executionDays > 0 ? (
                <div className="otc-sheet-rail rounded-[calc(var(--radius)+0.125rem)] px-4 py-3 text-sm text-muted-foreground">
                  Duracion estimada: <span className="otc-data-text font-semibold text-foreground">{executionDays} dias</span>
                </div>
              ) : null}

              <FieldBlock fieldId="areas" label="Areas principales *" error={errors.areas} helper="Selecciona quienes tienen ownership directo. Si hay varias, la tarea nace compartida desde el tablero.">
                <div id="areas" className="flex flex-wrap gap-2" tabIndex={-1}>
                  {AREAS.map((area) => {
                    const selected = draft.areas.includes(area)
                    return (
                      <Button
                        key={area}
                        type="button"
                        data-testid={`new-task-area-${area}`}
                        aria-pressed={selected}
                        variant={selected ? 'primary' : 'outline'}
                        size="sm"
                        radius="full"
                        className="otc-chip-button px-3 py-1.5"
                        onClick={() => setDraft((current) => ({ ...current, areas: current.areas.includes(area) ? current.areas.filter((item) => item !== area) : [...current.areas, area] }))}
                      >
                        {area}
                      </Button>
                    )
                  })}
                </div>
              </FieldBlock>
            </FormSection>

            <FormSection title="Prioridad y apoyo" description="Define tono operativo y si la tarea necesita colaboracion adicional antes de detallar la ejecucion.">
              <FieldBlock fieldId="prioridad" label="Prioridad" helper="Usa prioridad alta solo si impacta continuidad operativa o vencimiento inmediato.">
                <div className="flex flex-wrap gap-2">
                  {PRIORIDADES.map((prioridad) => (
                    <Button
                      key={prioridad}
                      type="button"
                      variant={draft.prioridad === prioridad ? 'primary' : 'outline'}
                      onClick={() => setDraft((current) => ({ ...current, prioridad }))}
                    >
                      {prioridad}
                    </Button>
                  ))}
                </div>
              </FieldBlock>

              <div className="otc-sheet-rail flex items-center justify-between gap-4 rounded-[calc(var(--radius)+0.125rem)] px-4 py-4">
                <div className="space-y-1">
                  <Label htmlFor="requiereApoyo">Requiere apoyo de otras areas</Label>
                  <p className="otc-form-helper">Activalo solo si la tarea necesita colaboracion real y no mera visibilidad.</p>
                </div>
                <Switch
                  id="requiereApoyo"
                  checked={draft.requiereApoyo}
                  onCheckedChange={(checked) => setDraft((current) => ({ ...current, requiereApoyo: checked }))}
                />
              </div>

              {draft.requiereApoyo ? (
                <FieldBlock fieldId="areasApoyo" label="Areas de apoyo" helper="Estas areas apareceran como colaboradoras dentro de la tabla y el detalle.">
                  <div className="flex flex-wrap gap-2">
                    {AREAS.filter((area) => !draft.areas.includes(area)).map((area) => {
                      const selected = draft.areasApoyo.includes(area)
                      return (
                        <Button
                          key={area}
                          type="button"
                          data-testid={`new-task-support-area-${area}`}
                          aria-pressed={selected}
                          variant={selected ? 'primary' : 'outline'}
                          size="sm"
                          radius="full"
                          className="otc-chip-button px-3 py-1.5"
                          onClick={() => setDraft((current) => ({ ...current, areasApoyo: current.areasApoyo.includes(area) ? current.areasApoyo.filter((item) => item !== area) : [...current.areasApoyo, area] }))}
                        >
                          {area}
                        </Button>
                      )
                    })}
                  </div>
                </FieldBlock>
              ) : null}
            </FormSection>
          </div>

          <div className="flex flex-col gap-6">
            <FormSection title="Documentos" description="Adjuntá respaldos relevantes para la iniciativa.">
              <Button type="button" variant="outline" onClick={() => {
                const document = createDocumentDraft()
                setDraft((current) => ({ ...current, documentos: [...current.documentos, document] }))
                toast({ title: 'Documento agregado', description: `${document.nombre} fue adjuntado.` })
              }}>
                <Upload data-icon="inline-start" />
                Adjuntar documento
              </Button>

              <div className="flex flex-col gap-2">
                {draft.documentos.length > 0 ? (
                  draft.documentos.map((document, index) => (
                    <div key={`${document.nombre}-${index}`} className="otc-soft-panel flex items-center justify-between gap-3 rounded-[calc(var(--radius)+0.125rem)] px-4 py-3">
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-medium text-foreground">{document.nombre}</p>
                        <p className="text-xs text-muted-foreground">Documento de respaldo.</p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" aria-label={`Eliminar ${document.nombre}`} onClick={() => setDraft((current) => ({ ...current, documentos: current.documentos.filter((_, currentIndex) => currentIndex !== index) }))}>
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="otc-soft-panel rounded-[calc(var(--radius)+0.125rem)] px-4 py-3 text-sm text-muted-foreground">Sin documentos adjuntos.</div>
                )}
              </div>
            </FormSection>

            <FormSection title="Actividades *" description="Desglosa la ejecucion en pasos concretos. El progreso se calcula en base a esta lista.">
              <div id="actividades" className="space-y-3" tabIndex={-1}>
                {draft.actividades.map((activity, index) => (
                  <div key={activity.id} className="otc-sheet-rail flex items-center gap-2 rounded-[calc(var(--radius)+0.125rem)] px-3 py-3">
                    <span className="otc-data-text text-sm text-muted-foreground">{index + 1}</span>
                    <Input
                      data-testid={`new-task-activity-${index}`}
                      name={`actividad-${index}`}
                      autoComplete="off"
                      placeholder="Describe el paso operativo…"
                      value={activity.nombre}
                      onChange={(event) => setDraft((current) => ({ ...current, actividades: current.actividades.map((item, currentIndex) => currentIndex === index ? { ...item, nombre: event.target.value } : item) }))}
                    />
                    <Button type="button" variant="ghost" size="icon" disabled={draft.actividades.length === 1} aria-label={`Eliminar actividad ${index + 1}`} onClick={() => setDraft((current) => ({ ...current, actividades: current.actividades.filter((_, currentIndex) => currentIndex !== index) }))}>
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                ))}
              </div>

              {errors.actividades ? <p id="actividades-error" className="otc-form-error">{errors.actividades}</p> : null}

              <Button type="button" variant="outline" onClick={() => setDraft((current) => ({ ...current, actividades: [...current.actividades, createActivityDraft()] }))}>
                <Plus data-icon="inline-start" />
                Agregar actividad
              </Button>
            </FormSection>
          </div>
        </div>

        <div className="otc-sticky-action-bar flex flex-col gap-3 rounded-[calc(var(--radius)+0.375rem)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Listo para guardar</p>
            <p className="text-sm text-muted-foreground">El CTA queda fijo para no perder contexto al revisar errores o documentos.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => router.push('/tareas')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isSaved}>
              {isSubmitting ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  Guardando…
                </>
              ) : isSaved ? (
                <>
                  <Check data-icon="inline-start" />
                  Guardado
                </>
              ) : (
                'Guardar tarea'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

function FormSection({ children, description, title }: { children: React.ReactNode; description: string; title: string }) {
  return (
    <Card className="otc-panel otc-form-section border-border/70">
      <CardHeader className="space-y-2">
        <span className="otc-section-kicker">Seccion</span>
        <div className="space-y-2">
          <CardTitle>{title}</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  )
}

function FieldBlock({ children, error, fieldId, helper, htmlFor, label }: { children: React.ReactNode; error?: string; fieldId: string; helper: string; htmlFor?: string; label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      <p id={`${fieldId}-help`} className="otc-form-helper">{helper}</p>
      {error ? <p id={`${fieldId}-error`} className="otc-form-error">{error}</p> : null}
    </div>
  )
}
