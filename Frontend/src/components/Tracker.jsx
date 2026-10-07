import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BeamsBackground } from '@/components/BeamsBackground';
import { MorphPanel } from '@/components/MorphPanel';
import { SegmentedTabs } from '@/components/SegmentedTabs';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/applications`;
const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected'];
const EMPTY = { company: '', role: '', status: 'Applied', appliedOn: '', notes: '' };

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="text-xs uppercase tracking-wider text-white/50">{label}</div>
    </div>
  );
}

export function Tracker({ token, user, onLogout, onAuthError }) {
  const authHeader = { Authorization: `Bearer ${token}` };

  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await fetch(API, { headers: authHeader });
      if (res.status === 401) return onAuthError();
      setApps(await res.json());
      setError('');
    } catch {
      setError('Could not reach the server. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const count = (s) => apps.filter((a) => a.status === s).length;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return apps
      .filter((a) => filter === 'All' || a.status === filter)
      .filter((a) => !q || a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sort === 'company') return a.company.localeCompare(b.company);
        const diff = new Date(a.appliedOn) - new Date(b.appliedOn);
        return sort === 'oldest' ? diff : -diff;
      });
  }, [apps, filter, search, sort]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(EMPTY); setError(''); };

  const send = async (url, method, body) => {
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.status === 401) { onAuthError(); return false; }
      if (!res.ok) { setError((await res.json()).error || 'Something went wrong.'); return false; }
      return true;
    } catch {
      setError('Could not reach the server. Check that the backend is running.');
      return false;
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const body = { ...form };
    if (!body.appliedOn) delete body.appliedOn;
    const ok = await send(editingId ? `${API}/${editingId}` : API, editingId ? 'PUT' : 'POST', body);
    if (ok) { closeForm(); load(); }
  };

  const edit = (a) => {
    setEditingId(a._id);
    setForm({
      company: a.company,
      role: a.role,
      status: a.status,
      appliedOn: a.appliedOn ? a.appliedOn.slice(0, 10) : '',
      notes: a.notes || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const changeStatus = async (a, status) => { if (await send(`${API}/${a._id}`, 'PUT', { status })) load(); };
  const remove = async (a) => {
    if (!window.confirm(`Delete your ${a.company} application?`)) return;
    if (await send(`${API}/${a._id}`, 'DELETE')) load();
  };

  const tabOptions = [
    { key: 'All', label: 'All', count: apps.length },
    ...STATUSES.map((s) => ({ key: s, label: s, count: count(s) })),
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-950 overflow-x-hidden">
      <BeamsBackground className="h-[320px] md:h-[380px]">
        <button
          onClick={onLogout}
          className="absolute top-5 right-5 md:right-8 text-xs uppercase tracking-wider text-white/50 hover:text-white transition-colors"
        >

        </button>
        <div className="text-center px-4">
          <p className="text-xs tracking-[0.3em] uppercase text-white/50 mb-3">Job Search</p>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white">Application Tracker</h1>
          <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-3 sm:gap-x-10 px-4">
            <Stat value={apps.length} label="Total" />
            <Stat value={count('Interview')} label="Interview" />
            <Stat value={count('Offer')} label="Offer" />
            <Stat value={count('Rejected')} label="Rejected" />
          </div>
        </div>
      </BeamsBackground>

      <main className="max-w-3xl mx-auto px-4 md:px-6 -mt-10 relative z-10 pb-20">
        <div className="mb-8">
          <MorphPanel open={showForm} onOpenChange={setShowForm} triggerLabel="+ Log an application">
            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <h2 className="col-span-full text-lg font-medium">{editingId ? 'Edit entry' : 'New entry'}</h2>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-white/50">
                Company
                <input name="company" value={form.company} onChange={change} required
                  className="bg-transparent border-b border-white/25 py-1.5 text-white text-sm focus:outline-none focus:border-white" />
              </label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-white/50">
                Role
                <input name="role" value={form.role} onChange={change} required
                  className="bg-transparent border-b border-white/25 py-1.5 text-white text-sm focus:outline-none focus:border-white" />
              </label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-white/50">
                Status
                <select name="status" value={form.status} onChange={change}
                  className="bg-neutral-950 border-b border-white/25 py-1.5 text-white text-sm focus:outline-none focus:border-white">
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-white/50">
                Applied on
                <input name="appliedOn" type="date" value={form.appliedOn} onChange={change}
                  className="bg-transparent border-b border-white/25 py-1.5 text-white text-sm focus:outline-none focus:border-white" />
              </label>
              <label className="col-span-full flex flex-col gap-1 text-xs uppercase tracking-wider text-white/50">
                Notes
                <input name="notes" value={form.notes} onChange={change} placeholder="Recruiter, next step, link"
                  className="bg-transparent border-b border-white/25 py-1.5 text-white text-sm focus:outline-none focus:border-white placeholder-white/30" />
              </label>
              <div className="col-span-full flex items-center gap-5 pt-1">
                <button type="submit" className="rounded-full bg-white text-neutral-950 px-5 py-2 text-sm font-medium hover:bg-white/90 transition-colors">
                  {editingId ? 'Save changes' : 'Add to log'}
                </button>
                <button type="button" onClick={closeForm} className="text-sm text-white/60 hover:text-white transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </MorphPanel>
        </div>

        {error && (
          <p role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <SegmentedTabs options={tabOptions} value={filter} onChange={setFilter} />
          <div className="flex gap-3">
            <input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-sm focus:outline-none focus:border-neutral-950 w-36"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm focus:outline-none focus:border-neutral-950"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="company">A to Z</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-neutral-400 py-16">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="text-center text-neutral-400 py-16">
            {apps.length === 0 ? 'Nothing logged yet. Add your first one above.' : 'No entries match.'}
          </p>
        ) : (
          <ul className="rounded-2xl border border-neutral-200 divide-y divide-neutral-200 overflow-hidden">
            {visible.map((a) => (
              <motion.li
                key={a._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-4 p-4 hover:bg-neutral-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-950 text-white flex items-center justify-center font-medium flex-shrink-0">
                  {a.company[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{a.company}</div>
                  <div className="text-sm text-neutral-500 truncate">{a.role} · {fmt(a.appliedOn)}</div>
                  {a.notes && <p className="text-sm text-neutral-400 mt-0.5 truncate">{a.notes}</p>}
                </div>
                <select
                  value={a.status}
                  onChange={(e) => changeStatus(a, e.target.value)}
                  className="text-xs uppercase tracking-wide border border-neutral-300 rounded-full px-2.5 py-1 bg-white focus:outline-none"
                >
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <div className="flex gap-3 text-xs uppercase tracking-wide">
                  <button onClick={() => edit(a)} className="text-neutral-500 hover:text-neutral-950">Edit</button>
                  <button onClick={() => remove(a)} className="text-neutral-500 hover:text-red-600">Delete</button>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
