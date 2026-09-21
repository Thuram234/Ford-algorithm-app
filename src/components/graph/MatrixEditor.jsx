import { useState, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Button from '../ui/Button'
import '../../styles/matrixEditor.css'

/*
 * MatrixCell — individual editable cell
 * Manages its own draft value locally during editing.
 * Commits to parent only on blur.
 *
 * Props:
 *  value    : number | '' — committed value from adjMap
 *  onCommit : (value: string) => void — called on blur
 */
const MatrixCell = ({ value, onCommit }) => {
  const [draft, setDraft] = useState(value === '' ? '' : String(value))

  return (
    <input
      type="number"
      className={`matrix-table__input ${draft !== '' ? 'has-value' : ''}`}
      value={draft}
      placeholder="·"
      onChange={e => setDraft(e.target.value)}
      onBlur={() => onCommit(draft)}
    />
  )
}

/*
 * MatrixEditor — adjacency matrix input
 *
 * Props:
 *  elements : Cytoscape elements array (nodes + edges)
 *  onUpdate : (elements) => void
 */
const MatrixEditor = ({ elements = [], onUpdate = () => {} }) => {

  /* ── Derive nodes and adjMap directly from elements (no state) ── */
  const nodes = elements.filter(el => !el.data?.source)

  const buildAdjMap = useCallback((els) => {
    const map = {}
    els
      .filter(el => el.data?.source)
      .forEach(el => {
        map[`${el.data.source}_${el.data.target}`] = el.data.weight ?? 1
      })
    return map
  }, [])

  /* Derived directly — no useState, no useEffect needed */
  const adjMap = buildAdjMap(elements)

  /* ── Rebuild full elements array and notify parent ── */
  const notifyElements = useCallback((newMap) => {
    const nodeEls = nodes.map(n => ({
      group:    'nodes',
      data:     { id: n.data.id, label: n.data.label },
      position: n.position ?? { x: 100, y: 100 },
    }))

    const edgeEls = Object.entries(newMap)
      .filter(([, w]) => typeof w === 'number' && !isNaN(w))
      .map(([key, weight]) => {
        // Split key into source/target (handles IDs with underscores e.g. "node_1")
        const parts  = key.split('_')
        const mid    = Math.floor(parts.length / 2)
        const source = parts.slice(0, mid).join('_')
        const target = parts.slice(mid).join('_')

        return {
          group: 'edges',
          data:  {
            id:     `edge_${source}_${target}`,
            source,
            target,
            weight,
            label:  String(weight),
          },
        }
      })

    onUpdate([...nodeEls, ...edgeEls])
  }, [nodes, onUpdate])

  /* ── Commit cell on blur : update adjMap and notify ── */
  const handleCellBlur = useCallback((sourceId, targetId, value) => {
    const key    = `${sourceId}_${targetId}`
    const newMap = { ...adjMap }
    const parsed = parseFloat(value)

    if (value === '' || isNaN(parsed)) {
      delete newMap[key]
    } else {
      newMap[key] = parsed
    }

    notifyElements(newMap)
  }, [adjMap, notifyElements])

  /* ── Add a new node ── */
  const handleAddNode = useCallback(() => {
    const usedIndices = nodes
      .map(n => n.data.label)
      .filter(l => /^x\d+$/.test(l))
      .map(l => parseInt(l.replace('x', ''), 10))

    let index = 1
    while (usedIndices.includes(index)) index++

    const newId    = `node_matrix_${Date.now()}`
    const newLabel = `x${index}`
    const angle    = (nodes.length * (2 * Math.PI)) / Math.max(nodes.length, 1)
    const radius   = 150

    const newNode = {
      group: 'nodes',
      data:  { id: newId, label: newLabel },
      position: {
        x: 300 + radius * Math.cos(angle),
        y: 200 + radius * Math.sin(angle),
      },
    }

    onUpdate([...elements, newNode])
  }, [nodes, elements, onUpdate])

  /* ── Remove a node and its connected edges ── */
  const handleRemoveNode = useCallback((nodeId) => {
    const newEls = elements.filter(el =>
      el.data.id     !== nodeId &&
      el.data.source !== nodeId &&
      el.data.target !== nodeId
    )
    onUpdate(newEls)
  }, [elements, onUpdate])

  /* ── Empty state ── */
  if (nodes.length === 0) {
    return (
      <div className="matrix-editor matrix-editor--empty">
        <p className="matrix-editor__empty-text">
          No nodes yet — add one to start building the matrix.
        </p>
        <Button
          variant="secondary"
          size="sm"
          icon={Plus}
          onClick={handleAddNode}
        >
          Add Node
        </Button>
      </div>
    )
  }

  return (
    <div className="matrix-editor">

      {/* ── Header ── */}
      <div className="matrix-editor__header">
        <span className="matrix-editor__title">
          Adjacency Matrix
          <span className="matrix-editor__size">
            {nodes.length} × {nodes.length}
          </span>
        </span>
        <Button
          variant="secondary"
          size="sm"
          icon={Plus}
          onClick={handleAddNode}
        >
          Add Node
        </Button>
      </div>

      {/* ── Matrix table ── */}
      <div className="matrix-editor__scroll">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="matrix-table__corner">from \ to</th>
              {nodes.map(n => (
                <th key={n.data.id} className="matrix-table__col-header">
                  <div className="matrix-table__header-cell">
                    <span>{n.data.label}</span>
                    <button
                      className="matrix-table__remove-btn"
                      onClick={() => handleRemoveNode(n.data.id)}
                      title={`Remove ${n.data.label}`}
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {nodes.map(rowNode => (
              <tr key={rowNode.data.id}>
                <td className="matrix-table__row-header">
                  {rowNode.data.label}
                </td>
                {nodes.map(colNode => {
                  const isSelf = rowNode.data.id === colNode.data.id
                  return (
                    <td key={colNode.data.id} className="matrix-table__cell">
                      {isSelf
                        ? <div className="matrix-table__self-cell">—</div>
                        : <MatrixCell
									key={`${rowNode.data.id}_${colNode.data.id}_${adjMap[`${rowNode.data.id}_${colNode.data.id}`] ?? ''}`}
									value={adjMap[`${rowNode.data.id}_${colNode.data.id}`] ?? ''}
									onCommit={(val) => handleCellBlur(rowNode.data.id, colNode.data.id, val)}
									/>
                      }
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default MatrixEditor