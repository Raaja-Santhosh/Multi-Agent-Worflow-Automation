import React, { useState } from 'react';
import { Check, ArrowRight, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  const [annual, setAnnual] = useState(true);
  const [tokenVolume, setTokenVolume] = useState(5); // Millions

  const plans = [
    {
      name: 'Developer Free',
      priceMonthly: 0,
      priceAnnual: 0,
      description: 'For individual developers building state machine prototypes.',
      features: [
        'Up to 100 task runs / month',
        '3 Active worker agent nodes',
        'Standard pgvector vector memory (1,536 dims)',
        'Community Discord Support',
        'Basic Telemetry Logs'
      ],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Team',
      priceMonthly: 49,
      priceAnnual: 39,
      description: 'For engineering teams running autonomous production pipelines.',
      features: [
        '10,000 Task runs / month',
        'All 8 Specialized Agent Nodes',
        'Sandboxed Python Subprocess Executor',
        'ICML 2025 Failure Attribution Engine',
        'Redis Pub/Sub Real-time WebSocket Feed',
        'Priority Email & Slack Support'
      ],
      cta: 'Deploy Team Plan',
      popular: true
    },
    {
      name: 'Enterprise Dedicated',
      priceMonthly: 'Custom',
      priceAnnual: 'Custom',
      description: 'Dedicated StateGraph clusters & SOC2 compliant infrastructure.',
      features: [
        'Unlimited task executions',
        'Dedicated pgvector vector database cluster',
        'gVisor Container Subprocess Isolation',
        '99.99% Uptime SLA Guarantee',
        'Custom OpenAPI Tool Integrations',
        'Dedicated Solutions Architect'
      ],
      cta: 'Contact Enterprise Sales',
      popular: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 select-none relative z-10 text-zinc-100">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-4">
        <div className="inline-flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-md text-[11px] font-mono text-zinc-400">
          <Terminal size={13} className="text-zinc-400" />
          <span>TRANSPARENT SYSTEM PRICING</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white font-heading leading-tight">
          Flexible Infrastructure Plans
        </h1>

        <p className="text-sm text-zinc-400 leading-relaxed font-sans max-w-xl mx-auto">
          Scale your multi-agent StateGraph workload with predictable token pricing.
        </p>

        {/* Toggle */}
        <div className="pt-4 flex items-center justify-center space-x-3 text-xs font-mono">
          <span className={!annual ? 'text-white font-bold' : 'text-zinc-500'}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className="w-12 h-6 bg-zinc-900 border border-zinc-800 rounded-full p-0.5 transition-colors relative cursor-pointer"
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                annual ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={annual ? 'text-white font-bold' : 'text-zinc-500'}>
            Annual <span className="text-zinc-400 text-[10px]">(Save 20%)</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`cosmo-card p-6 flex flex-col justify-between space-y-6 ${
              plan.popular ? 'border-zinc-700 bg-zinc-950' : ''
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white font-heading">{plan.name}</h3>
                {plan.popular && (
                  <span className="text-[10px] font-mono font-bold text-zinc-300 bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded">
                    STANDARD
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-3xl font-extrabold text-white font-heading">
                  {typeof plan.priceMonthly === 'number' ? (
                    <>
                      ${annual ? plan.priceAnnual : plan.priceMonthly}
                      <span className="text-xs text-zinc-500 font-normal font-sans"> / month</span>
                    </>
                  ) : (
                    plan.priceMonthly
                  )}
                </div>
                <p className="text-xs text-zinc-400">{plan.description}</p>
              </div>

              <div className="border-t border-zinc-800 pt-4 space-y-2.5">
                <p className="text-[10px] font-mono uppercase font-bold text-zinc-400">Included Features:</p>
                <ul className="space-y-2 text-xs text-zinc-300">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <Check size={14} className="text-zinc-400 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to={plan.name.includes('Enterprise') ? '/contact' : '/dashboard'}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-colors ${
                  plan.popular
                    ? 'bg-white hover:bg-zinc-200 text-black'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800'
                }`}
              >
                <span>{plan.cta}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
