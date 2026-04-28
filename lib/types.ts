export type Category = "perro" | "gato" | "accesorio"
export type Location = "deposito" | "local"

export interface Product {
  id: string
  name: string
  description: string
  category: Category
  supplier: string
  purchasePrice: number
  salePrice: number
  stockDeposito: number
  stockLocal: number
  createdAt: Date
  weight?: string
  picture?: string
}

export interface Sale {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
  date: Date
}

export interface InventoryMovement {
  id: string
  productId: string
  productName: string
  quantity: number
  from: Location
  to: Location
  date: Date
}

export interface ShortageItem {
  id: string
  productId: string
  productName: string
  category: Category
  supplier: string
  quantityToOrder: number
  currentStockLocal: number
  currentStockDeposito: number
  purchasePrice: number
  addedAt: Date
}

export const categoryLabels: Record<Category, string> = {
  perro: "Perros",
  gato: "Gatos",
  accesorio: "Accesorios",
}

export const categoryIcons: Record<Category, string> = {
  perro: "Dog",
  gato: "Cat",
  accesorio: "Package",
}

export const locationLabels: Record<Location, string> = {
  deposito: "Deposito",
  local: "Local",
}
