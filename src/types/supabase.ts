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
      docusign_agreements: {
        Row: {
          buyer_status: string | null
          created_at: string | null
          document_url: string | null
          envelope_id: string | null
          id: string
          seller_status: string | null
          status: string | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_status?: string | null
          created_at?: string | null
          document_url?: string | null
          envelope_id?: string | null
          id?: string
          seller_status?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_status?: string | null
          created_at?: string | null
          document_url?: string | null
          envelope_id?: string | null
          id?: string
          seller_status?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "docusign_agreements_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "ticket_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notifications: {
        Row: {
          created_at: string | null
          email_type: string
          id: string
          message_id: string | null
          recipient_id: string | null
          status: string | null
          transaction_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_type: string
          id?: string
          message_id?: string | null
          recipient_id?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_type?: string
          id?: string
          message_id?: string | null
          recipient_id?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_notifications_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "ticket_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string
          event_name: string
          id: string
          image_url: string | null
          location: string
          payment_methods: string[]
          price: number
          quantity: number
          row: string | null
          seats: string | null
          section: string | null
          seller_id: string
          status: string | null
          updated_at: string | null
          venue: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date: string
          event_name: string
          id?: string
          image_url?: string | null
          location: string
          payment_methods: string[]
          price: number
          quantity: number
          row?: string | null
          seats?: string | null
          section?: string | null
          seller_id: string
          status?: string | null
          updated_at?: string | null
          venue: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_name?: string
          id?: string
          image_url?: string | null
          location?: string
          payment_methods?: string[]
          price?: number
          quantity?: number
          row?: string | null
          seats?: string | null
          section?: string | null
          seller_id?: string
          status?: string | null
          updated_at?: string | null
          venue?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_records: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_date: string | null
          payment_method: string
          status: string | null
          transaction_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_date?: string | null
          payment_method: string
          status?: string | null
          transaction_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_date?: string | null
          payment_method?: string
          status?: string | null
          transaction_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_records_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_transfers: {
        Row: {
          buyer_email: string | null
          buyer_id: string | null
          buyer_name: string | null
          contract_id: string
          created_at: string | null
          event_date: string
          event_name: string
          event_time: string | null
          expiration_time: string | null
          id: string
          payment_method: string | null
          payment_verified: boolean | null
          price: number
          seat_details: string | null
          seller_email: string | null
          seller_id: string | null
          seller_name: string | null
          status: string
          ticket_notes: string | null
          ticket_provider: string | null
          ticket_quantity: number
          ticket_row: string | null
          ticket_seat: string | null
          ticket_section: string | null
          tickets_verified: boolean | null
          time_remaining: number | null
          updated_at: string | null
          venue: string
        }
        Insert: {
          buyer_email?: string | null
          buyer_id?: string | null
          buyer_name?: string | null
          contract_id: string
          created_at?: string | null
          event_date: string
          event_name: string
          event_time?: string | null
          expiration_time?: string | null
          id?: string
          payment_method?: string | null
          payment_verified?: boolean | null
          price: number
          seat_details?: string | null
          seller_email?: string | null
          seller_id?: string | null
          seller_name?: string | null
          status?: string
          ticket_notes?: string | null
          ticket_provider?: string | null
          ticket_quantity?: number
          ticket_row?: string | null
          ticket_seat?: string | null
          ticket_section?: string | null
          tickets_verified?: boolean | null
          time_remaining?: number | null
          updated_at?: string | null
          venue: string
        }
        Update: {
          buyer_email?: string | null
          buyer_id?: string | null
          buyer_name?: string | null
          contract_id?: string
          created_at?: string | null
          event_date?: string
          event_name?: string
          event_time?: string | null
          expiration_time?: string | null
          id?: string
          payment_method?: string | null
          payment_verified?: boolean | null
          price?: number
          seat_details?: string | null
          seller_email?: string | null
          seller_id?: string | null
          seller_name?: string | null
          status?: string
          ticket_notes?: string | null
          ticket_provider?: string | null
          ticket_quantity?: number
          ticket_row?: string | null
          ticket_seat?: string | null
          ticket_section?: string | null
          tickets_verified?: boolean | null
          time_remaining?: number | null
          updated_at?: string | null
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_transfers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_transfers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          buyer_id: string
          contract_id: string
          created_at: string | null
          event_date: string
          event_name: string
          expiration_time: string | null
          id: string
          listing_id: string | null
          payment_method: string
          payment_verified: boolean | null
          price: number
          seat_details: string | null
          seller_id: string
          status: string | null
          ticket_quantity: number
          tickets_verified: boolean | null
          time_remaining: number | null
          updated_at: string | null
          venue: string
        }
        Insert: {
          buyer_id: string
          contract_id: string
          created_at?: string | null
          event_date: string
          event_name: string
          expiration_time?: string | null
          id?: string
          listing_id?: string | null
          payment_method: string
          payment_verified?: boolean | null
          price: number
          seat_details?: string | null
          seller_id: string
          status?: string | null
          ticket_quantity: number
          tickets_verified?: boolean | null
          time_remaining?: number | null
          updated_at?: string | null
          venue: string
        }
        Update: {
          buyer_id?: string
          contract_id?: string
          created_at?: string | null
          event_date?: string
          event_name?: string
          expiration_time?: string | null
          id?: string
          listing_id?: string | null
          payment_method?: string
          payment_verified?: boolean | null
          price?: number
          seat_details?: string | null
          seller_id?: string
          status?: string | null
          ticket_quantity?: number
          tickets_verified?: boolean | null
          time_remaining?: number | null
          updated_at?: string | null
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_user_if_not_exists: {
        Args: {
          user_id: string
          user_email: string
          user_name: string
          user_avatar: string
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
