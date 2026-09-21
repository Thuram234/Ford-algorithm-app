//import { useCallback } from 'react'
import { Play, /*SkipForward,*/ RotateCcw, ChevronRight } from 'lucide-react'
import Button from '../ui/Button'
import '../../styles/controlPanel.css'

/*
 * ControlPanel — algorithm configuration and execution
 *
 * Props:
 *  nodes        : array of { id, label } — available nodes
 *  mode         : 'min' | 'max'
 *  onModeChange : (mode) => void
 *  sourceNode   : string | null
 *  targetNode   : string | null
 *  onSetSource  : (id) => void
 *  onSetTarget  : (id) => void
 *  onRun        : () => void — run full algorithm
 *  onStep       : () => void — run one step
 *  onReset      : () => void — reset algorithm state
 *  isRunning    : boolean
 *  hasResult    : boolean
 */
const ControlPanel = ({
  nodes        = [],
  mode         = 'min',
  onModeChange = () => {},
  sourceNode   = null,
  targetNode   = null,
  onSetSource  = () => {},
  onSetTarget  = () => {},
  onRun        = () => {},
  onStep       = () => {},
  onReset      = () => {},
  isRunning    = false,
  hasResult    = false,
  isStepping   = false
}) => {

  /* ── Guard : need at least 2 nodes to run ── */
  const canRun = nodes.length >= 2 && sourceNode && targetNode

  return (
    <div className="control-panel">

      {/* ── Section : Algorithm mode ── */}
      <div className="control-panel__section">
        <span className="control-panel__label">Mode</span>
        <div className="control-panel__toggle">
          <button
            className ={`toggle-btn ${mode === 'min' ? 'active' : ''}`}
            onClick   ={() => onModeChange('min')}
            disabled  ={hasResult}
          >
            MIN
          </button>
          <button
            className ={`toggle-btn ${mode === 'max' ? 'active' : ''}`}
            onClick   ={() => onModeChange('max')}
            disabled  ={hasResult}
          >
            MAX
          </button>
        </div>
      </div>

      {/* ── Section : Source node ── */}
      <div className="control-panel__section">
        <span className="control-panel__label">Source</span>
        <select
          className="control-panel__select"
          value={sourceNode ?? ''}
          onChange={e => onSetSource(e.target.value || null)}
        >
          <option value="">— select —</option>
          {nodes
            .filter(n => n.id !== targetNode)
            .map(n => (
              <option key={n.id} value={n.id}>{n.label}</option>
            ))
          }
        </select>
      </div>

      {/* ── Section : Target node ── */}
      <div className="control-panel__section">
        <span className="control-panel__label">Target</span>
        <select
          className="control-panel__select"
          value={targetNode ?? ''}
          onChange={e => onSetTarget(e.target.value || null)}
        >
          <option value="">— select —</option>
          {nodes
            .filter(n => n.id !== sourceNode)
            .map(n => (
              <option key={n.id} value={n.id}>{n.label}</option>
            ))
          }
        </select>
      </div>

      {/* ── Section : Actions ── */}
      <div className="control-panel__actions">

        {/* Run full algorithm */}
        <Button
          variant="primary"
          size="md"
          icon={Play}
          fullWidth
          disabled={!canRun || isRunning || isStepping}
          onClick={onRun}
        >
          Run
        </Button>

        {/* Step by step */}
        <Button
          variant="secondary"
          size="md"
          icon={ChevronRight}
          fullWidth
          disabled={!canRun}
          onClick={onStep}
        >
          Step
        </Button>

        {/* Reset */}
        {hasResult && (
          <Button
            variant="ghost"
            size="md"
            icon={RotateCcw}
            fullWidth
            onClick={onReset}
          >
            Reset
          </Button>
        )}

      </div>

      {/* ── Guard message ── */}
      {!canRun && (
        <p className="control-panel__hint">
          {nodes.length < 2
            ? 'Add at least 2 nodes to the graph'
            : !sourceNode || !targetNode
            ? 'Select a source and a target node'
            : ''
          }
        </p>
      )}

    </div>
  )
}

export default ControlPanel