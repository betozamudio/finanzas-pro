const fs = require('fs');
const path = require('path');
const B = '/workspaces/finanzas-pro/src';
function w(p, c) {
  const full = path.join(B, p);
  fs.mkdirSync(path.dirname(full), {recursive:true});
  fs.writeFileSync(full, c);
  console.log('OK:', p);
}

// ==================== main.tsx ====================
w('main.tsx', `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`);

// ==================== index.css ====================
w('index.css', `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg: #0f172a;
  --color-card: #1e293b;
  --color-accent: #6366f1;
}

body {
  background-color: var(--color-bg);
  color: #f1f5f9;
  font-family: 'Inter', sans-serif;
}

.scrollbar-thin::-webkit-scrollbar { width: 4px; }
.scrollbar-thin::-webkit-scrollbar-track { background: #1e293b; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: #4f46e5; border-radius: 4px; }
`);

// ==================== AuthContext ====================
w('context/AuthContext.tsx', `import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{error: any}>;
  signUp: (email: string, password: string, name: string) => Promise<{error: any}>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    return { error };
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
`);

console.log('Phase 1 done');

// ==================== App.tsx ====================
w('App.tsx', `import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Billetera from './pages/Billetera';
import Ingresos from './pages/Ingresos';
import Egresos from './pages/Egresos';
import Transferencias from './pages/Transferencias';
import Budget from './pages/Budget';
import Balance from './pages/Balance';
import Servicios from './pages/Servicios';
import Imprevistos from './pages/Imprevistos';
import Creditos from './pages/Creditos';
import GiftList from './pages/GiftList';
import Reserva from './pages/Reserva';

const PrivateRoute: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div></div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
      <Route index element={<Dashboard />} />
      <Route path="billetera" element={<Billetera />} />
      <Route path="ingresos" element={<Ingresos />} />
      <Route path="egresos" element={<Egresos />} />
      <Route path="transferencias" element={<Transferencias />} />
      <Route path="budget" element={<Budget />} />
      <Route path="balance" element={<Balance />} />
      <Route path="servicios" element={<Servicios />} />
      <Route path="imprevistos" element={<Imprevistos />} />
      <Route path="creditos" element={<Creditos />} />
      <Route path="gift-list" element={<GiftList />} />
      <Route path="reserva" element={<Reserva />} />
    </Route>
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
`);

console.log('App.tsx done');

// ==================== Layout ====================
w('components/layout/Layout.tsx', `import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Wallet, TrendingUp, TrendingDown,
  ArrowLeftRight, PieChart, BarChart3, Zap, AlertTriangle,
  CreditCard, Gift, PiggyBank, LogOut, Menu, X, ChevronRight
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/billetera', icon: Wallet, label: 'Billetera' },
  { to: '/ingresos', icon: TrendingUp, label: 'Ingresos' },
  { to: '/egresos', icon: TrendingDown, label: 'Egresos' },
  { to: '/transferencias', icon: ArrowLeftRight, label: 'Transferencias' },
  { to: '/budget', icon: PieChart, label: 'Budget' },
  { to: '/balance', icon: BarChart3, label: 'Balance' },
  { to: '/servicios', icon: Zap, label: 'Servicios' },
  { to: '/imprevistos', icon: AlertTriangle, label: 'Imprevistos' },
  { to: '/creditos', icon: CreditCard, label: 'Creditos' },
  { to: '/gift-list', icon: Gift, label: 'Gift List' },
  { to: '/reserva', icon: PiggyBank, label: 'Reserva' },
];

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => { await signOut(); navigate('/login'); };

  const Sidebar = ({ mobile = false }) => (
    <div className={mobile ? 'flex flex-col h-full' : 'flex flex-col h-full'}>
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <PiggyBank size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">FinanzasPro</h1>
            <p className="text-slate-400 text-xs">{user?.email}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? 'flex items-center gap-3 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm'
                    : 'flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white text-sm transition-colors'
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-red-900/30 hover:text-red-400 text-sm w-full transition-colors"
        >
          <LogOut size={18} />
          <span>Cerrar Sesion</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-shrink-0 bg-slate-800 border-r border-slate-700">
        <div className="flex flex-col w-full">
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700">
            <div className="absolute top-4 right-4">
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <Menu size={20} />
          </button>
          <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center">
            <PiggyBank size={14} className="text-white" />
          </div>
          <h1 className="text-white font-bold">FinanzasPro</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
`);

