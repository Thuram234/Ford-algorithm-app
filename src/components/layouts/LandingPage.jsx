import { motion } from 'framer-motion'
import { GitBranch, Footprints, BarChart2 } from 'lucide-react'
import Button from '../ui/Button'
import '../../styles/landingPage.css'

/*
 * LandingPage — app entry point
 * Displayed on first load before entering the editor.
 *
 * Props:
 *  onStart : () => void — navigate to editor
 */

const FEATURES = [
  {
    icon:  GitBranch,
    title: 'Interactive graph editor',
    desc:  'Build your graph visually — add nodes, draw edges, set weights.',
  },
  {
    icon:  Footprints,
    title: 'Step-by-step mode',
    desc:  'Watch each relaxation unfold one iteration at a time.',
  },
  {
    icon:  BarChart2,
    title: 'MIN & MAX paths',
    desc:  'Toggle between shortest and longest path in one click.',
  }
]

const LandingPage = ({ onStart = () => {} }) => (
  <div className="landing">

    {/* ── Navbar ── */}
    <header className="landing__nav">
      <div className="landing__nav-brand">
        <div className="landing__nav-logo">
          <GitBranch size={18} aria-hidden />
        </div>
        <span className="landing__nav-name">Ford-Algorithm</span>
      </div>
    </header>

    {/* ── Hero ── */}
    <main className="landing__hero">
      <motion.div
        className="landing__hero-content"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.5 }}
      >
        {/* Icon */}
        <div className="landing__icon">
          <GitBranch size={32} aria-hidden />
        </div>

        {/* Title */}
        <h1 className="landing__title">
          Ford-Algorithm Explorer
        </h1>
        <p className="landing__subtitle">
          Visualize shortest & longest path algorithms,
          step by step — built for learning.
        </p>

        {/* Feature pills */}
        <div className="landing__pills">
          {['MIN path', 'MAX path', 'Step-by-step', 'Cycle detection'].map(pill => (
            <span key={pill} className="landing__pill">{pill}</span>
          ))}
        </div>

        {/* CTA */}
        <Button
          variant="primary"
          size="lg"
          onClick={onStart}
        >
          Get Started →
        </Button>

      </motion.div>
    </main>

    {/* ── Features grid ── */}
    <section className="landing__features">
      {FEATURES.map(({ icon: Icon, title, desc }, i) => (
        <motion.div
          key={title}
          className="landing__feature-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4, delay: 0.1 * i }}
        >
          <div className="landing__feature-icon">
            <Icon size={20} aria-hidden />
          </div>
          <div>
            <p className="landing__feature-title">{title}</p>
            <p className="landing__feature-desc">{desc}</p>
          </div>
        </motion.div>
      ))}
    </section>

  </div>
)

export default LandingPage