import { useState, useCallback } from 'react'

/* ============================================================
   useBellmanFord — Bellman-Ford algorithm hook
   
   Generates all iteration steps upfront so the UI can
   play them back instantly (full run) or one by one (step).
   
   Returns:
    steps       : array of iteration snapshots
    currentStep : index of the current displayed step
    result      : { path, distance, hasCycle } | null
    isRunning   : boolean
    run         : () => void — execute full algorithm
    nextStep    : () => void — advance one step
    reset       : () => void — clear all state
   ============================================================ */

/* ── Internal : build graph structure from Cytoscape elements ── */
const buildGraph = (elements) => {
  const nodes = elements
    .filter(el => !el.data?.source)
    .map(el => el.data.id)

  const edges = elements
    .filter(el => el.data?.source)
    .map(el => ({
      source: el.data.source,
      target: el.data.target,
      weight: parseFloat(el.data.weight) || 1,
    }))

  return { nodes, edges }
}

/* ── Internal : run full Bellman-Ford and return all steps ──
 *
 * Each step records :
 *  iteration   : current iteration number (1-based)
 *  activeEdge  : { source, target } — edge being relaxed
 *  distances   : { nodeId: number } — current distance table
 *  predecessors: { nodeId: string } — predecessor map
 *  updated     : boolean — was a relaxation applied ?
 */
const computeSteps = (elements, sourceId, mode) => {
  const { nodes, edges } = buildGraph(elements)
  const INF = mode === 'min' ? Infinity : -Infinity

  /* ── Build index map for consistent ordering ── */
  const indexMap = {}
  nodes.forEach((id, idx) => { indexMap[id] = idx + 1 })
  
  /* ── Sort edges by source index — matches school method ordering ── */
  const sortedEdges = [...edges].sort((a, b) =>
    indexMap[a.source] - indexMap[b.source]
  )
  
  /* Initialize distances */
  const dist = {}
  const pred = {}
  const allPreds  = {}
  nodes.forEach(id => {
    dist[id] = mode === 'min' ? INF : 0,
    pred[id] = null
    allPreds[id] = []
  })
  dist[sourceId] = 0

  const steps   = []
  const n       = nodes.length
  let hasCycle  = false

  /* ── Main loop : n-1 iterations ── */
  for (let iter = 1; iter <= n - 1; iter++) {
    let anyUpdate = false

    for (const edge of sortedEdges) {
      const { source, target, weight } = edge
      if (dist[source] === INF) continue

      const candidate = dist[source] + weight
      const shouldRelax = mode === 'min'
        ? candidate < dist[target]
        : candidate > dist[target]

      const updated = shouldRelax
      if (shouldRelax) {
        dist[target] = candidate
        pred[target] = source
        anyUpdate    = true

        //Reset -  new best distance found
        allPreds[target] = [source]
      } else if (dist[source] !== INF) {
        //same distance optimal - alternatif path
        const equalOptimal = mode === 'min'
        ? candidate === dist[target]
        : candidate === dist[target]

        if (equalOptimal && !allPreds[target].includes(source)) {
          allPreds[target].push(source)
        }
      }

      /* Record this relaxation attempt as a step */
      steps.push({
        iteration:    iter,
        activeEdge:   { source, target },
        distances:    { ...dist },
        predecessors: { ...pred },
        updated,
      })
    }

    /* Early exit if no update in this iteration */
    if (!anyUpdate) break
  }

  /* ── Cycle detection : n-th pass ── */
  for (const edge of sortedEdges) {
    const { source, target, weight } = edge
    if (dist[source] === INF) continue

    const candidate = dist[source] + weight
    const wouldRelax = mode === 'min'
      ? candidate < dist[target]
      : candidate > dist[target]

    if (wouldRelax) {
      hasCycle = true
      break
    }
  }

  return { steps, finalDist: dist, finalPred: pred, finalAllPreds: allPreds, hasCycle }
}

/* ── Internal : reconstruct optimal path from predecessors ── */
/*
const reconstructPath = (predecessors, sourceId, targetId) => {
  const path = []
  let current = targetId

  /* Walk back from target to source 
  while (current !== null && current !== undefined) {
    path.unshift(current)
    if (current === sourceId) break
    current = predecessors[current]

    /* Cycle guard 
    if (path.length > Object.keys(predecessors).length) return []
  }

  /* Valid path must start at source 
  if (path[0] !== sourceId) return []
  return path
}
*/

