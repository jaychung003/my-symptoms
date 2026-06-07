import { useState } from 'react'
import { format, parseISO, isToday } from 'date-fns'
import { Pill, Plus, Trash2, Check } from 'lucide-react'
import type { Medication, MedicationLog } from '../types'

const MED_COLORS = [
  'bg-sky-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500', 'bg-teal-500', 'bg-indigo-500', 'bg-orange-500',
]

interface Props {
  medications: Medication[]
  logs: MedicationLog[]
  onAddMedication: (med: Medication) => void
  onDeleteMedication: (id: string) => void
  onLogDose: (log: MedicationLog) => void
  onDeleteLog: (id: string) => void
}

export default function MedicationLog({ medications, logs, onAddMedication, onDeleteMedication, onLogDose, onDeleteLog }: Props) {
  const [showMedForm, setShowMedForm] = useState(false)
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [frequency, setFrequency] = useState('')
  const [color, setColor] = useState(MED_COLORS[0])
  // Track which med IDs were just tapped (for brief animation feedback)
  const [justLogged, setJustLogged] = useState<Set<string>>(new Set())

  const todayLogs = logs.filter(l => isToday(parseISO(l.timestamp)))

  function logNow(medId: string) {
    onLogDose({
      id: crypto.randomUUID(),
      medicationId: medId,
      timestamp: new Date().toISOString(),
      notes: '',
    })
    setJustLogged(prev => new Set(prev).add(medId))
    setTimeout(() => setJustLogged(prev => { const s = new Set(prev); s.delete(medId); return s }), 1200)
  }

  function handleAddMed(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onAddMedication({ id: crypto.randomUUID(), name: name.trim(), dosage: dosage.trim(), frequency: frequency.trim(), color })
    setName(''); setDosage(''); setFrequency(''); setColor(MED_COLORS[0]); setShowMedForm(false)
  }

  function getMed(id: string) { return medications.find(m => m.id === id) }
  function getMedName(id: string) { return getMed(id)?.name ?? 'Unknown' }
  function todayCount(medId: string) { return todayLogs.filter(l => l.medicationId === medId).length }
  function lastTakenToday(medId: string) {
    const entries = todayLogs.filter(l => l.medicationId === medId).sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    return entries[0] ? format(parseISO(entries[0].timestamp), 'h:mm a') : null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Medications</h2>
        <button className="btn-secondary text-sm flex items-center gap-1.5" onClick={() => setShowMedForm(v => !v)}>
          <Plus size={14} /> Add Med
        </button>
      </div>

      {/* One-tap log cards */}
      {medications.length === 0 && !showMedForm && (
        <p className="text-center text-slate-400 py-8">No medications added yet.</p>
      )}

      {medications.length > 0 && (
        <div className="space-y-2">
          {medications.map(med => {
            const count = todayCount(med.id)
            const lastTime = lastTakenToday(med.id)
            const flash = justLogged.has(med.id)
            return (
              <button
                key={med.id}
                type="button"
                onClick={() => logNow(med.id)}
                className={`w-full card flex items-center gap-3 text-left transition-all active:scale-95 ${
                  flash ? 'bg-green-50 border-green-300' : count > 0 ? 'bg-slate-50' : 'bg-white'
                }`}
              >
                {/* Color dot */}
                <div className={`w-11 h-11 rounded-full ${med.color} flex items-center justify-center shrink-0 transition-all ${flash ? 'scale-110' : ''}`}>
                  {flash
                    ? <Check size={20} className="text-white" strokeWidth={3} />
                    : <Pill size={18} className="text-white" />
                  }
                </div>
                {/* Name + info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{med.name}</p>
                  {(med.dosage || med.frequency) && (
                    <p className="text-xs text-slate-500">{[med.dosage, med.frequency].filter(Boolean).join(' · ')}</p>
                  )}
                  {lastTime && (
                    <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                      <Check size={10} />
                      {count > 1 ? `${count}× today · last at ${lastTime}` : `Taken at ${lastTime}`}
                    </p>
                  )}
                  {!lastTime && (
                    <p className="text-xs text-slate-400 mt-0.5">Tap to log now</p>
                  )}
                </div>
                {/* Big tap affordance */}
                <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  count > 0
                    ? 'bg-green-500 border-green-500'
                    : 'bg-white border-slate-200'
                }`}>
                  <Check size={16} className={count > 0 ? 'text-white' : 'text-slate-300'} strokeWidth={3} />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Add medication form */}
      {showMedForm && (
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-3">Add Medication</h3>
          <form onSubmit={handleAddMed} className="space-y-3">
            <div>
              <label className="label">Medication Name *</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mesalamine" autoFocus required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Dosage</label>
                <input className="input" value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g. 400mg" />
              </div>
              <div>
                <label className="label">Frequency</label>
                <input className="input" value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="e.g. 3x daily" />
              </div>
            </div>
            <div>
              <label className="label">Color</label>
              <div className="flex gap-2">
                {MED_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full ${c} transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : ''}`} />
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setShowMedForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Add</button>
            </div>
          </form>
        </div>
      )}

      {/* Manage (delete) */}
      {medications.length > 0 && (
        <details>
          <summary className="text-xs font-semibold text-slate-400 uppercase tracking-wide cursor-pointer select-none hover:text-slate-600">
            Manage medications
          </summary>
          <div className="space-y-2 mt-2">
            {medications.map(med => (
              <div key={med.id} className="card flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${med.color} flex items-center justify-center shrink-0`}>
                  <Pill size={14} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{med.name}</p>
                  {(med.dosage || med.frequency) && (
                    <p className="text-xs text-slate-500">{[med.dosage, med.frequency].filter(Boolean).join(' · ')}</p>
                  )}
                </div>
                <button onClick={() => onDeleteMedication(med.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Recent dose log */}
      {logs.length > 0 && (
        <details>
          <summary className="text-xs font-semibold text-slate-400 uppercase tracking-wide cursor-pointer select-none hover:text-slate-600">
            Dose history
          </summary>
          <div className="space-y-2 mt-2">
            {logs
              .slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 30)
              .map(log => {
                const med = getMed(log.medicationId)
                return (
                  <div key={log.id} className="card flex items-center gap-3">
                    {med && (
                      <div className={`w-7 h-7 rounded-full ${med.color} flex items-center justify-center shrink-0`}>
                        <Pill size={12} className="text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{getMedName(log.medicationId)}</p>
                      <p className="text-xs text-slate-500">{format(parseISO(log.timestamp), 'MMM d, h:mm a')}</p>
                    </div>
                    <button onClick={() => onDeleteLog(log.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}
          </div>
        </details>
      )}
    </div>
  )
}
