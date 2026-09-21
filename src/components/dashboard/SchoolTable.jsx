import { useMemo } from 'react'
import Sb from '../ui/Sb'

/*
 * Pure function — computes separator flags outside React render cycle.
 * Avoids mutation during render and useMemo constraints.
 */
const addSeparatorFlags = (rows) => {
  let lastPass = 1
  return rows.map(row => {
    const showSeparator = row.passNumber > lastPass
    if (showSeparator) lastPass = row.passNumber
    return { ...row, showSeparator }
  })
}

/*
 * SchoolTable — school-method algorithm table
 */
const SchoolTable = ({ rows = [] }) => {

  /* ── Pre-compute separator flags — pure function outside component ── */
  const rowsWithSeparator = useMemo(() => addSeparatorFlags(rows), [rows])

  if (!rowsWithSeparator.length) return (
    <p className="dashboard__hint">Run the algorithm first.</p>
  )

  /* ── Helper : format lambda value for display ── */
  const fmtLambda = (val) => {
    if (val === null || val === undefined) return '—'
    if (val === Infinity || val === -Infinity) return '∞'
    return String(val)
  }

  /* ── Helper : format λj - λi column ── */
  const fmtDiff = (row) => {
    if (!row.diff) return '—'
    const ljStr = fmtLambda(row.lambdaJ)
    const liStr = fmtLambda(row.lambdaI)

	 /*
    const res   = row.updated
      ? fmtLambda(row.lambdaJ - row.lambdaI)
      : '∞'
	*/

	const res = fmtLambda(row.lambdaJ - row.lambdaI)
    return `${ljStr} - ${liStr} = ${res}`
  }

  /* ── Helper : format new λj column ── */
  const fmtNewLambda = (row) => {
    if (row.isEnd)    return '—'
    if (!row.updated) return '—'
    const liStr = fmtLambda(row.lambdaI)
    const res   = fmtLambda(row.newLambdaJ)
    return `= ${liStr} + ${row.vij} = ${res}`
  }

  return (
    <div className="school-table-wrap">
      <table className="school-table">
        <thead>
          <tr>
            <th className="school-table__th">i</th>
            <th className="school-table__th">j</th>
            <th 
					className="school-table__th"
					style={{paddingLeft: '40px'}}
				>λ<Sb str='i' /> − λ<Sb str='j' /></th>
            <th 
					className="school-table__th"
					style={{textAlign : 'center'}}
				>v(x<Sb str='i' />, x<Sb str='j' />)</th>
            <th 
					className="school-table__th"
					style={{textAlign : 'center', color: '#6366f1'}}
					>λ<Sb str='j' /> (new)</th>
          </tr>
        </thead>
        <tbody>
          {rowsWithSeparator.map((row, idx) => {

            if (row.isEnd) return (
              <tr key={`end-${idx}`} className="school-table__row school-table__row--end">
                <td colSpan={5} className={`school-table__td school-table__td--end ${row.hasCycle ? 'has-cycle' : ''}`}>
                  {row.hasCycle
                    ? '⚠ Cycle détecté — pas de solution bornée'
                    : 'End — no modifications possible'
                  }
                </td>
              </tr>
            )

            return (
              <>
                {row.showSeparator && (
                  <tr key={`sep-${idx}`} className="school-table__separator">
                    <td colSpan={5} className="school-table__separator-cell">
                      Restart from i={row.i}
                    </td>
                  </tr>
                )}
                <tr
                  key={`row-${idx}`}
                  className={[
                    'school-table__row',
                    row.updated   ? 'school-table__row--updated'   : '',
                    row.restarted ? 'school-table__row--restarted' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <td className="school-table__td school-table__td--index">{row.i}</td>
                  <td className="school-table__td school-table__td--index">{row.j}</td>
                  <td className="school-table__td school-table__td--calc">
							<Tdeco row={row}/> &nbsp;
							{fmtDiff(row)}
						
						</td>
                  <td className="school-table__td school-table__td--weight">{row.vij}</td>
                  <td className="school-table__td school-table__td--result">
							{row.updated && <Tdeco row={row} isDistance={false}/>}
							{fmtNewLambda(row)}
						</td>
                </tr>
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const Tdeco = ({row, isDistance=true}) => {
	if (isDistance) {
		return(
			<span>
				λ<Sb str={row.j}/> - λ<Sb str={row.i}/>=
			</span>
		)
	}

	return(
	<span>
		λ<Sb str={row.j}/> = λ<Sb str={row.i}/> + v(x<Sb str={row.i}/>, x<Sb str={row.j} />)
	</span>
	)

}

export default SchoolTable