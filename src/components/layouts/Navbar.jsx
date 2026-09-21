// src/components/layouts/Navbar.jsx

import { RotateCcw, BookOpen, HelpCircle, GitBranch, ArrowLeft } from 'lucide-react'
import Button from '../ui/Button'
import '../../styles/navbar.css'

/*
 * Navbar — top application bar
 *
 * Props:
 *  onNew          : () => void
 *  onExample      : () => void
 *  onHelp         : () => void
 *  activeAction   : 'new' | 'example' | null
 *  view           : 'editor' | 'dashboard'
 *  hasResult      : boolean
 *  onViewResults  : () => void
 *  onBackToEditor : () => void
 */
const Navbar = ({
  onNew          = () => {},
  onExample      = () => {},
  onHelp         = () => {},
  activeAction   = null,
  view           = 'editor',
  onBackToEditor = () => {},
}) => (
  <header className="navbar">

    {/* ── Brand ── */}
    <div className="navbar__brand">
      <div className="navbar__logo">
        <GitBranch size={20} aria-hidden />
      </div>
      <div className="navbar__titles">
        <span className="navbar__name">Ford-Algorithm</span>
        <span className="navbar__tagline">Shortest & Longest Path</span>
      </div>
    </div>

    {/* ── Actions — change based on current view ── */}
    <nav className="navbar__actions">

      {/* Editor view : New Graph + Load Example */}
      {view === 'editor' && (
        <>
          <Button
            variant={activeAction === 'new' ? 'secondary' : 'ghost'}
            size="sm"
            icon={RotateCcw}
            active={activeAction === 'new'}
            onClick={onNew}
          >
            New Graph
          </Button>
          <Button
            variant={activeAction === 'example' ? 'secondary' : 'ghost'}
            size="sm"
            icon={BookOpen}
            active={activeAction === 'example'}
            onClick={onExample}
          >
            Load Example
          </Button>
        </>
      )}

      {/* Dashboard view : Back to Editor */}
      {view === 'dashboard' && (
        <Button
          variant="secondary"
          size="sm"
          icon={ArrowLeft}
          onClick={onBackToEditor}
        >
          Back to Editor
        </Button>
      )}

    </nav>

    {/* ── Right side : help ── */}
    <div className="navbar__right">
      <Button
        variant="ghost"
        size="sm"
        icon={HelpCircle}
        onClick={onHelp}
        aria-label="Help"
      />
    </div>

  </header>
)

export default Navbar