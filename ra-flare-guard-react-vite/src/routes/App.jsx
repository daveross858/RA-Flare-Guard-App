import { NavLink, Outlet } from 'react-router-dom';
import { ShieldCheck, BarChart3 } from 'lucide-react';

const navigation = [
  { name: 'Overview', to: '/' },
  { name: 'Dashboard', to: '/dashboard' },
];

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(circle_at_top,_rgba(94,97,255,0.25),_transparent_65%)]" />
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-300">
            <ShieldCheck className="h-8 w-8" />
          </span>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-brand-200">RA Flare-Guard™</p>
            <h1 className="text-2xl font-semibold text-slate-100 md:text-3xl">Your RA Flare Early Warning System</h1>
          </div>
        </div>
        <nav className="flex shrink-0 items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 p-1 text-sm shadow-lg shadow-brand-900/20 backdrop-blur">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 font-medium transition ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-inner shadow-brand-900/30'
                    : 'text-slate-300 hover:text-white'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/dashboard" className="btn-secondary hidden items-center gap-2 md:inline-flex">
          <BarChart3 className="h-4 w-4" />
          Dashboard
        </NavLink>
      </header>
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-6 pb-16">
        <Outlet />
      </main>
      <footer className="border-t border-slate-800/60 bg-slate-950/40 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col justify-between gap-4 px-6 text-sm text-slate-500 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} RA Flare-Guard™. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#features">Features</a>
            <a href="mailto:hello@raflareguard.com">Contact</a>
            <a href="https://www.supabase.com" target="_blank" rel="noreferrer">
              Powered by Supabase
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
