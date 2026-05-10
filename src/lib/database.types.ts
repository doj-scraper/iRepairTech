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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      inventory_parts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          moq: number
          name: string
          price_cents: number
          sku: string
          stock_count: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          moq?: number
          name: string
          price_cents: number
          sku: string
          stock_count?: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          moq?: number
          name?: string
          price_cents?: number
          sku?: string
          stock_count?: number
        }
        Relationships: []
      }
      inventory_reservations: {
        Row: {
          created_at: string
          id: string
          order_id: string
          part_id: string
          quantity: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          part_id: string
          quantity: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          part_id?: string
          quantity?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_reservations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "inventory_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items_parts: {
        Row: {
          id: string
          order_id: string | null
          part_id: string | null
          price_cents: number
          quantity: number
        }
        Insert: {
          id?: string
          order_id?: string | null
          part_id?: string | null
          price_cents: number
          quantity: number
        }
        Update: {
          id?: string
          order_id?: string | null
          part_id?: string | null
          price_cents?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_parts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_parts_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "inventory_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items_services: {
        Row: {
          id: string
          order_id: string | null
          price_cents: number
          service_id: string | null
        }
        Insert: {
          id?: string
          order_id?: string | null
          price_cents: number
          service_id?: string | null
        }
        Update: {
          id?: string
          order_id?: string | null
          price_cents?: number
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_services_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "repair_services"
            referencedColumns: ["id"]
          },
        ]
      }
      order_state_history: {
        Row: {
          changed_at: string | null
          from_state: Database["public"]["Enums"]["order_status"] | null
          id: string
          metadata: Json | null
          order_id: string | null
          to_state: Database["public"]["Enums"]["order_status"] | null
        }
        Insert: {
          changed_at?: string | null
          from_state?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          to_state?: Database["public"]["Enums"]["order_status"] | null
        }
        Update: {
          changed_at?: string | null
          from_state?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          to_state?: Database["public"]["Enums"]["order_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "order_state_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_state_transitions: {
        Row: {
          from_state: Database["public"]["Enums"]["order_status"]
          to_state: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          from_state: Database["public"]["Enums"]["order_status"]
          to_state: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          from_state?: Database["public"]["Enums"]["order_status"]
          to_state?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: []
      }
      orders: {
        Row: {
          accepted_terms: boolean
          accepted_terms_at: string | null
          created_at: string | null
          id: string
          status: Database["public"]["Enums"]["order_status"]
          stripe_session_id: string
          terms_version: string | null
          total_cents: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accepted_terms?: boolean
          accepted_terms_at?: string | null
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          stripe_session_id: string
          terms_version?: string | null
          total_cents: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accepted_terms?: boolean
          accepted_terms_at?: string | null
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          stripe_session_id?: string
          terms_version?: string | null
          total_cents?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          role?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      repair_services: {
        Row: {
          created_at: string | null
          description: string | null
          estimated_hours: number | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price_cents: number
          sku: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price_cents: number
          sku: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price_cents?: number
          sku?: string
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          payload: Json
          processed: boolean | null
          type: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          payload: Json
          processed?: boolean | null
          type: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          payload?: Json
          processed?: boolean | null
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      finalize_order: { Args: { p_session_id: string }; Returns: undefined }
      release_inventory_for_order: {
        Args: { p_order_id: string }
        Returns: undefined
      }
      reserve_inventory_for_order: {
        Args: { p_order_id: string }
        Returns: undefined
      }
      transition_order_state: {
        Args: {
          p_next_state: Database["public"]["Enums"]["order_status"]
          p_order_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      order_status:
        | "pending"
        | "paid"
        | "fulfilled"
        | "refunded"
        | "expired"
        | "awaiting_device"
        | "device_received"
        | "in_repair"
        | "qa"
        | "shipped"
        | "completed"
        | "failed"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      order_status: [
        "pending",
        "paid",
        "fulfilled",
        "refunded",
        "expired",
        "awaiting_device",
        "device_received",
        "in_repair",
        "qa",
        "shipped",
        "completed",
        "failed",
      ],
    },
  },
} as const

// =========================================
// CONVENIENCE TYPE EXPORTS
// =========================================

export type OrderStatus = Database['public']['Enums']['order_status']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type InventoryPart = Database['public']['Tables']['inventory_parts']['Row']
export type InventoryPartInsert = Database['public']['Tables']['inventory_parts']['Insert']
export type InventoryPartUpdate = Database['public']['Tables']['inventory_parts']['Update']

export type RepairService = Database['public']['Tables']['repair_services']['Row']
export type RepairServiceInsert = Database['public']['Tables']['repair_services']['Insert']
export type RepairServiceUpdate = Database['public']['Tables']['repair_services']['Update']

export type Order = Database['public']['Tables']['orders']['Row']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']

export type OrderItemPart = Database['public']['Tables']['order_items_parts']['Row']
export type OrderItemPartInsert = Database['public']['Tables']['order_items_parts']['Insert']
export type OrderItemPartUpdate = Database['public']['Tables']['order_items_parts']['Update']

export type OrderItemService = Database['public']['Tables']['order_items_services']['Row']
export type OrderItemServiceInsert = Database['public']['Tables']['order_items_services']['Insert']
export type OrderItemServiceUpdate = Database['public']['Tables']['order_items_services']['Update']

export type OrderStateTransition = Database['public']['Tables']['order_state_transitions']['Row']
export type OrderStateTransitionInsert = Database['public']['Tables']['order_state_transitions']['Insert']
export type OrderStateTransitionUpdate = Database['public']['Tables']['order_state_transitions']['Update']

export type OrderStateHistory = Database['public']['Tables']['order_state_history']['Row']
export type OrderStateHistoryInsert = Database['public']['Tables']['order_state_history']['Insert']
export type OrderStateHistoryUpdate = Database['public']['Tables']['order_state_history']['Update']

export type InventoryReservation = Database['public']['Tables']['inventory_reservations']['Row']
export type InventoryReservationInsert = Database['public']['Tables']['inventory_reservations']['Insert']
export type InventoryReservationUpdate = Database['public']['Tables']['inventory_reservations']['Update']

export type StripeEvent = Database['public']['Tables']['stripe_events']['Row']
export type StripeEventInsert = Database['public']['Tables']['stripe_events']['Insert']
export type StripeEventUpdate = Database['public']['Tables']['stripe_events']['Update']

export type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row']
export type ContactSubmissionInsert = Database['public']['Tables']['contact_submissions']['Insert']
export type ContactSubmissionUpdate = Database['public']['Tables']['contact_submissions']['Update']
