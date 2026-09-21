import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import Button from './Button'

/*
 * ConfirmModal — simple confirmation dialog
 *
 * Props:
 *  visible   : boolean
 *  title     : string
 *  message   : string
 *  onConfirm : () => void
 *  onCancel  : () => void
 */
const ConfirmModal = ({
  visible   = false,
  title     = 'Are you sure?',
  message   = '',
  onConfirm = () => {},
  onCancel  = () => {},
  confirmButtonLabel = 'Load Example'
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
          className="modal confirm__load"
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1,    y: 0 }}
          exit={{    opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2 }}
        >
          <div className="modal__header">
            <AlertTriangle size={18} className="modal__icon" />
            <span className="modal__title">{title}</span>
          </div>

          <p className="modal__message">{message}</p>

          <div className="modal__actions">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={onConfirm}>
              {confirmButtonLabel}
            </Button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
)

export default ConfirmModal