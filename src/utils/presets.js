/* ============================================================
   PRESETS
   Pre-built graph examples for demonstration purposes.
   Each preset contains nodes and edges in Cytoscape format.
   ============================================================ */

const DEMO_PRESET = {
  id:          'demo',
  name:        'Demo Graph',
  description: 'A simple weighted graph to demonstrate Bellman-Ford',
  nodes: [
    { group: 'nodes', data: { id: 'node_1', label: 'x1', displayLabel: 'x1' }, position: { x: 150, y: 200 } },
    { group: 'nodes', data: { id: 'node_2', label: 'x2', displayLabel: 'x2' }, position: { x: 350, y: 100 } },
    { group: 'nodes', data: { id: 'node_3', label: 'x3', displayLabel: 'x3' }, position: { x: 350, y: 300 } },
    { group: 'nodes', data: { id: 'node_4', label: 'x4', displayLabel: 'x4' }, position: { x: 550, y: 100 } },
    { group: 'nodes', data: { id: 'node_5', label: 'x5', displayLabel: 'x5' }, position: { x: 550, y: 300 } },
    { group: 'nodes', data: { id: 'node_6', label: 'x6', displayLabel: 'x6' }, position: { x: 750, y: 200 } },
  ],
  edges: [
    { group: 'edges', data: { id: 'edge_node_1_node_2', source: 'node_1', target: 'node_2', weight: 4,  label: '4'  } },
    { group: 'edges', data: { id: 'edge_node_1_node_3', source: 'node_1', target: 'node_3', weight: 2,  label: '2'  } },
    { group: 'edges', data: { id: 'edge_node_2_node_4', source: 'node_2', target: 'node_4', weight: 3,  label: '3'  } },
    { group: 'edges', data: { id: 'edge_node_2_node_5', source: 'node_2', target: 'node_5', weight: 1,  label: '1'  } },
    { group: 'edges', data: { id: 'edge_node_3_node_2', source: 'node_3', target: 'node_2', weight: 1,  label: '1'  } },
    { group: 'edges', data: { id: 'edge_node_3_node_5', source: 'node_3', target: 'node_5', weight: 5,  label: '5'  } },
    { group: 'edges', data: { id: 'edge_node_4_node_6', source: 'node_4', target: 'node_6', weight: 2,  label: '2'  } },
    { group: 'edges', data: { id: 'edge_node_5_node_4', source: 'node_5', target: 'node_4', weight: 1,  label: '1'  } },
    { group: 'edges', data: { id: 'edge_node_5_node_6', source: 'node_5', target: 'node_6', weight: 3,  label: '3'  } },
  ],
}

/* Returns all elements (nodes + edges) merged */
export const getDemoPreset = () => [
  ...DEMO_PRESET.nodes,
  ...DEMO_PRESET.edges,
]

export default DEMO_PRESET