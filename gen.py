python3 << 'PYEOF'
import os
B = '/workspaces/finanzas-pro/src'
def w(path, content):
    full = B + '/' + path
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, 'w').write(content)
    print('OK:', path)

w('pages/Budget.tsx', '''import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { PieChart, Plus, Trash2 } from 'lucide-react';

export default function Budget() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [egresos, setEgresos] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ categoria: 'Alimentacion', monto_limite: 0, periodo: 'Mensual' });

  const fetchData = async () => {
    if (!user) return;
    const [{ data: bud }, { data: egr }] = await Promise.all([
      supabase.from('budget').select('*').eq('user_id', user.id),
      supabase.from('egresos').select('*').eq('user_id', user.id)
    ]);
    setItems(bud || []);
    setEgresos(egr || []);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSave = async () => {
    if (!user) return;
    await supabase.from('budget').insert({ ...form, user_id: user.id });
    setModal(false); fetchData();
  };

  const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

  return (
    <div>
      <div className="flex justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Presupuestos</h1>
        <button onClick={() => setModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"><Plus size={16}/> Nuevo</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map(b => {
          const gastado = egresos.filter(e => e.categoria === b.categoria).reduce((acc, curr) => acc + Number(curr.monto), 0);
          const pct = Math.min((gastado / b.monto_limite) * 100, 100);
          return (
            <div key={b.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <div className="flex justify-between mb-2">
                <span className="text-white font-medium">{b.categoria}</span>
                <span className="text-slate-400 text-sm">{fmt(gastado)} / {fmt(b.monto_limite)}</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className={`h-full ${pct > 90 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-slate-800 p-6 rounded-xl w-full max-w-sm">
            <h2 className="text-white font-bold mb-4">Nuevo Presupuesto</h2>
            <div className="space-y-4">
              <input placeholder="Categoria" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} className="w-full bg-slate-700 p-2 rounded text-white" />
              <input type="number" placeholder="Limite" value={form.monto_limite} onChange={e => setForm({ ...form, monto_limite: Number(e.target.value) })} className="w-full bg-slate-700 p-2 rounded text-white" />
              <div className="flex gap-2">
                <button onClick={() => setModal(false)} className="flex-1 bg-slate-600 p-2 rounded text-white">Cancelar</button>
                <button onClick={handleSave} className="flex-1 bg-indigo-600 p-2 rounded text-white">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
''')

w('pages/Balance.tsx', '''import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Balance() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('balance').select('*').eq('user_id', user.id).order('mes', { ascending: false }).then(({ data }) => setItems(data || []));
  }, [user]);

  const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Balance Historico</h1>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-700 text-slate-400 uppercase text-xs">
            <tr><th className="px-6 py-3">Mes</th><th className="px-6 py-3 text-green-400">Ingresos</th><th className="px-6 py-3 text-red-400">Egresos</th><th className="px-6 py-3">Ahorro</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-700 text-white">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-slate-750">
                <td className="px-6 py-4">{item.mes}</td>
                <td className="px-6 py-4 text-green-400">{fmt(item.total_ingresos)}</td>
                <td className="px-6 py-4 text-red-400">{fmt(item.total_egresos)}</td>
                <td className="px-6 py-4">{fmt(item.ahorro_neto)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
''')

w('pages/Servicios.tsx', '''import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Zap, Plus, Check } from 'lucide-react';

export default function Servicios() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nombre: '', monto: 0, fecha_vencimiento: '', pagado: false });

  const fetchData = async () => {
    if (!user) return;
    const { data } = await supabase.from('servicios').select('*').eq('user_id', user.id);
    setItems(data || []);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSave = async () => {
    if (!user) return;
    await supabase.from('servicios').insert({ ...form, user_id: user.id });
    setModal(false); fetchData();
  };

  const togglePaid = async (item: any) => {
    await supabase.from('servicios').update({ pagado: !item.pagado }).eq('id', item.id);
    fetchData();
  };

  return (
    <div>
      <div className="flex justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Servicios</h1>
        <button onClick={() => setModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"><Plus size={16}/> Nuevo</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(s => (
          <div key={s.id} className={`bg-slate-800 p-5 rounded-xl border ${s.pagado ? 'border-green-500/30' : 'border-slate-700'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.pagado ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                  <Zap size={20} className={s.pagado ? 'text-green-400' : 'text-yellow-400'} />
                </div>
                <div><h3 className="text-white font-medium">{s.nombre}</h3><p className="text-slate-400 text-xs">Vence: {s.fecha_vencimiento}</p></div>
              </div>
              <button onClick={() => togglePaid(s)} className={`p-1 rounded ${s.pagado ? 'bg-green-500 text-white' : 'border border-slate-600 text-slate-400'}`}><Check size={16}/></button>
            </div>
            <p className="text-xl font-bold text-white">${s.monto}</p>
          </div>
        ))}
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-slate-800 p-6 rounded-xl w-full max-w-sm">
            <h2 className="text-white font-bold mb-4">Nuevo Servicio</h2>
            <div className="space-y-4">
              <input placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full bg-slate-700 p-2 rounded text-white" />
              <input type="number" placeholder="Monto" value={form.monto} onChange={e => setForm({ ...form, monto: Number(e.target.value) })} className="w-full bg-slate-700 p-2 rounded text-white" />
              <input type="date" value={form.fecha_vencimiento} onChange={e => setForm({ ...form, fecha_vencimiento: e.target.value })} className="w-full bg-slate-700 p-2 rounded text-white" />
              <div className="flex gap-2">
                <button onClick={() => setModal(false)} className="flex-1 bg-slate-600 p-2 rounded text-white">Cancelar</button>
                <button onClick={handleSave} className="flex-1 bg-indigo-600 p-2 rounded text-white">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
''')

