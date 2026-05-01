import { useState, useEffect, useRef } from 'react'
import { Upload } from 'lucide-react'
import { parseFactures } from '../../utils/parseFactures'

export default function AdminStats() {
  const [data,     setData]     = useState(null)
  const [fileName, setFileName] = useState('')
  const [loading,  setLoading]  = useState(false)

  const monthRef   = useRef(null)
  const statusRef  = useRef(null)
  const revenueRef = useRef(null)
  const charts     = useRef({})

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    setLoading(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const parsed = parseFactures(ev.target.result)
      setData(parsed)
      setLoading(false)
    }
    reader.readAsText(file, 'utf-8')
  }

  useEffect(() => {
    if (!data) return
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'
    script.onload = () => buildCharts()
    document.head.appendChild(script)
    if (window.Chart) buildCharts()
    return () => Object.values(charts.current).forEach((c) => c.destroy())
  }, [data])

  function buildCharts() {
    if (!data || !window.Chart) return
    Object.values(charts.current).forEach((c) => c.destroy())
    charts.current = {}

    if (monthRef.current) {
      charts.current.month = new window.Chart(monthRef.current, {
        type: 'bar',
        data: {
          labels: data.monthly.map((d) => d.month),
          datasets: [
            { label: 'Net', data: data.monthly.map((d) => d.net), backgroundColor: '#1D9E75', borderRadius: 6 },
            { label: 'CRBT', data: data.monthly.map((d) => d.crbt), backgroundColor: '#9FE1CB', borderRadius: 6 },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { autoSkip: false }, grid: { display: false } },
            y: { ticks: { callback: (v) => v.toLocaleString() + ' DH' }, grid: { color: 'rgba(128,128,128,0.1)' } }
          }
        }
      })
    }

    if (statusRef.current) {
      charts.current.status = new window.Chart(statusRef.current, {
        type: 'bar',
        data: {
          labels: data.monthly.map((d) => d.month),
          datasets: [
            { label: 'Livrées', data: data.monthly.map((d) => d.livres), backgroundColor: '#378ADD', borderRadius: 6 },
            { label: 'Refusées', data: data.monthly.map((d) => d.refuses), backgroundColor: '#E24B4A', borderRadius: 6 },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { autoSkip: false }, grid: { display: false } },
            y: { grid: { color: 'rgba(128,128,128,0.1)' } }
          }
        }
      })
    }

    if (revenueRef.current) {
      charts.current.revenue = new window.Chart(revenueRef.current, {
        type: 'bar',
        indexAxis: 'y',
        data: {
          labels: data.villes.map((v) => v.name),
          datasets: [{
            label: 'Revenue net (DH)',
            data: data.villes.map((v) => v.rev),
            backgroundColor: '#7F77DD', borderRadius: 6,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { callback: (v) => v + ' DH' }, grid: { color: 'rgba(128,128,128,0.1)' } },
            y: { ticks: { font: { size: 11 } }, grid: { display: false } }
          }
        }
      })
    }
  }

  const maxCmds = data ? Math.max(...data.villes.map((v) => v.cmds)) : 1

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light tracking-widest uppercase text-stone-800">Statistiques</h2>
          <p className="text-xs text-stone-400 mt-1">
            {fileName ? fileName : 'Importez votre fichier CSV de factures'}
          </p>
        </div>
        {data && (
          <span className="text-xs font-medium bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
            {data.taux}% taux livraison
          </span>
        )}
      </div>

      {/* Upload Zone */}
      <label className={'flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-10 mb-8 cursor-pointer transition ' + (data ? 'border-stone-200 bg-stone-50 hover:bg-stone-100' : 'border-stone-300 bg-white hover:bg-stone-50')}>
        <Upload size={28} className="text-stone-400" />
        <div className="text-center">
          <p className="text-sm font-medium text-stone-700">
            {data ? 'Importer un autre fichier CSV' : 'Cliquez pour importer votre CSV de factures'}
          </p>
          <p className="text-xs text-stone-400 mt-1">Format: N°, Code d'envoi, Ville, Destinataire, Date livraison, Status, Crbt, Frais, Total</p>
        </div>
        <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
      </label>

      {loading && (
        <div className="text-center py-20 text-stone-400">
          <div className="text-4xl mb-3">⏳</div>
          <p className="text-sm">Analyse en cours...</p>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total commandes', value: data.total, sub: data.livres + ' livrées · ' + data.refuses + ' refusées' },
              { label: 'CRBT total',      value: data.totalCrbt.toLocaleString() + ' DH', sub: 'Encaissé livraison' },
              { label: 'Frais livraison', value: data.totalFrais.toLocaleString() + ' DH', sub: 'Total déboursé' },
              { label: 'Net total',       value: data.totalNet.toLocaleString() + ' DH', sub: 'CRBT — Frais', green: true },
            ].map((s) => (
              <div key={s.label} className="bg-stone-50 rounded-2xl p-5">
                <p className="text-xs text-stone-400 mb-2">{s.label}</p>
                <p className={'text-2xl font-light mb-1 ' + (s.green ? 'text-green-700' : 'text-stone-900')}>{s.value}</p>
                <p className="text-xs text-stone-400">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <p className="text-xs font-medium tracking-widest uppercase text-stone-500 mb-1">Revenue net par mois</p>
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2 text-xs text-stone-400"><div className="w-3 h-3 rounded-sm bg-green-500"></div> Net</div>
                <div className="flex items-center gap-2 text-xs text-stone-400"><div className="w-3 h-3 rounded-sm" style={{background:'#9FE1CB'}}></div> CRBT</div>
              </div>
              <div style={{position:'relative', height:'220px'}}>
                <canvas ref={monthRef} role="img" aria-label="Revenue net et CRBT par mois" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <p className="text-xs font-medium tracking-widests uppercase text-stone-500 mb-1">Commandes par mois</p>
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2 text-xs text-stone-400"><div className="w-3 h-3 rounded-sm bg-blue-500"></div> Livrées</div>
                <div className="flex items-center gap-2 text-xs text-stone-400"><div className="w-3 h-3 rounded-sm bg-red-500"></div> Refusées</div>
              </div>
              <div style={{position:'relative', height:'220px'}}>
                <canvas ref={statusRef} role="img" aria-label="Livrées et refusées par mois" />
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <p className="text-xs font-medium tracking-widest uppercase text-stone-500 mb-4">Top villes — commandes</p>
              {data.villes.map((v) => (
                <div key={v.name} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-stone-400 w-24 text-right flex-shrink-0 capitalize">{v.name}</span>
                  <div className="flex-1 bg-stone-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center px-2"
                      style={{ width: Math.round(v.cmds / maxCmds * 100) + '%', background: '#534AB7' }}
                    >
                      <span className="text-[10px] text-white font-medium">{v.cmds}</span>
                    </div>
                  </div>
                  <span className="text-xs text-stone-400 w-16 flex-shrink-0">{v.cmds} cmds</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <p className="text-xs font-medium tracking-widest uppercase text-stone-500 mb-1">Revenue net par ville</p>
              <div style={{position:'relative', height: Math.max(280, data.villes.length * 32 + 60) + 'px'}}>
                <canvas ref={revenueRef} role="img" aria-label="Revenue net par ville" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100">
              <p className="text-xs font-medium tracking-widest uppercase text-stone-500">Détail mensuel</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-xs tracking-widest uppercase text-stone-400">
                  <tr>
                    {['Mois','Commandes','Livrées','Refusées','CRBT','Frais','Net','Taux'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.monthly.map((d) => {
                    const taux = Math.round(d.livres / d.cmds * 100)
                    return (
                      <tr key={d.key} className="border-t border-stone-50 hover:bg-stone-50 transition">
                        <td className="px-5 py-3 font-medium text-stone-800">{d.month}</td>
                        <td className="px-5 py-3 text-stone-600">{d.cmds}</td>
                        <td className="px-5 py-3 text-green-600 font-medium">{d.livres}</td>
                        <td className="px-5 py-3 text-red-500">{d.refuses}</td>
                        <td className="px-5 py-3 text-stone-700">{Math.round(d.crbt).toLocaleString()} DH</td>
                        <td className="px-5 py-3 text-stone-400">{Math.round(d.frais).toLocaleString()} DH</td>
                        <td className="px-5 py-3 font-medium text-green-700">{Math.round(d.net).toLocaleString()} DH</td>
                        <td className="px-5 py-3">
                          <span className="bg-green-100 text-green-700 text-[11px] px-2.5 py-1 rounded-full font-medium">{taux}%</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-stone-50 border-t border-stone-200">
                    <td className="px-5 py-3 font-medium text-stone-800">Total</td>
                    <td className="px-5 py-3 font-medium">{data.total}</td>
                    <td className="px-5 py-3 font-medium text-green-600">{data.livres}</td>
                    <td className="px-5 py-3 font-medium text-red-500">{data.refuses}</td>
                    <td className="px-5 py-3 font-medium">{data.totalCrbt.toLocaleString()} DH</td>
                    <td className="px-5 py-3 text-stone-400">{data.totalFrais.toLocaleString()} DH</td>
                    <td className="px-5 py-3 font-medium text-green-700">{data.totalNet.toLocaleString()} DH</td>
                    <td className="px-5 py-3">
                      <span className="bg-green-100 text-green-700 text-[11px] px-2.5 py-1 rounded-full font-medium">{data.taux}%</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}