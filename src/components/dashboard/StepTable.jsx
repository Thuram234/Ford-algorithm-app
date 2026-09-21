import Sb from "../ui/Sb"

/*
 * StepTable — iteration-by-iteration distance table
 *
 * Props:
 *  steps       : array of algorithm steps
 *  currentStep : index of active step (highlighted row)
 *  nodeList    : [{ id, label }]
 */
const StepTable = ({ steps = [], currentStep = -1, nodeList = [] }) => {

  if (!steps.length) return (
    <p className="dashboard__hint">No steps yet.</p>
  )

  return (
    <div className="step-table-wrap">
      <table className="step-table">
        <thead>
          <tr>
            <th className="step-table__th">Iter.</th>
            <th className="step-table__th">Relaxed arc</th>
            <th className="step-table__th">Updated</th>
            {nodeList.map(n => (
              <th key={n.id} className="step-table__th step-table__th--node">
                λ<Sb str={n.label.slice(1)} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {steps.map((step, idx) => {

            /* Find labels for source and target */
            const srcLabel = nodeList.find(n => n.id === step.activeEdge?.source)?.label ?? '?'
            const tgtLabel = nodeList.find(n => n.id === step.activeEdge?.target)?.label ?? '?'

            const isActive = idx === currentStep
            const isFuture = idx >  currentStep && currentStep !== steps.length - 1

            return (
              <tr
                key={idx}
                className={[
                  'step-table__row',
                  isActive ? 'step-table__row--active' : '',
                  isFuture ? 'step-table__row--future' : '',
                  step.updated ? 'step-table__row--updated' : '',
                ].filter(Boolean).join(' ')}
              >
                <td className="step-table__td">{step.iteration}</td>
                <td className="step-table__td step-table__td--arc">
                  {srcLabel} → {tgtLabel}
                </td>
                <td className="step-table__td">
                  {step.updated
                    ? <span className="step-badge step-badge--yes">✓</span>
                    : <span className="step-badge step-badge--no">—</span>
                  }
                </td>
                {nodeList.map(n => {
                  const d = step.distances[n.id]
                  const isInf = d === Infinity || d === -Infinity
                  return (
                    <td key={n.id} className={`step-table__td step-table__td--dist ${isInf ? 'is-inf' : ''}`}>
                      {isInf ? '∞' : d}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default StepTable