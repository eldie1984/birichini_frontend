import { generateText, Output } from "ai"
import { z } from "zod"

const remitoSchema = z.object({
  proveedor: z.object({
    nombre: z.string().describe("Nombre de la empresa proveedora"),
    cuit: z.string().nullable().describe("CUIT del proveedor si esta disponible"),
    direccion: z.string().nullable().describe("Direccion del proveedor si esta disponible"),
  }),
  numeroRemito: z.string().nullable().describe("Numero de remito o factura"),
  fecha: z.string().nullable().describe("Fecha del remito en formato DD/MM/YYYY"),
  productos: z.array(
    z.object({
      nombre: z.string().describe("Nombre o descripcion del producto"),
      cantidad: z.number().describe("Cantidad de unidades"),
      precioUnitario: z.number().describe("Precio por unidad"),
      subtotal: z.number().describe("Subtotal del producto (cantidad * precio unitario)"),
    })
  ),
  total: z.number().describe("Valor total del remito"),
})

export type RemitoData = z.infer<typeof remitoSchema>

export async function POST(req: Request) {
  try {
    const { image } = await req.json()

    if (!image) {
      return Response.json({ error: "No se proporciono imagen" }, { status: 400 })
    }

    const { output } = await generateText({
      model: "anthropic/claude-sonnet-4",
      output: Output.object({
        schema: remitoSchema,
      }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analiza esta imagen de un remito o factura de proveedor y extrae la siguiente informacion:
              
1. Datos del proveedor (nombre de la empresa, CUIT si aparece, direccion)
2. Numero de remito o factura
3. Fecha del documento
4. Lista de productos con: nombre, cantidad, precio unitario y subtotal
5. Total del remito

Si algun dato no esta visible o no se puede determinar, usa null para campos opcionales.
Para los precios, usa numeros sin simbolos de moneda.
Asegurate de que el total coincida con la suma de los subtotales de los productos.`,
            },
            {
              type: "image",
              image: image,
            },
          ],
        },
      ],
    })

    return Response.json({ data: output })
  } catch (error) {
    console.error("Error procesando remito:", error)
    return Response.json(
      { error: "Error al procesar el remito" },
      { status: 500 }
    )
  }
}
