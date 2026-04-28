export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      citas: {
        Row: {
          cliente_id: string
          created_at: string
          estado: string
          fecha_hora: string
          id: string
          medio_reserva: string
          notas: string | null
          profesional: string | null
          recordatorio_24h_enviado: boolean
          servicio_id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          estado?: string
          fecha_hora: string
          id?: string
          medio_reserva: string
          notas?: string | null
          profesional?: string | null
          recordatorio_24h_enviado?: boolean
          servicio_id: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          estado?: string
          fecha_hora?: string
          id?: string
          medio_reserva?: string
          notas?: string | null
          profesional?: string | null
          recordatorio_24h_enviado?: boolean
          servicio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "citas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citas_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nombre_completo: string
          telefono: string
          telegram_chat_id: number | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          nombre_completo: string
          telefono: string
          telegram_chat_id?: number | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nombre_completo?: string
          telefono?: string
          telegram_chat_id?: number | null
        }
        Relationships: []
      }
      errors_log: {
        Row: {
          created_at: string
          error: string
          id: string
          payload: Json | null
          workflow: string
        }
        Insert: {
          created_at?: string
          error: string
          id?: string
          payload?: Json | null
          workflow: string
        }
        Update: {
          created_at?: string
          error?: string
          id?: string
          payload?: Json | null
          workflow?: string
        }
        Relationships: []
      }
      servicios: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          duracion_minutos: number
          id: string
          imagen_url: string | null
          nombre: string
          precio: number
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          duracion_minutos: number
          id?: string
          imagen_url?: string | null
          nombre: string
          precio: number
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          duracion_minutos?: number
          id?: string
          imagen_url?: string | null
          nombre?: string
          precio?: number
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
