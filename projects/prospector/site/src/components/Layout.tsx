import { NavLink, useLocation } from 'react-router-dom'

const ORG_GROUPS = [
  {
    label: 'Operators',
    description: 'Multi-site education providers',
    orgs: [
      { id: 'cspd', name: 'CSPD' },
      { id: 'ipeople', name: 'iPeople' },
      { id: 'phinma', name: 'PHINMA' },
      { id: 'rising', name: 'Rising' },
      { id: 'school-for-life', name: 'School for Life' },
    ],
  },
  {
    label: 'Advisory',
    description: 'Consulting & thought leadership',
    orgs: [
      { id: 'acasus', name: 'Acasus' },
      { id: 'wise', name: 'WISE' },
    ],
  },
  {
    label: 'SaaS',
    description: 'Education technology vendors',
    orgs: [
      { id: 'kinetic', name: 'Kinetic' },
    ],
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isOrg = location.pathname.startsWith('/organizations/')

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>Prospector</h1>
          <div className="subtitle">Education Sector Intelligence</div>
        </div>

        <nav>
          {ORG_GROUPS.map(group => (
            <div key={group.label}>
              <div className="nav-section-label">{group.label}</div>
              {group.orgs.map(o => (
                <NavLink
                  key={o.id}
                  to={`/organizations/${o.id}`}
                  className={({ isActive }) =>
                    `nav-item ${isActive && isOrg ? 'active' : ''}`
                  }
                >
                  {o.name}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', marginTop: 'auto' }}>
          <NavLink to="/appendix" style={{ fontSize: 10, color: 'var(--text-muted)', opacity: 0.5, textDecoration: 'none' }}>
            Archive
          </NavLink>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
