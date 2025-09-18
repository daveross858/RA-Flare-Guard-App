import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  HeartPulse,
  LineChart,
  Sparkles,
  ShieldPlus,
} from 'lucide-react';
import { getSupabaseClient } from '../lib/supabase.js';

const featureCards = [
  {
    title: 'Flare-Risk Score',
    description: 'Daily risk level calculated from symptoms, wearable data, and medication adherence.',
    icon: Activity,
  },
  {
    title: 'Trigger Detection',
    description: 'Spot patterns like weather changes, stress spikes, or sleep debt that precede flares.',
    icon: LineChart,
  },
  {
    title: 'Personalized Reports',
    description: 'Weekly digest to help you and your rheumatologist stay aligned and proactive.',
    icon: BarChart3,
  },
  {
    title: 'Care Team Alerts',
    description: 'Securely share flare signals with caregivers so everyone is ready to act fast.',
    icon: ShieldPlus,
  },
];

const credibility = ['Backed by Rheumatologists', 'HIPAA-ready infrastructure', 'Built on Supabase'];

const Landing = () => {
  const [formValues, setFormValues] = useState({
    email: '',
    note: '',
    source: 'organic',
  });
  const [utmParams, setUtmParams] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const utm = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('utm_')) {
        utm[key] = value;
      }
    });

    setUtmParams(utm);

    const sourceParam = searchParams.get('source') || searchParams.get('utm_source');
    if (sourceParam) {
      setFormValues((prev) => ({ ...prev, source: sourceParam }));
    }
  }, []);

  const supabase = useMemo(() => getSupabaseClient(), []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('loading');
    setErrorMessage('');

    try {
      if (!formValues.email) {
        throw new Error('Please add your email so we can reach out with early access.');
      }

      const payload = {
        email: formValues.email,
        note: formValues.note,
        source: formValues.source,
        converted: false,
        plan: 'waitlist',
        ...(Object.keys(utmParams).length ? { utm: utmParams } : {}),
      };

      if (supabase) {
        const { error } = await supabase.from('waitlist').insert([payload]);
        if (error) {
          throw error;
        }
      } else {
        // Fallback: simulate async behavior when Supabase credentials are missing locally
        await new Promise((resolve) => setTimeout(resolve, 600));
        console.info('Supabase credentials missing. Payload:', payload);
      }

      setStatus('success');
      setFormValues({ email: '', note: '', source: formValues.source });
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || 'Something went wrong. Please try again.');
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/60 shadow-[0_0_120px_-40px_rgba(94,97,255,0.7)]">
        <div className="grid gap-10 px-6 py-16 md:grid-cols-[1.1fr_0.9fr] md:px-12 md:py-20">
          <div className="flex flex-col justify-center gap-8">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.3em] text-brand-200">
              <Sparkles className="h-4 w-4" />
              Early Access Cohort
            </span>
            <div className="space-y-4">
              <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
                Predict RA flares days before they strike.
              </h2>
              <p className="text-lg text-slate-300 md:text-xl">
                RA Flare-Guard™ combines wearable signals, medication logs, and weather data to warn you before a flare derails your plans.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              {credibility.map((item) => (
                <span key={item} className="inline-flex items-center gap-2 rounded-full border border-slate-800/60 bg-slate-900/60 px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-300" />
                  {item}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-6 rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-xl shadow-brand-900/30">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-brand-200">See your flare risk</p>
                  <p className="text-slate-300">
                    Morning check-ins highlight today&apos;s flare probability so you can adapt treatment sooner.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 text-sm text-slate-400 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-300">Today&apos;s Risk</p>
                  <p className="mt-2 text-3xl font-semibold text-brand-200">18% Low</p>
                  <p className="mt-2 text-xs text-slate-500">Down 12% vs yesterday</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-300">Triggers Detected</p>
                  <p className="mt-2 text-3xl font-semibold text-brand-200">Stress + Weather</p>
                  <p className="mt-2 text-xs text-slate-500">Prep your recovery plan</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[32px] bg-[radial-gradient(circle_at_top,_rgba(94,97,255,0.3),_transparent_70%)]" />
            <form
              onSubmit={handleSubmit}
              className="card sticky top-24 flex flex-col gap-6 border-brand-500/20 bg-slate-950/80"
            >
              <header className="space-y-2">
                <p className="section-title">Join the waitlist</p>
                <h3 className="text-2xl font-semibold text-white">Get early access + our RA flare playbook.</h3>
                <p className="text-sm text-slate-400">
                  Spots open monthly. Share how we can help and we&apos;ll send an invite when the next cohort launches.
                </p>
              </header>
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-200">Email</span>
                <input
                  type="email"
                  required
                  value={formValues.email}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-slate-100 shadow-inner shadow-slate-950 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  placeholder="you@email.com"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-200">What&apos;s your top RA goal right now?</span>
                <textarea
                  value={formValues.note}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, note: event.target.value }))}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-slate-100 shadow-inner shadow-slate-950 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  placeholder="e.g. Avoid morning stiffness before important meetings"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-200">How did you hear about us?</span>
                <input
                  value={formValues.source}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, source: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-slate-100 shadow-inner shadow-slate-950 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  placeholder="e.g. Instagram, Rheumatologist, Friend"
                />
              </label>
              <button type="submit" className="btn-primary mt-2" disabled={isSubmitting}>
                {isSubmitting ? 'Joining waitlist…' : 'Get early access'}
                {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
              {status === 'success' && (
                <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                  <p className="font-semibold">You&apos;re on the list!</p>
                  <p className="mt-1 text-emerald-100">
                    We&apos;ll review your goals and send your invite soon. Watch your inbox for the RA flare readiness playbook.
                  </p>
                </div>
              )}
              {status === 'error' && (
                <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200">
                  <p className="font-semibold">Submission failed</p>
                  <p className="mt-1 text-rose-100">{errorMessage}</p>
                </div>
              )}
              <p className="text-xs leading-relaxed text-slate-500">
                By joining, you agree to receive onboarding emails about RA Flare-Guard™. No spam — unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </div>

      <section id="features" className="mt-20 space-y-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-title">How it works</p>
            <h3 className="text-3xl font-semibold md:text-4xl">Everything you need to outsmart RA flares.</h3>
          </div>
          <p className="max-w-xl text-base text-slate-400">
            Our AI engine translates your daily logs, wearable insights, and environment shifts into a personalized flare score so you can plan treatments with confidence.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {featureCards.map(({ title, description, icon: Icon }) => (
            <article key={title} className="card h-full border-slate-800/80 bg-slate-950/70">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                  <Icon className="h-6 w-6" />
                </span>
                <h4 className="text-xl font-semibold">{title}</h4>
              </div>
              <p className="mt-4 text-sm text-slate-300">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
