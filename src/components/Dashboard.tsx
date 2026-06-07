import { isToday, parseISO, subDays, format } from 'date-fns'
import { Activity, Droplets, Pill, Utensils, Moon, Dumbbell, AlertTriangle } from 'lucide-react'
import type { AppData, BristolScale, BloodLevel } from '../types'

const BRISTOL_COLOR: Record<BristolScale, string> = {
  1: 'bg-amber-900 text-white', 2: 'bg-amber-700 text-white', 3: 'bg-amber-600 text-white',
  4: 'bg-green-600 text-white', 5: 'bg-yellow-500 text-white', 6: 'bg-orange-500 text-white',
  7: 'bg-red-500 text-white',
}

const BLOOD_ORDER: BloodLevel[] = ['none', 'trace', 'mild', 'moderate', 'severe']
const BLOOD_DOT: Record<BloodLevel, string> = {
  none: 'bg-slate-300', trace: 'bg-pink-300', mild: 'bg-red-300',
  moderate: 'bg-red-500', severe: 'bg-red-700',
}
const BLOOD_LABEL: Record<BloodLevel, string> = {
  none: '–', trace: 'Trace', mild: 'Mild', moderate: 'Mod', severe: 'Sev',
}

function painTextColor(p: number) {
  if (p === 0) return 'text-slate-400'
  if (p <= 3) return 'text-green-600'
  if (p <= 6) return 'text-amber-500'
  return 'text-red-500'
}

function StatCard({
  icon: Icon, label, value, sub, color, alert,
}: {
  icon: React.ElementType; label: string; value: string | number
  sub?: string; color: string; alert?: boolean
}) {
  return (
    <div className={`card flex items-center gap-3 ${alert ? 'border-red-200 bg-red-50' : ''}`}>
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-lg font-bold text-slate-800">{value}</p>
        {sub && <p className="text-xs text-slate-500">{sub}</p>}
      </div>
      {alert && <AlertTriangle size={16} className="text-red-400 ml-auto" />}
    </div>
  )
}

interface Props {
  data: AppData
  onTabChange: (tab: string) => void
}

