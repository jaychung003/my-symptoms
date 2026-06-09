import { useState } from 'react'
import { format, parseISO, isToday, subMinutes, subHours } from 'date-fns'
import { Pill, Plus, Trash2, Check, Clock } from 'lucide-react'
import type { Medication, MedicationLog } from '../types'

const MED_COLORS = [
  'bg-sky-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500', 'bg-teal-500', 'bg-indigo-500', 'bg-orange-500',
]

const TIME_SHORTCUTS = [
  { label: 'Now',     offset: () => new Date() },
  { label: '15m ago', offset: () => subMinutes(new Date(), 15) },
  { label: '30m ago', offset: () => subMinutes(new Date(), 30) },
  { label: '1hr ago', offset: () => subHours(new Date(), 1) },
]

function toTimeInput(d: Date) { return format(d, 'HH:mm') }
function toDateInput(d: Date) { return format(d, 'yyyy-MM-dd') }

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
  const [justLogged, setJustLogged] = useState<Set<string>>(new Set())

  // Time picker state
  const [showTimePicker, setShowTimePicker] = useState<string | null>(null)
  const [pickerTime, setPickerTime] = useState('')
  const [pickerDate, setPickerDate] = useState('')
  const [activeShortcut, setActiveShortcut] = useState<number | null>(null)

  const todayLogs = logs.filter(l => isToday(parseISO(l.timestamp)))

  function flashMed(medId: string) {
    setJustLogged(prev => new Set(prev).add(medId))
    setTimeout(() => setJustLogged(prev => { const s = new Set(prev); s.delete(medId); return s }), 1200)
  }

  function logNow(medId: string) {
    onLogDose({
      id: crypto.randomUUID(),
      medicationId: medId,
      timestamp: new Date().toISOString(),
      notes: '',
    })
    flashMed(medId)
  }

  function openTimePicker(medId: string) {
    const now = new Date()
    setShowTimePicker(medId)
    setPickerTime(toTimeInput(now))
    setPickerDate(toDateInput(now))
    setActiveShortcut(0)
  }

  function logWithTime(medId: string) {
    if (!pickerTime || !pickerDate) return
    const ts = new Date(`${pickerDate}T${pickerTime}`).toISOString()
    onLogDose({
      id: crypto.randomUUID(),
      medicationId: medId,
      timestamp: ts,
      notes: '',
    })
    setShowTimePicker(null)
    flashMed(medId)
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

      {medications.length === 0 && !showMedForm && (
        <p className="text-center text-slate-400 py-8">No medications added yet.</p>
      )}

      {medications.length > 0 && (
        <div className="space-y-2">
          {medications.map(med => {
            const count = todayCount(med.id)
            const lastTime = lastTakenToday(med.id)
            const flash = justLogged.has(med.id)
            const pickerOpen = showTimePicker === med.id
            return (
              <div
                key={med.id}
                className={`card transition-all ${flash ? 'bg-green-50 border-green-300' : count > 0 ? 'bg-slate-50' : 'bg-white'}`}
              >
                {/* Main tap row */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => { if (!pickerOpen) logNow(med.id) }}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!pickerOpen) logNow(med.id) } }}
                  className="flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform select-none"
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
                    {!lastTime && !pickerOpen && (
                      <p className="text-xs text-slate-400 mt-0.5">Tap to log now</p>
                    )}
                  </div>
                  {/* Right side: check circle + clock */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        pickerOpen ? setShowTimePicker(null) : openTimePicker(med.id)
                      }}
                      className={`p-1.5 rounded-full transition-colors ${pickerOpen ? 'text-sky-500 bg-sky-50' : 'text-slate-300 hover:text-sky-500'}`}
                      title="Log at a different time"
                    >
                      <Clock size={15} />
                    </button>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                      count > 0 ? 'bg-green-500 border-green-500' : 'bg-white border-slate-200'
                    }`}>
                      <Check size={16} className={count > 0 ? 'text-white' : 'text-slate-300'} strokeWidth={3} />
                    </div>
                  </div>
                </div>

                {/* Inline time picker */}
                {pickerOpen && (
                  <div className="border-t border-slate-100 pt-3 mt-3 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">When was it taken?</p>
                    {/* Shortcuts */}
                    <div className="flex gap-1.5 flex-wrap">
                      {TIME_SHORTCUTS.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            const d = s.offset()
                            setPickerTime(toTimeInput(d))
                            setPickerDate(toDateInput(d))
                            setActiveShortcut(i)
                          }}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                            activeShortcut === i
                              ? 'bg-sky-500 border-sky-500 text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                    {/* Time input */}
                    <input
                      type="time"
                      className="input text-sm py-1"
                      value={pickerTime}
                      onChange={e => { setPickerTime(e.target.value); setActiveShortcut(null) }}
                    />
                    {/* Different day */}
                    <details className="text-xs">
                      <summary className="cursor-pointer text-slate-400 hover:text-slate-600 select-none">Different day?</summary>
                      <input
                        type="date"
                        className="input text-sm py-1 mt-1"
                        value={pickerDate}
                        max={toDateInput(new Date())}
                        onChange={e => setPickerDate(e.target.value)}
                      />
                    </details>
                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                      <button type="button" className="btn-secondary text-xs" onClick={() => setShowTimePicker(null)}>
                        Cancel
                      </button>
                      <button type="button" className="btn-primary text-xs" onClick={() => logWithTime(med.id)}>
                        Log
                      </button>
                    </div>
                  </div>
                )}
              </div>
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

      {/* Recent dose log grouped by day */}
      {logs.length > 0 && (
        <details>
          <summary className="text-xs font-semibold text-slate-400 uppercase tracking-wide cursor-pointer select-none hover:text-slate-600">
            Dose history
          </summary>
          <div className="space-y-3 mt-2">
            {(() => {
              const todayKey = format(new Date(), 'yyyy-MM-dd')
              const groups = new Map<string, typeof logs>()
              logs
                .slice()
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 60)
                .forEach(log => {
                  const key = format(parseISO(log.timestamp), 'yyyy-MM-dd')
                  if (!groups.has(key)) groups.set(key, [])
                  groups.get(key)!.push(log)
                })
              return Array.from(groups.entries()).map(([dateKey, dayLogs]) => (
                <div key={dateKey}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                    {dateKey === todayKey ? 'Today' : format(parseISO(dateKey), 'EEE, MMM d')}
                  </p>
                  <div className="space-y-2">
                    {dayLogs.map(log => {
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
                            <p className="text-xs text-slate-500">{format(parseISO(log.timestamp), 'h:mm a')}</p>
                          </div>
                          <button onClick={() => onDeleteLog(log.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            })()}
          </div>
        </details>
      )}
    </div>
  )
}
