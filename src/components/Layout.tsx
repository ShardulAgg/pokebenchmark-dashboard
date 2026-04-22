import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/games', label: 'Games' },
  { to: '/skills', label: 'Skills' },
  { to: '/runs', label: 'Runs' },
  { to: '/save-states', label: 'Save States' },
  { to: '/compare', label: 'Compare' },
]

export default function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <nav
        style={{
          width: 220,
          minWidth: 220,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 0',
          gap: 4,
        }}
      >
        <div
          style={{
            padding: '0 20px 24px',
            fontWeight: 700,
            fontSize: 18,
            color: 'var(--accent)',
            letterSpacing: '-0.5px',
          }}
        >
          pokebenchmark
        </div>
        {navItems.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              display: 'block',
              padding: '10px 20px',
              color: isActive ? 'var(--accent)' : 'var(--text)',
              background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
              borderLeft: isActive
                ? '3px solid var(--accent)'
                : '3px solid transparent',
              fontWeight: isActive ? 600 : 400,
              fontSize: 14,
              textDecoration: 'none',
              transition: 'background 0.15s',
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <main
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 28,
          background: 'var(--bg)',
        }}
      >
        <Outlet />
      </main>
    </div>
  )
}
