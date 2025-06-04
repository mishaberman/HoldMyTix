
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_transfers: {
        Row: {
          id: string
          contract_id: string
          seller_id: string | null
          buyer_id: string | null
          event_name: string
          event_date: string
          venue: string
          seat_details: string | null
          ticket_quantity: number
          price: number
          payment_method: string | null
          status: string
          payment_verified: boolean | null
          tickets_verified: boolean | null
          time_remaining: number | null
          expiration_time: string | null
          ticket_provider: string | null
          ticket_notes: string | null
          seller_name: string | null
          seller_email: string | null
          buyer_name: string | null
          buyer_email: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          contract_id: string
          seller_id?: string | null
          buyer_id?: string | null
          event_name: string
          event_date: string
          venue: string
          seat_details?: string | null
          ticket_quantity?: number
          price: number
          payment_method?: string | null
          status?: string
          payment_verified?: boolean | null
          tickets_verified?: boolean | null
          time_remaining?: number | null
          expiration_time?: string | null
          ticket_provider?: string | null
          ticket_notes?: string | null
          seller_name?: string | null
          seller_email?: string | null
          buyer_name?: string | null
          buyer_email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          contract_id?: string
          seller_id?: string | null
          buyer_id?: string | null
          event_name?: string
          event_date?: string
          venue?: string
          seat_details?: string | null
          ticket_quantity?: number
          price?: number
          payment_method?: string | null
          status?: string
          payment_verified?: boolean | null
          tickets_verified?: boolean | null
          time_remaining?: number | null
          expiration_time?: string | null
          ticket_provider?: string | null
          ticket_notes?: string | null
          seller_name?: string | null
          seller_email?: string | null
          buyer_name?: string | null
          buyer_email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      docusign_agreements: {
        Row: {
          id: string
          transaction_id: string | null
          envelope_id: string | null
          status: string | null
          document_url: string | null
          seller_status: string | null
          buyer_status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          transaction_id?: string | null
          envelope_id?: string | null
          status?: string | null
          document_url?: string | null
          seller_status?: string | null
          buyer_status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          transaction_id?: string | null
          envelope_id?: string | null
          status?: string | null
          document_url?: string | null
          seller_status?: string | null
          buyer_status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "docusign_agreements_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "ticket_transfers"
            referencedColumns: ["id"]
          }
        ]
      }
      email_notifications: {
        Row: {
          id: string
          transaction_id: string | null
          recipient_id: string | null
          email_type: string
          status: string | null
          message_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          transaction_id?: string | null
          recipient_id?: string | null
          email_type: string
          status?: string | null
          message_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          transaction_id?: string | null
          recipient_id?: string | null
          email_type?: string
          status?: string | null
          message_id?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_notifications_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "ticket_transfers"
            referencedColumns: ["id"]
          }
        ]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
