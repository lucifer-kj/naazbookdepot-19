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
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: number | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: number | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: number | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: number
          title: string
          slug: string | null
          description: string | null
          price: number
          compare_at_price: number | null
          category: string | null
          subcategory: string | null
          author: string | null
          publisher: string | null
          isbn: string | null
          language: string
          pages: number | null
          weight: number | null
          dimensions: string | null
          tags: string[] | null
          image_url: string | null
          images: string[] | null
          in_stock: boolean
          stock_quantity: number
          low_stock_threshold: number
          featured: boolean
          status: 'draft' | 'published' | 'archived'
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          slug?: string | null
          description?: string | null
          price: number
          compare_at_price?: number | null
          category?: string | null
          subcategory?: string | null
          author?: string | null
          publisher?: string | null
          isbn?: string | null
          language?: string
          pages?: number | null
          weight?: number | null
          dimensions?: string | null
          tags?: string[] | null
          image_url?: string | null
          images?: string[] | null
          in_stock?: boolean
          stock_quantity?: number
          low_stock_threshold?: number
          featured?: boolean
          status?: 'draft' | 'published' | 'archived'
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          slug?: string | null
          description?: string | null
          price?: number
          compare_at_price?: number | null
          category?: string | null
          subcategory?: string | null
          author?: string | null
          publisher?: string | null
          isbn?: string | null
          language?: string
          pages?: number | null
          weight?: number | null
          dimensions?: string | null
          tags?: string[] | null
          image_url?: string | null
          images?: string[] | null
          in_stock?: boolean
          stock_quantity?: number
          low_stock_threshold?: number
          featured?: boolean
          status?: 'draft' | 'published' | 'archived'
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          phone: string | null
          date_of_birth: string | null
          bio: string | null
          avatar_url: string | null
          default_address: Json | null
          preferences: Json
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          bio?: string | null
          avatar_url?: string | null
          default_address?: Json | null
          preferences?: Json
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          bio?: string | null
          avatar_url?: string | null
          default_address?: Json | null
          preferences?: Json
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: number
          user_id: string
          full_name: string
          phone: string
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          pincode: string
          country: string
          address_type: 'home' | 'work' | 'other'
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          full_name: string
          phone: string
          address_line1: string
          address_line2?: string | null
          city: string
          state: string
          pincode: string
          country?: string
          address_type?: 'home' | 'work' | 'other'
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          full_name?: string
          phone?: string
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string
          pincode?: string
          country?: string
          address_type?: 'home' | 'work' | 'other'
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: number
          order_number: string
          user_id: string | null
          email: string | null
          phone: string | null
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'pending_payment_verification'
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'pending_verification'
          payment_method: string | null
          subtotal: number
          tax_amount: number
          shipping_amount: number
          discount_amount: number
          total_amount: number
          currency: string
          shipping_address: Json
          billing_address: Json | null
          notes: string | null
          tracking_number: string | null
          shipped_at: string | null
          delivered_at: string | null
          upi_reference_code: string | null
          payment_reference: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          order_number?: string
          user_id?: string | null
          email?: string | null
          phone?: string | null
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'pending_payment_verification'
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'pending_verification'
          payment_method?: string | null
          subtotal: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          total_amount: number
          currency?: string
          shipping_address: Json
          billing_address?: Json | null
          notes?: string | null
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          upi_reference_code?: string | null
          payment_reference?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          order_number?: string
          user_id?: string | null
          email?: string | null
          phone?: string | null
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'pending_payment_verification'
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'pending_verification'
          payment_method?: string | null
          subtotal?: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          total_amount?: number
          currency?: string
          shipping_address?: Json
          billing_address?: Json | null
          notes?: string | null
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          upi_reference_code?: string | null
          payment_reference?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: number
          order_id: number
          product_id: number | null
          product_title: string
          product_author: string | null
          product_isbn: string | null
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: number
          order_id: number
          product_id?: number | null
          product_title: string
          product_author?: string | null
          product_isbn?: string | null
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          product_id?: number | null
          product_title?: string
          product_author?: string | null
          product_isbn?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: number
          product_id: number
          user_id: string
          rating: number
          title: string | null
          comment: string | null
          would_recommend: boolean
          verified_purchase: boolean
          helpful_count: number
          status: 'pending' | 'approved' | 'rejected'
          moderated_by: string | null
          moderated_at: string | null
          moderation_notes: string | null
          reported_count: number
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          product_id: number
          user_id: string
          rating: number
          title?: string | null
          comment?: string | null
          would_recommend?: boolean
          verified_purchase?: boolean
          helpful_count?: number
          status?: 'pending' | 'approved' | 'rejected'
          moderated_by?: string | null
          moderated_at?: string | null
          moderation_notes?: string | null
          reported_count?: number
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          product_id?: number
          user_id?: string
          rating?: number
          title?: string | null
          comment?: string | null
          would_recommend?: boolean
          verified_purchase?: boolean
          helpful_count?: number
          status?: 'pending' | 'approved' | 'rejected'
          moderated_by?: string | null
          moderated_at?: string | null
          moderation_notes?: string | null
          reported_count?: number
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      review_reports: {
        Row: {
          id: number
          review_id: number
          reporter_id: string
          reason: 'spam' | 'inappropriate' | 'fake' | 'offensive' | 'other'
          description: string | null
          status: 'pending' | 'reviewed' | 'resolved'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          review_id: number
          reporter_id: string
          reason: 'spam' | 'inappropriate' | 'fake' | 'offensive' | 'other'
          description?: string | null
          status?: 'pending' | 'reviewed' | 'resolved'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          review_id?: number
          reporter_id?: string
          reason?: 'spam' | 'inappropriate' | 'fake' | 'offensive' | 'other'
          description?: string | null
          status?: 'pending' | 'reviewed' | 'resolved'
          created_at?: string
          updated_at?: string
        }
      }
      order_feedback: {
        Row: {
          id: number
          order_id: number
          user_id: string
          overall_rating: number
          delivery_rating: number
          packaging_rating: number
          would_recommend: boolean
          feedback_text: string | null
          improvement_suggestions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          order_id: number
          user_id: string
          overall_rating: number
          delivery_rating: number
          packaging_rating: number
          would_recommend?: boolean
          feedback_text?: string | null
          improvement_suggestions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          user_id?: string
          overall_rating?: number
          delivery_rating?: number
          packaging_rating?: number
          would_recommend?: boolean
          feedback_text?: string | null
          improvement_suggestions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      review_analytics: {
        Row: {
          id: number
          review_id: number
          sentiment_score: number | null
          sentiment_label: 'positive' | 'negative' | 'neutral' | null
          keywords: string[] | null
          readability_score: number | null
          word_count: number | null
          analyzed_at: string
        }
        Insert: {
          id?: number
          review_id: number
          sentiment_score?: number | null
          sentiment_label?: 'positive' | 'negative' | 'neutral' | null
          keywords?: string[] | null
          readability_score?: number | null
          word_count?: number | null
          analyzed_at?: string
        }
        Update: {
          id?: number
          review_id?: number
          sentiment_score?: number | null
          sentiment_label?: 'positive' | 'negative' | 'neutral' | null
          keywords?: string[] | null
          readability_score?: number | null
          word_count?: number | null
          analyzed_at?: string
        }
      }
      review_helpful_votes: {
        Row: {
          id: number
          review_id: number
          user_id: string
          is_helpful: boolean
          created_at: string
        }
        Insert: {
          id?: number
          review_id: number
          user_id: string
          is_helpful: boolean
          created_at?: string
        }
        Update: {
          id?: number
          review_id?: number
          user_id?: string
          is_helpful?: boolean
          created_at?: string
        }
      }
      blog_categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          post_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          post_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          post_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: number
          title: string
          slug: string
          excerpt: string | null
          content: string
          category: string | null
          author: string
          featured_image: string | null
          status: string
          views: number
          read_time: number
          tags: string[] | null
          meta_title: string | null
          meta_description: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          slug: string
          excerpt?: string | null
          content: string
          category?: string | null
          author?: string
          featured_image?: string | null
          status?: string
          views?: number
          read_time?: number
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          category?: string | null
          author?: string
          featured_image?: string | null
          status?: string
          views?: number
          read_time?: number
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      promo_codes: {
        Row: {
          id: number
          code: string
          description: string | null
          discount_type: string
          discount_value: number
          minimum_order_value: number
          max_usage: number | null
          used_count: number
          valid_from: string
          valid_until: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          code: string
          description?: string | null
          discount_type: string
          discount_value: number
          minimum_order_value?: number
          max_usage?: number | null
          used_count?: number
          valid_from: string
          valid_until: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          code?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          minimum_order_value?: number
          max_usage?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      wishlist: {
        Row: {
          id: number
          user_id: string
          product_id: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          product_id: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          product_id?: number
          created_at?: string
        }
      }
      cart_items: {
        Row: {
          id: number
          user_id: string
          product_id: number
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          product_id: number
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          product_id?: number
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      newsletter_subscriptions: {
        Row: {
          id: number
          email: string
          preferences: string[]
          is_active: boolean
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          id?: number
          email: string
          preferences?: string[]
          is_active?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          id?: number
          email?: string
          preferences?: string[]
          is_active?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
      }
      contact_messages: {
        Row: {
          id: number
          name: string
          email: string
          phone: string | null
          subject: string
          message: string
          category: string
          status: string
          replied_at: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          email: string
          phone?: string | null
          subject: string
          message: string
          category?: string
          status?: string
          replied_at?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string
          phone?: string | null
          subject?: string
          message?: string
          category?: string
          status?: string
          replied_at?: string | null
          created_at?: string
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
      order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'pending_payment_verification'
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'pending_verification'
      product_status: 'draft' | 'published' | 'archived'
      address_type: 'home' | 'work' | 'other'
    }
  }
}