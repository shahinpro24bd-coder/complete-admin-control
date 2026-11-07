export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      amc_contracts: {
        Row: {
          amount: number | null
          billing: string
          created_at: string
          customer_id: string | null
          customer_name: string
          end_date: string | null
          id: string
          next_visit: string | null
          notes: string | null
          plan: string | null
          property: string | null
          start_date: string | null
          status: string
          visits_per_year: number | null
        }
        Insert: {
          amount?: number | null
          billing?: string
          created_at?: string
          customer_id?: string | null
          customer_name: string
          end_date?: string | null
          id?: string
          next_visit?: string | null
          notes?: string | null
          plan?: string | null
          property?: string | null
          start_date?: string | null
          status?: string
          visits_per_year?: number | null
        }
        Update: {
          amount?: number | null
          billing?: string
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          end_date?: string | null
          id?: string
          next_visit?: string | null
          notes?: string | null
          plan?: string | null
          property?: string | null
          start_date?: string | null
          status?: string
          visits_per_year?: number | null
        }
        Relationships: []
      }
      business_settings: {
        Row: {
          data: Json
          id: number
          updated_at: string
        }
        Insert: {
          data?: Json
          id?: number
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          trn: string | null
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          trn?: string | null
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          trn?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          bill_no: string | null
          category: string
          created_at: string
          description: string | null
          expense_date: string
          id: string
          job_id: string | null
          method: string
          notes: string | null
          status: string
          supplier: string | null
          vat_amount: number
        }
        Insert: {
          amount?: number
          bill_no?: string | null
          category?: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          job_id?: string | null
          method?: string
          notes?: string | null
          status?: string
          supplier?: string | null
          vat_amount?: number
        }
        Update: {
          amount?: number
          bill_no?: string | null
          category?: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          job_id?: string | null
          method?: string
          notes?: string | null
          status?: string
          supplier?: string | null
          vat_amount?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          contract_id: string | null
          created_at: string
          customer_address: string | null
          customer_id: string | null
          customer_name: string
          customer_trn: string | null
          description: string | null
          discount: number
          due_date: string | null
          id: string
          invoice_no: string
          issue_date: string
          items: Json
          job_id: string | null
          lpo_no: string | null
          notes: string | null
          paid_date: string | null
          status: string
          vat_percent: number
        }
        Insert: {
          amount?: number
          contract_id?: string | null
          created_at?: string
          customer_address?: string | null
          customer_id?: string | null
          customer_name: string
          customer_trn?: string | null
          description?: string | null
          discount?: number
          due_date?: string | null
          id?: string
          invoice_no: string
          issue_date?: string
          items?: Json
          job_id?: string | null
          lpo_no?: string | null
          notes?: string | null
          paid_date?: string | null
          status?: string
          vat_percent?: number
        }
        Update: {
          amount?: number
          contract_id?: string | null
          created_at?: string
          customer_address?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_trn?: string | null
          description?: string | null
          discount?: number
          due_date?: string | null
          id?: string
          invoice_no?: string
          issue_date?: string
          items?: Json
          job_id?: string | null
          lpo_no?: string | null
          notes?: string | null
          paid_date?: string | null
          status?: string
          vat_percent?: number
        }
        Relationships: []
      }
      jobs: {
        Row: {
          created_at: string
          customer_id: string | null
          customer_name: string | null
          id: string
          location: string | null
          notes: string | null
          priority: string
          scheduled_date: string | null
          scheduled_time: string | null
          service: string | null
          status: string
          technician: string | null
          title: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          priority?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          service?: string | null
          status?: string
          technician?: string | null
          title: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          priority?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          service?: string | null
          status?: string
          technician?: string | null
          title?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          cheque_date: string | null
          created_at: string
          customer_id: string | null
          customer_name: string
          id: string
          invoice_id: string | null
          method: string
          notes: string | null
          payment_date: string
          receipt_no: string
          reference: string | null
        }
        Insert: {
          amount: number
          cheque_date?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name: string
          id?: string
          invoice_id?: string | null
          method?: string
          notes?: string | null
          payment_date?: string
          receipt_no: string
          reference?: string | null
        }
        Update: {
          amount?: number
          cheque_date?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          id?: string
          invoice_id?: string | null
          method?: string
          notes?: string | null
          payment_date?: string
          receipt_no?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          amount: number
          created_at: string
          customer_address: string | null
          customer_id: string | null
          customer_name: string
          customer_trn: string | null
          discount: number
          id: string
          invoice_id: string | null
          issue_date: string
          items: Json
          notes: string | null
          quote_no: string
          status: string
          subject: string | null
          valid_until: string | null
          vat_percent: number
        }
        Insert: {
          amount?: number
          created_at?: string
          customer_address?: string | null
          customer_id?: string | null
          customer_name: string
          customer_trn?: string | null
          discount?: number
          id?: string
          invoice_id?: string | null
          issue_date?: string
          items?: Json
          notes?: string | null
          quote_no: string
          status?: string
          subject?: string | null
          valid_until?: string | null
          vat_percent?: number
        }
        Update: {
          amount?: number
          created_at?: string
          customer_address?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_trn?: string | null
          discount?: number
          id?: string
          invoice_id?: string | null
          issue_date?: string
          items?: Json
          notes?: string | null
          quote_no?: string
          status?: string
          subject?: string | null
          valid_until?: string | null
          vat_percent?: number
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          company: string | null
          created_at: string
          details: string
          email: string | null
          follow_up_date: string | null
          id: string
          location: string
          name: string
          notes: string | null
          phone: string
          property_type: string | null
          service: string
          status: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          details: string
          email?: string | null
          follow_up_date?: string | null
          id?: string
          location: string
          name: string
          notes?: string | null
          phone: string
          property_type?: string | null
          service: string
          status?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          details?: string
          email?: string | null
          follow_up_date?: string | null
          id?: string
          location?: string
          name?: string
          notes?: string | null
          phone?: string
          property_type?: string | null
          service?: string
          status?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
    },
  },
} as const
