import { CheckCircle, XCircle, AlertTriangle, ArrowRight } from 'lucide-react'

/*
 * PathResult — displays the optimal path and distance
 *
 * Props:
 *  result   : { path, distance, hasCycle, reachable } | null
 *  nodeList : [{ id, label }]
 *  mode     : 'min' | 'max'
 */
const PathResult = ({ result = null, nodeList = [], mode = 'min' }) => {

  if (!result) return (
    <p className="dashboard__hint">Run the algorithm first.</p>
  )

  /* ── Cycle detected ── */
  if (result.hasCycle) return (
    <div className="path-result path-result--cycle">
      <AlertTriangle size={24} className="path-result__icon" />
      <div>
        <p className="path-result__title">
          {mode === 'min' ? 'Negative cycle detected' : 'Positive cycle detected'}
        </p>
        <p className="path-result__desc">
          The problem has no bounded solution — the algorithm cannot converge.
        </p>
      </div>
    </div>
  )

  /* ── Target unreachable ── */
  if (!result.reachable || !result.path?.length) return (
    <div className="path-result path-result--unreachable">
      <XCircle size={24} className="path-result__icon" />
      <p className="path-result__title">Target node is unreachable</p>
    </div>
  )

  /* ── Success ── */
  /*
  const labels = result.path.map(id =>
    nodeList.find(n => n.id === id)?.label ?? id
  )
  */
  
  /*

  return (
    <div className="path-result path-result--success">

      {/* Icon + title }
      <div className="path-result__header">
        <CheckCircle size={20} className="path-result__icon" />
        <span className="path-result__title">
          {mode === 'min' ? 'Shortest path found' : 'Longest path found'}
        </span>
      </div>

      {/* Path visualization }
      <div className="path-result__path">
        {labels.map((label, idx) => (
          <span key={idx} className="path-result__path-item">
            <span className="path-result__node">{label}</span>
            {idx < labels.length - 1 && (
              <ArrowRight size={14} className="path-result__arrow" />
            )}
          </span>
        ))}
      </div>

      {/* Distance }
      <div className="path-result__distance">
        <span className="path-result__distance-label">
          Total {mode === 'min' ? 'minimum' : 'maximum'} distance :
        </span>
        <span className="path-result__distance-value">
          {result.distance}
        </span>
      </div>

    </div>
    
  )*/

  /* ── Success ── */
  const { allPaths, distance } = result

  return (
    <div className="path-result path-result--success">

      {/* Header */}
      <div className="path-result__header">
        <CheckCircle size={20} className="path-result__icon" />
        <span className="path-result__title">
          {allPaths.length > 1
            ? `${allPaths.length} optimal paths found`
            : mode === 'min' ? 'Shortest path found' : 'Longest path found'
          }
        </span>
      </div>

      {/* All paths */}
      <div className="path-result__all-paths">
        {allPaths.map((path, pathIdx) => {
          const labels = path.map(id =>
            nodeList.find(n => n.id === id)?.label ?? id
          )
          return (
            <div key={pathIdx} className="path-result__path-row">
              {allPaths.length > 1 && (
                <span className="path-result__path-index">#{pathIdx + 1}</span>
              )}
              <div className="path-result__path">
                {labels.map((label, idx) => (
                  <span key={idx} className="path-result__path-item">
                    <span className="path-result__node">{label}</span>
                    {idx < labels.length - 1 && (
                      <ArrowRight size={14} className="path-result__arrow" />
                    )}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Distance */}
      <div className="path-result__distance">
        <span className="path-result__distance-label">
          Optimal {mode === 'min' ? 'minimum' : 'maximum'} distance :
        </span>
        <span className="path-result__distance-value">{distance}</span>
      </div>

    </div>
  )

    }

export default PathResult