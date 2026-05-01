export function parseFactures(csvText) {
  const lines = csvText.trim().split('\n')
  lines.shift() // remove header

  const rows = []
  for (const line of lines) {
    const cols = line.split(',')
    if (cols.length < 9) continue

    const parseAmount = (s) => {
      const clean = s.replace(/DH/g, '').replace(/\s/g, '').trim()
      return parseFloat(clean) || 0
    }

    rows.push({
      code:          cols[1]?.trim(),
      dateEnvoi:     cols[2]?.trim(),
      dateLivraison: cols[3]?.trim(),
      status:        cols[4]?.trim(),
      ville:         cols[5]?.trim().toLowerCase(),
      crbt:          parseAmount(cols[6]),
      frais:         parseAmount(cols[7]),
      total:         parseAmount(cols[8]),
    })
  }

  // Stats globales
  const livres  = rows.filter((r) => r.status === 'Livré')
  const refuses = rows.filter((r) => r.status === 'Refusé')

  const totalCrbt  = livres.reduce((s, r) => s + r.crbt, 0)
  const totalFrais = rows.reduce((s, r) => s + r.frais, 0)
  const totalNet   = livres.reduce((s, r) => s + r.total, 0)

  // Par mois
  const monthMap = {}
  for (const r of rows) {
    if (!r.dateEnvoi || r.dateEnvoi.length < 7) continue
    const key = r.dateEnvoi.slice(0, 7)
    if (!monthMap[key]) monthMap[key] = { cmds: 0, livres: 0, refuses: 0, crbt: 0, frais: 0, net: 0 }
    monthMap[key].cmds++
    monthMap[key].frais += r.frais
    if (r.status === 'Livré') {
      monthMap[key].livres++
      monthMap[key].crbt += r.crbt
      monthMap[key].net  += r.total
    } else {
      monthMap[key].refuses++
    }
  }

  const monthNames = { '01':'Janvier','02':'Février','03':'Mars','04':'Avril','05':'Mai','06':'Juin','07':'Juillet','08':'Août','09':'Septembre','10':'Octobre','11':'Novembre','12':'Décembre' }
  const monthly = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, d]) => ({
      key,
      month: monthNames[key.slice(5)] || key,
      ...d,
    }))

  // Par ville
  const villeMap = {}
  for (const r of rows) {
    const v = r.ville || 'inconnu'
    if (!villeMap[v]) villeMap[v] = { cmds: 0, rev: 0 }
    villeMap[v].cmds++
    if (r.status === 'Livré') villeMap[v].rev += r.total
  }

  const villes = Object.entries(villeMap)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.cmds - a.cmds)
    .slice(0, 10)

  return {
    total:    rows.length,
    livres:   livres.length,
    refuses:  refuses.length,
    taux:     Math.round(livres.length / rows.length * 100),
    totalCrbt:  Math.round(totalCrbt),
    totalFrais: Math.round(totalFrais),
    totalNet:   Math.round(totalNet),
    monthly,
    villes,
  }
}