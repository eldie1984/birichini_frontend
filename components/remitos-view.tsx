"use client"

import React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { Upload, FileText, Building2, Calendar, Hash, Loader2, ImageIcon, X } from "lucide-react"
import type { RemitoData } from "@/app/api/extract-remito/route"

interface RemitosViewProps {
  onProductsExtracted?: (products: RemitoData["productos"]) => void
}

export function RemitosView({ onProductsExtracted }: RemitosViewProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [remitoData, setRemitoData] = useState<RemitoData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setRemitoData(null)
      setError(null)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setRemitoData(null)
      setError(null)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const clearFile = useCallback(() => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setRemitoData(null)
    setError(null)
  }, [])

  const processRemito = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setError(null)

    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string

        const response = await fetch("/api/extract-remito", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        })

        const result = await response.json()

        if (result.error) {
          setError(result.error)
        } else if (result.data) {
          setRemitoData(result.data)
          if (onProductsExtracted && result.data.productos) {
            onProductsExtracted(result.data.productos)
          }
        }

        setIsProcessing(false)
      }
      reader.readAsDataURL(selectedFile)
    } catch (err) {
      setError("Error al procesar el archivo")
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Cargar Remito</h2>
        <p className="text-muted-foreground">
          Sube una imagen de un remito para extraer automaticamente los productos y precios
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Subir Remito
            </CardTitle>
            <CardDescription>
              Arrastra una imagen o haz clic para seleccionar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!previewUrl ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 transition-colors hover:border-primary hover:bg-muted/50"
              >
                <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-sm font-medium text-foreground">
                  Arrastra tu imagen aqui
                </p>
                <p className="mb-4 text-xs text-muted-foreground">
                  PNG, JPG o JPEG (max 10MB)
                </p>
                <Label htmlFor="remito-upload">
                  <Input
                    id="remito-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" asChild>
                    <span>Seleccionar archivo</span>
                  </Button>
                </Label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Vista previa del remito"
                    className="w-full rounded-lg border object-contain"
                    style={{ maxHeight: "300px" }}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={clearFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {selectedFile?.name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {selectedFile && (selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <Button
                  onClick={processRemito}
                  disabled={isProcessing}
                  className="w-full gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Extraer Datos
                    </>
                  )}
                </Button>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Datos Extraidos
            </CardTitle>
            <CardDescription>
              Informacion obtenida del remito
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Analizando imagen con IA...
                </p>
              </div>
            ) : remitoData ? (
              <div className="space-y-4">
                {/* Proveedor Info */}
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {remitoData.proveedor.nombre}
                      </p>
                      {remitoData.proveedor.cuit && (
                        <p className="text-sm text-muted-foreground">
                          CUIT: {remitoData.proveedor.cuit}
                        </p>
                      )}
                      {remitoData.proveedor.direccion && (
                        <p className="text-sm text-muted-foreground">
                          {remitoData.proveedor.direccion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remito Details */}
                <div className="flex gap-4">
                  {remitoData.numeroRemito && (
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="text-muted-foreground">Remito:</span>{" "}
                        <span className="font-medium">{remitoData.numeroRemito}</span>
                      </span>
                    </div>
                  )}
                  {remitoData.fecha && (
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="text-muted-foreground">Fecha:</span>{" "}
                        <span className="font-medium">{remitoData.fecha}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Sube un remito para ver los datos extraidos
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      {remitoData && remitoData.productos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos del Remito</CardTitle>
            <CardDescription>
              {remitoData.productos.length} producto(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Precio Unit.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {remitoData.productos.map((producto, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{producto.nombre}</TableCell>
                    <TableCell className="text-right">{producto.cantidad}</TableCell>
                    <TableCell className="text-right">
                      ${producto.precioUnitario.toLocaleString("es-AR")}
                    </TableCell>
                    <TableCell className="text-right">
                      ${producto.subtotal.toLocaleString("es-AR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-semibold">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg text-primary">
                    ${remitoData.total.toLocaleString("es-AR")}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
