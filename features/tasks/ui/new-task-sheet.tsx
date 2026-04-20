'use client'

import { useCallback, useMemo, useState } from 'react'
import { Check, Loader2, Plus, Trash2, Upload } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { createTask } from '@/features/tasks/application/task.commands'
import { AREAS, PRIORIDADES } from '@/features/tasks/domain/task.constants'
import type { Area } from '@/features/tasks/domain/task.types'
import {
  calculateExecutionDays,
  createActivityDraft,
  createDocumentDraft,
  createSheetTaskDraft,
  getFirstInvalidField,
  sanitizeActivities,
  validateTaskDraft,
} from '@/features/tasks/ui/new-task-form.shared'
import { useSessionStore } from '@/features/session/application/session.store'
import { useToast } from '@/hooks/use-toast'

interface NewTaskSheetProps {
  onOpenChange: (open: boolean) => void
  open: boolean
}

export function NewTaskSheet({ onOpenChange, open }: NewTaskSheetProps) {
  const rol = useSessionStore((state) => state.rol)
  const areaUsuario = useSessionStore((state) => state.areaUsuario)
  const { toast } = useToast()
  const reducedMotion = useReducedMotion()
  const [draft, setDraft] = useState(createSheetTaskDraft)
  const [errors, setErrors] = useState<ReturnType<typeof validateTaskDraft>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const executionDays = useMemo(() => calculateExecutionDays(draft.fechaInicio, draft.fechaFin), [draft.fechaFin, draft.fechaInicio])

  const getMotionProps = (delay = 0) => {
    if (reducedMotion) return {}

    return {
      animate: { opacity: 1, x: 0, y: 0 },
      initial: { opacity: 0, x: 16, y: 10 },
      transition: { delay, duration: 0.24 },
    }
  }

  const resetForm = useCallback(() => {
    setDraft(createSheetTaskDraft())
    setErrors({})
    setIsSubmitting(false)
    setIsSaved(false)
  }, [])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        resetForm()
      }

      onOpenChange(nextOpen)
    },
    [onOpenChange, resetForm],
  )

  const focusFirstError = (validationErrors: ReturnType<typeof validateTaskDraft>) => {
    const firstField = getFirstInvalidField(validationErrors)
    if (!firstField) return

    const targetId =
      firstField === 'areas'
        ? 'sheet-area'
        : firstField === 'actividades'
          ? 'sheet-activities'
          : firstField === 'fechaInicio'
            ? 'sheet-inicio'
            : firstField === 'fechaFin'
              ? 'sheet-fin'
              : 'sheet-nombre'
    const element = document.getElementById(targetId)
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
      primarySelectionCount: draft.area ? 1 : 0,
    })

    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      toast({ title: 'Error de validacion', description: 'Corrige los campos marcados antes de guardar.', variant: 'destructive' })
      focusFirstError(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await createTask(
        {
          actividades: sanitizeActivities(draft.actividades),
          areas: draft.area ? [draft.area] : [],
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
      toast({ title: 'Tarea creada', description: 'La tarea fue agregada al sistema.' })
      window.setTimeout(() => handleOpenChange(false), 1200)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="otc-sheet-shell overflow-y-auto p-0 sm:max-w-2xl" data-motion="enter">
        <div className="flex min-h-full flex-col">
          <SheetHeader className="border-b border-border/70 px-5 pb-5 pt-6 sm:px-6">
            <motion.div className="space-y-3" {...getMotionProps()}>
              <span className="otc-section-kicker">Creacion rapida</span>
              <SheetTitle className="otc-page-title text-3xl font-semibold text-foreground">Nueva tarea</SheetTitle>
              <SheetDescription className="max-w-2xl text-sm leading-7 text-muted-foreground">
                La sheet prioriza los mismos datos que la ruta completa, pero en una secuencia compacta y estable para decisiones rapidas.
              </SheetDescription>
            </motion.div>
          </SheetHeader>

          {rol !== 'Administrador' ? (
            <div className="flex min-h-[240px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
              Solo administradores pueden crear tareas nuevas.
            </div>
          ) : (
            <form className="flex flex-1 flex-col gap-6 px-5 py-6 sm:px-6" onSubmit={handleSubmit} noValidate>
              {Object.keys(errors).length > 0 ? (
                <div className="otc-soft-panel rounded-[calc(var(--radius)+0.125rem)] px-4 py-3" role="alert" aria-live="polite">
                  <p className="text-sm font-semibold text-foreground">Hay campos pendientes antes de guardar.</p>
                  <p className="mt-1 text-sm text-muted-foreground">La sheet deja fijo el CTA y te lleva al primer error para corregir rapido.</p>
                </div>
              ) : null}

              <motion.section className="space-y-5" {...getMotionProps(0.03)}>
                <SheetSection title="Alcance" description="Nombre, descripcion y ownership principal para que la tarea nazca clara.">
                  <FieldRow fieldId="sheet-nombre" htmlFor="sheet-nombre" label="Nombre *" helper="Se va a leer en tabla, cards y detalle. Hace que sea directo.">
                      <Input
                        id="sheet-nombre"
                      name="nombre"
                      autoComplete="off"
                      aria-describedby="sheet-nombre-help sheet-nombre-error"
                      aria-invalid={Boolean(errors.nombre)}
                      placeholder="Ej.: Regularizar expediente prioritario…"
                      value={draft.nombre}
                      onChange={(event) => setDraft((current) => ({ ...current, nombre: event.target.value }))}
                    />
                  </FieldRow>

                  <FieldRow fieldId="sheet-descripcion" htmlFor="sheet-descripcion" label="Descripcion" helper="Agrega contexto solo si mejora la ejecucion o la revision posterior.">
                    <Textarea
                      id="sheet-descripcion"
                      name="descripcion"
                      autoComplete="off"
                      placeholder="Describe objetivo, evidencia y contexto…"
                      rows={4}
                      value={draft.descripcion}
                      onChange={(event) => setDraft((current) => ({ ...current, descripcion: event.target.value }))}
                    />
                  </FieldRow>

                  <FieldRow fieldId="sheet-area" htmlFor="sheet-area" label="Area principal *" error={errors.areas} helper="Elige quien lidera el seguimiento dentro del tablero principal.">
                    <Select value={draft.area ?? ''} onValueChange={(value) => setDraft((current) => ({ ...current, area: value as Area }))}>
                      <SelectTrigger id="sheet-area" className="w-full">
                        <SelectValue placeholder="Selecciona un area" />
                      </SelectTrigger>
                      <SelectContent>
                        {AREAS.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldRow>
                </SheetSection>
              </motion.section>

              <motion.section className="space-y-5" {...getMotionProps(0.06)}>
                <SheetSection title="Planificacion" description="Fechas, prioridad y colaboracion para fijar ritmo operativo.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldRow fieldId="sheet-inicio" htmlFor="sheet-inicio" label="Fecha de inicio *" error={errors.fechaInicio} helper="Cuando el equipo puede arrancar realmente.">
                      <Input
                        id="sheet-inicio"
                        name="fechaInicio"
                        type="date"
                        autoComplete="off"
                        aria-describedby="sheet-inicio-help sheet-inicio-error"
                        aria-invalid={Boolean(errors.fechaInicio)}
                        value={draft.fechaInicio}
                        onChange={(event) => setDraft((current) => ({ ...current, fechaInicio: event.target.value }))}
                      />
                    </FieldRow>

                    <FieldRow fieldId="sheet-fin" htmlFor="sheet-fin" label="Fecha de fin *" error={errors.fechaFin} helper="Tiene que ser posterior al inicio.">
                      <Input
                        id="sheet-fin"
                        name="fechaFin"
                        type="date"
                        autoComplete="off"
                        aria-describedby="sheet-fin-help sheet-fin-error"
                        aria-invalid={Boolean(errors.fechaFin)}
                        value={draft.fechaFin}
                        onChange={(event) => setDraft((current) => ({ ...current, fechaFin: event.target.value }))}
                      />
                    </FieldRow>
                  </div>

                  {executionDays > 0 ? (
                    <div className="otc-sheet-rail rounded-[calc(var(--radius)+0.125rem)] px-4 py-3 text-sm text-muted-foreground">
                      Duracion estimada: <span className="otc-data-text font-semibold text-foreground">{executionDays} dias</span>
                    </div>
                  ) : null}

                  <FieldRow fieldId="sheet-prioridad" label="Prioridad" helper="Alta solo si mueve el resultado operativo de corto plazo.">
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
                  </FieldRow>

                  <div className="otc-sheet-rail flex items-center justify-between gap-4 rounded-[calc(var(--radius)+0.125rem)] px-4 py-4">
                    <div className="space-y-1">
                      <Label htmlFor="sheet-apoyo">Requiere apoyo</Label>
                      <p className="otc-form-helper">Activalo solo si otra area participa activamente en la ejecucion.</p>
                    </div>
                    <Switch id="sheet-apoyo" checked={draft.requiereApoyo} onCheckedChange={(checked) => setDraft((current) => ({ ...current, requiereApoyo: checked }))} />
                  </div>

                  {draft.requiereApoyo ? (
                    <FieldRow fieldId="sheet-areas-apoyo" label="Areas de apoyo" helper="Van a quedar visibles como colaboradoras en detalle y listados.">
                      <div className="flex flex-wrap gap-2">
                        {AREAS.filter((area) => area !== draft.area).map((area) => {
                          const selected = draft.areasApoyo.includes(area)
                          return (
                            <Button
                              key={area}
                              type="button"
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
                    </FieldRow>
                  ) : null}
                </SheetSection>
              </motion.section>

              <motion.section className="space-y-5" {...getMotionProps(0.09)}>
                <SheetSection title="Ejecución" description="Define actividades y adjunta los respaldos que correspondan.">
                  <FieldRow fieldId="sheet-activities" label="Actividades *" error={errors.actividades} helper="Cada actividad suma claridad y ordena el progreso futuro.">
                    <div id="sheet-activities" className="space-y-3" tabIndex={-1}>
                      {draft.actividades.map((activity, index) => (
                        <div key={activity.id} className="otc-sheet-rail flex items-center gap-2 rounded-[calc(var(--radius)+0.125rem)] px-3 py-3">
                          <span className="otc-data-text text-sm text-muted-foreground">{index + 1}</span>
                          <Input
                            value={activity.nombre}
                            name={`sheet-activity-${index}`}
                            autoComplete="off"
                            placeholder="Describe el paso operativo…"
                            onChange={(event) => setDraft((current) => ({ ...current, actividades: current.actividades.map((item, currentIndex) => currentIndex === index ? { ...item, nombre: event.target.value } : item) }))}
                          />
                          <Button type="button" variant="ghost" size="icon" disabled={draft.actividades.length === 1} aria-label={`Eliminar actividad ${index + 1}`} onClick={() => setDraft((current) => ({ ...current, actividades: current.actividades.filter((_, currentIndex) => currentIndex !== index) }))}>
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </FieldRow>

                  <Button type="button" variant="outline" onClick={() => setDraft((current) => ({ ...current, actividades: [...current.actividades, createActivityDraft()] }))}>
                    <Plus data-icon="inline-start" />
                    Agregar actividad
                  </Button>

                  <div className="space-y-3">
                    <Label>Documentos</Label>
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
                  </div>
                </SheetSection>
              </motion.section>

              <SheetFooter className="otc-sticky-action-bar border-t border-border/70 px-0 pt-4 sm:flex-row sm:items-center sm:justify-between sm:px-0">
                <div>
                  <p className="text-sm font-semibold text-foreground">Confirmá la creación</p>
                  <p className="text-sm text-muted-foreground">Los datos cargados quedarán disponibles en el backlog.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => handleOpenChange(false)}>
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
              </SheetFooter>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function SheetSection({ children, description, title }: { children: React.ReactNode; description: string; title: string }) {
  return (
    <div className="otc-panel rounded-[calc(var(--radius)+0.25rem)] border border-border/70 px-4 py-4 sm:px-5 sm:py-5">
      <div className="space-y-1">
        <p className="otc-section-kicker">Seccion</p>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </div>
  )
}

function FieldRow({ children, error, fieldId, helper, htmlFor, label }: { children: React.ReactNode; error?: string; fieldId: string; helper: string; htmlFor?: string; label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      <p id={`${fieldId}-help`} className="otc-form-helper">{helper}</p>
      {error ? <p id={`${fieldId}-error`} className="otc-form-error">{error}</p> : null}
    </div>
  )
}
