// src/components/layouts/MainLayout.jsx

import { useState, useCallback, useRef, useEffect } from 'react'
import { Network, Table, BarChart2 }                from 'lucide-react'

import Navbar         from './Navbar'
import GraphEditor    from '../graph/GraphEditor'
import MatrixEditor   from '../graph/MatrixEditor'
import ControlPanel   from '../controls/ControlPanel'
import Dashboard      from '../dashboard/Dashboard'
import AlertBanner    from '../ui/AlertBanner'
import ConfirmModal   from '../ui/ConfirmModal'
import TabSwitcher    from '../ui/TabSwitcher'
import HelpModal from '../ui/HelpModal'

import useBellmanFord    from '../../hooks/useBellmanFord'
import { getDemoPreset } from '../../utils/presets'
import '../../styles/mainLayout.css'

/* ── Matrix editor tab configuration ── */
const INPUT_TABS = [
  { id: 'editor', label: 'Visual', icon: Network },
  { id: 'matrix', label: 'Matrix', icon: Table   },
]

function MainLayout() {

  /* ── View state : editor | dashboard ── */
  const [view, setView] = useState('editor')

  /* ── Graph state ── */
  const [elements,   setElements]   = useState([])
  const [sourceNode, setSourceNode] = useState(null)
  const [targetNode, setTargetNode] = useState(null)
  const [algoMode,   setAlgoMode]   = useState('min')

  /* ── UI state ── */
  const [inputTab,        setInputTab]        = useState('editor')
  const [hasResult,       setHasResult]       = useState(false)
  const [showPresetModal, setShowPresetModal] = useState(false)
  const [activeNavAction, setActiveNavAction] = useState(null)
  const [isStepMode,      setIsStepMode]      = useState(false)
  const [renewModal,      setRenewModal]      = useState(false)
  const [showHelp  ,      setShowHelp]        = useState(false)

  /* ── Refs ── */
  const graphEditorRef = useRef(null)
  const currentStepRef = useRef(-1)
  const isStepModeRef  = useRef(false)
  const prevViewRef    = useRef('editor')

  /* ── Algorithm hook ── */
  const {
    steps,
    currentStep,
    result,
    isRunning,
    schoolRows,
    run,
    initSteps,
    nextStep,
    computeSchool,
    reset: resetAlgo,
  } = useBellmanFord()

  /* ── Derived values ── */
  const isStepping = currentStep >= 0 && currentStep < steps.length - 1

  const nodeList = elements
    .filter(el => !el.data?.source)
    .map(el => ({ id: el.data.id, label: el.data.label }))

  /* Derive alert directly from result — no state needed */
  const alert = (() => {
    if (!result || !hasResult)          return null
    if (isStepMode && isRunning)        return null   // ← state au lieu de ref


    if (result.hasCycle) return {
      type: 'danger',
      message: algoMode === 'min'
        ? 'Negative cycle detected — no bounded shortest path exists.'
        : 'Positive cycle detected — no bounded longest path exists.',
    }

    if (!result.reachable || !result.path?.length) return {
      type: 'warning',
      message: 'Target node is unreachable from the source.',
    }

    return {
      type: 'success',
      message: algoMode === 'min'
        ? `Shortest path found — total distance : ${result.distance}`
        : `Longest path found — total distance : ${result.distance}`,
    }
  })()

  /* ── Effects ── */

  /* Keep currentStepRef in sync with currentStep state */
  useEffect(() => {
    currentStepRef.current = currentStep
  }, [currentStep])

  /* Apply visual step on Cytoscape when currentStep changes */
  useEffect(() => {
    if (!graphEditorRef.current) return
    if (currentStep < 0) return

    const step = steps[currentStep]
    if (!step) return


    graphEditorRef.current.showDistances(step.distances)

    if (currentStep === steps.length - 1) {
      if (!result?.hasCycle) {
        graphEditorRef.current.showResult(result?.allPaths)
      } else {
        graphEditorRef.current.clearHighlights()
        graphEditorRef.current.clearDistances()
      }
      return
    }

    graphEditorRef.current.clearHighlights()
    graphEditorRef.current.applyStep(step.activeEdge)
  }, [currentStep, steps, result])

  /* Show result after full Run — not triggered during step-by-step */
  useEffect(() => {

    if (!graphEditorRef.current)         return
    if (!result || !hasResult)           return
    if (isRunning)                       return
    if (isStepModeRef.current)           return
    if (currentStep !== -1 && currentStep < steps.length - 1) return

    if (result.hasCycle) {
      graphEditorRef.current.clearHighlights()
      return
    }

    if (result.path?.length) {
      graphEditorRef.current.showResult(result.allPaths)
      graphEditorRef.current.showDistances(steps[steps.length - 1]?.distances)
    }
  }, [result, hasResult, isRunning, currentStep, steps])

  /* Clear highlights when result is dismissed */
  useEffect(() => {
    if (!hasResult) {
      graphEditorRef.current?.clearHighlights()
    }
  }, [hasResult])

  /* Re-apply visual state only when transitioning back to editor */
  useEffect(() => {
    const wasInDashboard = prevViewRef.current === 'dashboard'
    prevViewRef.current  = view

    // Only re-apply when coming back from dashboard
    if (!wasInDashboard)   return
    if (view !== 'editor') return
    if (!hasResult)        return

    const cy = graphEditorRef.current
    if (!cy) return

    if (result && !result.hasCycle && result.path?.length) {
      cy.showResult(result.allPaths)
    }
  }, [view, hasResult, result])



  /* ── Handlers ── */

  const closeAlert = useCallback(() => {
    setHasResult(false)
  }, [])

  /*Run the algorithm */

  const handleRun = useCallback(() => {
    isStepModeRef.current = false
    setIsStepMode(false)
    run(elements, sourceNode, targetNode, algoMode)
    setHasResult(true)
  }, [elements, sourceNode, targetNode, algoMode, run])

  const handleStep = useCallback(() => {
    const step = currentStepRef.current

    if (step === -1) {
      isStepModeRef.current = true
      setIsStepMode(true)
      initSteps(elements, sourceNode, targetNode, algoMode)
      setHasResult(true)
      return
    }

    if (step >= steps.length - 1) {
      if (!result?.hasCycle) {
        graphEditorRef.current?.showResult(result?.allPaths)
      } else {
        graphEditorRef.current?.clearHighlights()
      }
      setIsStepMode(false)   // ← step mode done
      return
    }

    nextStep()
  }, [steps.length, elements, sourceNode, targetNode, algoMode,
      initSteps, nextStep, result])

  const handleReset = useCallback(() => {
    resetAlgo()
    setHasResult(false)
    setIsStepMode(false)
    
    setSourceNode(null)
    setTargetNode(null)
    
    closeAlert()
    graphEditorRef.current?.clearDistances() //news
  }, [resetAlgo, closeAlert])

  const resetByPannel = useCallback(() => {
     resetAlgo()
    setHasResult(false)
    setIsStepMode(false)
    
    closeAlert()
    graphEditorRef.current?.clearDistances() //news
  }, [resetAlgo, closeAlert])

  const handleNew = useCallback(() => {
    setElements([])
    setSourceNode(null)
    setTargetNode(null)
    resetAlgo()
    setHasResult(false)
    setRenewModal(false)
    setView('editor')
    closeAlert()
    graphEditorRef.current?.clearDistances()   // ← new
    setActiveNavAction('new')
  }, [resetAlgo, closeAlert])

  const loadPreset = useCallback(() => {
    setElements(getDemoPreset())
    setSourceNode(null)
    setTargetNode(null)
    resetAlgo()
    setHasResult(false)
    setShowPresetModal(false)
    setView('editor')
    setActiveNavAction('example')
  }, [resetAlgo])

  const handleLoadExample = useCallback(() => {
    if (elements.length > 0) {
      setShowPresetModal(true)
      return
    }
    loadPreset()
  }, [elements.length, loadPreset])

  /* trying to renew the graph */
  const handleRenewModal = useCallback(() => {
    if (elements.length > 0) {
      setRenewModal(true)
      return
    }
    handleNew()
  }, [elements.length, handleNew])

  /* Switch to dashboard view — only if result exists */
  const handleViewResults = useCallback(() => {
    if (hasResult) setView('dashboard')
    computeSchool(elements, sourceNode, algoMode)
  }, [hasResult, computeSchool,elements, sourceNode, algoMode])

  /* Switch back to editor view */
  const handleBackToEditor = useCallback(() => {
    setView('editor')
  }, [])

  /* ── Render ── */
  return (
    <div className="app-shell">

      {/* Top navigation bar */}
      <Navbar
        onNew={handleRenewModal}
        onExample={handleLoadExample}
        activeAction={activeNavAction}
        view={view}
        hasResult={hasResult}
        onViewResults={handleViewResults}
        onBackToEditor={handleBackToEditor}
        onHelp={() => setShowHelp(true)}
      />

      {/* ── Editor view ── */}
      <div 
        className="workspace"
        style    = {{ display : view === 'editor' ? 'flex' : 'none'}}
      >

        {/* Graph canvas — full height */}
        <div className="canvas-area">
          <GraphEditor
            ref={graphEditorRef}
            elements={elements}
            onUpdate={setElements}
            sourceNode={sourceNode}
            targetNode={targetNode}
            onFullReset={handleReset}
          />

          {/* Alert banner — centered top of canvas */}
          <AlertBanner
            type={alert?.type ?? 'success'}
            message={alert?.message ?? ''}
            visible={!!alert}
            onClose={closeAlert}
          />
        </div>

        {/* Side panel — fixed full height */}
        <aside className="side-panel">

          {/* Algorithm controls */}
          <ControlPanel
            nodes={nodeList}
            mode={algoMode}
            onModeChange={setAlgoMode}
            sourceNode={sourceNode}
            targetNode={targetNode}
            onSetSource={setSourceNode}
            onSetTarget={setTargetNode}
            onRun={handleRun}
            onStep={handleStep}
            onReset={resetByPannel}
            isRunning={isRunning}
            isStepping={isStepping}
            hasResult={hasResult}
          />

          {/* Divider */}
          <div className="side-panel__divider" />

          {/* Matrix editor via tabs */}
          <div className="side-panel__matrix">
            <TabSwitcher
              tabs={INPUT_TABS}
              active={inputTab}
              onChange={setInputTab}
            />
            <div className="side-panel__matrix-content">
              {inputTab === 'matrix' && (
                <MatrixEditor
                  elements={elements}
                  onUpdate={setElements}
                />
              )}
              {inputTab === 'editor' && (
                <p className="placeholder-text">
                  Use the canvas to edit the graph visually.
                </p>
              )}
            </div>
          </div>

          {/* View results button — visible only when result is available */}
          {result && hasResult && !isStepMode && !result.hasCycle && (
            <div className="side-panel__footer">
              <button
                className="view-results-btn"
                onClick={handleViewResults}
              >
                <BarChart2 size={15} aria-hidden />
                View Results
              </button>
            </div>
          )}

        </aside>
      </div>

      {/* ── Dashboard view — full screen ── */}
      <div 
        className="dashboard-view"
        style    ={{ display : view === 'dashboard' ? 'flex' : 'none'}}
      >
        <Dashboard
          steps={steps}
          currentStep={currentStep}
          result={result}
          elements={elements}
          mode={algoMode}
          nodeList  ={nodeList}
          schoolRows={schoolRows}
        />
      </div>
      
      {/* ___ Help center ___ */}
      <HelpModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        />
      

      {/* Preset confirmation modal */}
      <ConfirmModal
        visible={showPresetModal}
        title="Load Demo Graph"
        message="This will replace your current graph. Any unsaved work will be lost."
        onConfirm={loadPreset}
        onCancel={() => setShowPresetModal(false)}
      />

      {/* Renew confirmation modal */}
      <ConfirmModal
        visible={renewModal}
        title  ="Create New Graph"
        message="This will clear your current graph. Any unsaved work will be lost."
        onConfirm={handleNew}
        onCancel ={() => setRenewModal(false)}
        confirmButtonLabel='New graph'
        />

    </div>
  )
}

export default MainLayout