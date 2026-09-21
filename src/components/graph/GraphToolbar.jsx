import { MousePointer2, CirclePlus, Spline, Trash2, RotateCcw } from 'lucide-react'
import Button from '../ui/Button'

/*
 * GraphToolbar — mode selector and graph action buttons
 *
 * Props:
 *  mode         : 'select' | 'addNode' | 'addEdge'
 *  onModeChange : (mode) => void
 *  onDelete     : () => void — delete selected elements
 *  onReset      : () => void — clear the entire graph
 */
const GraphToolbar = ({ mode, onModeChange, onDelete, onReset }) => (
  <div className="graph-toolbar">

    {/* ── Interaction modes ── */}
    <div className="graph-toolbar__modes">
      <Button
        variant="ghost"
        size="sm"
        icon={MousePointer2}
        active={mode === 'select'}
        onClick={() => onModeChange('select')}
        title="Select / Move"
      />
      <Button
        variant="ghost"
        size="sm"
        icon={CirclePlus}
        active={mode === 'addNode'}
        onClick={() => onModeChange('addNode')}
        title="Add Node"
      >
        Node
      </Button>
      <Button
        variant="ghost"
        size="sm"
        icon={Spline}
        active={mode === 'addEdge'}
        onClick={() => onModeChange('addEdge')}
        title="Add Edge"
      >
        Edge
      </Button>
    </div>

    {/* ── Divider ── */}
    <div className="graph-toolbar__divider" />

    {/* ── Destructive actions ── */}
    <div className="graph-toolbar__actions">
      <Button
        variant="ghost"
        size="sm"
        icon={Trash2}
        onClick={onDelete}
        title="Delete selected"
      
      />
      <Button
        variant="danger"
        size="sm"
        icon={RotateCcw}
        onClick={onReset}
        title="Reset graph"
      >
        Reset
      </Button>
    </div>

  </div>
)

export default GraphToolbar