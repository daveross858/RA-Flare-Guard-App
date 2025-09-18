import { useMemo, useState } from 'react';
import {
  Activity,
  CalendarCheck,
  CheckCircle2,
  Flame,
  HeartPulse,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Target,
  Utensils,
  Watch,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const formatDate = (date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(date));

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const calculateRiskScore = (data) => {
  let score = 25;

  if (Number(data.painLevel) >= 7) score += 35;
  else if (Number(data.painLevel) >= 5) score += 22;
  else if (Number(data.painLevel) >= 3) score += 12;
  else score += 4;

  if (Number(data.stressLevel) >= 7) score += 18;
  else if (Number(data.stressLevel) >= 5) score += 10;
  else if (Number(data.stressLevel) >= 3) score += 6;

  score += Math.max(0, 7 - Number(data.sleepHours)) * 4;
  score += Math.max(0, 5500 - Number(data.steps)) / 300;

  if (Number(data.hrv) < 50) score += 12;
  else if (Number(data.hrv) < 60) score += 6;

  score += data.medicationTaken ? -5 : 18;

  return Math.round(clamp(score, 5, 95));
};

const detectTriggers = (data) => {
  const triggers = new Set();

  if (Number(data.sleepHours) < 6) {
    triggers.add('Sleep debt');
  }
  if (Number(data.stressLevel) >= 6) {
    triggers.add('Stress spikes');
  }
  if (Number(data.steps) < 4000) {
    triggers.add('Low activity');
  }
  if (Number(data.hrv) < 50) {
    triggers.add('Low HRV readiness');
  }
  if (!data.medicationTaken) {
    triggers.add('Missed medication');
  }
  if (Number(data.painLevel) >= 6) {
    triggers.add('Joint inflammation');
  }

  if (data.notes) {
    if (/storm|pressure|rain|weather/i.test(data.notes)) {
      triggers.add('Weather shift');
    }
    if (/fried|sugar|dessert|alcohol|wine|gluten/i.test(data.notes)) {
      triggers.add('Inflammatory foods');
    }
  }

  return Array.from(triggers);
};

const deriveGuidance = (data) => {
  const guidance = [];

  if (Number(data.sleepHours) < 6.5) {
    guidance.push('Lights out by 10pm with gentle neck + shoulder release.');
  }
  if (Number(data.painLevel) >= 6) {
    guidance.push('Use heat pack for 15 minutes and schedule wrist mobility session.');
  }
  if (Number(data.stressLevel) >= 6) {
    guidance.push('Add two 5-minute breathing breaks to disrupt stress spikes.');
  }
  if (!data.medicationTaken) {
    guidance.push('Log medication dose now and confirm evening reminder.');
  }
  if (Number(data.steps) < 5000) {
    guidance.push('Plan two short walks (10 minutes each) to boost circulation.');
  }
  if (Number(data.hrv) < 55) {
    guidance.push('Swap intense workouts for restorative stretching tonight.');
  }

  if (!guidance.length) {
    guidance.push('Keep hydration steady and continue morning mobility circuit.');
  }

  return guidance.slice(0, 4);
};

const initialDailyLogs = [
  {
    date: '2024-03-14',
    sleepHours: 7.3,
    steps: 6900,
    hrv: 61,
    painLevel: 3,
    stressLevel: 3,
    medicationTaken: true,
    notes: 'Completed morning stretch and hydration.',
    riskScore: 22,
    triggers: ['Routine maintained'],
    guidance: [
      'Keep mid-day mobility check-in to preserve joint range.',
      'Hydrate steadily to maintain anti-inflammatory routine.',
    ],
  },
  {
    date: '2024-03-15',
    sleepHours: 6.1,
    steps: 5600,
    hrv: 56,
    painLevel: 4,
    stressLevel: 4,
    medicationTaken: true,
    notes: 'Slept late after family event.',
    riskScore: 34,
    triggers: ['Sleep debt'],
    guidance: [
      'Aim for lights out by 10pm with gentle yoga wind-down.',
      'Add turmeric ginger tea with dinner to fight inflammation.',
    ],
  },
  {
    date: '2024-03-16',
    sleepHours: 6.8,
    steps: 7400,
    hrv: 59,
    painLevel: 3,
    stressLevel: 3,
    medicationTaken: true,
    notes: 'Walked 20 minutes after lunch.',
    riskScore: 28,
    triggers: ['Balanced activity'],
    guidance: [
      'Keep afternoon walk and ankle circles to stay limber.',
      'Continue alternating heat and cold on wrists tonight.',
    ],
  },
  {
    date: '2024-03-17',
    sleepHours: 5.7,
    steps: 5100,
    hrv: 52,
    painLevel: 5,
    stressLevel: 6,
    medicationTaken: true,
    notes: 'Stressful deadline and rainy weather.',
    riskScore: 52,
    triggers: ['Sleep debt', 'Stress spikes', 'Weather shift'],
    guidance: [
      'Schedule 5-minute breathing break at 3pm.',
      'Use compression gloves this evening.',
      'Prepare magnesium glycinate before bed.',
    ],
  },
  {
    date: '2024-03-18',
    sleepHours: 6.4,
    steps: 6300,
    hrv: 55,
    painLevel: 4,
    stressLevel: 4,
    medicationTaken: true,
    notes: 'Recovered with mobility class.',
    riskScore: 38,
    triggers: ['Moderate stress'],
    guidance: [
      'Hold 60-second calf stretches morning and night.',
      'Prioritize leafy greens at lunch.',
    ],
  },
  {
    date: '2024-03-19',
    sleepHours: 5.1,
    steps: 3200,
    hrv: 47,
    painLevel: 7,
    stressLevel: 7,
    medicationTaken: false,
    notes: 'Missed methotrexate dose, storm overnight.',
    riskScore: 78,
    triggers: ['Sleep debt', 'Stress spikes', 'Missed medication', 'Weather shift'],
    guidance: [
      'Take medication as soon as safe and log dosage.',
      'Message care team about swelling plan if symptoms persist.',
      'Swap workout for restorative stretching only.',
    ],
  },
  {
    date: '2024-03-20',
    sleepHours: 7.2,
    steps: 5800,
    hrv: 58,
    painLevel: 4,
    stressLevel: 4,
    medicationTaken: true,
    notes: 'Focused on hydration and rest.',
    riskScore: 44,
    triggers: ['Post-flare recovery', 'Stress management'],
    guidance: [
      'Keep anti-inflammatory breakfast and hydration target.',
      'Book 15-minute walk after lunch to boost circulation.',
    ],
  },
];

const initialMeals = [
  {
    id: 'meal-1',
    date: '2024-03-18',
    description: 'Omega-3 breakfast bowl with chia, berries, walnuts',
    tags: ['omega-3', 'berries', 'chia'],
    reaction: 'steady',
    notes: 'Felt energized through morning meetings.',
  },
  {
    id: 'meal-2',
    date: '2024-03-19',
    description: 'Late-night fried takeout',
    tags: ['fried', 'gluten', 'sodium'],
    reaction: 'suspect',
    notes: 'Woke up puffy; joints stiff.',
  },
  {
    id: 'meal-3',
    date: '2024-03-20',
    description: 'Turmeric lentil soup with mixed greens',
    tags: ['turmeric', 'greens', 'fiber'],
    reaction: 'steady',
    notes: 'Inflammation markers steady.',
  },
];

const onboardingDefaults = {
  name: 'Alex Carter',
  diagnosisYear: 2016,
  medications: 'Methotrexate weekly + folic acid',
  goals: ['Avoid morning stiffness', 'Stay energized for work', 'Stay on track with medication'],
  triggers: ['Sleep debt', 'Stress spikes'],
  devices: {
    appleHealth: true,
    auraRing: true,
    fitbit: false,
    weather: true,
  },
};

const deviceOptions = [
  {
    key: 'appleHealth',
    label: 'Apple Health',
    description: 'Steps, HRV, heart rate variability',
    icon: Activity,
  },
  {
    key: 'auraRing',
    label: 'Oura Ring',
    description: 'Sleep staging & readiness score',
    icon: Moon,
  },
  {
    key: 'fitbit',
    label: 'Fitbit',
    description: 'Activity minutes & resting heart rate',
    icon: Watch,
  },
  {
    key: 'weather',
    label: 'Weather sync',
    description: 'Barometric pressure & humidity monitoring',
    icon: Sun,
  },
];

const suggestedGoals = [
  'Avoid morning stiffness',
  'Keep energy for evening family time',
  'Build strength without flares',
  'Improve sleep consistency',
  'Stay on track with medication',
];

const suggestedTriggers = [
  'Sleep debt',
  'Stress spikes',
  'Weather shift',
  'High-sodium meals',
  'Overtraining',
  'Hormonal changes',
];

const PatientApp = () => {
  const [onboarding, setOnboarding] = useState(onboardingDefaults);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  const [customTrigger, setCustomTrigger] = useState('');
  const [dailyLogs, setDailyLogs] = useState(initialDailyLogs);
  const [meals, setMeals] = useState(initialMeals);
  const [checkInForm, setCheckInForm] = useState({
    sleepHours: 7,
    painLevel: 4,
    stressLevel: 4,
    steps: 6000,
    hrv: 56,
    medicationTaken: true,
    notes: '',
  });
  const [checkInStatus, setCheckInStatus] = useState('idle');
  const [mealForm, setMealForm] = useState({
    description: '',
    tags: '',
    reaction: 'steady',
    notes: '',
  });
  const [mealStatus, setMealStatus] = useState('idle');

  const stepCount = 3;
  const progressPercent = onboardingComplete
    ? 100
    : Math.round(((onboardingStep + 1) / stepCount) * 100);

  const sortedLogs = useMemo(
    () => [...dailyLogs].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [dailyLogs],
  );

  const latestLog = sortedLogs[sortedLogs.length - 1];
  const previousLog = sortedLogs[sortedLogs.length - 2];

  const riskTrendData = useMemo(
    () =>
      sortedLogs.slice(-7).map((log) => ({
        date: formatDate(log.date),
        risk: log.riskScore,
      })),
    [sortedLogs],
  );

  const medicationAdherence = useMemo(() => {
    if (!sortedLogs.length) return 0;
    const adherent = sortedLogs.filter((log) => log.medicationTaken).length;
    return Math.round((adherent / sortedLogs.length) * 100);
  }, [sortedLogs]);

  const averagePain = useMemo(() => {
    if (!sortedLogs.length) return 0;
    const total = sortedLogs.reduce((sum, log) => sum + Number(log.painLevel), 0);
    return Math.round((total / sortedLogs.length) * 10) / 10;
  }, [sortedLogs]);

  const averageSleep = useMemo(() => {
    if (!sortedLogs.length) return 0;
    const total = sortedLogs.reduce((sum, log) => sum + Number(log.sleepHours), 0);
    return Math.round((total / sortedLogs.length) * 10) / 10;
  }, [sortedLogs]);

  const highRiskDays = useMemo(
    () => sortedLogs.filter((log) => log.riskScore >= 60).length,
    [sortedLogs],
  );

  const baselineLog = sortedLogs.length > 6 ? sortedLogs[sortedLogs.length - 7] : null;
  const baselineChange =
    latestLog && baselineLog ? latestLog.riskScore - baselineLog.riskScore : null;

  const triggerSignals = useMemo(() => {
    const map = {};

    meals.forEach((meal) => {
      const riskForDay = sortedLogs.find((log) => log.date === meal.date)?.riskScore;
      const isHighRiskDay = typeof riskForDay === 'number' && riskForDay >= 60;
      const isSuspectMeal = meal.reaction === 'suspect';

      meal.tags.forEach((tag) => {
        const normalized = tag.trim().toLowerCase();
        if (!normalized) return;
        if (!map[normalized]) {
          map[normalized] = { label: tag.trim(), count: 0, highRisk: 0 };
        }
        map[normalized].count += 1;
        if (isHighRiskDay || isSuspectMeal) {
          map[normalized].highRisk += 1;
        }
      });
    });

    return Object.entries(map)
      .map(([key, value]) => ({
        tag: value.label,
        normalizedTag: key,
        count: value.count,
        highRiskShare: value.count
          ? Math.round((value.highRisk / value.count) * 100)
          : 0,
      }))
      .sort((a, b) => b.highRiskShare - a.highRiskShare || b.count - a.count);
  }, [meals, sortedLogs]);

  const flaggedTags = useMemo(
    () =>
      new Set(
        triggerSignals
          .filter((signal) => signal.highRiskShare >= 50)
          .map((signal) => signal.normalizedTag),
      ),
    [triggerSignals],
  );

  const recentMeals = useMemo(
    () => [...meals].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4),
    [meals],
  );

  const weeklySummary = useMemo(() => {
    const lastSeven = sortedLogs.slice(-7);
    if (!lastSeven.length) return null;

    const avgRisk = Math.round(
      lastSeven.reduce((sum, log) => sum + log.riskScore, 0) / lastSeven.length,
    );
    const avgPain =
      Math.round(
        (lastSeven.reduce((sum, log) => sum + Number(log.painLevel), 0) /
          lastSeven.length) *
          10,
      ) / 10;
    const avgSleep =
      Math.round(
        (lastSeven.reduce((sum, log) => sum + Number(log.sleepHours), 0) /
          lastSeven.length) *
          10,
      ) / 10;
    const medAdherence = Math.round(
      (lastSeven.filter((log) => log.medicationTaken).length / lastSeven.length) *
        100,
    );
    const highRisk = lastSeven.filter((log) => log.riskScore >= 60).length;
    const bestDay = lastSeven.reduce((best, log) =>
      log.riskScore < best.riskScore ? log : best,
    );
    const toughDay = lastSeven.reduce((worst, log) =>
      log.riskScore > worst.riskScore ? log : worst,
    );

    return {
      avgRisk,
      avgPain,
      avgSleep,
      medAdherence,
      highRisk,
      bestDay,
      toughDay,
    };
  }, [sortedLogs]);

  const clinicianHighlights = useMemo(() => {
    if (!weeklySummary || !latestLog) return [];

    const highlights = [
      `Average flare risk ${weeklySummary.avgRisk}% with ${weeklySummary.highRisk} high-risk day(s).`,
      `Medication adherence ${weeklySummary.medAdherence}% and average sleep ${weeklySummary.avgSleep} hrs.`,
    ];

    if (baselineChange !== null) {
      highlights.push(
        `${Math.abs(baselineChange)} point ${baselineChange <= 0 ? 'decline' : 'increase'} vs 7-day baseline.`,
      );
    }

    if (triggerSignals.length) {
      const [top] = triggerSignals;
      highlights.push(
        `Top suspected trigger: ${top.tag} (linked on ${top.highRiskShare}% of tracked meals).`,
      );
    }

    if (latestLog.triggers.length) {
      highlights.push(`Today’s alert focus: ${latestLog.triggers.join(', ')}.`);
    }

    return highlights;
  }, [baselineChange, latestLog, triggerSignals, weeklySummary]);

  const connectedSources = Object.values(onboarding.devices).filter(Boolean).length;
  const confidenceLabel =
    connectedSources >= deviceOptions.length - 1
      ? 'High'
      : connectedSources >= 2
      ? 'Medium'
      : 'Learning';

  const riskLabel = latestLog
    ? latestLog.riskScore >= 65
      ? 'High'
      : latestLog.riskScore >= 35
      ? 'Moderate'
      : 'Low'
    : 'Unknown';

  const riskBadgeClass =
    riskLabel === 'High'
      ? 'border-rose-400/40 bg-rose-500/10 text-rose-200'
      : riskLabel === 'Moderate'
      ? 'border-amber-400/40 bg-amber-500/10 text-amber-200'
      : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200';

  const riskDelta = latestLog && previousLog ? latestLog.riskScore - previousLog.riskScore : null;

  const focusTrigger = triggerSignals.find((signal) => signal.highRiskShare >= 40);

  const toggleGoal = (goal) => {
    setOnboarding((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((item) => item !== goal)
        : [...prev.goals, goal],
    }));
  };

  const toggleTrigger = (trigger) => {
    setOnboarding((prev) => ({
      ...prev,
      triggers: prev.triggers.includes(trigger)
        ? prev.triggers.filter((item) => item !== trigger)
        : [...prev.triggers, trigger],
    }));
  };

  const toggleDevice = (key) => {
    setOnboarding((prev) => ({
      ...prev,
      devices: {
        ...prev.devices,
        [key]: !prev.devices[key],
      },
    }));
  };

  const handleGoalSubmit = (event) => {
    event.preventDefault();
    if (!customGoal.trim()) return;
    const value = customGoal.trim();
    setOnboarding((prev) => ({
      ...prev,
      goals: prev.goals.includes(value) ? prev.goals : [...prev.goals, value],
    }));
    setCustomGoal('');
  };

  const handleTriggerSubmit = (event) => {
    event.preventDefault();
    if (!customTrigger.trim()) return;
    const value = customTrigger.trim();
    setOnboarding((prev) => ({
      ...prev,
      triggers: prev.triggers.includes(value)
        ? prev.triggers
        : [...prev.triggers, value],
    }));
    setCustomTrigger('');
  };

  const handleCheckInChange = (field, value) => {
    setCheckInForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckInSubmit = (event) => {
    event.preventDefault();

    const normalized = {
      sleepHours: Number(checkInForm.sleepHours),
      painLevel: Number(checkInForm.painLevel),
      stressLevel: Number(checkInForm.stressLevel),
      steps: Number(checkInForm.steps),
      hrv: Number(checkInForm.hrv),
      medicationTaken: Boolean(checkInForm.medicationTaken),
      notes: checkInForm.notes.trim(),
    };

    const today = new Date().toISOString().slice(0, 10);
    const riskScore = calculateRiskScore(normalized);
    const triggers = detectTriggers(normalized);
    const guidance = deriveGuidance(normalized);

    const newLog = {
      date: today,
      ...normalized,
      riskScore,
      triggers,
      guidance,
    };

    setDailyLogs((prev) => {
      const filtered = prev.filter((log) => log.date !== today);
      return [...filtered, newLog].sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    setCheckInStatus('success');
    setTimeout(() => setCheckInStatus('idle'), 4000);
    setCheckInForm((prev) => ({ ...prev, notes: '' }));
  };

  const handleMealSubmit = (event) => {
    event.preventDefault();
    if (!mealForm.description.trim()) return;

    const today = new Date().toISOString().slice(0, 10);
    const tags = mealForm.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const newMeal = {
      id: `meal-${Date.now()}`,
      date: today,
      description: mealForm.description.trim(),
      tags: tags.length ? tags : ['unclassified'],
      reaction: mealForm.reaction,
      notes: mealForm.notes.trim(),
    };

    setMeals((prev) => [...prev, newMeal]);
    setMealStatus('success');
    setTimeout(() => setMealStatus('idle'), 4000);
    setMealForm({ description: '', tags: '', reaction: 'steady', notes: '' });
  };

  const handleAdvance = () => {
    if (onboardingStep === stepCount - 1) {
      setOnboardingComplete(true);
    } else {
      setOnboardingStep((prev) => Math.min(stepCount - 1, prev + 1));
    }
  };

  const handleBack = () => {
    setOnboardingStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <section className="space-y-10 pb-16">
      <header className="space-y-4">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.3em] text-brand-200">
          <Sparkles className="h-4 w-4" />
          AI Flare Coach
        </span>
        <h2 className="text-3xl font-semibold md:text-4xl">Your personalized RA Flare-Guard™ companion</h2>
        <p className="max-w-3xl text-base text-slate-400">
          Guide patients through onboarding, daily flare risk monitoring, trigger discovery, and clinician-ready summaries — all
          powered by Supabase and on-device coaching.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="card border-brand-500/30 bg-slate-950/80">
            <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="section-title">Step {Math.min(onboardingStep + 1, stepCount)} onboarding</p>
                <h3 className="text-2xl font-semibold text-white">Patient setup assistant</h3>
              </div>
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
                <span>
                  {onboardingComplete ? 'Complete' : `Progress ${progressPercent}%`}
                </span>
              </div>
            </header>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-900">
              <div
                className="h-2 rounded-full bg-brand-500 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {onboardingComplete && (
              <div className="mt-6 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <p className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  Setup complete
                </p>
                <p className="mt-2 text-emerald-50/80">
                  Streaming data from {connectedSources} of {deviceOptions.length} connected sources.
                </p>
              </div>
            )}

            <div className="mt-6 space-y-6">
              {onboardingStep === 0 && (
                <div className="space-y-4">
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-slate-200">Patient name</span>
                    <input
                      value={onboarding.name}
                      onChange={(event) =>
                        setOnboarding((prev) => ({ ...prev, name: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-slate-100 shadow-inner shadow-slate-950 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                      placeholder="e.g. Alex Carter"
                    />
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm">
                      <span className="font-medium text-slate-200">Diagnosis year</span>
                      <input
                        type="number"
                        min="1950"
                        max={new Date().getFullYear()}
                        value={onboarding.diagnosisYear}
                        onChange={(event) =>
                          setOnboarding((prev) => ({
                            ...prev,
                            diagnosisYear: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-slate-100 shadow-inner shadow-slate-950 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm">
                      <span className="font-medium text-slate-200">Primary medication</span>
                      <input
                        value={onboarding.medications}
                        onChange={(event) =>
                          setOnboarding((prev) => ({
                            ...prev,
                            medications: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-slate-100 shadow-inner shadow-slate-950 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                        placeholder="Methotrexate + folic acid"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500">
                    We pre-fill data for demo purposes — edit to match your patient persona before saving.
                  </p>
                </div>
              )}

              {onboardingStep === 1 && (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-200">Top goals</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedGoals.map((goal) => {
                        const active = onboarding.goals.includes(goal);
                        return (
                          <button
                            type="button"
                            key={goal}
                            onClick={() => toggleGoal(goal)}
                            className={`rounded-full border px-3 py-1 text-xs transition ${
                              active
                                ? 'border-brand-400 bg-brand-500/20 text-brand-100'
                                : 'border-slate-700 text-slate-300 hover:border-brand-400/50'
                            }`}
                          >
                            {goal}
                          </button>
                        );
                      })}
                    </div>
                    <form onSubmit={handleGoalSubmit} className="flex flex-wrap gap-3 pt-2">
                      <input
                        value={customGoal}
                        onChange={(event) => setCustomGoal(event.target.value)}
                        className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 shadow-inner shadow-slate-950 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                        placeholder="Add custom goal"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-2xl border border-brand-400/60 px-4 py-2 text-xs font-medium text-brand-200 transition hover:border-brand-300 hover:text-brand-100"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add
                      </button>
                    </form>
                    <div className="flex flex-wrap gap-2">
                      {onboarding.goals.map((goal) => (
                        <span
                          key={goal}
                          className="inline-flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/10 px-3 py-1 text-xs text-brand-100"
                        >
                          <Target className="h-3 w-3" />
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-200">Known triggers</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTriggers.map((trigger) => {
                        const active = onboarding.triggers.includes(trigger);
                        return (
                          <button
                            type="button"
                            key={trigger}
                            onClick={() => toggleTrigger(trigger)}
                            className={`rounded-full border px-3 py-1 text-xs transition ${
                              active
                                ? 'border-rose-400 bg-rose-500/10 text-rose-100'
                                : 'border-slate-700 text-slate-300 hover:border-rose-400/60'
                            }`}
                          >
                            {trigger}
                          </button>
                        );
                      })}
                    </div>
                    <form onSubmit={handleTriggerSubmit} className="flex flex-wrap gap-3 pt-2">
                      <input
                        value={customTrigger}
                        onChange={(event) => setCustomTrigger(event.target.value)}
                        className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 shadow-inner shadow-slate-950 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                        placeholder="Add custom trigger"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/60 px-4 py-2 text-xs font-medium text-rose-200 transition hover:border-rose-300 hover:text-rose-100"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add
                      </button>
                    </form>
                    <div className="flex flex-wrap gap-2">
                      {onboarding.triggers.map((trigger) => (
                        <span
                          key={trigger}
                          className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-100"
                        >
                          <Flame className="h-3 w-3" />
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {onboardingStep === 2 && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-slate-200">
                    Connect data sources ({connectedSources}/{deviceOptions.length} connected)
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {deviceOptions.map(({ key, label, description, icon: Icon }) => {
                      const active = onboarding.devices[key];
                      return (
                        <button
                          type="button"
                          key={key}
                          onClick={() => toggleDevice(key)}
                          className={`flex h-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                            active
                              ? 'border-brand-400/60 bg-brand-500/10 text-brand-100'
                              : 'border-slate-700 bg-slate-900/70 hover:border-brand-400/60'
                          }`}
                        >
                          <span
                            className={`mt-1 flex h-10 w-10 items-center justify-center rounded-xl ${
                              active ? 'bg-brand-500/25 text-brand-100' : 'bg-slate-950 text-slate-300'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <span>
                            <p className="text-base font-medium">{label}</p>
                            <p className="mt-1 text-sm text-slate-400">{description}</p>
                            <p
                              className={`mt-2 text-xs uppercase tracking-[0.2em] ${
                                active ? 'text-brand-200' : 'text-slate-500'
                              }`}
                            >
                              {active ? 'Connected' : 'Tap to connect'}
                            </p>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-slate-800/60 pt-4 md:flex-row md:items-center md:justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={onboardingStep === 0}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleAdvance}
                className="btn-secondary"
              >
                {onboardingStep === stepCount - 1 && !onboardingComplete ? 'Complete setup' : 'Continue'}
              </button>
            </div>
          </div>

          <div className="card border-brand-500/20 bg-slate-950/80">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="section-title">Today’s outlook</p>
                <h3 className="text-2xl font-semibold text-white">Flare risk monitor</h3>
              </div>
              <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1 text-sm font-medium ${riskBadgeClass}`}>
                <HeartPulse className="h-4 w-4" /> {riskLabel} risk
              </span>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Risk score</p>
                  <p className="mt-3 text-4xl font-semibold text-white">
                    {latestLog ? `${latestLog.riskScore}%` : '—'}
                  </p>
                  {riskDelta !== null && (
                    <p
                      className={`mt-2 text-xs ${
                        riskDelta > 0 ? 'text-rose-300' : riskDelta < 0 ? 'text-emerald-300' : 'text-slate-400'
                      }`}
                    >
                      {riskDelta > 0 ? '+' : ''}
                      {riskDelta} pts vs yesterday
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    Confidence {confidenceLabel} · Data sources {connectedSources}/{deviceOptions.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Key triggers</p>
                  {latestLog ? (
                    <ul className="mt-3 space-y-2 text-sm text-slate-200">
                      {latestLog.triggers.length ? (
                        latestLog.triggers.map((trigger) => (
                          <li key={trigger} className="flex items-center gap-2">
                            <Flame className="h-4 w-4 text-rose-300" />
                            {trigger}
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-400">No triggers detected today — keep logging.</li>
                      )}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-slate-400">Log a check-in to unlock trigger insights.</p>
                  )}
                </div>
              </div>

              <div className="h-56 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-3">
                {riskTrendData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={riskTrendData} margin={{ left: -20, right: 0, top: 10 }}>
                      <defs>
                        <linearGradient id="riskArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5E61FF" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#5E61FF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.3} />
                      <XAxis dataKey="date" stroke="#94A3B8" tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} stroke="#94A3B8" tickLine={false} axisLine={false} width={36} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#020617',
                          borderRadius: '1rem',
                          border: '1px solid rgba(148,163,184,0.2)',
                        }}
                      />
                      <Area type="monotone" dataKey="risk" stroke="#5E61FF" fill="url(#riskArea)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    Log at least one check-in to view your trend.
                  </div>
                )}
              </div>
            </div>

            {latestLog?.guidance?.length && (
              <div className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Today’s action plan</p>
                <ul className="mt-3 grid gap-2 md:grid-cols-2">
                  {latestLog.guidance.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-slate-200">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="card border-slate-800/80 bg-slate-950/80">
            <header className="space-y-2">
              <p className="section-title">Morning & evening check-ins</p>
              <h3 className="text-2xl font-semibold text-white">Log symptoms to update predictions</h3>
              <p className="text-sm text-slate-400">
                Combine subjective inputs with wearable data to keep the risk model tuned to your day.
              </p>
            </header>

            {checkInStatus === 'success' && (
              <div className="mt-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                Check-in saved — predictions refreshed!
              </div>
            )}

            <form onSubmit={handleCheckInSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-200">Sleep hours</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={checkInForm.sleepHours}
                  onChange={(event) => handleCheckInChange('sleepHours', Number(event.target.value))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-slate-100 shadow-inner shadow-slate-950 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-200 flex items-center justify-between">
                  Pain level
                  <span className="text-xs text-slate-400">{checkInForm.painLevel}/10</span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={checkInForm.painLevel}
                  onChange={(event) => handleCheckInChange('painLevel', Number(event.target.value))}
                  className="accent-brand-500"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-200 flex items-center justify-between">
                  Stress level
                  <span className="text-xs text-slate-400">{checkInForm.stressLevel}/10</span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={checkInForm.stressLevel}
                  onChange={(event) => handleCheckInChange('stressLevel', Number(event.target.value))}
                  className="accent-brand-500"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-200">Steps so far</span>
                <input
                  type="number"
                  min="0"
                  value={checkInForm.steps}
                  onChange={(event) => handleCheckInChange('steps', Number(event.target.value))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-slate-100 shadow-inner shadow-slate-950 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-200">HRV (ms)</span>
                <input
                  type="number"
                  min="0"
                  value={checkInForm.hrv}
                  onChange={(event) => handleCheckInChange('hrv', Number(event.target.value))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-slate-100 shadow-inner shadow-slate-950 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </label>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={checkInForm.medicationTaken}
                  onChange={(event) => handleCheckInChange('medicationTaken', event.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-slate-200">Medication taken as prescribed</span>
              </label>

              <label className="md:col-span-2 flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-200">Notes</span>
                <textarea
                  value={checkInForm.notes}
                  onChange={(event) => handleCheckInChange('notes', event.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-slate-100 shadow-inner shadow-slate-950 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  placeholder="e.g. Slept poorly due to storm, skipped methotrexate"
                />
              </label>

              <div className="md:col-span-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-xs text-slate-500">
                  Data syncs instantly to the founder dashboard for population-level insights.
                </p>
                <button type="submit" className="btn-primary">
                  Save check-in
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card border-slate-800/80 bg-slate-950/80">
            <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="section-title">Meal & trigger detection</p>
                <h3 className="text-2xl font-semibold text-white">Log meals to learn your flare patterns</h3>
              </div>
              <Utensils className="h-8 w-8 text-brand-200" />
            </header>

            {mealStatus === 'success' && (
              <div className="mt-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                Meal logged — trigger model updated.
              </div>
            )}

            <form onSubmit={handleMealSubmit} className="mt-6 grid gap-4">
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-200">Meal or snack</span>
                <input
                  value={mealForm.description}
                  onChange={(event) => setMealForm((prev) => ({ ...prev, description: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-slate-100 shadow-inner shadow-slate-950 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  placeholder="e.g. Spinach omelet with avocado"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-200">Tags</span>
                <input
                  value={mealForm.tags}
                  onChange={(event) => setMealForm((prev) => ({ ...prev, tags: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-slate-100 shadow-inner shadow-slate-950 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  placeholder="e.g. omega-3, greens, turmeric"
                />
                <span className="text-xs text-slate-500">Separate tags with commas.</span>
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-200">Body response</span>
                <select
                  value={mealForm.reaction}
                  onChange={(event) => setMealForm((prev) => ({ ...prev, reaction: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-slate-100 shadow-inner shadow-slate-950 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                >
                  <option value="steady">Steady</option>
                  <option value="suspect">Suspect flare</option>
                  <option value="energized">Energized</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-200">Notes</span>
                <textarea
                  value={mealForm.notes}
                  onChange={(event) => setMealForm((prev) => ({ ...prev, notes: event.target.value }))}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-slate-100 shadow-inner shadow-slate-950 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  placeholder="e.g. Felt bloated, paired with late bedtime"
                />
              </label>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-xs text-slate-500">Computer vision can auto-tag meals when photos are uploaded.</p>
                <button type="submit" className="btn-secondary">
                  Log meal
                </button>
              </div>
            </form>

            <div className="mt-6 space-y-4">
              {recentMeals.map((meal) => {
                const riskTags = meal.tags.map((tag) => tag.trim().toLowerCase());
                const flagged = riskTags.some((tag) => flaggedTags.has(tag));
                return (
                  <article
                    key={meal.id}
                    className={`rounded-2xl border p-4 transition ${
                      flagged ? 'border-rose-400/50 bg-rose-500/5' : 'border-slate-800/70 bg-slate-950/70'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                          {formatDate(meal.date)}
                        </p>
                        <h4 className="mt-2 text-lg font-semibold text-slate-100">{meal.description}</h4>
                      </div>
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                          meal.reaction === 'suspect'
                            ? 'border-rose-400/50 bg-rose-500/10 text-rose-200'
                            : meal.reaction === 'energized'
                            ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-200'
                            : 'border-slate-700 text-slate-300'
                        }`}
                      >
                        <HeartPulse className="h-3.5 w-3.5" />
                        {meal.reaction === 'suspect'
                          ? 'Suspect flare'
                          : meal.reaction === 'energized'
                          ? 'Energized'
                          : 'Steady'}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {meal.tags.map((tag) => {
                        const normalized = tag.trim().toLowerCase();
                        const highlight = flaggedTags.has(normalized);
                        return (
                          <span
                            key={`${meal.id}-${tag}`}
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${
                              highlight
                                ? 'border-rose-400/60 bg-rose-500/10 text-rose-200'
                                : 'border-slate-700 text-slate-300'
                            }`}
                          >
                            {highlight ? (
                              <Flame className="h-3 w-3" />
                            ) : (
                              <Utensils className="h-3 w-3" />
                            )}
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                    {meal.notes && (
                      <p className="mt-3 text-sm text-slate-400">{meal.notes}</p>
                    )}
                  </article>
                );
              })}
            </div>

            {triggerSignals.length > 0 && (
              <div className="mt-6 rounded-2xl border border-brand-500/30 bg-brand-500/10 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-200">Emerging patterns</p>
                <ul className="mt-3 space-y-2 text-sm text-brand-50/90">
                  {triggerSignals.slice(0, 3).map((signal) => (
                    <li key={signal.normalizedTag} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-brand-200" />
                        {signal.tag}
                      </span>
                      <span className="text-xs text-brand-200">
                        {signal.highRiskShare}% flagged · {signal.count} log{signal.count > 1 ? 's' : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="card border-slate-800/80 bg-slate-950/80">
            <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="section-title">Weekly summary</p>
                <h3 className="text-2xl font-semibold text-white">Clinician-ready insights</h3>
              </div>
              <CalendarCheck className="h-8 w-8 text-brand-200" />
            </header>

            {weeklySummary ? (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Avg flare risk</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{weeklySummary.avgRisk}%</p>
                    {baselineChange !== null && (
                      <p className={`mt-2 text-xs ${baselineChange <= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {baselineChange <= 0 ? 'Improving' : 'Rising'} vs 7-day baseline
                      </p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Avg sleep</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{weeklySummary.avgSleep} hrs</p>
                    <p className="mt-2 text-xs text-slate-500">Pain {weeklySummary.avgPain}/10</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Medication adherence</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{weeklySummary.medAdherence}%</p>
                    <p className="mt-2 text-xs text-slate-500">High-risk days: {weeklySummary.highRisk}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Best day</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {formatDate(weeklySummary.bestDay.date)} — {weeklySummary.bestDay.riskScore}% risk
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      Sleep {weeklySummary.bestDay.sleepHours} hrs · pain {weeklySummary.bestDay.painLevel}/10
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Toughest day</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {formatDate(weeklySummary.toughDay.date)} — {weeklySummary.toughDay.riskScore}% risk
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      Sleep {weeklySummary.toughDay.sleepHours} hrs · pain {weeklySummary.toughDay.painLevel}/10
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Clinician highlights</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-200">
                    {clinicianHighlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-300" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Focus for next week</p>
                  <p className="mt-2 text-sm text-slate-200">
                    {focusTrigger
                      ? `Watch for ${focusTrigger.tag.toLowerCase()} — ${focusTrigger.highRiskShare}% of meals flagged it as a trigger.`
                      : 'Keep logging meals and symptoms to uncover repeat patterns.'}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Coach suggestions: {averageSleep >= 7 ? 'maintain' : 'increase'} sleep hygiene, keep pain below {averagePain}/10,
                    and target {medicationAdherence}%+ medication adherence.
                  </p>
                  <button className="btn-secondary mt-4">Generate PDF (coming soon)</button>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">Log check-ins throughout the week to unlock summary analytics.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatientApp;
