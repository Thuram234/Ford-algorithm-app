import { motion, AnimatePresence } from 'framer-motion'
import { X, MousePointer2, CirclePlus, Spline, Play, ChevronRight, RotateCcw, GitBranch } from 'lucide-react'
import Button from './Button'

/*
 * HelpModal — quick reference guide
 * Displays essential usage instructions for the application.
 *
 * Props:
 *  visible  : boolean
 *  onClose  : () => void
 */
const HelpModal = ({ visible = false, onClose = () => {} }) => (
  <AnimatePresence>
    {visible && (
      <>
        {/* Backdrop */}
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{    opacity: 0 }}
          onClick={onClose}
        />

        {/* Dialog */}
        <motion.div
          className="modal help-modal"
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1,    y: 0 }}
          exit={{    opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="modal__header">
            <div className="help-modal__icon">
              <GitBranch size={16} aria-hidden />
            </div>
            <span className="modal__title">User Guide</span>
            <button
              className="edge-weight-modal__close"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>

          {/* Content */}
          <div className="help-modal__content">

            {/* Section 1 : Algorithm */}
            <div className="help-modal__section">
              <h3 className="help-modal__section-title">Ford Algorithm (Bellman-Ford)</h3>
              <p className="help-modal__text">
                The Ford algorithm finds the optimal path (minimum or maximum)
                between two vertices of a weighted directed graph,
                even in the presence of negative weights.
              </p>
              <div className="help-modal__formula">
                <span className="help-modal__formula-text">
                  If λj − λi {'>'} v(xi, xj) then λj = λi + v(xi, xj)
                </span>
              </div>
              <p className="help-modal__text">
                The algorithm stops when no λ value can be further updated.
                A cycle is detected if updates persist after n−1 iterations.
              </p>
            </div>

            {/* Section 2 : Graph Editor */}
            <div className="help-modal__section">
              <h3 className="help-modal__section-title">Graph Editor</h3>
              <div className="help-modal__items">
                <div className="help-modal__item">
                  <div className="help-modal__item-icon"><MousePointer2 size={14} /></div>
                  <div>
                    <span className="help-modal__item-label">Select</span>
                    <span className="help-modal__item-desc"> — Click to select, drag to move</span>
                  </div>
                </div>
                <div className="help-modal__item">
                  <div className="help-modal__item-icon"><CirclePlus size={14} /></div>
                  <div>
                    <span className="help-modal__item-label">Node</span>
                    <span className="help-modal__item-desc"> — Click on the canvas to add a vertex</span>
                  </div>
                </div>
                <div className="help-modal__item">
                  <div className="help-modal__item-icon"><Spline size={14} /></div>
                  <div>
                    <span className="help-modal__item-label">Edge</span>
                    <span className="help-modal__item-desc"> — Click source then destination node, enter the weight</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 : Execution */}
            <div className="help-modal__section">
              <h3 className="help-modal__section-title">Running the Algorithm</h3>
              <div className="help-modal__items">
                <div className="help-modal__item">
                  <div className="help-modal__item-icon"><Play size={14} /></div>
                  <div>
                    <span className="help-modal__item-label">Run</span>
                    <span className="help-modal__item-desc"> — Executes the algorithm and displays the final result instantly</span>
                  </div>
                </div>
                <div className="help-modal__item">
                  <div className="help-modal__item-icon"><ChevronRight size={14} /></div>
                  <div>
                    <span className="help-modal__item-label">Step</span>
                    <span className="help-modal__item-desc"> — Advances one iteration at a time to visualize each relaxation</span>
                  </div>
                </div>
                <div className="help-modal__item">
                  <div className="help-modal__item-icon"><RotateCcw size={14} /></div>
                  <div>
                    <span className="help-modal__item-label">Reset</span>
                    <span className="help-modal__item-desc"> — Resets the algorithm without clearing the graph</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4 : Dashboard */}
            <div className="help-modal__section">
              <h3 className="help-modal__section-title">Dashboard</h3>
              <div className="help-modal__items">
                <div className="help-modal__item">
                  <div className="help-modal__item-badge">Global</div>
                  <span className="help-modal__item-desc">Distance table updated at each iteration</span>
                </div>
                <div className="help-modal__item">
                  <div className="help-modal__item-badge">Steps</div>
                  <span className="help-modal__item-desc">Detailed table following the school Ford method</span>
                </div>
                <div className="help-modal__item">
                  <div className="help-modal__item-badge">Path</div>
                  <span className="help-modal__item-desc">Reconstructed optimal path with total distance</span>
                </div>
                <div className="help-modal__item">
                  <div className="help-modal__item-badge">Matrix</div>
                  <span className="help-modal__item-desc">Adjacency matrix of the current graph</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="modal__actions">
            <Button variant="primary" size="sm" onClick={onClose}>
              Got it!
            </Button>
          </div>

        </motion.div>
      </>
    )}
  </AnimatePresence>
)

export default HelpModal