export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          email: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          email?: string
          avatar_url?: string | null
          updated_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          updated_at?: string
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: 'owner' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: 'owner' | 'member'
          joined_at?: string
        }
        Update: {
          role?: 'owner' | 'member'
        }
      }
      expenses: {
        Row: {
          id: string
          group_id: string
          description: string
          amount: number
          paid_by: string
          split_method: 'equal' | 'exact' | 'percentage'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          description: string
          amount: number
          paid_by: string
          split_method: 'equal' | 'exact' | 'percentage'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          description?: string
          amount?: number
          paid_by?: string
          split_method?: 'equal' | 'exact' | 'percentage'
          updated_at?: string
        }
      }
      expense_splits: {
        Row: {
          id: string
          expense_id: string
          user_id: string
          amount: number
          percentage: number | null
        }
        Insert: {
          id?: string
          expense_id: string
          user_id: string
          amount: number
          percentage?: number | null
        }
        Update: {
          amount?: number
          percentage?: number | null
        }
      }
      shopping_items: {
        Row: {
          id: string
          group_id: string
          text: string
          is_checked: boolean
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          text: string
          is_checked?: boolean
          created_by: string
          created_at?: string
        }
        Update: {
          text?: string
          is_checked?: boolean
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type GroupMember = Database['public']['Tables']['group_members']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseSplit = Database['public']['Tables']['expense_splits']['Row']
export type ShoppingItem = Database['public']['Tables']['shopping_items']['Row']
