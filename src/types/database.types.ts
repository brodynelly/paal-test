export interface Database {
  public: {
    Tables: {
      pig_group: {
        Row: {
          group_id: number
          stall_id: number | null
          farm_id: number | null
          special: string | null
        }
        Insert: {
          group_id: number
          stall_id?: number | null
          farm_id?: number | null
          special?: string | null
        }
        Update: {
          group_id?: number
          stall_id?: number | null
          farm_id?: number | null
          special?: string | null
        }
      }
      pig: {
        Row: {
          pig_id: number
          group_id: number
          breed: string | null
          age: number | null
          parity: number | null
          insertion_time: string
          last_update_time: string
        }
        Insert: {
          pig_id: number
          group_id: number
          breed?: string | null
          age?: number | null
          parity?: number | null
          insertion_time?: string
          last_update_time?: string
        }
        Update: {
          pig_id?: number
          group_id?: number
          breed?: string | null
          age?: number | null
          parity?: number | null
          insertion_time?: string
          last_update_time?: string
        }
      }
      bcs_data: {
        Row: {
          record_id: number
          pig_id: number
          bcs_score: number
          timestamp_info: string | null
        }
        Insert: {
          record_id?: number
          pig_id: number
          bcs_score: number
          timestamp_info?: string | null
        }
        Update: {
          record_id?: number
          pig_id?: number
          bcs_score?: number
          timestamp_info?: string | null
        }
      }
      posture: {
        Row: {
          record_id: number
          pig_id: number
          posture: number
          timestamp_info: string | null
        }
        Insert: {
          record_id?: number
          pig_id: number
          posture: number
          timestamp_info?: string | null
        }
        Update: {
          record_id?: number
          pig_id?: number
          posture?: number
          timestamp_info?: string | null
        }
      }
      devices: {
        Row: {
          device_id: number
          device_name: string
          device_type: string | null
          insertion_time: string
        }
        Insert: {
          device_id?: number
          device_name: string
          device_type?: string | null
          insertion_time?: string
        }
        Update: {
          device_id?: number
          device_name?: string
          device_type?: string | null
          insertion_time?: string
        }
      }
      device_sens_data: {
        Row: {
          record_id: number
          device_id: number
          temperature: number
          entry_time: string
        }
        Insert: {
          record_id?: number
          device_id: number
          temperature: number
          entry_time?: string
        }
        Update: {
          record_id?: number
          device_id?: number
          temperature?: number
          entry_time?: string
        }
      }
    }
  }
}