import { useState } from 'react'
import { GitBranch, Table, Route, BookOpen } from 'lucide-react'
import StepTable   from './StepTable'
import PathResult  from './PathResult'
import SchoolTable from './SchoolTable'
import TabSwitcher from '../ui/TabSwitcher'
import '../../styles/dashboard.css'

/*
 * Dashboard — results panel at the bottom
 * Shows step table, optimal path, and adjacency matrix.
 *
 * Props:
 *  steps       : array of algorithm steps
 *  currentStep : index of current step
 *  result      : { path, distance, hasCycle, reachable } | null
 *  elements    : Cytoscape elements array
 *  mode        : 'min' | 'max'
 *  nodeList    : [{ id, label }]
 */

const TABS = [
  { id: 'steps',  label: 'Global',  icon: Table    },
  { id: 'school', label: 'Steps', icon: BookOpen},
  { id: 'path',   label: 'Path',   icon: Route    },
  { id: 'matrix', label: 'Matrix', icon: GitBranch },
]

const Dashboard = ({
  steps       = [],
  currentStep = -1,
  result      = null,
  elements    = [],
  mode        = 'min',
  nodeList    = [],
  schoolRows  = [],
}) => {

  const [activeTab, setActiveTab] = useState('steps')

  /* ── Empty state ── */
  if (!steps.length && !result) {
    return (
      <div className="dashboard dashboard--empty">
        <span className="dashboard__empty-text">
          Run the algorithm to see results here.
        </span>
      </div>
    )
  }

  // Cycle detected — show only the alert, no steps
  if (result?.hasCycle) {
    return (
      <div className="dashboard dashboard--empty">
        <span className="dashboard__empty-text">
          No steps to display — a cycle was detected.
        </span>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <TabSwitcher
        tabs={TABS}
        active={activeTab}
        onChange={setActiveTab}
      />

      <div className="dashboard__content">

        {/* ── Steps table ── */}
        {activeTab === 'steps' && (
          <StepTable
            steps={steps}
            currentStep={currentStep}
            nodeList={nodeList}
          />
        )}

        

        {/* __ School Tab content __*/}
        {activeTab === 'school' && (
          <SchoolTable
            rows={schoolRows}
          />
        )}

        {/* ── Path result ── */}
        {activeTab === 'path' && (
          <PathResult
            result={result}
            nodeList={nodeList}
            mode={mode}
          />
        )}

        {/* ── Adjacency matrix (read-only) ── */}
        {activeTab === 'matrix' && (
          <div className="dashboard__matrix">
            <table className="adj-matrix">
              <thead>
                <tr>
                  <th className="adj-matrix__corner">↓ from \ to →</th>
                  {nodeList.map(n => (
                    <th key={n.id} className="adj-matrix__header">{n.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nodeList.map(rowNode => (
                  <tr key={rowNode.id}>
                    <td className="adj-matrix__row-header">{rowNode.label}</td>
                    {nodeList.map(colNode => {
                      const edge = elements.find(el =>
                        el.data?.source === rowNode.id &&
                        el.data?.target === colNode.id
                      )
                      const isSelf = rowNode.id === colNode.id
                      return (
                        <td
                          key={colNode.id}
                          className={`adj-matrix__cell ${edge ? 'has-value' : ''} ${isSelf ? 'is-self' : ''}`}
                        >
                          {isSelf ? '—' : edge ? edge.data.weight : '∞'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  )
}

export default Dashboard