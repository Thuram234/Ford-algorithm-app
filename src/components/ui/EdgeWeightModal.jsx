import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence }     from 'framer-motion'
import { Spline, X }                   from 'lucide-react'
import Button from './Button'

/*
 * Inner form — remounted via key on each open,
 * so useState initializes fresh every time.
 */
const EdgeWeightForm = ({ sourceLabel, targetLabel, onConfirm, onCancel }) => {

  const [value, setValue] = useState('1')
  const [error, setError] = useState('')
  const inputRef          = useRef(null)

  /* Focus input on mount */
  useEffect(() => {
    inputRef.current?.select()
  }, [])

  const handleConfirm = () => {
    const parsed = parseFloat(value)
    if (isNaN(parsed)) {
      setError('Please enter a valid number.')
      return
    }
    onConfirm(parsed)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter')  handleConfirm()
    if (e.key === 'Escape') onCancel()
  }

  return (
    <>
      {/* Arc preview */}
      <div className="edge-weight-modal__preview">
        <span className="edge-weight-modal__node">{sourceLabel}</span>
        <div className="edge-weight-modal__arrow">
          <div className="edge-weight-modal__line" />
          <span className="edge-weight-modal__arrow-head">▶</span>
        </div>
        <span className="edge-weight-modal__node">{targetLabel}</span>
      </div>

      {/* Input */}
      <div className="edge-weight-modal__field">
        <label className="edge-weight-modal__label">Weight</label>
        <input
          ref={inputRef}
          type="number"
          className={`edge-weight-modal__input ${error ? 'has-error' : ''}`}
          value={value}
          onChange={e => { setValue(e.target.value); setError('') }}
          onKeyDown={handleKeyDown}
          placeholder="Enter weight..."
        />
        {error && (
          <span className="edge-weight-modal__error">{error}</span>
        )}
      </div>

      {/* Actions */}
      <div className="modal__actions">
        <Button variant="ghost"   size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleConfirm}>
          Add Edge
        </Button>
      </div>
    </>
  )
}

/*
 * EdgeWeightModal — custom prompt for edge weight input
 *
 * Props:
 *  visible     : boolean
 *  sourceLabel : string
 *  targetLabel : string
 *  onConfirm   : (weight: number) => void
 *  onCancel    : () => void
 */
const EdgeWeightModal = ({
  visible     = false,
  sourceLabel = '?',
  targetLabel = '?',
  onConfirm   = () => {},
  onCancel    = () => {},
}) => (
  <AnimatePresence>
    {visible && (
      <>
        {/* Backdrop */}
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{    opacity: 0 }}
          onClick={onCancel}
        />

        {/* Dialog */}
        <motion.div
          className="modal edge-weight-modal"
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1,    y: 0 }}
          exit={{    opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="modal__header">
            <div className="edge-weight-modal__icon">
              <Spline size={16} aria-hidden />
            </div>
            <span className="modal__title">Edge Weight</span>
            <button
              className="edge-weight-modal__close"
              onClick={onCancel}
              aria-label="Cancel"
            >
              <X size={14} />
            </button>
          </div>

          {/* Form — key forces remount on each open → fresh state */}
          <EdgeWeightForm
				key={`${sourceLabel}_${targetLabel}`}
				sourceLabel={sourceLabel}
				targetLabel={targetLabel}
				onConfirm={onConfirm}
				onCancel={onCancel}
				/>

        </motion.div>
      </>
    )}
  </AnimatePresence>
)

export default EdgeWeightModal