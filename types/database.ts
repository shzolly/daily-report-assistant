export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          pin: string
          full_name: string | null
          role: string
          is_admin: boolean
          is_active: boolean
          created_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          username: string
          pin: string
          full_name?: string | null
          role?: string
          is_admin?: boolean
          is_active?: boolean
          created_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          username?: string
          pin?: string
          full_name?: string | null
          role?: string
          is_admin?: boolean
          is_active?: boolean
          created_at?: string
          last_login?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          category_id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string
          report_date: string
          week_start_date: string
          status: string
          blockers: string | null
          tomorrow_plan: string | null
          generated_report: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          report_date: string
          week_start_date: string
          status?: string
          blockers?: string | null
          tomorrow_plan?: string | null
          generated_report?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          report_date?: string
          week_start_date?: string
          status?: string
          blockers?: string | null
          tomorrow_plan?: string | null
          generated_report?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      report_activities: {
        Row: {
          id: string
          report_id: string
          category_id: string
          activity_id: string
          time_spent: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          category_id: string
          activity_id: string
          time_spent?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          category_id?: string
          activity_id?: string
          time_spent?: number | null
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}
