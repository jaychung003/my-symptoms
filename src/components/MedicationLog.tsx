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
  const [showLogForm, setShowLogForm] = useState(false)
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [frequency, setFrequency] = useState('')
  const [color, setColor] = useState(MED_COLORS[0])
  const [selectedMed, setSelectedMed] = useState('')
  const [logNotes, setLogNotes] = useState('')
  const [logTime, setLogTime] = useState(() => {
    const now = new Date()
    return `${format(now, 'yyyy-MM-dd')}T${format(now, 'HH:mm')}`
  })

  const todayLogs = logs.filter(l => isToday(parseISO(l.timestamp)))

  function handleAddMed(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onAddMedication({
      id: crypto.randomUUID(),
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      color,
    })
    setName('')
    setDosage('')
    setFrequency('')
    setColor(MED_COLORS[0])
    setShowMedForm(false)
  }

  function handleLogDose(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedMed) return
    onLogDose({
      id: crypto.randomUUID(),
      medicationId: selectedMed,
      timestamp: new Date(logTime).toISOString(),
      notes: logNotes,
    })
    setLogNotes('')
    setShowLogForm(false)
  }

  function getMedName(id: string) {
    return medications.find(m => m.id === id)?.name ?? 'Unknown'
  }

  function getMed(id: string) {
    return medications.find(m => m.id === id)
  }

  function takenToday(medId: string) {
    return todayLogs.some(l => l.medicationId === medId)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Medications</h2>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm flex items-center gap-1" onClick={() => setShowMedForm(v => !v)}>
            <Plus size={14} /> Add Med
          </button>
          {medications.length > 0 && (
            <button className="btn-primary text-sm flex items-center gap-1" onClick={() => setShowLogForm(v => !v)}>
              <Check size={14} /> Log Dose
            </button>
          )}
        </div>
      </div>

      {/* Today's medication checklist */}
      {medications.length > 0 && (
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Today's medications</p>
          <div className="space-y-2">
            {medications.map(med => {
              const taken = takenToday(med.id)
              const todayCount = todayLogs.filter(l => l.medicationId === med.id).length
              return (
                <div key={med.id} className={`flex items-center gap-3 p-2 rounded-lg ${taken ? 'bg-green-50' : 'bg-slate-50'}`}>
                  <div className={`w-8 h-8 rounded-full ${med.color} flex items-center justify-center shrink-0`}>
                    <Pill size={14} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{med.name}</p>
                    {med.dosage && <p className="text-xs text-slate-500">{med.dosage} · {med.frequency}</p>}
                  </div>
                  {taken ? (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <Check size={12} /> {todayCount}x taken
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Not yet</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add medication form */}
      {showMedForm && (
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-3">Add Medication</h3>
          <form onSubmit={handleAddMed} className="space-y-3">
            <div>
              <label className="label">Medication Name *</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mesalamine" required />
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
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full ${c} transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : ''}`}
                  />
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

      {/* Log dose form */}
      {showLogForm && (
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-3">Log Dose</h3>
          <form onSubmit={handleLogDose} className="space-y-3">
            <div>
              <label className="label">Medication *</label>
              <select className="input" value={selectedMed} onChange={e => setSelectedMed(e.target.value)} required>
                <option value="">Select medication...</option>
                {medications.map(m => (
                  <option key={m.id} value={m.id}>{m.name} {m.dosage}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Time</label>
              <input type="datetime-local" className="input" value={logTime} onChange={e => setLogTime(e.target.value)} />
            </div>
            <div>
              <label className="label">Notes</label>
              <input className="input" value={logNotes} onChange={e => setLogNotes(e.target.value)} placeholder="Optional notes..." />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setShowLogForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Log</button>
            </div>
          </form>
        </div>
      )}

      {/* Medication management */}
      {medications.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Manage medications</p>
          <div className="space-y-2">
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
        </div>
      )}

      {medications.length === 0 && (
        <p className="text-center text-slate-400 py-8">No medications added yet.</p>
      )}

      {/* Recent dose log */}
      {logs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Recent doses</p>
          <div className="space-y-2">
            {logs
              .slice()
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 20)
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
                      {log.notes && <p className="text-xs text-slate-400 italic">{log.notes}</p>}
                    </div>
                    <button onClick={() => onDeleteLog(log.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