/*
 * Reconstructs ALL optimal paths from source to target
 * using the allPreds map (multiple predecessors per node).
 * Returns an array of paths, each path being an array of node IDs.
 */
const reconstructAllPaths = (allPreds, sourceId, targetId) => {
  const allPaths = []

  /* Depth-first search — walk back from target to source */
  
  /*
  const dfs = (current, path) => {
    /* Cycle guard
    if (path.length > Object.keys(allPreds).length) return

    const fullPath = [current, ...path]

    if (current === sourceId) {
      allPaths.push(fullPath)
      return
    }

    const preds = allPreds[current]
    if (!preds || preds.length === 0) return

    for (const pred of preds) {
      dfs(pred, fullPath.slice(1) === undefined ? [] : [current, ...path].slice(1))
    }
  }
  */

  /* Start DFS from target, building path backwards */
  const dfsBack = (current, pathSoFar) => {
    if (pathSoFar.length > Object.keys(allPreds).length + 1) return

    if (current === sourceId) {
      allPaths.push([sourceId, ...pathSoFar])
      return
    }

    const preds = allPreds[current]
    if (!preds || preds.length === 0) return

    for (const pred of preds) {
      dfsBack(pred, [current, ...pathSoFar])
    }
  }

  dfsBack(targetId, [])

  /* Filter : only valid paths starting at source */
  return allPaths.filter(p => p[0] === sourceId && p[p.length - 1] === targetId)
}

/* ── Internal : generate school-method table rows ──
  *
  * Follows the exact school algorithm :
  * For each arc (xi → xj) :
  *   - Compute λj - λi
  *   - If λj - λi > v(xi,xj) → update λj = λi + v(xi,xj)
  *   - If i > j after update → restart from j (new pass)
  * Stop when no update occurs in a full pass.
  *
  * Each row records :
  *  i          : source node index (1-based)
  *  j          : target node index (1-based)
  *  sourceId   : source node ID
  *  targetId   : target node ID
  *  lambdaI    : λi value before relaxation
  *  lambdaJ    : λj value before relaxation
  *  diff       : λj - λi (formatted string)
  *  vij        : arc weight v(xi, xj)
  *  newLambdaJ : new λj value after relaxation (null if no update)
  *  updated    : boolean
  *  restarted  : boolean — did we restart from j ?
  *  passNumber : which pass this row belongs to
  */
  const computeSchoolSteps = (elements, sourceId, mode) => {
    const { nodes, edges } = buildGraph(elements)
    const INF = mode === 'min' ? Infinity : -Infinity

    /* Build index map : nodeId → 1-based position */
    const indexMap = {}
    nodes.forEach((id, idx) => { indexMap[id] = idx + 1 })

    /* Initialize lambdas */
    const lambda = {}
    nodes.forEach(id => { lambda[id] = mode === 'min' ? INF : 0 })
    lambda[sourceId] = 0

    const rows       = []
    let   passNumber = 1

    /* Build ordered arc list — sorted by source index */
    const sortedEdges = [...edges].sort((a, b) =>
      indexMap[a.source] - indexMap[b.source]
    )

    let keepGoing = true

    while (keepGoing) {
      let anyUpdate = false
      let edgeIdx   = 0

      while (edgeIdx < sortedEdges.length) {
        const edge                       = sortedEdges[edgeIdx]
        const { source, target, weight } = edge
        const i                          = indexMap[source]
        const j                          = indexMap[target]
        const lambdaI                    = lambda[source]
        const lambdaJ                    = lambda[target]

        const liStr = lambdaI === Infinity || lambdaI === -Infinity ? '∞' : String(lambdaI)
        const ljStr = lambdaJ === Infinity || lambdaJ === -Infinity ? '∞' : String(lambdaJ)

        const candidate = lambdaI === Infinity || lambdaI === -Infinity
          ? INF
          : lambdaI + weight

        const shouldRelax = mode === 'min'
          ? candidate < lambdaJ
          : candidate > lambdaJ


        if (shouldRelax) {
          lambda[target] = candidate
          anyUpdate      = true

          rows.push({
            i, j, sourceId: source, targetId: target,
            lambdaI, lambdaJ,
            diff:       `${ljStr} - ${liStr}`,
            vij:        weight,
            newLambdaJ: candidate,
            updated:    true,
            restarted:  false,
            passNumber,
          })

          if (i > j) {
            rows[rows.length - 1].restarted = true

            /* ── Reset anyUpdate for the new sub-pass ──
            * The restart begins a new verification from j.
            * If nothing updates from here, we should stop.  */
            anyUpdate = false

            passNumber++
            edgeIdx = sortedEdges.findIndex(e => indexMap[e.source] === j)
            if (edgeIdx === -1) edgeIdx = sortedEdges.length
            continue
          }

        } else {
          rows.push({
            i, j, sourceId: source, targetId: target,
            lambdaI, lambdaJ,
            diff:       `${ljStr} - ${liStr}`,
            vij:        weight,
            newLambdaJ: null,
            updated:    false,
            restarted:  false,
            passNumber,
          })
        }

        edgeIdx++
      }

      if (!anyUpdate) {
        keepGoing = false
      } else {
        passNumber++
      }
    }

    /* Final row — signals algorithm termination */
    /*
    rows.push({
      i: null, j: null,
      sourceId: null, targetId: null,
      lambdaI: null, lambdaJ: null,
      diff: null, vij: null,
      newLambdaJ: null,
      updated: false, restarted: false,
      passNumber, isEnd: true,
    })

    */

    const rebound      = sortedEdges.length
    const returnedRows = rows.slice(0,-rebound)

    
    returnedRows.push({
      i: null, j: null,
      sourceId: null, targetId: null,
      lambdaI: null, lambdaJ: null,
      diff: null, vij: null,
      newLambdaJ: null,
      updated: false, restarted: false,
      passNumber, isEnd: true,
    })
      
    
    return { returnedRows, finalLambda: lambda }
  }

