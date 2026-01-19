"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Upload, FileText, Loader2, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTaskContext } from "@/lib/task-context"
import { AREAS, PRIORIDADES, type Area, type Prioridad } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface FormData {
  nombre: string
  descripcion: string
  areas: Area[]
  fechaInicio: string
  fechaFin: string
  prioridad: Prioridad
  requiereApoyo: boolean
  areasApoyo: Area[]
  documentos: Array<{ nombre: string; url: string }>
  actividades: Array<{ id: string; nombre: string; porcentaje: number; completada: boolean }>
}

interface FormErrors {
  nombre?: string
  areas?: string
  fechaInicio?: string
  fechaFin?: string
  actividades?: string
}

export function NuevaTareaForm() {
  const router = useRouter()
  const { agregarTarea, rol } = useTaskContext()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    descripcion: "",
    areas: [],
    fechaInicio: "",
    fechaFin: "",
    prioridad: "Media",
    requiereApoyo: false,
    areasApoyo: [],
    documentos: [],
    actividades: [{ id: `act-${Date.now()}`, nombre: "", porcentaje: 0, completada: false }],
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [diasEjecutar, setDiasEjecutar] = useState(0)

  // Calculate days
  useEffect(() => {
    if (formData.fechaInicio && formData.fechaFin) {
      const inicio = new Date(formData.fechaInicio)
      const fin = new Date(formData.fechaFin)
      const diff = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
      setDiasEjecutar(Math.max(0, diff))
    }
  }, [formData.fechaInicio, formData.fechaFin])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    }

    if (formData.areas.length === 0) {
      newErrors.areas = "Selecciona al menos un area"
    }

    if (!formData.fechaInicio) {
      newErrors.fechaInicio = "La fecha de inicio es requerida"
    }

    if (!formData.fechaFin) {
      newErrors.fechaFin = "La fecha de fin es requerida"
    } else if (formData.fechaInicio && new Date(formData.fechaFin) <= new Date(formData.fechaInicio)) {
      newErrors.fechaFin = "La fecha de fin debe ser posterior a la fecha de inicio"
    }

    const actividadesValidas = formData.actividades.filter((a) => a.nombre.trim())
    if (actividadesValidas.length === 0) {
      newErrors.actividades = "Agrega al menos una actividad"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Error de validacion",
        description: "Por favor corrige los errores del formulario",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const actividadesLimpias = formData.actividades
      .filter((a) => a.nombre.trim())
      .map((a, i) => ({
        ...a,
        id: `act-${Date.now()}-${i}`,
      }))

    agregarTarea({
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      areas: formData.areas,
      fechaInicio: formData.fechaInicio,
      fechaFin: formData.fechaFin,
      diasEjecutar,
      prioridad: formData.prioridad,
      requiereApoyo: formData.requiereApoyo,
      areasApoyo: formData.requiereApoyo ? formData.areasApoyo : [],
      documentos: formData.documentos,
      actividades: actividadesLimpias,
    })

    setIsSaved(true)

    toast({
      title: "Tarea creada exitosamente",
      description: "La nueva tarea ha sido agregada al sistema",
    })

    setTimeout(() => {
      router.push("/tareas")
    }, 1500)
  }

  const toggleArea = (area: Area) => {
    setFormData((prev) => ({
      ...prev,
      areas: prev.areas.includes(area)
        ? prev.areas.filter((a) => a !== area)
        : [...prev.areas, area],
    }))
  }

  const toggleAreaApoyo = (area: Area) => {
    setFormData((prev) => ({
      ...prev,
      areasApoyo: prev.areasApoyo.includes(area)
        ? prev.areasApoyo.filter((a) => a !== area)
        : [...prev.areasApoyo, area],
    }))
  }

  const addActividad = () => {
    setFormData((prev) => ({
      ...prev,
      actividades: [
        ...prev.actividades,
        { id: `act-${Date.now()}`, nombre: "", porcentaje: 0, completada: false },
      ],
    }))
  }

  const removeActividad = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      actividades: prev.actividades.filter((_, i) => i !== index),
    }))
  }

  const updateActividad = (index: number, nombre: string) => {
    setFormData((prev) => ({
      ...prev,
      actividades: prev.actividades.map((a, i) => (i === index ? { ...a, nombre } : a)),
    }))
  }

  const handleAddDocument = () => {
    // Simulate file upload
    const docName = `Documento_${Date.now()}.pdf`
    setFormData((prev) => ({
      ...prev,
      documentos: [...prev.documentos, { nombre: docName, url: "#" }],
    }))
    toast({
      title: "Documento agregado",
      description: `${docName} ha sido adjuntado`,
    })
  }

  const removeDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documentos: prev.documentos.filter((_, i) => i !== index),
    }))
  }

  if (rol !== "Administrador") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Acceso Restringido</h2>
        <p className="text-muted-foreground text-center">
          Solo los administradores pueden crear nuevas tareas.
          <br />
          Cambia tu rol a Administrador en el panel lateral.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nueva Tarea</h1>
        <p className="text-sm text-muted-foreground">
          Completa el formulario para crear una nueva tarea operacional
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informacion General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la tarea *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Actualizacion plan de emergencia"
                value={formData.nombre}
                onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                className={errors.nombre ? "border-red-500" : ""}
              />
              {errors.nombre && <p className="text-xs text-red-500">{errors.nombre}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripcion</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe los objetivos y alcance de la tarea..."
                value={formData.descripcion}
                onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Area(s) responsable(s) *</Label>
              <div className="flex flex-wrap gap-2">
                {AREAS.map((area) => (
                  <Badge
                    key={area}
                    variant={formData.areas.includes(area) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleArea(area)}
                  >
                    {area}
                  </Badge>
                ))}
              </div>
              {errors.areas && <p className="text-xs text-red-500">{errors.areas}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fechas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de inicio *</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, fechaInicio: e.target.value }))
                  }
                  className={errors.fechaInicio ? "border-red-500" : ""}
                />
                {errors.fechaInicio && <p className="text-xs text-red-500">{errors.fechaInicio}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha de fin *</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fechaFin: e.target.value }))}
                  className={errors.fechaFin ? "border-red-500" : ""}
                />
                {errors.fechaFin && <p className="text-xs text-red-500">{errors.fechaFin}</p>}
              </div>
            </div>

            {diasEjecutar > 0 && (
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">
                  Dias de ejecucion: <span className="font-semibold text-foreground">{diasEjecutar} dias</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority and Support */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prioridad y Apoyo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <div className="flex gap-2">
                {PRIORIDADES.map((prioridad) => (
                  <Button
                    key={prioridad}
                    type="button"
                    variant={formData.prioridad === prioridad ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setFormData((prev) => ({ ...prev, prioridad }))}
                  >
                    {prioridad}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <Label htmlFor="requiereApoyo" className="cursor-pointer">
                  Requiere apoyo de otras areas?
                </Label>
                <p className="text-xs text-muted-foreground">
                  Activa esta opcion si necesitas colaboracion
                </p>
              </div>
              <Switch
                id="requiereApoyo"
                checked={formData.requiereApoyo}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, requiereApoyo: checked }))
                }
              />
            </div>

            {formData.requiereApoyo && (
              <div className="space-y-2">
                <Label>Areas de apoyo</Label>
                <div className="flex flex-wrap gap-2">
                  {AREAS.filter((a) => !formData.areas.includes(a)).map((area) => (
                    <Badge
                      key={area}
                      variant={formData.areasApoyo.includes(area) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleAreaApoyo(area)}
                    >
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onClick={handleAddDocument}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click para agregar documentos
              </p>
              <p className="text-xs text-muted-foreground mt-1">(Simulado)</p>
            </div>

            {formData.documentos.length > 0 && (
              <div className="space-y-2">
                {formData.documentos.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{doc.nombre}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(i)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actividades *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.actividades.map((actividad, index) => (
              <div key={actividad.id} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                <Input
                  placeholder={`Actividad ${index + 1}`}
                  value={actividad.nombre}
                  onChange={(e) => updateActividad(index, e.target.value)}
                  className="flex-1"
                />
                {formData.actividades.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeActividad(index)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            ))}

            {errors.actividades && <p className="text-xs text-red-500">{errors.actividades}</p>}

            <Button type="button" variant="outline" size="sm" onClick={addActividad}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar actividad
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/tareas")}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || isSaved}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : isSaved ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Guardado
              </>
            ) : (
              "Guardar Tarea"
            )}
          </Button>
        </div>
      </form>
      <Toaster />
    </div>
  )
}