w('pages/Imprevistos.tsx', '''import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Plus } from 'lucide-react';

export default function Imprevistos() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ concepto: '', monto: 0, fecha: new Date().toISOString().split('T')[0] });

  const fetchData = async () => {
    if (!user) return;
    const { data } = await supabase.from('imprevistos').select('*').eq('user_id', user.id).order('fecha', { ascending: false });
    setItems(data || []);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSave = async () => {
    if (!user) return;
    await supabase.from('imprevistos').insert({ ...form, user_id: user.id });
    setModal(false); fetchData();
  };

  return (
    <div>
      <div className="flex justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Imprevistos</h1>
        <button onClick={() => setModal(true)} className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"><Plus size={16}/> Registrar</button>
      </div>
      <div className="space-y-3">
        {items.map(i => (
          <div key={i.id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><AlertTriangle size={20}/></div>
              <div><p className="text-white font-medium">{i.concepto}</p><p className="text-slate-400 text-xs">{i.fecha}</p></div>
            </div>
            <p className="text-white font-bold text-lg">${i.monto}</p>
          </div>
        ))}
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-slate-800 p-6 rounded-xl w-full max-w-sm">
            <h2 className="text-white font-bold mb-4">Registrar Imprevisto</h2>
            <div className="space-y-4">
              <input placeholder="Concepto" value={form.concepto} onChange={e => setForm({ ...form, concepto: e.target.value })} className="w-full bg-slate-700 p-2 rounded text-white" />
              <input type="number" placeholder="Monto" value={form.monto} onChange={e => setForm({ ...form, monto: Number(e.target.value) })} className="w-full bg-slate-700 p-2 rounded text-white" />
              <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} className="w-full bg-slate-700 p-2 rounded text-white" />
              <div className="flex gap-2">
                <button onClick={() => setModal(false)} className="flex-1 bg-slate-600 p-2 rounded text-white">Cancelar</button>
                <button onClick={handleSave} className="flex-1 bg-indigo-600 p-2 rounded text-white">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
''')

w('pages/Creditos.tsx', '''import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Plus } from 'lucide-react';

export default function Creditos() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('creditos').select('*').eq('user_id', user.id).then(({ data }) => setItems(data || []));
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Creditos y Prestamos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(c => (
          <div key={c.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><CreditCard size={20}/></div>
              <div><h3 className="text-white font-medium">{c.entidad}</h3><p className="text-slate-400 text-xs">Vence el {c.dia_pago} de cada mes</p></div>
            </div>
            <div className="flex justify-between items-end">
              <div><p className="text-slate-400 text-xs">Monto Total</p><p className="text-white font-bold">${c.monto_total}</p></div>
              <div className="text-right"><p className="text-slate-400 text-xs">Cuota Mensual</p><p className="text-indigo-400 font-bold">${c.cuota_mensual}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
''')

w('pages/GiftList.tsx', '''import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Gift, Plus } from 'lucide-react';

export default function GiftList() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('gift_list').select('*').eq('user_id', user.id).then(({ data }) => setItems(data || []));
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Gift List</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(i => (
          <div key={i.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400"><Gift size={20}/></div>
              <h3 className="text-white font-medium">{i.persona}</h3>
            </div>
            <p className="text-slate-400 text-sm mb-2">{i.ocasion} - {i.regalo}</p>
            <p className="text-white font-bold">${i.presupuesto}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
''')

w('pages/Reserva.tsx', '''import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { PiggyBank } from 'lucide-react';

export default function Reserva() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('reserva_monetaria').select('*').eq('user_id', user.id).then(({ data }) => setItems(data || []));
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Reserva Monetaria</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(r => (
          <div key={r.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400"><PiggyBank size={24}/></div>
            <h3 className="text-white font-medium mb-1">{r.moneda}</h3>
            <p className="text-2xl font-bold text-white mb-2">${r.monto_actual}</p>
            <p className="text-slate-400 text-xs">Meta: ${r.meta_ahorro}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
''')

print('All pages done')
PYEOF
npm run build

git add . && git commit -m "Complete finance app with all Notion pages" && git push
