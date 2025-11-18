/**
 * Supabase Database Types
 * Auto-generated types for type-safe database operations
 */

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
      admins: {
        Row: {
          id: string
          email: string
          name: string
          role: 'super_admin' | 'admin' | 'moderator'
          status: 'active' | 'inactive' | 'suspended'
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: 'super_admin' | 'admin' | 'moderator'
          status?: 'active' | 'inactive' | 'suspended'
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'super_admin' | 'admin' | 'moderator'
          status?: 'active' | 'inactive' | 'suspended'
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          category: string
          price: number
          unit: string
          stock: number
          status: 'active' | 'inactive' | 'out_of_stock'
          image_url: string | null
          images: string[] | null
          is_featured: boolean
          is_organic: boolean
          sku: string | null
          weight: number | null
          dimensions: Json | null
          tags: string[] | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          category: string
          price: number
          unit: string
          stock?: number
          status?: 'active' | 'inactive' | 'out_of_stock'
          image_url?: string | null
          images?: string[] | null
          is_featured?: boolean
          is_organic?: boolean
          sku?: string | null
          weight?: number | null
          dimensions?: Json | null
          tags?: string[] | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          category?: string
          price?: number
          unit?: string
          stock?: number
          status?: 'active' | 'inactive' | 'out_of_stock'
          image_url?: string | null
          images?: string[] | null
          is_featured?: boolean
          is_organic?: boolean
          sku?: string | null
          weight?: number | null
          dimensions?: Json | null
          tags?: string[] | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          avatar_url: string | null
          address: Json | null
          status: 'active' | 'inactive' | 'blocked'
          total_orders: number
          total_spent: number
          loyalty_points: number
          created_at: string
          updated_at: string
          last_order_at: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string | null
          avatar_url?: string | null
          address?: Json | null
          status?: 'active' | 'inactive' | 'blocked'
          total_orders?: number
          total_spent?: number
          loyalty_points?: number
          created_at?: string
          updated_at?: string
          last_order_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          avatar_url?: string | null
          address?: Json | null
          status?: 'active' | 'inactive' | 'blocked'
          total_orders?: number
          total_spent?: number
          loyalty_points?: number
          created_at?: string
          updated_at?: string
          last_order_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          customer_name: string
          customer_email: string
          customer_phone: string | null
          items: Json
          subtotal: number
          tax: number
          shipping_fee: number
          discount: number
          total: number
          delivery_address: Json
          delivery_method: string
          delivery_date: string | null
          delivery_time_slot: string | null
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method: string | null
          notes: string | null
          admin_notes: string | null
          tracking_number: string | null
          created_at: string
          updated_at: string
          confirmed_at: string | null
          delivered_at: string | null
        }
        Insert: {
          id?: string
          order_number: string
          customer_id?: string | null
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          items: Json
          subtotal: number
          tax?: number
          shipping_fee?: number
          discount?: number
          total: number
          delivery_address: Json
          delivery_method: string
          delivery_date?: string | null
          delivery_time_slot?: string | null
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: string | null
          notes?: string | null
          admin_notes?: string | null
          tracking_number?: string | null
          created_at?: string
          updated_at?: string
          confirmed_at?: string | null
          delivered_at?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          items?: Json
          subtotal?: number
          tax?: number
          shipping_fee?: number
          discount?: number
          total?: number
          delivery_address?: Json
          delivery_method?: string
          delivery_date?: string | null
          delivery_time_slot?: string | null
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: string | null
          notes?: string | null
          admin_notes?: string | null
          tracking_number?: string | null
          created_at?: string
          updated_at?: string
          confirmed_at?: string | null
          delivered_at?: string | null
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          featured_image: string | null
          category: string
          tags: string[] | null
          author_id: string | null
          author_name: string
          status: 'draft' | 'published' | 'archived'
          is_featured: boolean
          views: number
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          featured_image?: string | null
          category: string
          tags?: string[] | null
          author_id?: string | null
          author_name: string
          status?: 'draft' | 'published' | 'archived'
          is_featured?: boolean
          views?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          featured_image?: string | null
          category?: string
          tags?: string[] | null
          author_id?: string | null
          author_name?: string
          status?: 'draft' | 'published' | 'archived'
          is_featured?: boolean
          views?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          timestamp: string
          actor_id: string
          actor_name: string
          actor_email: string
          actor_role: string
          actor_type: 'admin' | 'customer' | 'system'
          action: string
          category: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          description: string
          target_type: string | null
          target_id: string | null
          target_name: string | null
          changes: Json | null
          device: Json
          location: Json
          metadata: Json | null
          session_id: string
          request_id: string | null
          status: 'success' | 'failed' | 'pending'
          error_message: string | null
          duration: number | null
        }
        Insert: {
          id?: string
          timestamp?: string
          actor_id: string
          actor_name: string
          actor_email: string
          actor_role: string
          actor_type: 'admin' | 'customer' | 'system'
          action: string
          category: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          description: string
          target_type?: string | null
          target_id?: string | null
          target_name?: string | null
          changes?: Json | null
          device: Json
          location: Json
          metadata?: Json | null
          session_id: string
          request_id?: string | null
          status: 'success' | 'failed' | 'pending'
          error_message?: string | null
          duration?: number | null
        }
        Update: {
          id?: string
          timestamp?: string
          actor_id?: string
          actor_name?: string
          actor_email?: string
          actor_role?: string
          actor_type?: 'admin' | 'customer' | 'system'
          action?: string
          category?: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          description?: string
          target_type?: string | null
          target_id?: string | null
          target_name?: string | null
          changes?: Json | null
          device?: Json
          location?: Json
          metadata?: Json | null
          session_id?: string
          request_id?: string | null
          status?: 'success' | 'failed' | 'pending'
          error_message?: string | null
          duration?: number | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          description: string | null
          category: string
          is_public: boolean
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          description?: string | null
          category: string
          is_public?: boolean
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          description?: string | null
          category?: string
          is_public?: boolean
          updated_by?: string | null
          created_at?: string
          updated_at?: string
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
