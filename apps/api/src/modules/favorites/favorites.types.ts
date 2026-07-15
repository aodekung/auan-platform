/**
 * Favorites module type definitions and DTOs.
 */

export interface FavoriteProductResponse {
  id: string
  name: string
  nameEn: string | null
  description: string | null
  imageUrl: string | null
  price: string
  status: string
  isAvailable: boolean
  displayOrder: number
  category: { id: string; name: string }
}

export interface FavoriteResponse {
  id: string
  productId: string
  product?: FavoriteProductResponse
  createdAt: string
}

export interface FavoriteCheckResponse {
  isFavorited: boolean
}
