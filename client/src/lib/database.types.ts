export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          address: string | null
          role: 'citizen' | 'admin' | 'authority' | 'moderator'
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          role?: 'citizen' | 'admin' | 'authority' | 'moderator'
          is_active?: boolean
        }
        Update: {
          email?: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          role?: 'citizen' | 'admin' | 'authority' | 'moderator'
          is_active?: boolean
          last_login?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      issues: {
        Row: {
          id: string
          title: string
          description: string
          category_id: number
          category: string | null
          status: 'pending' | 'in_progress' | 'resolved' | 'rejected'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          location_lat: number | null
          location_lng: number | null
          location_address: string | null
          location: string | null
          images: string[] | null
          upvotes: number
          downvotes: number
          citizen_id: string
          assigned_to: string | null
          resolution_note: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description: string
          category_id: number
          category?: string | null
          status?: 'pending' | 'in_progress' | 'resolved' | 'rejected'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          location_lat?: number | null
          location_lng?: number | null
          location_address?: string | null
          location?: string | null
          images?: string[] | null
          citizen_id: string
          assigned_to?: string | null
        }
        Update: {
          title?: string
          description?: string
          category?: string | null
          status?: 'pending' | 'in_progress' | 'resolved' | 'rejected'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          location?: string | null
          assigned_to?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      issue_categories: {
        Row: {
          id: number
          name: string
          description: string | null
          icon: string | null
          color: string
          created_at: string
        }
        Relationships: []
      }
      issue_votes: {
        Row: {
          id: number
          issue_id: string
          user_id: string
          vote_type: 'upvote' | 'downvote'
          created_at: string
        }
        Insert: {
          issue_id: string
          user_id: string
          vote_type: 'upvote' | 'downvote'
        }
        Relationships: []
      }
      issue_comments: {
        Row: {
          id: string
          issue_id: string
          user_id: string
          comment: string
          created_at: string
        }
        Insert: {
          issue_id: string
          user_id: string
          comment: string
        }
        Relationships: []
      }
      issue_updates: {
        Row: {
          id: string
          issue_id: string
          update_text: string
          admin_id: string | null
          created_at: string
        }
        Insert: {
          issue_id: string
          update_text: string
          admin_id?: string | null
        }
        Update: {
          update_text?: string
          admin_id?: string | null
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          id: string
          action: string
          description: string
          user_id: string
          entity_type: 'issue' | 'user' | 'system'
          entity_id: string
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          action: string
          description: string
          user_id: string
          entity_type: 'issue' | 'user' | 'system'
          entity_id: string
          metadata?: Record<string, unknown> | null
        }
        Update: {
          action?: string
          description?: string
          metadata?: Record<string, unknown> | null
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
