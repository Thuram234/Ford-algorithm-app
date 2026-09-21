import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react'
import cytoscapeStyle     from '../../utils/cytoscapeStyle'
import {
  createNode,
  createEdge,
  generateNodeId,
  getNextNodeLabel,
} from '../../utils/graphHelpers'
import GraphToolbar from './GraphToolbar'
import EdgeWeightModal from '../ui/EdgeWeightModal'
import '../../styles/GraphEditor.css'
import cytoscape from 'cytoscape'


/*
 * GraphEditor — interactive graph canvas
 * Cytoscape is mounted manually via useEffect to guarantee
 * events are bound exactly once — no re-bind on re-render.
 *
 * Props:
 *  elements   : Cytoscape elements array (nodes + edges)
 *  onUpdate   : (elements) => void
 *  sourceNode : string | null
 *  targetNode : string | null
 */
const GraphEditor = forwardRef(({
  elements   = [],
  onUpdate   = () => {},
  sourceNode = null,
  targetNode = null,
  onFullReset= () => {},
}, ref) => {

  const containerRef     = useRef(null)   // DOM div for Cytoscape
  const cyRef            = useRef(null)   // Cytoscape instance
  const isInternalUpdate = useRef(false) // prevents sync loop on internal changes
  const modeRef          = useRef('select')
  const onUpdateRef      = useRef(onUpdate)
  const pendingSourceRef = useRef(null)

  const [mode,       setMode]       = useState('select')
  const [hasPending, setHasPending] = useState(false)
  const [edgeModal, setEdgeModal] = useState({
    visible:     false,
    sourceId:    null,
    targetId:    null,
    sourceLabel: '',
    targetLabel: '',
  })

  /* ── Wrapper : flag internal updates to prevent sync loop ── */
  const notifyUpdate = useCallback(() => {
    isInternalUpdate.current = true
    onUpdateRef.current(cyRef.current.elements().jsons())
  }, [])

  /* ── Keep refs in sync ── */
  useEffect(() => { modeRef.current     = mode     }, [mode])
  useEffect(() => { onUpdateRef.current = onUpdate }, [onUpdate])

  /* ── Mount Cytoscape once on component mount ── */
  useEffect(() => {
    const cy = cytoscape({
      container: containerRef.current,
      elements:  [],
      style:     cytoscapeStyle,
      layout:    { name: 'preset' },
      boxSelectionEnabled:  true,
      autounselectify:      false,
    })

    cyRef.current = cy

    /* Click on empty canvas → add node */
    cy.on('tap', (evt) => {
      if (evt.target !== cy)             return
      if (modeRef.current !== 'addNode') return

      const id    = generateNodeId()
      const label = getNextNodeLabel(cy.nodes().toArray())
      cy.add(createNode(id, label, evt.position))

      notifyUpdate();
    })

    cy.on('tap', 'node', (evt) => {
      /* Ignore ghost nodes */
      if (evt.target.hasClass('distance-ghost')) return
      if (modeRef.current !== 'addEdge') return

      const node = evt.target

      if (!pendingSourceRef.current) {
        pendingSourceRef.current = node.id()
        setHasPending(true)
        node.addClass('visited')
      } else {
        const source = pendingSourceRef.current
        const target = node.id()

        if (
          source !== target &&
          !cy.edges(`[source="${source}"][target="${target}"]`).length
        ) {
          const sourceLabel = cy.$(`#${source}`).data('label') ?? source
          const targetLabel = cy.$(`#${target}`).data('label') ?? target

          /* Reset pending state before opening modal */
          cy.nodes().removeClass('visited')
          pendingSourceRef.current = null
          setHasPending(false)

          /* Open custom weight modal instead of native prompt */
          setEdgeModal({
            visible:     true,
            sourceId:    source,
            targetId:    target,
            sourceLabel,
            targetLabel,
          })
          return
        }

        /* Source === target or edge already exists — just reset */
        cy.nodes().removeClass('visited')
        pendingSourceRef.current = null
        setHasPending(false)
      }
    })

    /* Cleanup on unmount */
    return () => cy.destroy()

  }, []) // ← strict empty deps : mount once, never re-run


  /* ── Sync source / target visual classes ── */
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    cy.nodes().removeClass('source target')
    if (sourceNode) cy.$(`#${sourceNode}`).addClass('source')
    if (targetNode) cy.$(`#${targetNode}`).addClass('target')
  }, [sourceNode, targetNode])

  /* ── Sync external elements into Cytoscape (matrix + presets) ──
  * Skipped when the update comes from an internal canvas interaction
  * to prevent infinite sync loops.                                  */
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }

    cy.elements().remove()
    if (elements.length) {
      cy.add(elements.map(el => {
        // Ensure displayLabel is set for nodes
        if (!el.data?.source && !el.data?.displayLabel) {
          return {
            ...el,
            data: { ...el.data, displayLabel: el.data.label }
          }
        }
        return el
      }))
      cy.layout({ name: 'preset' }).run()
    }
  }, [elements])

  /* ── Handle mode change + reset edge drawing state ── */
  const handleModeChange = useCallback((newMode) => {
    if (newMode !== 'addEdge') {
      cyRef.current?.nodes().removeClass('visited')
      pendingSourceRef.current = null
      setHasPending(false)
    }
    setMode(newMode)
  }, [])

  /* ── Delete selected elements ── */
  const handleDelete = useCallback(() => {
    const cy = cyRef.current
    if (!cy) return

    cy.$(':selected').remove()
    notifyUpdate();
  }, [])

  /* ── Reset entire graph ── */
  const handleReset = useCallback(() => {
    const cy = cyRef.current
    if (!cy) return

    cy.elements().remove()
    onUpdateRef.current([])
    pendingSourceRef.current = null
    setHasPending(false)
    onFullReset()
  }, [onFullReset])


  /* ── Confirm edge weight from modal ── */
  const handleEdgeConfirm = useCallback((weight) => {
    const cy = cyRef.current
    if (!cy) return

    isInternalUpdate.current = true   // ← flag avant l'ajout
    cy.add(createEdge(edgeModal.sourceId, edgeModal.targetId, weight))
    onUpdateRef.current(cy.elements().jsons())
    setEdgeModal(prev => ({ ...prev, visible: false }))
  }, [edgeModal.sourceId, edgeModal.targetId])

  /* ── Cancel edge creation from modal ── */
  const handleEdgeCancel = useCallback(() => {
    setEdgeModal(prev => ({ ...prev, visible: false }))
  }, [])

  /* ── Expose animation methods to parent via ref ── */
  useImperativeHandle(ref, () => ({

    /*
    * Highlight the edge being relaxed during a step.
    * Clears previous active state first.
    */
    applyStep(activeEdge) {
      const cy = cyRef.current
      if (!cy || !activeEdge) return

      cy.elements().removeClass('active visited')

      const edge = cy.edges(
        `[source="${activeEdge.source}"][target="${activeEdge.target}"]`
      )

      edge.addClass('active')
      edge.source().addClass('visited')
      edge.target().addClass('visited')
    },

    /*
    * Illuminate the optimal path at the end of the algorithm.
    * Clears all active states and applies 'optimal' class.
    */
    showResult(paths) {
      const cy = cyRef.current
      if (!cy || !paths?.length) return

      // Clear all highlights
      cy.elements().removeClass('active visited')

      // Highlight each edge of the optimal path
      paths.map((path) => {
        for (let i = 0; i < path.length - 1; i++) {
          const source = path[i]
          const target = path[i + 1]
          cy.edges(`[source="${source}"][target="${target}"]`).addClass('optimal')
          cy.$(`#${source}`).addClass('optimal-node')
          cy.$(`#${target}`).addClass('optimal-node')
        }
      })      

      
    },

    /*
    * Show distance labels on each node after algorithm run.
    * Displays λ(xi) = d below each node.
    * distances : { nodeId: number | Infinity | -Infinity }
    */
    showDistances(distances) {
      const cy = cyRef.current
      if (!cy || !distances) return

      cy.remove('.distance-ghost')

      cy.nodes().not('.distance-ghost').forEach(node => {
        const d = distances[node.id()]
        if (d === undefined) return

        const isInf     = d === Infinity || d === -Infinity
        const nodeLabel = node.data('label')             // e.g. "x3"
        const index     = nodeLabel.replace('x', '')     // e.g. "3"
        const distLabel = `λ${index}=${isInf ? '∞' : d}`  // e.g. "λ3=5"
        const pos       = node.position()

        cy.add({
          group:   'nodes',
          classes: 'distance-ghost',
          data:    { id: `ghost_${node.id()}`, label: distLabel },
          position: { x: pos.x, y: pos.y + 40 },
        })
      })
    },

    clearDistances() {
      const cy = cyRef.current
      if (!cy) return
      cy.remove('.distance-ghost')
    },


    /*
    * Clear all algorithm-related visual highlights.
    */
    clearHighlights() {
      cyRef.current?.elements().removeClass('active visited optimal optimal-node')
    },

  }), [])



  return (
    <div className="graph-editor" ref={ref}>
      <GraphToolbar
        mode={mode}
        onModeChange={handleModeChange}
        onDelete={handleDelete}
        onReset={handleReset}
      />

      {/* Native div — Cytoscape mounts directly here */}
      <div
        ref={containerRef}
        className={`graph-editor__canvas graph-editor__canvas--${mode}`}
      />

      <div className="graph-editor__hint">
        {mode === 'select'  && 'Click to select — drag to move'}
        {mode === 'addNode' && 'Click on the canvas to add a node'}
        {mode === 'addEdge' && (hasPending
          ? 'Now click the destination node'
          : 'Click the source node first'
        )}
      </div>

      {/* Edge weight input modal */}
      <EdgeWeightModal
        visible={edgeModal.visible}
        sourceLabel={edgeModal.sourceLabel}
        targetLabel={edgeModal.targetLabel}
        onConfirm={handleEdgeConfirm}
        onCancel={handleEdgeCancel}
      />
    </div>
  )
})   // ferme forwardRef

GraphEditor.displayName = 'GraphEditor'
export default GraphEditor