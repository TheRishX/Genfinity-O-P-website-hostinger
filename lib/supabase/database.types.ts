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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      consent_records: {
        Row: {
          accepted_at: string
          consent_type: string
          id: string
          intake_id: string
          ip_hash: string
          packet_version: string
          signature_mode: string
          signer_relationship: string
          text_hash: string
          user_agent: string
        }
        Insert: {
          accepted_at: string
          consent_type: string
          id?: string
          intake_id: string
          ip_hash: string
          packet_version: string
          signature_mode: string
          signer_relationship: string
          text_hash: string
          user_agent: string
        }
        Update: {
          accepted_at?: string
          consent_type?: string
          id?: string
          intake_id?: string
          ip_hash?: string
          packet_version?: string
          signature_mode?: string
          signer_relationship?: string
          text_hash?: string
          user_agent?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_amendments: {
        Row: {
          auth_tag: string
          changed_fields: string[]
          ciphertext: string
          created_at: string
          created_by: string
          id: string
          intake_id: string
          iv: string
          reason: string
        }
        Insert: {
          auth_tag: string
          changed_fields: string[]
          ciphertext: string
          created_at?: string
          created_by: string
          id?: string
          intake_id: string
          iv: string
          reason: string
        }
        Update: {
          auth_tag?: string
          changed_fields?: string[]
          ciphertext?: string
          created_at?: string
          created_by?: string
          id?: string
          intake_id?: string
          iv?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_amendments_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_audit_events: {
        Row: {
          action: string
          actor_id: string | null
          changed_fields: string[]
          created_at: string
          id: number
          intake_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          changed_fields?: string[]
          created_at?: string
          id?: never
          intake_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          changed_fields?: string[]
          created_at?: string
          id?: never
          intake_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intake_audit_events_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_drafts: {
        Row: {
          auth_tag: string
          ciphertext: string
          created_at: string
          current_step: number
          expires_at: string
          id: string
          iv: string
          secret_hash: string
          updated_at: string
        }
        Insert: {
          auth_tag: string
          ciphertext: string
          created_at?: string
          current_step?: number
          expires_at?: string
          id?: string
          iv: string
          secret_hash: string
          updated_at?: string
        }
        Update: {
          auth_tag?: string
          ciphertext?: string
          created_at?: string
          current_step?: number
          expires_at?: string
          id?: string
          iv?: string
          secret_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      intake_search_tokens: {
        Row: {
          field: string
          patient_id: string
          token_hash: string
        }
        Insert: {
          field: string
          patient_id: string
          token_hash: string
        }
        Update: {
          field?: string
          patient_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_search_tokens_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_signatures: {
        Row: {
          created_at: string
          intake_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          intake_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          intake_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_signatures_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: true
            referencedRelation: "intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_submission_keys: {
        Row: {
          created_at: string
          expires_at: string
          key_hash: string
          reference_number: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          key_hash: string
          reference_number?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          key_hash?: string
          reference_number?: string | null
        }
        Relationships: []
      }
      intakes: {
        Row: {
          auth_tag: string
          ciphertext: string
          id: string
          iv: string
          packet_version: string
          patient_id: string
          reference_number: string
          signed_snapshot_hash: string
          status: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          auth_tag: string
          ciphertext: string
          id?: string
          iv: string
          packet_version: string
          patient_id: string
          reference_number: string
          signed_snapshot_hash: string
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          auth_tag?: string
          ciphertext?: string
          id?: string
          iv?: string
          packet_version?: string
          patient_id?: string
          reference_number?: string
          signed_snapshot_hash?: string
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intakes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      office_checklists: {
        Row: {
          checklist: Json
          clinician_notes: string
          intake_id: string
          ssn_last_four: string | null
          updated_at: string
        }
        Insert: {
          checklist?: Json
          clinician_notes?: string
          intake_id: string
          ssn_last_four?: string | null
          updated_at?: string
        }
        Update: {
          checklist?: Json
          clinician_notes?: string
          intake_id?: string
          ssn_last_four?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "office_checklists_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: true
            referencedRelation: "intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_password_resets: {
        Row: {
          created_at: string
          expires_at: string
          token_hash: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          token_hash: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          token_hash?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          auth_tag: string
          ciphertext: string
          created_at: string
          id: string
          iv: string
          updated_at: string
        }
        Insert: {
          auth_tag: string
          ciphertext: string
          created_at?: string
          id?: string
          iv: string
          updated_at?: string
        }
        Update: {
          auth_tag?: string
          ciphertext?: string
          created_at?: string
          id?: string
          iv?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
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
  public: {
    Enums: {},
  },
} as const
