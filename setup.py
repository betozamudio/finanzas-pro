import os

files = {}

files['src/index.css'] = '''@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { @apply border-slate-700; }
  body { @apply bg-slate-950 text-white font-sans antialiased; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { @apply bg-slate-800; }
  ::-webkit-scrollbar-thumb { @apply bg-slate-600 rounded-full; }
}

@layer components {
  .card { @apply bg-slate-800 rounded-2xl border border-slate-700 p-5; }
  .card-sm { @apply bg-slate-800 rounded-xl border border-slate-700 p-4; }
  .btn { @apply inline-flex items-center gap-2 font-semibold px-4 py-2 rounded-xl transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
  .btn-primary { @apply btn bg-green-500 hover:bg-green-600 text-white; }
  .btn-secondary { @apply btn bg-slate-700 hover:bg-slate-600 text-white; }
  .btn-danger { @apply btn bg-red-500 hover:bg-red-600 text-white; }
  .btn-ghost { @apply btn bg-transparent hover:bg-slate-700 text-slate-300; }
  .input { @apply bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 w-full transition-all text-sm; }
  .label { @apply text-xs font-medium text-slate-400 mb-1 block uppercase tracking-wide; }
  .select { @apply bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500 w-full text-sm; }
  .badge { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold; }
  .badge-green { @apply badge bg-green-500/20 text-green-400; }
  .badge-red { @apply badge bg-red-500/20 text-red-400; }
  .badge-blue { @apply badge bg-blue-500/20 text-blue-400; }
  .badge-yellow { @apply badge bg-yellow-500/20 text-yellow-400; }
  .badge-purple { @apply badge bg-purple-500/20 text-purple-400; }
  .badge-gray { @apply badge bg-slate-600/50 text-slate-400; }
  .stat-card { @apply card flex flex-col gap-2; }
  .page-header { @apply mb-6; }
  .page-title { @apply text-2xl font-bold text-white; }
  .page-subtitle { @apply text-sm text-slate-400 mt-1; }
  .table-wrapper { @apply overflow-x-auto rounded-xl border border-slate-700; }
  .table { @apply w-full text-sm; }
  .table th { @apply bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider px-4 py-3 text-left font-medium; }
  .table td { @apply px-4 py-3 border-t border-slate-700/50 text-slate-300; }
  .table tr:hover td { @apply bg-slate-700/20; }
  .sidebar-link { @apply flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all text-sm font-medium; }
  .sidebar-link.active { @apply bg-green-500/10 text-green-400 hover:bg-green-500/20; }
}
'''

files['src/lib/supabase.ts'] = '''import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Faltan variables de entorno de Supabase");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
'''

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f'Creado: {path}')