/* ============================================================
   HOOK
   ============================================================ */
const useBellmanFord = () => {

  const [steps,       setSteps]       = useState([])
  const [currentStep, setCurrentStep] = useState(-1)
  const [result,      setResult]      = useState(null)
  const [isRunning,   setIsRunning]   = useState(false)
  const [schoolRows,  setSchoolRows]  = useState([])

  /* ── Reset all state ── */
  const reset = useCallback(() => {
    setSteps([])
    setCurrentStep(-1)
    setResult(null)
    setIsRunning(false)
    setSchoolRows([])
  }, [])

  /* ── Build result object from final state ── */
  const buildResult = useCallback((finalDist, finalPred, finalAllPreds, sourceId, targetId, hasCycle) => {
    const allPaths = reconstructAllPaths(finalAllPreds, sourceId, targetId)
    //const path     = reconstructPath(finalPred, sourceId, targetId)
    const path     = allPaths[0] ?? []
    const distance = finalDist[targetId]
    const reachable = distance !== Infinity && distance !== -Infinity

    return {
      path,
      allPaths,
      distance: reachable ? distance : null,
      hasCycle,
      reachable,
    }
  }, [])

  /* ── Run full algorithm instantly ── */
  const run = useCallback((elements, sourceId, targetId, mode) => {
    reset()
    setIsRunning(true)

    const { steps, finalDist, finalPred, finalAllPreds, hasCycle } = computeSteps(
      elements, sourceId, mode
    )

    const res = buildResult(finalDist, finalPred, finalAllPreds, sourceId, targetId, hasCycle)

    setSteps(steps)
    setCurrentStep(steps.length - 1)   // jump to final state
    setResult(res)
    setIsRunning(false)
  }, [reset, buildResult])

  /* ── Initialize step-by-step mode ── */
  const initSteps = useCallback((elements, sourceId, targetId, mode) => {
    reset()

    const { steps, finalDist, finalPred, finalAllPreds, hasCycle } = computeSteps(
      elements, sourceId, mode
    )

    const res = buildResult(finalDist, finalPred, finalAllPreds, sourceId, targetId, hasCycle)

    setSteps(steps)
    setCurrentStep(0)
    setResult(res)
    setIsRunning(true)   // stays true until user reaches last step
  }, [reset, buildResult])

  /* ── Advance one step ── */
  const nextStep = useCallback(() => {
    setCurrentStep(prev => {
      const next = prev + 1
      // Don't set isRunning false here — MainLayout controls that
      return Math.min(next, steps.length - 1)
    })
  }, [steps.length])

  /* ── Compute school-method table ── */
  const computeSchool = useCallback((elements, sourceId, mode) => {
    const { returnedRows } = computeSchoolSteps(elements, sourceId, mode)
    setSchoolRows(returnedRows)
  }, [])

  return {
    steps,
    currentStep,
    result,
    isRunning,
    schoolRows,
    run,
    initSteps,
    nextStep,
    computeSchool,
    reset,
  }
}

export default useBellmanFord