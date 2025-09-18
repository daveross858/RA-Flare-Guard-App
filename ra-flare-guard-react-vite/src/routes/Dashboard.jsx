import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getSupabaseClient } from '../lib/supabase.js';
import { CalendarRange, PieChart as PieChartIcon, TrendingUp, Users } from 'lucide-react';

const FALLBACK_WAITLIST = [
  {
    id: '1',
    email: 'maria@flareguard.com',
    note: 'Stay flare-free before my marathon.',
    source: 'webinar',
    converted: true,
    plan: 'pro',
    utm: { utm_source: 'webinar', utm_campaign: 'spring_launch' },
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    email: 'david@example.com',
    note: 'Track medication adherence.',
    source: 'instagram',
    converted: false,
    plan: 'waitlist',
    utm: { utm_source: 'instagram', utm_campaign: 'stories' },
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    email: 'amina@example.com',
    note: 'Avoid morning stiffness flare ups.',
    source: 'podcast',
    converted: false,
    plan: 'waitlist',
    utm: { utm_source: 'podcast' },
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    email: 'lin@flareguard.com',
    note: 'Stay on top of swelling triggers.',
    source: 'referral',
    converted: true,
    plan: 'premium',
    utm: { utm_source: 'referral', utm_medium: 'physician' },
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    email: 'jordan@example.com',
    note: 'Get reminders for med schedule.',
    source: 'organic',
    converted: false,
    plan: 'waitlist',
    utm: null,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    email: 'nina@example.com',
    note: 'Understand weather triggers.',
    source: 'webinar',
    converted: true,
    plan: 'pro',
    utm: { utm_source: 'webinar', utm_campaign: 'winter_clinic' },
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    email: 'kevin@example.com',
    note: 'Reduce fatigue crashes.',
    source: 'newsletter',
    converted: false,
    plan: 'waitlist',
    utm: { utm_source: 'newsletter', utm_medium: 'email' },
    created_at: new Date().toISOString(),
  },
];

const CHART_COLORS = ['#5E61FF', '#8C8CFF', '#36D399', '#FBBF24', '#F472B6'];

const formatDate = (isoDate) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(isoDate));

const aggregateDailySignups = (rows) => {
  const counts = rows.reduce((acc, row) => {
    if (!row.created_at) return acc;
    const date = row.created_at.slice(0, 10);
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, count]) => ({ date: formatDate(date), count }));
};

const aggregateSources = (rows) => {
  const counts = rows.reduce((acc, row) => {
    const key = row.source?.trim() ? row.source.trim().toLowerCase() : 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([source, value]) => ({
      name: source.replace(/\b\w/g, (letter) => letter.toUpperCase()),
      value,
    }))
    .sort((a, b) => b.value - a.value);
};

const aggregateConversion = (rows) => {
  const total = rows.length;
  const converted = rows.filter((row) => row.converted).length;
  const free = total - converted;

  return {
    total,
    converted,
    free,
    conversionRate: total ? Math.round((converted / total) * 1000) / 10 : 0,
  };
};

const Dashboard = () => {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [waitlist, setWaitlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setWaitlist(FALLBACK_WAITLIST);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error(error);
        setErrorMessage(error.message || 'Unable to load waitlist data.');
        setWaitlist(FALLBACK_WAITLIST);
      } else {
        setWaitlist(data || []);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [supabase]);

  const dailySignups = useMemo(() => aggregateDailySignups(waitlist), [waitlist]);
  const sourceBreakdown = useMemo(() => aggregateSources(waitlist), [waitlist]);
  const conversion = useMemo(() => aggregateConversion(waitlist), [waitlist]);

  return (
    <section className="space-y-10 pb-16">
      <header className="flex flex-col gap-3">
        <p className="section-title">Founder dashboard</p>
        <h2 className="text-3xl font-semibold md:text-4xl">Daily pulse of your RA Flare-Guard™ launch.</h2>
        <p className="max-w-3xl text-slate-400">
          Track waitlist growth, see which campaigns drive momentum, and monitor conversion into paid tiers — all powered by your Supabase waitlist table.
        </p>
      </header>

      {errorMessage && (
        <div className="rounded-3xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card border-slate-800/70 bg-slate-950/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-brand-300">Total waitlist</p>
              <p className="mt-3 text-3xl font-semibold text-white">{conversion.total}</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-300">
              <Users className="h-6 w-6" />
            </span>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Combined number of people eager for early access across all channels.
          </p>
        </div>
        <div className="card border-slate-800/70 bg-slate-950/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-brand-300">Conversion rate</p>
              <p className="mt-3 text-3xl font-semibold text-white">{conversion.conversionRate}%</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-200">
              <TrendingUp className="h-6 w-6" />
            </span>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Paying customers divided by the total waitlist.
          </p>
        </div>
        <div className="card border-slate-800/70 bg-slate-950/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-brand-300">Paying vs Free</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {conversion.converted} <span className="text-sm text-slate-400">paid</span>
              </p>
              <p className="text-sm text-slate-400">{conversion.free} free-tier</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-500/20 text-fuchsia-200">
              <CalendarRange className="h-6 w-6" />
            </span>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Use this to size the onboarding funnel for high-intent patients.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="card border-slate-800/80 bg-slate-950/80 lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-brand-300">Daily signups</p>
              <h3 className="mt-1 text-2xl font-semibold text-white">Waitlist trend</h3>
            </div>
          </div>
          <div className="mt-6 h-72">
            {dailySignups.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySignups} margin={{ left: -20 }}>
                  <defs>
                    <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5E61FF" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#5E61FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#94A3B8" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} stroke="#94A3B8" tickLine={false} axisLine={false} width={40} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderRadius: '1rem',
                      border: '1px solid rgba(148,163,184,0.2)',
                    }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#5E61FF" fill="url(#colorSignups)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-800/60 text-sm text-slate-500">
                No signups yet. Your chart will appear once patients join the waitlist.
              </div>
            )}
          </div>
        </div>
        <div className="card border-slate-800/80 bg-slate-950/80 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-brand-300">Source breakdown</p>
              <h3 className="mt-1 text-2xl font-semibold text-white">Which channels convert</h3>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-300">
              <PieChartIcon className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 h-72">
            {sourceBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {sourceBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} signups`, name]}
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderRadius: '1rem',
                      border: '1px solid rgba(148,163,184,0.2)',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => <span className="text-slate-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-800/60 text-sm text-slate-500">
                Add signups to see which campaigns perform best.
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-slate-400">Syncing latest waitlist data…</p>
      )}
    </section>
  );
};

export default Dashboard;