console.log('Layout done');

// ==================== Login ====================
w('pages/Login.tsx', `import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PiggyBank } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await signIn(email, password);
    if (error) { setError(error.message); setLoading(false); }
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PiggyBank size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">FinanzasPro</h2>
          <p className="text-slate-400 mt-1">Gestiona tus finanzas personales</p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6">Iniciar Sesion</h3>
          {error && <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Correo electronico</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Contrasena</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {loading ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>
          <p className="text-center text-slate-400 text-sm mt-4">
            No tienes cuenta? <Link to="/register" className="text-indigo-400 hover:text-indigo-300">Registrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
`);

// ==================== Register ====================
w('pages/Register.tsx', `import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PiggyBank } from 'lucide-react';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await signUp(email, password, name);
    if (error) { setError(error.message); setLoading(false); }
    else { setSuccess(true); setTimeout(() => navigate('/login'), 2000); }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PiggyBank size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">FinanzasPro</h2>
        </div>
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6">Crear Cuenta</h3>
          {error && <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          {success && <div className="bg-green-900/30 border border-green-700 text-green-400 px-4 py-3 rounded-lg mb-4 text-sm">Cuenta creada! Revisa tu correo para verificar.</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Nombre</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Correo electronico</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Contrasena</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                placeholder="Min. 6 caracteres"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {loading ? 'Creando...' : 'Crear Cuenta'}
            </button>
          </form>
          <p className="text-center text-slate-400 text-sm mt-4">
            Ya tienes cuenta? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Inicia sesion</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
`);

console.log('Auth pages done');

// ==================== Dashboard ====================
w('pages/Dashboard.tsx', `import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowLeftRight, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Stats { ingresos: number; egresos: number; saldo: number; cuentas: number; transferencias: number; imprevistos: number; }

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ ingresos:0, egresos:0, saldo:0, cuentas:0, transferencias:0, imprevistos:0 });
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const [ing, egr, bll, trans, imp] = await Promise.all([
        supabase.from('ingresos').select('monto').eq('user_id', user.id),
        supabase.from('egresos').select('monto').eq('user_id', user.id),
        supabase.from('billetera').select('saldo_actual').eq('user_id', user.id),
        supabase.from('transferencias').select('monto').eq('user_id', user.id),
        supabase.from('imprevistos').select('monto').eq('user_id', user.id),
      ]);
      const totalIng = (ing.data||[]).reduce((a,b)=>a+Number(b.monto),0);
      const totalEgr = (egr.data||[]).reduce((a,b)=>a+Number(b.monto),0);
      const totalSaldo = (bll.data||[]).reduce((a,b)=>a+Number(b.saldo_actual),0);
      setStats({ ingresos:totalIng, egresos:totalEgr, saldo:totalSaldo, cuentas:(bll.data||[]).length, transferencias:(trans.data||[]).length, imprevistos:(imp.data||[]).length });
      const { data: recent } = await supabase.from('ingresos').select('*').eq('user_id', user.id).order('fecha', {ascending:false}).limit(5);
      setRecentTx(recent||[]);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const fmt = (n: number) => new Intl.NumberFormat('es-MX', {style:'currency',currency:'MXN'}).format(n);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div></div>;

  const cards = [
    { label:'Total Ingresos', value:fmt(stats.ingresos), icon:TrendingUp, color:'text-green-400', bg:'bg-green-500/10', link:'/ingresos' },
    { label:'Total Egresos', value:fmt(stats.egresos), icon:TrendingDown, color:'text-red-400', bg:'bg-red-500/10', link:'/egresos' },
    { label:'Saldo Total', value:fmt(stats.saldo), icon:Wallet, color:'text-indigo-400', bg:'bg-indigo-500/10', link:'/billetera' },
    { label:'Cuentas', value:stats.cuentas+' cuentas', icon:PiggyBank, color:'text-yellow-400', bg:'bg-yellow-500/10', link:'/billetera' },
    { label:'Transferencias', value:stats.transferencias+' mov.', icon:ArrowLeftRight, color:'text-blue-400', bg:'bg-blue-500/10', link:'/transferencias' },
    { label:'Imprevistos', value:stats.imprevistos+' eventos', icon:AlertTriangle, color:'text-orange-400', bg:'bg-orange-500/10', link:'/imprevistos' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Resumen de tus finanzas</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map(card => (
          <Link key={card.label} to={card.link}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-indigo-500/50 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm">{card.label}</span>
              <div className={card.bg+' p-2 rounded-lg'}>
                <card.icon size={20} className={card.color} />
              </div>
            </div>
            <p className={card.color+' text-2xl font-bold'}>{card.value}</p>
          </Link>
        ))}
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Ingresos Recientes</h2>
        {recentTx.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No hay transacciones aun</p>
        ) : (
          <div className="space-y-3">
            {recentTx.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{tx.concepto}</p>
                  <p className="text-slate-400 text-xs">{tx.categoria} - {new Date(tx.fecha).toLocaleDateString('es-MX')}</p>
                </div>
                <span className="text-green-400 font-semibold">{fmt(tx.monto)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
`);

