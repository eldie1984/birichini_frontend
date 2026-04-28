"use client"

import { Product, Sale, InventoryMovement, ShortageItem } from "./types"
import { productsApi, salesApi, movementsApi, shortagesApi } from "./api"

// Products functions - now using API
export async function getProducts(): Promise<Product[]> {
  try {
    const response = await productsApi.getAll()
    if (response.error) {
      console.error('Failed to fetch products:', response.error)
      return []
    }
    return response.data || []
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function addProduct(product: Omit<Product, "id" | "createdAt">): Promise<Product | null> {
  try {
    const productWithId = {
      ...product,
      id: crypto.randomUUID(),
    }
    const response = await productsApi.create(productWithId)
    if (response.error) {
      console.error('Failed to create product:', response.error)
      return null
    }
    return response.data || null
  } catch (error) {
    console.error('Error creating product:', error)
    return null
  }
}

export async function updateProduct(id: string, updates: Partial<Omit<Product, "id" | "createdAt">>): Promise<Product | null> {
  try {
    const response = await productsApi.update(id, updates)
    if (response.error) {
      console.error('Failed to update product:', response.error)
      return null
    }
    return response.data || null
  } catch (error) {
    console.error('Error updating product:', error)
    return null
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const response = await productsApi.delete(id)
    if (response.error) {
      console.error('Failed to delete product:', response.error)
      return false
    }
    return true
  } catch (error) {
    console.error('Error deleting product:', error)
    return false
  }
}

// Sales functions - now using API
export async function getSales(): Promise<Sale[]> {
  try {
    const response = await salesApi.getAll()
    if (response.error) {
      console.error('Failed to fetch sales:', response.error)
      return []
    }
    return response.data || []
  } catch (error) {
    console.error('Error fetching sales:', error)
    return []
  }
}

export async function registerSale(productId: string, quantity: number): Promise<Sale | null> {
  try {
    const saleData = {
      productId,
      quantity,
      id: crypto.randomUUID(),
    }
    const response = await salesApi.create(saleData)
    if (response.error) {
      console.error('Failed to register sale:', response.error)
      return null
    }
    return response.data || null
  } catch (error) {
    console.error('Error registering sale:', error)
    return null
  }
}

// Inventory movement functions - now using API
export async function getMovements(): Promise<InventoryMovement[]> {
  try {
    const response = await movementsApi.getAll()
    if (response.error) {
      console.error('Failed to fetch movements:', response.error)
      return []
    }
    return response.data || []
  } catch (error) {
    console.error('Error fetching movements:', error)
    return []
  }
}

export async function moveInventory(
  productId: string,
  quantity: number,
  from: "deposito" | "local",
  to: "deposito" | "local"
): Promise<InventoryMovement | null> {
  try {
    const movementData = {
      productId,
      quantity,
      from,
      to,
      id: crypto.randomUUID(),
    }
    const response = await movementsApi.create(movementData)
    if (response.error) {
      console.error('Failed to move inventory:', response.error)
      return null
    }
    return response.data || null
  } catch (error) {
    console.error('Error moving inventory:', error)
    return null
  }
}

// Shortage functions - now using API
export async function getShortages(): Promise<ShortageItem[]> {
  try {
    const response = await shortagesApi.getAll()
    if (response.error) {
      console.error('Failed to fetch shortages:', response.error)
      return []
    }
    return response.data || []
  } catch (error) {
    console.error('Error fetching shortages:', error)
    return []
  }
}

export async function addShortage(productId: string, quantityToOrder: number): Promise<ShortageItem | null> {
  try {
    const shortageData = {
      productId,
      quantityToOrder,
      id: crypto.randomUUID(),
    }
    const response = await shortagesApi.create(shortageData)
    if (response.error) {
      console.error('Failed to add shortage:', response.error)
      return null
    }
    return response.data || null
  } catch (error) {
    console.error('Error adding shortage:', error)
    return null
  }
}

export async function updateShortage(id: string, quantityToOrder: number): Promise<ShortageItem | null> {
  try {
    const response = await shortagesApi.update(id, quantityToOrder)
    if (response.error) {
      console.error('Failed to update shortage:', response.error)
      return null
    }
    return response.data || null
  } catch (error) {
    console.error('Error updating shortage:', error)
    return null
  }
}

export async function removeShortage(id: string): Promise<boolean> {
  try {
    const response = await shortagesApi.delete(id)
    if (response.error) {
      console.error('Failed to remove shortage:', response.error)
      return false
    }
    return true
  } catch (error) {
    console.error('Error removing shortage:', error)
    return false
  }
}

export async function clearShortages(): Promise<boolean> {
  try {
    const response = await shortagesApi.clearAll()
    if (response.error) {
      console.error('Failed to clear shortages:', response.error)
      return false
    }
    return true
  } catch (error) {
    console.error('Error clearing shortages:', error)
    return false
  }
}