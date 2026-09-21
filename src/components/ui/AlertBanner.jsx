import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react'

/*
 * AlertBanner — animated notification banner
 *
 * Props:
 *  type    : 'success' | 'danger' | 'warning'
 *  message : string
 *  visible : boolean
 *  onClose : () => void
 */
const ICONS = {
  success: CheckCircle,
  danger:  AlertTriangle,
  warning: XCircle,
}

const AlertBanner = ({ type = 'danger', message = '', visible = false, onClose = () => {} }) => {
  const Icon = ICONS[type]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`alert-banner alert-banner--${type}`}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0   }}
          exit={{    opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
        >
          <Icon size={16} className="alert-banner__icon" />
          <span className="alert-banner__message">{message}</span>
          <button className="alert-banner__close" onClick={onClose}>
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AlertBanner