console.log('Dashboard done');

// ==================== Billetera ====================
w('pages/Billetera.tsx', `import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react';

interface Cuenta { id: string; nombre: string; tipo: string; saldo_inicial: number; saldo_actual: number; moneda: string; color: string; }

const TIPOS = ['Efectivo','Debito','Credito','Ahorro','Inversion','Otro'];
const MONEDAS = ['MXN','USD','EUR'];
const COLORES = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#ec4899'];

export default function Billetera() {
  const { user } = useAuth();
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Cuenta | null>(null);
  const [form, setForm] = useState({ nombre:'', tipo:'Efectivo', saldo_inicial:0, moneda:'MXN', color:'#6366f1' });

  const fmt = (n: number, mon='MXN') => new Intl.NumberFormat('es-MX',{style:'currency',currency:mon}).format(n);

  const fetchCuentas = async () => {
    if (!user) return;
    const { data } = await supabase.from('billetera').select('*').eq('user_id', user.id).order('created_at');
    setCuentas(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCuentas(); }, [user]);

  const openModal = (cuenta?: Cuenta) => {
    if (cuenta) { setEditing(cuenta); setForm({ nombre:cuenta.nombre, tipo:cuenta.tipo, saldo_inicial:cuenta.saldo_inicial, moneda:cuenta.moneda, color:cuenta.color }); }
    else { setEditing(null); setForm({ nombre:'', tipo:'Efectivo', saldo_inicial:0, moneda:'MXN', color:'#6366f1' }); }
    setModal(true);
  };

  const handleSave = async () => {
    if (!user || !form.nombre) return;
    if (editing) {
      await supabase.from('billetera').update({ nombre:form.nombre, tipo:form.tipo, moneda:form.moneda, color:form.color }).eq('id', editing.id);
    } else {
      await supabase.from('billetera').insert({ ...form, saldo_actual:form.saldo_inicial, user_id:user.id });
    }
    setModal(false);
    fetchCuentas();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta cuenta?')) return;
    await supabase.from('billetera').delete().eq('id', id);
    fetchCuentas();
  };

  const totalSaldo = cuentas.reduce((a,b) => a + Number(b.saldo_actual), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Billetera</h1>
          <p className="text-slate-400 mt-1">Gestiona tus cuentas</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Nueva Cuenta
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center"><Wallet size={24} className="text-indigo-400" /></div>
          <div>
            <p className="text-slate-400 text-sm">Saldo Total</p>
            <p className="text-3xl font-bold text-white">{fmt(totalSaldo)}</p>
          </div>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cuentas.map(c => (
            <div key={c.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-indigo-500/40 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor:c.color+'33'}}>
                    <Wallet size={20} style={{color:c.color}} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{c.nombre}</h3>
                    <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">{c.tipo}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openModal(c)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{fmt(c.saldo_actual, c.moneda)}</p>
                <p className="text-xs text-slate-500 mt-1">{c.moneda} - Inicial: {fmt(c.saldo_inicial, c.moneda)}</p>
              </div>
            </div>
          ))}
          {cuentas.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">No tienes cuentas. Agrega una!</div>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-6">{editing ? 'Editar Cuenta' : 'Nueva Cuenta'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Nombre</label>
                <input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Ej: Caja de Ahorro"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Tipo</label>
                <select value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500">
                  {TIPOS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              {!editing && (
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Saldo Inicial</label>
                  <input type="number" value={form.saldo_inicial} onChange={e=>setForm({...form,saldo_inicial:Number(e.target.value)})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Moneda</label>
                <select value={form.moneda} onChange={e=>setForm({...form,moneda:e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500">
                  {MONEDAS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Color</label>
                <div className="flex gap-2">
                  {COLORES.map(col => (
                    <button key={col} onClick={() => setForm({...form,color:col})}
                      className="w-8 h-8 rounded-full border-2 transition-all"
                      style={{backgroundColor:col, borderColor: form.color===col ? '#fff' : 'transparent'}}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg text-sm transition-colors">Cancelar</button>
              <button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm transition-colors">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`);

