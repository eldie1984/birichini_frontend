const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface ApiResponse<T> {
  data?: T
  error?: string
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.message || 'An error occurred' }
    }

    return { data }
  } catch (error) {
    return { error: 'Network error' }
  }
}

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await fetchApi<{ access_token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    if (response.data?.access_token) {
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response
  },

  register: async (username: string, email: string, password: string) => {
    return fetchApi<{ message: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    })
  },

  logout: async () => {
    const response = await fetchApi<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    })
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return response
  },

  getProfile: async () => {
    return fetchApi<{ user: any }>('/api/users/profile')
  },
}

// Products API
export const productsApi = {
  getAll: async () => {
    return fetchApi<any[]>('/api/products/products')
  },

  getById: async (id: string) => {
    return fetchApi<any>(`/api/products/products/${id}`)
  },

  create: async (product: any) => {
    return fetchApi<any>('/api/products/products', {
      method: 'POST',
      body: JSON.stringify(product),
    })
  },

  update: async (id: string, product: any) => {
    return fetchApi<any>(`/api/products/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    })
  },

  delete: async (id: string) => {
    return fetchApi<any>(`/api/products/products/${id}`, {
      method: 'DELETE',
    })
  },
}

// Sales API
export const salesApi = {
  getAll: async () => {
    return fetchApi<any[]>('/api/sales/sales')
  },

  create: async (sale: { productId: string; quantity: number; id?: string }) => {
    return fetchApi<any>('/api/sales/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    })
  },
}

// Movements API
export const movementsApi = {
  getAll: async () => {
    return fetchApi<any[]>('/api/movements/movements')
  },

  create: async (movement: { productId: string; quantity: number; from: string; to: string; id?: string }) => {
    return fetchApi<any>('/api/movements/movements', {
      method: 'POST',
      body: JSON.stringify(movement),
    })
  },
}

// Shortages API
export const shortagesApi = {
  getAll: async () => {
    return fetchApi<any[]>('/api/shortages/shortages')
  },

  create: async (shortage: { productId: string; quantityToOrder: number; id?: string }) => {
    return fetchApi<any>('/api/shortages/shortages', {
      method: 'POST',
      body: JSON.stringify(shortage),
    })
  },

  update: async (id: string, quantityToOrder: number) => {
    return fetchApi<any>(`/api/shortages/shortages/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantityToOrder }),
    })
  },

  delete: async (id: string) => {
    return fetchApi<any>(`/api/shortages/shortages/${id}`, {
      method: 'DELETE',
    })
  },

  clearAll: async () => {
    return fetchApi<any>('/api/shortages/shortages', {
      method: 'DELETE',
    })
  },
}

// Helper to get current user
export function getStoredUser() {
  if (typeof window === 'undefined') return null
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export function isAuthenticated() {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('token')
}