import { useState, useEffect } from 'react'
import { Activity, Pill, Utensils, Moon, Dumbbell, LayoutDashboard } from 'lucide-react'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { AppData, BowelMovement, Medication, MedicationLog, FoodEntry, SleepEntry, WorkoutEntry } from './types'
import Dashboard from './components/Dashboard'
import BowelLog from './components/BowelLog'
import MedicationLogView from './components/MedicationLog'
import FoodLog from './components/FoodLog'
import SleepLog from './components/SleepLog'
import WorkoutLog from './components/WorkoutLog'

const INITIAL_DATA: AppData = {
  bowelMovements: [],
  medications: [],
  medicationLogs: [],
  foodEntries: [],
  sleepEntries: [],
  workoutEntries: [],
}

const TABS = [
  { id: 'bowel', label: 'BMs', Icon: Activity },
  { id: 'medications', label: 'Meds', Icon: Pill },
  { id: 'food', label: 'Food', Icon: Utensils },
  { id: 'sleep', label: 'Sleep', Icon: Moon },
  { id: 'workout', label: 'Workout', Icon: Dumbbell },
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
]

export default function App() {
  const [data, setData] = useLocalStorage<AppData>('ibd-tracker-v1', INITIAL_DATA)

  const VALID_TABS = TABS.map(t => t.id)
  function tabFromHash() {
    const hash = window.location.hash.replace('#', '')
    return VALID_TABS.includes(hash) ? hash : 'bowel'
  }
  const [activeTab, setActiveTab] = useState(tabFromHash)

  useEffect(() => {
    const onHashChange = () => setActiveTab(tabFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  function navigate(tab: string) {
    window.location.hash = tab
    setActiveTab(tab)
  }

  function update<K extends keyof AppData>(key: K, value: AppData[K]) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  function addBM(entry: BowelMovement) {
    update('bowelMovements', [...data.bowelMovements, entry])
  }
  function deleteBM(id: string) {
    update('bowelMovements', data.bowelMovements.filter(e => e.id !== id))
  }

  function addMedication(med: Medication) {
    update('medications', [...data.medications, med])
  }
  function deleteMedication(id: string) {
    update('medications', data.medications.filter(m => m.id !== id))
    update('medicationLogs', data.medicationLogs.filter(l => l.medicationId !== id))
  }

  function addMedLog(log: MedicationLog) {
    update('medicationLogs', [...data.medicationLogs, log])
  }
  function deleteMedLog(id: string) {
    update('medicationLogs', data.medicationLogs.filter(l => l.id !== id))
  }

  function addFood(entry: FoodEntry) {
    update('foodEntries', [...data.foodEntries, entry])
  }
  function deleteFood(id: string) {
    update('foodEntries', data.foodEntries.filter(e => e.id !== id))
  }

  function addSleep(entry: SleepEntry) {
    update('sleepEntries', [...data.sleepEntries, entry])
  }
  function deleteSleep(id: string) {
    update('sleepEntries', data.sleepEntries.filter(e => e.id !== id))
  }

  function addWorkout(entry: WorkoutEntry) {
    update('workoutEntries', [...data.workoutEntries, entry])
  }
  function deleteWorkout(id: string) {
    update('workoutEntries', data.workoutEntries.filter(e => e.id !== id))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-none">IBD Tracker</h1>
              <p className="text-xs text-slate-400 leading-none mt-0.5">Symptom Journal</p>
            </div>
          </div>
        </div>
        {/* Tab bar */}
        <div className="max-w-2xl mx-auto px-2 flex overflow-x-auto gap-0 border-t border-slate-100 no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 transition-colors whitespace-nowrap min-w-[56px] text-xs ${
                activeTab === tab.id ? 'tab-active' : 'tab-inactive'
              }`}
            >
              <tab.Icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-5 pb-24">
        {activeTab === 'dashboard' && (
          <Dashboard data={data} onTabChange={navigate} />
        )}
        {activeTab === 'bowel' && (
          <BowelLog
            entries={data.bowelMovements}
            onAdd={addBM}
            onDelete={deleteBM}
          />
        )}
        {activeTab === 'medications' && (
          <MedicationLogView
            medications={data.medications}
            logs={data.medicationLogs}
            onAddMedication={addMedication}
            onDeleteMedication={deleteMedication}
            onLogDose={addMedLog}
            onDeleteLog={deleteMedLog}
          />
        )}
        {activeTab === 'food' && (
          <FoodLog
            entries={data.foodEntries}
            onAdd={addFood}
            onDelete={deleteFood}
          />
        )}
        {activeTab === 'sleep' && (
          <SleepLog
            entries={data.sleepEntries}
            onAdd={addSleep}
            onDelete={deleteSleep}
          />
        )}
        {activeTab === 'workout' && (
          <WorkoutLog
            entries={data.workoutEntries}
            onAdd={addWorkout}
            onDelete={deleteWorkout}
          />
        )}
      </main>
    </div>
  )
}