console.log('Billetera done');

// ==================== Ingresos ====================
w('pages/Ingresos.tsx', `import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';

interface Ingreso { id:string; concepto:string; categoria:string; monto:number; fecha:string; cuenta_id:string; notas:string; }
interface Cuenta { id:string; nombre:string; }

const CATEGORIAS_ING = ['Sueldo','Freelance','Negocio','Inversion','Regalo','Otro'];

export default function Ingresos() {
  const { user } = useAuth();
  const [items, setItems] = useState<Ingreso[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Ingreso|null>(null);
  const [form, setForm] = useState({ concepto:'', categoria:'Sueldo', monto:0, fecha:new Date().toISOString().split('T')[0], cuenta_id:'', notas:'' });
  const [filtroMes, setFiltroMes] = useState(new Date().toISOString().slice(0,7));

  const fmt = (n:number) => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(n);

  const fetchData = async () => {
    if (!user) return;
    const [{ data:ing }, { data:cue }] = await Promise.all([
      supabase.from('ingresos').select('*').eq('user_id',user.id).order('fecha',{ascending:false}),
      supabase.from('billetera').select('id,nombre').eq('user_id',user.id)
    ]);
    setItems(ing||[]);
    setCuentas(cue||[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const filtered = items.filter(i => i.fecha?.startsWith(filtroMes));
  const total = filtered.reduce((a,b) => a+Number(b.monto), 0);

  const openModal = (item?: Ingreso) => {
    if (item) { setEditing(item); setForm({ concepto:item.concepto, categoria:item.categoria, monto:item.monto, fecha:item.fecha, cuenta_id:item.cuenta_id||'', notas:item.notas||'' }); }
    else { setEditing(null); setForm({ concepto:'', categoria:'Sueldo', monto:0, fecha:new Date().toISOString().split('T')[0], cuenta_id:cuentas[0]?.id||'', notas:'' }); }
    setModal(true);
  };

  const handleSave = async () => {
    if (!user || !form.concepto || !form.monto) return;
    const payload = { ...form, monto:Number(form.monto), user_id:user.id };
    if (editing) await supabase.from('ingresos').update(payload).eq('id', editing.id);
    else await supabase.from('ingresos').insert(payload);
    setModal(false);
    fetchData();
  };

  const handleDelete = async (id:string) => {
    if (!confirm('Eliminar?')) return;
    await supabase.from('ingresos').delete().eq('id', id);
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-white">Ingresos</h1><p className="text-slate-400 mt-1">Registra tus entradas de dinero</p></div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"><Plus size={16}/>Nuevo Ingreso</button>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-3 flex-1">
          <TrendingUp size={20} className="text-green-400" />
          <div><p className="text-slate-400 text-xs">Total del mes</p><p className="text-xl font-bold text-green-400">{fmt(total)}</p></div>
        </div>
        <input type="month" value={filtroMes} onChange={e=>setFiltroMes(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
        />
      </div>
      {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div> : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  {['Concepto','Categoria','Cuenta','Fecha','Monto','Acciones'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-750 transition-colors">
                    <td className="px-4 py-3 text-white text-sm font-medium">{item.concepto}</td>
                    <td className="px-4 py-3"><span className="bg-green-500/10 text-green-400 px-2 py-1 rounded-full text-xs">{item.categoria}</span></td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{cuentas.find(c=>c.id===item.cuenta_id)?.nombre||'-'}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{new Date(item.fecha+'T00:00').toLocaleDateString('es-MX')}</td>
                    <td className="px-4 py-3 text-green-400 font-semibold">{fmt(item.monto)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={()=>openModal(item)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg"><Pencil size={14}/></button>
                        <button onClick={()=>handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length===0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">No hay ingresos este mes</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-6">{editing?'Editar Ingreso':'Nuevo Ingreso'}</h3>
            <div className="space-y-4">
              <div><label className="block text-sm text-slate-400 mb-2">Concepto</label>
                <input value={form.concepto} onChange={e=>setForm({...form,concepto:e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-slate-400 mb-2">Categoria</label>
                  <select value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500">
                    {CATEGORIAS_ING.map(c=><option key={c}>{c}</option>)}
                  </select></div>
                <div><label className="block text-sm text-slate-400 mb-2">Monto</label>
                  <input type="number" value={form.monto} onChange={e=>setForm({...form,monto:Number(e.target.value)})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-slate-400 mb-2">Fecha</label>
                  <input type="date" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" /></div>
                <div><label className="block text-sm text-slate-400 mb-2">Cuenta</label>
                  <select value={form.cuenta_id} onChange={e=>setForm({...form,cuenta_id:e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500">
                    <option value="">Sin cuenta</option>
                    {cuentas.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select></div>
              </div>
              <div><label className="block text-sm text-slate-400 mb-2">Notas</label>
                <textarea value={form.notas} onChange={e=>setForm({...form,notas:e.target.value})} rows={2} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 resize-none" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg text-sm">Cancelar</button>
              <button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`);

