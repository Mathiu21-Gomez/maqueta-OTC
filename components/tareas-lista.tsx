"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Filter,
  ArrowUpDown,
  Zap,
  Users,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination"
import { useTaskContext } from "@/lib/task-context"
import {
  calcularEstado,
  diasRestantes,
  formatearFecha,
  getMesFromFecha,
} from "@/lib/helpers"
import { AREAS, ESTADOS, MESES, type Area, type Prioridad } from "@/lib/types"
import { TareaDetalleModal } from "@/components/tarea-detalle-modal"
import type { Tarea } from "@/lib/types"

const ITEMS_PER_PAGE = 10

type SortField = "nombre" | "estado" | "avanceTotal" | "fechaFin" | "prioridad"
type SortDirection = "asc" | "desc"

export function TareasLista() {
  const { tareas } = useTaskContext()
  const [busqueda, setBusqueda] = useState("")
  const [mesFilter, setMesFilter] = useState<string>("todos")
  const [areaFilter, setAreaFilter] = useState<string>("todas")
  const [estadoFilter, setEstadoFilter] = useState<string>("todos")
  const [prioridadFilter, setPrioridadFilter] = useState<string>("todas")
  const [sortField, setSortField] = useState<SortField>("fechaFin")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const tareasFiltradas = useMemo(() => {
    let resultado = [...tareas]

    if (busqueda) {
      const search = busqueda.toLowerCase()
      resultado = resultado.filter(
        (t) =>
          t.nombre.toLowerCase().includes(search) ||
          t.descripcion.toLowerCase().includes(search)
      )
    }

    if (mesFilter !== "todos") {
      resultado = resultado.filter(
        (t) => getMesFromFecha(t.fechaInicio) === parseInt(mesFilter)
      )
    }

    if (areaFilter !== "todas") {
      resultado = resultado.filter((t) => t.areas.includes(areaFilter as Area))
    }

    if (estadoFilter !== "todos") {
      resultado = resultado.filter((t) => calcularEstado(t) === estadoFilter)
    }

    if (prioridadFilter !== "todas") {
      resultado = resultado.filter((t) => t.prioridad === prioridadFilter)
    }

    resultado.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "nombre":
          comparison = a.nombre.localeCompare(b.nombre)
          break
        case "estado":
          comparison = calcularEstado(a).localeCompare(calcularEstado(b))
          break
        case "avanceTotal":
          comparison = a.avanceTotal - b.avanceTotal
          break
        case "fechaFin":
          comparison = new Date(a.fechaFin).getTime() - new Date(b.fechaFin).getTime()
          break
        case "prioridad":
          const prioridadOrden: Record<Prioridad, number> = { Alta: 0, Media: 1, Baja: 2 }
          comparison = prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad]
          break
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

    return resultado
  }, [tareas, busqueda, mesFilter, areaFilter, estadoFilter, prioridadFilter, sortField, sortDirection])

  const totalPages = Math.ceil(tareasFiltradas.length / ITEMS_PER_PAGE)
  const paginatedTareas = tareasFiltradas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const stats = useMemo(() => {
    const total = tareasFiltradas.length
    const finalizadas = tareasFiltradas.filter(t => calcularEstado(t) === "Finalizado").length
    const atrasadas = tareasFiltradas.filter(t => calcularEstado(t) === "Atrasado").length
    const avancePromedio = total > 0
      ? Math.round(tareasFiltradas.reduce((acc, t) => acc + t.avanceTotal, 0) / total)
      : 0
    return { total, finalizadas, atrasadas, avancePromedio }
  }, [tareasFiltradas])

  const getRowBorderClass = (tarea: Tarea) => {
    const estado = calcularEstado(tarea)
    const dias = diasRestantes(tarea.fechaFin)

    if (estado === "Atrasado") return "border-l-4 border-l-red-500"
    if (dias > 0 && dias <= 5 && estado !== "Finalizado") return "border-l-4 border-l-amber-500"
    return ""
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("ellipsis")
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push("ellipsis")
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lista de Tareas</h1>
        <p className="text-sm text-muted-foreground">
          {tareasFiltradas.length} tareas encontradas
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o descripción..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                Filtros:
              </div>
              <Select
                value={mesFilter}
                onValueChange={(v) => { setMesFilter(v); setCurrentPage(1) }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los meses</SelectItem>
                  {MESES.map((mes, i) => (
                    <SelectItem key={mes} value={i.toString()}>{mes}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={areaFilter}
                onValueChange={(v) => { setAreaFilter(v); setCurrentPage(1) }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las áreas</SelectItem>
                  {AREAS.map((area) => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={estadoFilter}
                onValueChange={(v) => { setEstadoFilter(v); setCurrentPage(1) }}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {ESTADOS.map((estado) => (
                    <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={prioridadFilter}
                onValueChange={(v) => { setPrioridadFilter(v); setCurrentPage(1) }}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableCaption className="mb-4">
              Lista de tareas operacionales del sistema OTI
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("nombre")}>
                    Nombre <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Área(s)</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("estado")}>
                    Estado <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("avanceTotal")}>
                    Avance <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("fechaFin")}>
                    Fin <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Días Rest.</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("prioridad")}>
                    Prior. <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-[80px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTareas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center">
                    <p className="text-muted-foreground">No se encontraron tareas</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTareas.map((tarea) => {
                  const estado = calcularEstado(tarea)
                  const dias = diasRestantes(tarea.fechaFin)
                  const esColaborativa = tarea.areas.length > 1 || tarea.requiereApoyo

                  return (
                    <TableRow
                      key={tarea.id}
                      className={`cursor-pointer ${getRowBorderClass(tarea)}`}
                      onClick={() => setSelectedTarea(tarea)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {tarea.prioridad === "Alta" && <Zap className="h-4 w-4 text-red-500 flex-shrink-0" />}
                          {esColaborativa && <Users className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                          <span className="line-clamp-1">{tarea.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {tarea.areas.slice(0, 2).map((area) => (
                            <Badge key={area} variant="outline" className="text-xs">{area}</Badge>
                          ))}
                          {tarea.areas.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{tarea.areas.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${estado === "Finalizado" ? "text-green-600" :
                            estado === "Atrasado" ? "text-red-600" :
                              estado === "En curso" ? "text-blue-600" : "text-yellow-600"
                          }`}>{estado}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full bg-primary transition-all" style={{ width: `${tarea.avanceTotal}%` }} />
                          </div>
                          <span className="text-sm text-muted-foreground">{tarea.avanceTotal}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatearFecha(tarea.fechaInicio)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatearFecha(tarea.fechaFin)}</TableCell>
                      <TableCell>
                        <span className={`font-medium ${dias < 0 ? "text-red-600" : dias <= 5 ? "text-amber-600" : "text-muted-foreground"}`}>
                          {dias < 0 ? `${Math.abs(dias)} atrasado` : `${dias} días`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${tarea.prioridad === "Alta" ? "text-red-600" :
                            tarea.prioridad === "Media" ? "text-yellow-600" : "text-green-600"
                          }`}>{tarea.prioridad}</span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedTarea(tarea) }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Resumen de tareas filtradas</TableCell>
                <TableCell className="text-right font-medium">{stats.avancePromedio}% promedio</TableCell>
                <TableCell colSpan={2} className="text-center">
                  <span className="text-green-600">{stats.finalizadas}</span> finalizadas
                </TableCell>
                <TableCell colSpan={2} className="text-center">
                  <span className="text-red-600">{stats.atrasadas}</span> atrasadas
                </TableCell>
                <TableCell className="text-right font-medium">{stats.total} total</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, tareasFiltradas.length)} de{" "}
            {tareasFiltradas.length} tareas
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
              </PaginationItem>
              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <Button
                      variant={currentPage === page ? "outline" : "ghost"}
                      size="icon"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Detail Sheet */}
      {selectedTarea && (
        <TareaDetalleModal
          tarea={selectedTarea}
          open={!!selectedTarea}
          onClose={() => setSelectedTarea(null)}
        />
      )}
    </div>
  )
}
