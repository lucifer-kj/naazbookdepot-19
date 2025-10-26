export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          price: number
          category: string
          image_url: string
          stock_quantity: number
          tags: string[]
          is_featured: boolean
          is_published: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          price: number
          category: string
          image_url: string
          stock_quantity: number
          tags?: string[]
          is_featured?: boolean
          is_published?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          price?: number
          category?: string
          image_url?: string
          stock_quantity?: number
          tags?: string[]
          is_featured?: boolean
          is_published?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          user_id: string
          status: string
          total_amount: number
          shipping_address: Json
          payment_status: string
          items: Json[]
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          status: string
          total_amount: number
          shipping_address: Json
          payment_status: string
          items: Json[]
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          status?: string
          total_amount?: number
          shipping_address?: Json
          payment_status?: string
          items?: Json[]
        }
      }
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          role: string
          profile: Json
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          role?: string
          profile?: Json
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          role?: string
          profile?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}