console.log('Ingresos done');

// ==================== Egresos ====================
w('pages/Egresos.tsx', `import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Pencil, Trash2, TrendingDown } from 'lucide-react';

interface Egreso { id:string; concepto:string; categoria:string; subcategoria:string; monto:number; fecha:string; cuenta_id:string; notas:string; }
interface Cuenta { id:string; nombre:string; }

const CATEGORIAS_EGR = ['Hogar','Alimentacion','Transporte','Salud','Entretenimiento','Ropa','Educacion','Servicios','Otros'];

export default function Egresos() {
  const { user } = useAuth();
  const [items, setItems] = useState<Egreso[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Egreso|null>(null);
  const [form, setForm] = useState({ concepto:'', categoria:'Hogar', subcategoria:'', monto:0, fecha:new Date().toISOString().split('T')[0], cuenta_id:'', notas:'' });
  const [filtroMes, setFiltroMes] = useState(new Date().toISOString().slice(0,7));

  const fmt = (n:number) => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(n);

  const fetchData = async () => {
    if (!user) return;
    const [{ data:egr }, { data:cue }] = await Promise.all([
      supabase.from('egresos').select('*').eq('user_id',user.id).order('fecha',{ascending:false}),
      supabase.from('billetera').select('id,nombre').eq('user_id',user.id)
    ]);
    setItems(egr||[]); setCuentas(cue||[]); setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const filtered = items.filter(i => i.fecha?.startsWith(filtroMes));
  const total = filtered.reduce((a,b) => a+Number(b.monto), 0);

  const openModal = (item?: Egreso) => {
    if (item) { setEditing(item); setForm({ concepto:item.concepto, categoria:item.categoria, subcategoria:item.subcategoria||'', monto:item.monto, fecha:item.fecha, cuenta_id:item.cuenta_id||'', notas:item.notas||'' }); }
    else { setEditing(null); setForm({ concepto:'', categoria:'Hogar', subcategoria:'', monto:0, fecha:new Date().toISOString().split('T')[0], cuenta_id:cuentas[0]?.id||'', notas:'' }); }
    setModal(true);
  };

  const handleSave = async () => {
    if (!user || !form.concepto || !form.monto) return;
    const payload = { ...form, monto:Number(form.monto), user_id:user.id };
    if (editing) await supabase.from('egresos').update(payload).eq('id', editing.id);
    else await supabase.from('egresos').insert(payload);
    setModal(false); fetchData();
  };

  const handleDelete = async (id:string) => {
    if (!confirm('Eliminar?')) return;
    await supabase.from('egresos').delete().eq('id', id); fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-white">Egresos</h1><p className="text-slate-400 mt-1">Controla tus gastos</p></div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"><Plus size={16}/>Nuevo Egreso</button>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-3 flex-1">
          <TrendingDown size={20} className="text-red-400" />
          <div><p className="text-slate-400 text-xs">Total del mes</p><p className="text-xl font-bold text-red-400">{fmt(total)}</p></div>
        </div>
        <input type="month" value={filtroMes} onChange={e=>setFiltroMes(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
        />
      </div>
      {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div> : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-700">{['Concepto','Categoria','Cuenta','Fecha','Monto','Acciones'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-700">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-750">
                    <td className="px-4 py-3 text-white text-sm">{item.concepto}</td>
                    <td className="px-4 py-3"><span className="bg-red-500/10 text-red-400 px-2 py-1 rounded-full text-xs">{item.categoria}</span></td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{cuentas.find(c=>c.id===item.cuenta_id)?.nombre||'-'}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{new Date(item.fecha+'T00:00').toLocaleDateString('es-MX')}</td>
                    <td className="px-4 py-3 text-red-400 font-semibold">{fmt(item.monto)}</td>
                    <td className="px-4 py-3"><div className="flex gap-1">
                      <button onClick={()=>openModal(item)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg"><Pencil size={14}/></button>
                      <button onClick={()=>handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={14}/></button>
                    </div></td>
                  </tr>
                ))}
                {filtered.length===0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">No hay egresos este mes</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-6">{editing?'Editar Egreso':'Nuevo Egreso'}</h3>
            <div className="space-y-4">
              <div><label className="block text-sm text-slate-400 mb-2">Concepto</label>
                <input value={form.concepto} onChange={e=>setForm({...form,concepto:e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-slate-400 mb-2">Categoria</label>
                  <select value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500">
                    {CATEGORIAS_EGR.map(c=><option key={c}>{c}</option>)}
                  </select></div>
                <div><label className="block text-sm text-slate-400 mb-2">Monto</label>
                  <input type="number" value={form.monto} onChange={e=>setForm({...form,monto:Number(e.target.value)})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-slate-400 mb-2">Fecha</label>
                  <input type="date" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" /></div>
                <div><label className="block text-sm text-slate-400 mb-2">Cuenta</label>
                  <select value={form.cuenta_id} onChange={e=>setForm({...form,cuenta_id:e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500">
                    <option value="">Sin cuenta</option>
                    {cuentas.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select></div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg text-sm">Cancelar</button>
              <button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`);

