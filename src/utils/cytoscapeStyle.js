/* ============================================================
   CYTOSCAPE STYLESHEET
   Visual style for nodes, edges, and their interaction states
   ============================================================ */

const cytoscapeStyle = [

  /* ── Nodes ── */
  {
    selector: 'node',
    style: {
      'width':              48,
      'height':             48,
      'background-color':   '#6366f1',
      'border-width':       2,
      'border-color':       '#4f46e5',

      'label':              'data(displayLabel)',

      'color':              '#ffffff',
      'font-size':          16,
      'font-weight':        600,
      'text-valign':        'center',
      'text-halign':        'center',
      'transition-property': 'background-color, border-color',
      'transition-duration': '200ms',
    },
  },

  /* Distance label — shown below node when distLabel data is set */
  {
    selector: 'node[distLabel]',
    style: {
      'text-valign':  'bottom',
      'text-halign':  'center',
      'text-margin-y': 14,
      'label':        'data(distLabel)',   // ← remplace label par distLabel
      'color':        '#6366f1',
      'font-size':    11,
      'font-weight':  600,
      'text-background-color':   '#ededfb',
      'text-background-opacity': 1,
      'text-background-padding': '3px',
      'text-border-radius':      3,
    },
  },

  /* Node : hovered */
  {
    selector: 'node:active',
    style: { 'background-color': '#4f46e5' },
  },

  /* Node : selected */
  {
    selector: 'node:selected',
    style: {
      'background-color': '#4f46e5',
      'border-color'  : '#5de7ff',
      'border-width':     3,
    },
  },

  /* Node : source (start) */
  {
    selector: 'node.source',
    style: {
      'background-color': '#16a34a',
      'border-color':     '#15803d',
    },
  },

  /* Node : target (destination) */
  {
    selector: 'node.target',
    style: {
      'background-color': '#dc2626',
      'border-color':     '#b91c1c',
    },
  },

  /* Node : visited during algorithm step */
  {
    selector: 'node.visited',
    style: { 'background-color': '#f59e0b', 'border-color': '#d97706' },
  },

  /* Distance label below node — uses :after-like approach via compound */
  {
    selector: 'node.has-distance',
    style: {
      /* Keep original label inside */
      'label':      'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',

      /* Show distance label outside below */
      'text-background-color':   'transparent',
    },
  },

  /* ── Distance ghost node — label displayed below real node ── */
  {
    selector: 'node.distance-ghost',
    style: {
      
      'width':               1,
      'height':              1,
      'border-width':        0,
      'color':               '#4f46e5',
      

      'background-opacity':  0,
      
      'label':               'data(label)',
      'font-size':           11,
      'font-weight':         600,
      'font-family':         'JetBrains Mono, Fira Code, monospace',
      'text-valign':         'center',
      'text-halign':         'center',
      'text-background-color':   '#ededfb',
      'text-background-opacity': 1,
      'text-background-padding': '4px',
      'events':              'no',    // not interactive
    },
  },

  /* ── Edges ── */
  {
    selector: 'edge',
    style: {
      'width':               2,
      'line-color':          '#d1d1e0',
      'target-arrow-color':  '#d1d1e0',
      'target-arrow-shape':  'triangle',
      'curve-style':         'bezier',
      'label':               'data(label)',
      'font-size':           12,
      'color':               '#6b7280',
      'text-background-color':   '#ffffff',
      'text-background-opacity': 1,
      'text-background-padding': '3px',
      'text-border-radius':      4,
      'transition-property': 'line-color, target-arrow-color',
      'transition-duration': '200ms',
    },
  },

  /* Edge : selected */
  {
    selector: 'edge:selected',
    style: {
      'line-color':         '#6366f1',
      'target-arrow-color': '#6366f1',
    },
  },

  /* Edge : active (being relaxed during algorithm) */
  {
    selector: 'edge.active',
    style: {
      'width':              3,
      'line-color':         '#f59e0b',
      'target-arrow-color': '#f59e0b',
    },
  },

  /* Node : part of the optimal path */
  {
    selector: 'node.optimal-node',
    style: {
      'background-color': '#16a34a',
      'border-color':     '#15803d',
      'border-width':     3,
    },
  },


  /* Edge : part of the optimal path */
  {
    selector: 'edge.optimal',
    style: {
      'width':              3,
      'line-color':         '#16a34a',
      'target-arrow-color': '#16a34a',
    },
  }


]

export default cytoscapeStyle