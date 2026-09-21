/* ============================================================
   GRAPH HELPERS
   Utility functions for creating and managing Cytoscape elements
   ============================================================ */

/**
 * Global auto-increment counter for node IDs.
 * Declared outside React — never resets on re-render.
 */
let nodeCounter = 0

/**
 * Generates a guaranteed unique node ID using a stable counter.
 * @returns {string} e.g. "node_1", "node_2"
 */
export const generateNodeId = () => `node_${++nodeCounter}`

/**
 * Generates a unique edge ID from source and target node IDs.
 * @param {string} source
 * @param {string} target
 * @returns {string} e.g. "edge_node_1_node_2"
 */
export const generateEdgeId = (source, target) => `edge_${source}_${target}`

/**
 * Creates a Cytoscape-ready node object.
 * @param {string} id
 * @param {string} label
 * @param {{ x: number, y: number }} position
 * @returns {object}
 */
export const createNode = (id, label, position) => ({
  group: 'nodes',
  data:  { id, label, displayLabel: label },  // ← displayLabel initialized
  position,
})

/**
 * Creates a Cytoscape-ready edge object.
 * @param {string} source
 * @param {string} target
 * @param {number} weight
 * @returns {object}
 */
export const createEdge = (source, target, weight = 1) => ({
  group: 'edges',
  data:  {
    id:    generateEdgeId(source, target),
    source,
    target,
    weight,
    label: String(weight),
  },
})

/**
 * Computes the next available label (x1, x2, x3 ...).
 * Finds the smallest positive integer not already in use.
 * @param {Array} nodes - Cytoscape node array
 * @returns {string} e.g. "x3"
 */
export const getNextNodeLabel = (nodes) => {
  const usedIndices = nodes
    .map(n => n.data('label'))
    .filter(label => /^x\d+$/.test(label))
    .map(label => parseInt(label.replace('x', ''), 10))

  let index = 1
  while (usedIndices.includes(index)) index++

  return `x${index}`
}