export default function Dashboard({ data, onTabChange }: Props) {
  const today = new Date()
  const todayBMs = data.bowelMovements.filter(e => isToday(parseISO(e.timestamp)))
  const todayFood = data.foodEntries.filter(e => isToday(parseISO(e.timestamp)))
  const todayMedLogs = data.medicationLogs.filter(l => isToday(parseISO(l.timestamp)))
  const todayWorkouts = data.workoutEntries.filter(e => isToday(parseISO(e.timestamp)))

  const lastSleep = data.sleepEntries.sort((a, b) => b.date.localeCompare(a.date))[0]
  const hasBloodToday = todayBMs.some(e => e.bloodLevel !== 'none')
  const avgPainToday = todayBMs.length > 0
    ? (todayBMs.reduce((s, e) => s + e.painLevel, 0) / todayBMs.length).toFixed(1)
    : '—'
  const riskyFoodCount = todayFood.filter(e => e.risk === 'risky').length

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i)
    const dateStr = format(d, 'yyyy-MM-dd')
    const bms = data.bowelMovements.filter(e => e.timestamp.startsWith(dateStr))
    const avgPain = bms.length > 0 ? bms.reduce((s, e) => s + e.painLevel, 0) / bms.length : null
    const worstBlood = bms.length > 0
      ? bms.reduce<BloodLevel>((worst, e) =>
          BLOOD_ORDER.indexOf(e.bloodLevel) > BLOOD_ORDER.indexOf(worst) ? e.bloodLevel : worst,
          'none')
      : null
    const bristols = bms
      .slice().sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(e => e.bristolScale)
    return { d, label: format(d, 'EEE'), isToday: i === 6, count: bms.length, avgPain, worstBlood, bristols }
  })
  const maxCount = Math.max(...last7.map(d => d.count), 1)
  const anyData = last7.some(d => d.count > 0)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Today's Overview</h2>
        <p className="text-sm text-slate-500">{format(today, 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button className="text-left" onClick={() => onTabChange('bowel')}>
          <StatCard icon={Activity} label="Bowel Movements" value={todayBMs.length}
            sub={`Avg pain: ${avgPainToday}`} color={todayBMs.length >= 6 ? 'bg-red-500' : 'bg-sky-500'} alert={hasBloodToday} />
        </button>
        <button className="text-left" onClick={() => onTabChange('medications')}>
          <StatCard icon={Pill} label="Doses Taken" value={todayMedLogs.length}
            sub={`of ${data.medications.length} medication${data.medications.length !== 1 ? 's' : ''}`} color="bg-violet-500" />
        </button>
        <button className="text-left" onClick={() => onTabChange('food')}>
          <StatCard icon={Utensils} label="Foods Logged" value={todayFood.length}
            sub={riskyFoodCount > 0 ? `${riskyFoodCount} risky` : 'No risky foods'} color="bg-emerald-500" alert={riskyFoodCount > 0} />
        </button>
        <button className="text-left" onClick={() => onTabChange('sleep')}>
          <StatCard icon={Moon} label="Last Sleep" value={lastSleep ? `${lastSleep.hours}h` : '—'}
            sub={lastSleep ? lastSleep.quality : 'Not logged'} color="bg-indigo-500" />
        </button>
        <button className="text-left col-span-2 sm:col-span-1" onClick={() => onTabChange('workout')}>
          <StatCard icon={Dumbbell} label="Workout"
            value={todayWorkouts.length > 0 ? `${todayWorkouts.reduce((s, e) => s + e.duration, 0)} min` : 'Rest day'}
            sub={todayWorkouts.length > 0 ? todayWorkouts.map(w => w.type).join(', ') : ''} color="bg-orange-500" />
        </button>
      </div>

      {/* 7-day BM trend */}
      <div className="card">
        <p className="text-sm font-semibold text-slate-600 mb-3">Bowel Movements — Last 7 Days</p>
        {!anyData ? (
          <p className="text-sm text-slate-400 text-center py-2">No data yet.</p>
        ) : (
          <>
            {/* Bar chart */}
            <div className="flex items-end gap-1 mb-3" style={{ height: '56px' }}>
              {last7.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex items-end justify-center" style={{ height: '48px' }}>
                    <div
                      className={`w-full rounded-t transition-all ${d.isToday ? 'bg-sky-500' : 'bg-sky-200'}`}
                      style={{ height: d.count > 0 ? `${(d.count / maxCount) * 48}px` : '2px' }}
                    />
                  </div>
                  <span className={`text-xs mt-1 ${d.isToday ? 'font-semibold text-sky-600' : 'text-slate-400'}`}>
                    {d.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Per-day detail rows */}
            <div className="border-t border-slate-100 pt-3 space-y-2.5">
              {last7.filter(d => d.count > 0).reverse().map((d, i) => (
                <div key={i} className="space-y-1">
                  {/* Date + count */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${d.isToday ? 'text-sky-600' : 'text-slate-600'}`}>
                      {d.isToday ? 'Today' : format(d.d, 'EEE, MMM d')}
                    </span>
                    <span className="text-xs text-slate-500">{d.count} BM{d.count !== 1 ? 's' : ''}</span>
                  </div>
                  {/* Metrics row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Bristol chips */}
                    <div className="flex gap-1 flex-wrap">
                      {d.bristols.map((s, j) => (
                        <span key={j} className={`px-1.5 py-0.5 rounded text-xs font-bold ${BRISTOL_COLOR[s]}`}>
                          T{s}
                        </span>
                      ))}
                    </div>
                    {/* Pain */}
                    {d.avgPain !== null && (
                      <span className={`text-xs font-medium ${painTextColor(d.avgPain)}`}>
                        Pain {d.avgPain.toFixed(1)}
                      </span>
                    )}
                    {/* Blood */}
                    {d.worstBlood !== null && (
                      <span className="flex items-center gap-1 text-xs">
                        <Droplets size={11} className={d.worstBlood === 'none' ? 'text-slate-300' : 'text-red-400'} />
                        <span className={d.worstBlood === 'none' ? 'text-slate-400' : 'text-red-500 font-medium'}>
                          {d.worstBlood === 'none' ? 'No blood' : BLOOD_LABEL[d.worstBlood]}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Alerts */}
      {(hasBloodToday || riskyFoodCount > 0) && (
        <div className="card border-amber-200 bg-amber-50">
          <p className="text-sm font-semibold text-amber-800 mb-1 flex items-center gap-1">
            <AlertTriangle size={14} /> Alerts
          </p>
          <ul className="space-y-1">
            {hasBloodToday && (
              <li className="text-sm text-amber-700 flex items-center gap-1.5">
                <Droplets size={12} className="text-red-500" />
                Blood detected in today's bowel movements
              </li>
            )}
            {riskyFoodCount > 0 && (
              <li className="text-sm text-amber-700">
                {riskyFoodCount} potentially risky food item{riskyFoodCount > 1 ? 's' : ''} consumed today
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
