// Tipos generados desde el esquema de Supabase (proyecto Veterinaria).
// Regenerar tras cambios de esquema.

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "17.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          date: string
          id: string
          patient_id: string
          reason: string
          time: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          patient_id: string
          reason: string
          time: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          patient_id?: string
          reason?: string
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          created_at: string
          date: string
          diagnosis: string
          id: string
          patient_id: string
          symptoms: string
          treatment: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          date: string
          diagnosis?: string
          id?: string
          patient_id: string
          symptoms: string
          treatment?: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          diagnosis?: string
          id?: string
          patient_id?: string
          symptoms?: string
          treatment?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          admission_date: string
          age: number | null
          breed: string
          caretaker: string
          created_at: string
          discharge_date: string | null
          email: string
          id: string
          name: string
          phone: string
          species: Database["public"]["Enums"]["species"]
          symptoms: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          admission_date: string
          age?: number | null
          breed?: string
          caretaker: string
          created_at?: string
          discharge_date?: string | null
          email: string
          id?: string
          name: string
          phone?: string
          species?: Database["public"]["Enums"]["species"]
          symptoms: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          admission_date?: string
          age?: number | null
          breed?: string
          caretaker?: string
          created_at?: string
          discharge_date?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string
          species?: Database["public"]["Enums"]["species"]
          symptoms?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          done: boolean
          due_date: string
          id: string
          name: string
          patient_id: string
          type: Database["public"]["Enums"]["reminder_type"]
        }
        Insert: {
          created_at?: string
          done?: boolean
          due_date: string
          id?: string
          name: string
          patient_id: string
          type?: Database["public"]["Enums"]["reminder_type"]
        }
        Update: {
          created_at?: string
          done?: boolean
          due_date?: string
          id?: string
          name?: string
          patient_id?: string
          type?: Database["public"]["Enums"]["reminder_type"]
        }
        Relationships: [
          {
            foreignKeyName: "reminders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
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
      reminder_type: "vacuna" | "desparasitacion"
      species: "perro" | "gato" | "ave" | "conejo" | "roedor" | "reptil" | "otro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicTables = Database["public"]["Tables"]
export type Row<T extends keyof PublicTables> = PublicTables[T]["Row"]
export type Insert<T extends keyof PublicTables> = PublicTables[T]["Insert"]
export type Update<T extends keyof PublicTables> = PublicTables[T]["Update"]
