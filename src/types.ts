export type BristolScale = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type BloodLevel = 'none' | 'trace' | 'mild' | 'moderate' | 'severe'

export type PainLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export interface BowelMovement {
  id: string
  timestamp: string // ISO string
  bristolScale: BristolScale
  bloodLevel: BloodLevel
  painLevel: PainLevel
  urgency: boolean
  notes: string
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  color: string
}

export interface MedicationLog {
  id: string
  medicationId: string
  timestamp: string
  notes: string
}

export type FoodRisk = 'safe' | 'caution' | 'risky'

export interface FoodEntry {
  id: string
  timestamp: string
  name: string
  risk: FoodRisk
  category: string
  notes: string
}

export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent'

export interface SleepEntry {
  id: string
  date: string // YYYY-MM-DD
  bedtime: string // HH:MM
  wakeTime: string // HH:MM
  hours: number
  quality: SleepQuality
  interruptions: number
  notes: string
}

export type WorkoutIntensity = 'light' | 'moderate' | 'intense'

export interface WorkoutEntry {
  id: string
  timestamp: string
  type: string
  duration: number // minutes
  intensity: WorkoutIntensity
  notes: string
}

export interface AppData {
  bowelMovements: BowelMovement[]
  medications: Medication[]
  medicationLogs: MedicationLog[]
  foodEntries: FoodEntry[]
  sleepEntries: SleepEntry[]
  workoutEntries: WorkoutEntry[]
}