console.log('Egresos done');

// ==================== Transferencias ====================
w('pages/Transferencias.tsx', `import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Pencil, Trash2, ArrowLeftRight } from 'lucide-react';

interface Transferencia { id:string; cuenta_origen_id:string; cuenta_destino_id:string; monto:number; fecha:string; concepto:string; notas:string; }
interface Cuenta { id:string; nombre:string; }

export default function Transferencias() {
  const { user } = useAuth();
  const [items, setItems] = useState<Transferencia[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Transferencia|null>(null);
  const [form, setForm] = useState({ cuenta_origen_id:'', cuenta_destino_id:'', monto:0, fecha:new Date().toISOString().split('T')[0], concepto:'', notas:'' });

  const fmt = (n:number) => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(n);

  const fetchData = async () => {
    if (!user) return;
    const [{ data:trans }, { data:cue }] = await Promise.all([
      supabase.from('transferencias').select('*').eq('user_id',user.id).order('fecha',{ascending:false}),
      supabase.from('billetera').select('id,nombre').eq('user_id',user.id)
    ]);
    setItems(trans||[]); setCuentas(cue||[]); setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const openModal = (item?: Transferencia) => {
    if (item) { setEditing(item); setForm({ cuenta_origen_id:item.cuenta_origen_id, cuenta_destino_id:item.cuenta_destino_id, monto:item.monto, fecha:item.fecha, concepto:item.concepto||'', notas:item.notas||'' }); }
    else { setEditing(null); setForm({ cuenta_origen_id:cuentas[0]?.id||'', cuenta_destino_id:cuentas[1]?.id||'', monto:0, fecha:new Date().toISOString().split('T')[0], concepto:'Transferencia', notas:'' }); }
    setModal(true);
  };

  const handleSave = async () => {
    if (!user || !form.monto || !form.cuenta_origen_id || !form.cuenta_destino_id) return;
    const payload = { ...form, monto:Number(form.monto), user_id:user.id };
    if (editing) await supabase.from('transferencias').update(payload).eq('id', editing.id);
    else await supabase.from('transferencias').insert(payload);
    setModal(false); fetchData();
  };

  const handleDelete = async (id:string) => {
    if (!confirm('Eliminar?')) return;
    await supabase.from('transferencias').delete().eq('id', id); fetchData();
  };

  const getCuenta = (id:string) => cuentas.find(c=>c.id===id)?.nombre||'-';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-white">Transferencias</h1><p className="text-slate-400 mt-1">Mueve dinero entre cuentas</p></div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"><Plus size={16}/>Nueva Transferencia</button>
      </div>
      {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div> : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-700">{['Origen','Destino','Concepto','Fecha','Monto','Acciones'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-700">
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-white text-sm">{getCuenta(item.cuenta_origen_id)}</td>
                    <td className="px-4 py-3 text-white text-sm">{getCuenta(item.cuenta_destino_id)}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{item.concepto}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{new Date(item.fecha+'T00:00').toLocaleDateString('es-MX')}</td>
                    <td className="px-4 py-3 text-blue-400 font-semibold">{fmt(item.monto)}</td>
                    <td className="px-4 py-3"><div className="flex gap-1">
                      <button onClick={()=>openModal(item)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg"><Pencil size={14}/></button>
                      <button onClick={()=>handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={14}/></button>
                    </div></td>
                  </tr>
                ))}
                {items.length===0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">No hay transferencias</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-6">{editing?'Editar Transferencia':'Nueva Transferencia'}</h3>
            <div className="space-y-4">
              <div><label className="block text-sm text-slate-400 mb-2">Cuenta Origen</label>
                <select value={form.cuenta_origen_id} onChange={e=>setForm({...form,cuenta_origen_id:e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500">
                  {cuentas.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select></div>
              <div><label className="block text-sm text-slate-400 mb-2">Cuenta Destino</label>
                <select value={form.cuenta_destino_id} onChange={e=>setForm({...form,cuenta_destino_id:e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500">
                  {cuentas.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-slate-400 mb-2">Monto</label>
                  <input type="number" value={form.monto} onChange={e=>setForm({...form,monto:Number(e.target.value)})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" /></div>
                <div><label className="block text-sm text-slate-400 mb-2">Fecha</label>
                  <input type="date" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" /></div>
              </div>
              <div><label className="block text-sm text-slate-400 mb-2">Concepto</label>
                <input value={form.concepto} onChange={e=>setForm({...form,concepto:e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg text-sm">Cancelar</button>
              <button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`);

console.log('Transferencias done');
