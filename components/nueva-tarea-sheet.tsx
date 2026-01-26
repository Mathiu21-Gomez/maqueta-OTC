"use client"

import React, { useState, useEffect } from "react"
import {
  Plus,
  Trash2,
  Upload,
  FileText,
  Loader2,
  Check,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle,
  Building2,
  Users,
  FileCheck,
  X,
} from "lucide-react"
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useTaskContext } from "@/lib/task-context"
import { AREAS, PRIORIDADES, type Area, type Prioridad } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface FormData {
  nombre: string
  descripcion: string
  area: Area | null
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

interface NuevaTareaSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NuevaTareaSheet({ open, onOpenChange }: NuevaTareaSheetProps) {
  const { agregarTarea, rol } = useTaskContext()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    descripcion: "",
    area: null,
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

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
      setFormData({
        nombre: "",
        descripcion: "",
        area: null,
        fechaInicio: "",
        fechaFin: "",
        prioridad: "Media",
        requiereApoyo: false,
        areasApoyo: [],
        documentos: [],
        actividades: [{ id: `act-${Date.now()}`, nombre: "", porcentaje: 0, completada: false }],
      })
      setErrors({})
      setIsSaved(false)
      setIsSubmitting(false)
    }
  }, [open])

  // Calculate days
  useEffect(() => {
    if (formData.fechaInicio && formData.fechaFin) {
      const inicio = new Date(formData.fechaInicio)
      const fin = new Date(formData.fechaFin)
      const diff = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
      setDiasEjecutar(Math.max(0, diff))
    } else {
      setDiasEjecutar(0)
    }
  }, [formData.fechaInicio, formData.fechaFin])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    }

    if (!formData.area) {
      newErrors.areas = "Selecciona un área"
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
        title: "Error de validación",
        description: "Por favor corrige los errores del formulario",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

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
      areas: formData.area ? [formData.area] : [],
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
      onOpenChange(false)
    }, 1500)
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
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Acceso Restringido</SheetTitle>
            <SheetDescription>
              Solo los administradores pueden crear nuevas tareas. Cambia tu rol a Administrador en el panel lateral.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-xl">Nueva Tarea</SheetTitle>
          <SheetDescription>
            Completa el formulario para crear una nueva tarea operacional
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-1 py-6 space-y-6">
            {/* Información General */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-semibold">Información General</Label>
              </div>
              <div className="space-y-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-sm">
                    Nombre de la tarea <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Actualización plan de emergencia"
                    value={formData.nombre}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                    className={cn(errors.nombre && "border-red-500")}
                  />
                  {errors.nombre && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.nombre}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion" className="text-sm">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Describe los objetivos y alcance de la tarea..."
                    value={formData.descripcion}
                    onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-semibold">Fechas</Label>
              </div>
              <div className="space-y-4 pl-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fechaInicio" className="text-sm">
                      Fecha de inicio <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fechaInicio"
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, fechaInicio: e.target.value }))
                      }
                      className={cn(errors.fechaInicio && "border-red-500")}
                    />
                    {errors.fechaInicio && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.fechaInicio}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaFin" className="text-sm">
                      Fecha de fin <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fechaFin"
                      type="date"
                      value={formData.fechaFin}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fechaFin: e.target.value }))}
                      className={cn(errors.fechaFin && "border-red-500")}
                    />
                    {errors.fechaFin && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.fechaFin}
                      </p>
                    )}
                  </div>
                </div>

                {diasEjecutar > 0 && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-900">
                        <span className="font-semibold">{diasEjecutar}</span> días de ejecución
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Áreas */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-semibold">
                  Áreas <span className="text-red-500">*</span>
                </Label>
              </div>
              <div className="pl-6">
                <Select
                  value={formData.area || ""}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, area: value as Area }))}
                >
                  <SelectTrigger className={cn(errors.areas && "border-red-500")}>
                    <SelectValue placeholder="Selecciona un área principal" />
                  </SelectTrigger>
                  <SelectContent>
                    {AREAS.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.areas && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-2">
                    <AlertCircle className="w-3 h-3" />
                    {errors.areas}
                  </p>
                )}
              </div>
            </div>

            {/* Prioridad */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-semibold">Prioridad</Label>
              </div>
              <div className="pl-6">
                <div className="grid grid-cols-3 gap-2">
                  {PRIORIDADES.map((prioridad) => {
                    const isSelected = formData.prioridad === prioridad
                    const colors = {
                      Alta: { bg: "bg-red-50", border: "border-red-500", text: "text-red-700" },
                      Media: { bg: "bg-amber-50", border: "border-amber-500", text: "text-amber-700" },
                      Baja: { bg: "bg-green-50", border: "border-green-500", text: "text-green-700" },
                    }
                    const color = colors[prioridad]

                    return (
                      <button
                        key={prioridad}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, prioridad }))}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all text-center",
                          isSelected
                            ? `${color.border} ${color.bg}`
                            : "border-gray-200 bg-white hover:border-gray-300"
                        )}
                      >
                        <span className={cn(
                          "text-sm font-semibold",
                          isSelected ? color.text : "text-gray-700"
                        )}>
                          {prioridad}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Requiere Apoyo */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-semibold">Apoyo de otras áreas</Label>
              </div>
              <div className="pl-6">
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <div>
                    <Label htmlFor="requiereApoyo" className="cursor-pointer text-sm font-medium">
                      Requiere apoyo de otras áreas
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Activa esta opción si necesitas colaboración
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
                  <div className="mt-3 space-y-2">
                    <Label className="text-sm">Áreas de apoyo</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {AREAS.filter((a) => a !== formData.area).map((area) => {
                        const isSelected = formData.areasApoyo.includes(area)
                        return (
                          <button
                            key={area}
                            type="button"
                            onClick={() => toggleAreaApoyo(area)}
                            className={cn(
                              "p-2 rounded-lg border text-left transition-all",
                              isSelected
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            )}
                          >
                            <span className={cn(
                              "text-xs font-medium",
                              isSelected ? "text-purple-700" : "text-gray-700"
                            )}>
                              {area}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actividades */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-semibold">
                  Actividades <span className="text-red-500">*</span>
                </Label>
              </div>
              <div className="pl-6 space-y-3">
                {formData.actividades.map((actividad, index) => (
                  <div key={actividad.id} className="flex items-center gap-2">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
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
                        className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {errors.actividades && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.actividades}
                  </p>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addActividad}
                  className="w-full border-2 border-dashed border-gray-400 bg-gray-50 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar actividad
                </Button>
              </div>
            </div>

            {/* Documentos */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-semibold">Documentos</Label>
              </div>
              <div className="pl-6 space-y-3">
                <div
                  onClick={handleAddDocument}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                >
                  <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click para agregar documentos</p>
                  <p className="text-xs text-gray-400 mt-1">(Simulado)</p>
                </div>

                {formData.documentos.length > 0 && (
                  <div className="space-y-2">
                    {formData.documentos.map((doc, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{doc.nombre}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDocument(i)}
                          className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <SheetFooter className="border-t pt-4 mt-4">
            <SheetClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                className="border-red-300 text-red-700 bg-white hover:bg-red-50 hover:border-red-400 hover:text-red-800 font-medium"
              >
                Cancelar
              </Button>
            </SheetClose>
            <Button
              type="submit"
              disabled={isSubmitting || isSaved}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
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
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
