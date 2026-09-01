import React from 'react';
import { Shield, Sparkles, Upload, Mic, ArrowRight, CheckCircle2, FileText, ShieldCheck, Scale, FileSearch, HelpCircle as QuestionIcon, HelpCircle, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { VerdictBadge } from '../components/common/VerdictBadge';
import { CommunityRadar } from '../components/community/CommunityRadar';

interface LandingPageProps {
  onStartCheck: (initialText?: string, mode?: 'text' | 'image' | 'voice') => void;
  onOpenWorkspaceWithDemo: (demoId: string) => void;
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCheck,
  onOpenWorkspaceWithDemo,
  onNavigate,
}) => {
  const { t, isHindi } = useLanguage();

  return (
    <div className="w-full flex flex-col items-center">
      {/* ══════════════════════════════════════════════════
          SECTION 1 — HERO
          ══════════════════════════════════════════════════ */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
        {/* Subtle trust badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-bold border border-primary/20 mb-6">
          <Shield size={14} className="stroke-[2.5]" />
          <span>{t('hero_badge')}</span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-text-primary mb-6 max-w-4xl mx-auto leading-[1.12]">
          {t('hero_title_prefix')}{' '}
          <span className="text-primary underline decoration-primary/30 decoration-wavy underline-offset-8">
            {t('hero_title_highlight')}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          {t('hero_description')}
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 max-w-xl mx-auto mb-14">
          <button
            type="button"
            onClick={() => onStartCheck('', 'text')}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-primary text-white font-bold text-sm shadow-xs hover:bg-primary-hover active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Sparkles size={17} />
            <span>{t('hero_cta_check')}</span>
          </button>

          <button
            type="button"
            onClick={() => onStartCheck('', 'image')}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-surface border border-border hover:border-primary/40 font-bold text-sm text-text-primary shadow-xs hover:bg-surface-secondary transition-all focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Upload size={16} className="text-primary" />
            <span>{t('hero_cta_screenshot')}</span>
          </button>

          <button
            type="button"
            onClick={() => onStartCheck('', 'voice')}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-surface border border-border hover:border-primary/40 font-bold text-sm text-text-primary shadow-xs hover:bg-surface-secondary transition-all focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Mic size={16} className="text-primary" />
            <span>{t('hero_cta_voice')}</span>
          </button>
        </div>

        {/* Subtle Process Flow Visual (Static, Clean, Structured) */}
        <div className="p-6 rounded-3xl bg-surface border border-border max-w-3xl mx-auto shadow-xs text-left">
          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-border/80 text-xs font-bold uppercase tracking-wider text-text-muted">
            <span>{t('hero_provenance_label')}</span>
            <span className="text-primary font-mono">{t('brand_motto')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-surface-secondary border border-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">01. {isHindi ? 'इनपुट' : 'Input'}</span>
              <span className="text-xs font-bold text-text-primary">{isHindi ? 'संदेश / छवि' : 'Claim / Forward'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-surface-secondary border border-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">02. {isHindi ? 'स्रोत' : 'Registries'}</span>
              <span className="text-xs font-bold text-text-primary">RBI, PIB, WHO</span>
            </div>
            <div className="p-3 rounded-2xl bg-surface-secondary border border-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">03. {isHindi ? 'साक्ष्य' : 'Evidence'}</span>
              <span className="text-xs font-bold text-text-primary">{isHindi ? 'आधिकारिक परिपत्र' : 'Official Circulars'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-primary-soft border border-primary/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-1">04. {isHindi ? 'परिणाम' : 'Verdict'}</span>
              <span className="text-xs font-extrabold text-primary">{isHindi ? 'सत्यापित / खंडित' : 'Verified / False'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — THE PROBLEM
          ══════════════════════════════════════════════════ */}
      <section className="w-full bg-surface-secondary/60 border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-text-secondary text-xs font-bold mb-3">
              <QuestionIcon size={13} className="text-primary" />
              <span>{t('problem_badge')}</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-text-primary mb-3">
              {t('problem_title')}
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {t('problem_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 spotlight-group">
            <div className="p-6 rounded-3xl bg-surface border border-border hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 flex items-center justify-center font-bold mb-4 border border-rose-200 dark:border-rose-800">
                01
              </div>
              <h3 className="font-bold text-base text-text-primary mb-2">
                "{t('problem_q1_title')}"
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {t('problem_q1_desc')}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center font-bold mb-4 border border-amber-200 dark:border-amber-800">
                02
              </div>
              <h3 className="font-bold text-base text-text-primary mb-2">
                "{t('problem_q2_title')}"
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {t('problem_q2_desc')}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 flex items-center justify-center font-bold mb-4 border border-indigo-200 dark:border-indigo-800">
                03
              </div>
              <h3 className="font-bold text-base text-text-primary mb-2">
                "{t('problem_q3_title')}"
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {t('problem_q3_desc')}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 flex items-center justify-center font-bold mb-4 border border-teal-200 dark:border-teal-800">
                04
              </div>
              <h3 className="font-bold text-base text-text-primary mb-2">
                "{t('problem_q4_title')}"
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {t('problem_q4_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 3 — HOW FACTSETU WORKS
          ══════════════════════════════════════════════════ */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold mb-3">
            <Scale size={13} />
            <span>{t('how_badge')}</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-text-primary mb-3">
            {t('how_title')}
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {t('how_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 spotlight-group">
          <div className="p-6 rounded-3xl bg-surface border border-border">
            <div className="w-10 h-10 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-bold text-sm mb-4">
              01
            </div>
            <h3 className="font-display font-bold text-base text-text-primary mb-2">
              {t('how_step1_title')}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {t('how_step1_desc')}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-surface border border-border">
            <div className="w-10 h-10 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-bold text-sm mb-4">
              02
            </div>
            <h3 className="font-display font-bold text-base text-text-primary mb-2">
              {t('how_step2_title')}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {t('how_step2_desc')}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-surface border border-border">
            <div className="w-10 h-10 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-bold text-sm mb-4">
              03
            </div>
            <h3 className="font-display font-bold text-base text-text-primary mb-2">
              {t('how_step3_title')}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {t('how_step3_desc')}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-surface border border-border">
            <div className="w-10 h-10 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-bold text-sm mb-4">
              04
            </div>
            <h3 className="font-display font-bold text-base text-text-primary mb-2">
              {t('how_step4_title')}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {t('how_step4_desc')}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 4 — INPUT TYPES
          ══════════════════════════════════════════════════ */}
      <section className="w-full bg-surface-secondary/60 border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-text-secondary text-xs font-bold mb-3">
              <FileText size={13} className="text-primary" />
              <span>{t('input_types_badge')}</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-text-primary mb-3">
              {t('input_types_title')}
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {t('input_types_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 spotlight-group">
            {/* Text Card */}
            <div className="p-7 rounded-3xl bg-surface border border-border flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mb-5">
                  <FileText size={22} />
                </div>
                <h3 className="font-bold text-lg text-text-primary mb-2">
                  {t('input_type_text_title')}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
                  {t('input_type_text_desc')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onStartCheck('', 'text')}
                className="w-full py-3 rounded-xl bg-surface-secondary hover:bg-primary hover:text-white border border-border text-xs font-bold text-text-primary flex items-center justify-center gap-2 transition-all"
              >
                <span>{t('input_type_text_cta')}</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Screenshot Card */}
            <div className="p-7 rounded-3xl bg-surface border border-border flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mb-5">
                  <Upload size={22} />
                </div>
                <h3 className="font-bold text-lg text-text-primary mb-2">
                  {t('input_type_image_title')}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
                  {t('input_type_image_desc')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onStartCheck('', 'image')}
                className="w-full py-3 rounded-xl bg-surface-secondary hover:bg-primary hover:text-white border border-border text-xs font-bold text-text-primary flex items-center justify-center gap-2 transition-all"
              >
                <span>{t('input_type_image_cta')}</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Voice Card */}
            <div className="p-7 rounded-3xl bg-surface border border-border flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mb-5">
                  <Mic size={22} />
                </div>
                <h3 className="font-bold text-lg text-text-primary mb-2">
                  {t('input_type_voice_title')}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
                  {t('input_type_voice_desc')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onStartCheck('', 'voice')}
                className="w-full py-3 rounded-xl bg-surface-secondary hover:bg-primary hover:text-white border border-border text-xs font-bold text-text-primary flex items-center justify-center gap-2 transition-all"
              >
                <span>{t('input_type_voice_cta')}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 5 — CLAIM-BY-CLAIM VERIFICATION
          ══════════════════════════════════════════════════ */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold mb-3">
            <CheckCircle2 size={13} />
            <span>{t('claim_split_badge')}</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-text-primary mb-3">
            {t('claim_split_title')}
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {t('claim_split_subtitle')}
          </p>
        </div>

        {/* Visual Example Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border max-w-4xl mx-auto shadow-xs">
          <div className="mb-6 p-4 rounded-2xl bg-surface-secondary border border-border/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-1">
              {t('claim_split_example_title')}:
            </span>
            <p className="text-sm sm:text-base font-semibold text-text-primary italic">
              {t('claim_split_msg')}
            </p>
          </div>

          <div className="space-y-3.5">
            {/* Claim 1 */}
            <div className="p-4 rounded-2xl bg-surface border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-0.5">
                  {isHindi ? 'दावा 01' : 'Claim 01'}
                </span>
                <p className="text-xs sm:text-sm font-bold text-text-primary mb-1">
                  "{t('claim_split_c1_text')}"
                </p>
                <p className="text-xs text-text-secondary">
                  {t('claim_split_c1_why')}
                </p>
              </div>
              <VerdictBadge verdict="VERIFIED" size="sm" />
            </div>

            {/* Claim 2 */}
            <div className="p-4 rounded-2xl bg-surface border border-rose-200 dark:border-rose-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 block mb-0.5">
                  {isHindi ? 'दावा 02' : 'Claim 02'}
                </span>
                <p className="text-xs sm:text-sm font-bold text-text-primary mb-1">
                  "{t('claim_split_c2_text')}"
                </p>
                <p className="text-xs text-text-secondary">
                  {t('claim_split_c2_why')}
                </p>
              </div>
              <VerdictBadge verdict="CONTRADICTED" size="sm" />
            </div>

            {/* Claim 3 */}
            <div className="p-4 rounded-2xl bg-surface border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-0.5">
                  {isHindi ? 'दावा 03' : 'Claim 03'}
                </span>
                <p className="text-xs sm:text-sm font-bold text-text-primary mb-1">
                  "{t('claim_split_c3_text')}"
                </p>
                <p className="text-xs text-text-secondary">
                  {t('claim_split_c3_why')}
                </p>
              </div>
              <VerdictBadge verdict="UNCERTAIN" size="sm" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 6 — EVIDENCE FIRST DEMO
          ══════════════════════════════════════════════════ */}
      <section className="w-full bg-surface-secondary/60 border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-text-secondary text-xs font-bold mb-3">
              <ShieldCheck size={13} className="text-primary" />
              <span>{t('evidence_first_badge')}</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-text-primary mb-3">
              {t('evidence_first_title')}
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {t('evidence_first_subtitle')}
            </p>
          </div>

          {/* Interactive Evidence Preview Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border max-w-4xl mx-auto shadow-xs">
            <div className="mb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1">
                {t('evidence_demo_claim_label')}:
              </span>
              <p className="text-base sm:text-lg font-bold text-text-primary p-4 rounded-2xl bg-surface-secondary border border-border">
                "{t('evidence_demo_claim_text')}"
              </p>
            </div>

            {/* Verdict Result */}
            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <VerdictBadge verdict="CONTRADICTED" size="md" showDescription />
            </div>

            {/* Attached Evidence Snippets */}
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-3">
              {t('evidence_demo_sources_label')}:
            </span>

            <div className="space-y-3 mb-6">
              <div className="p-4 rounded-xl bg-surface-secondary border border-border text-xs sm:text-sm text-text-primary">
                <div className="flex items-center justify-between font-bold text-primary mb-1">
                  <span>{t('evidence_demo_rbi_name')}</span>
                  <span className="text-[10px] uppercase text-emerald-700 dark:text-emerald-400">Level 5 Authority</span>
                </div>
                <p className="italic">"{t('evidence_demo_rbi_quote')}"</p>
              </div>

              <div className="p-4 rounded-xl bg-surface-secondary border border-border text-xs sm:text-sm text-text-primary">
                <div className="flex items-center justify-between font-bold text-primary mb-1">
                  <span>{t('evidence_demo_npci_name')}</span>
                  <span className="text-[10px] uppercase text-emerald-700 dark:text-emerald-400">Level 5 Authority</span>
                </div>
                <p className="italic">"{t('evidence_demo_npci_quote')}"</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenWorkspaceWithDemo('upi-ban')}
              className="w-full py-3.5 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>{isHindi ? 'पूर्ण सत्यापन कार्यक्षेत्र (Workspace) खोलें' : 'Open Complete Verification Workspace'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 7 — TRUSTED SOURCES DIRECTORY PREVIEW
          ══════════════════════════════════════════════════ */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold mb-3">
          <Shield size={13} />
          <span>{t('sources_badge')}</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-text-primary mb-3">
          {t('sources_title')}
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto mb-10 leading-relaxed">
          {t('sources_subtitle')}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8 spotlight-group">
          {[
            { name: 'PIB Fact Check', domain: 'factcheck.pib.gov.in' },
            { name: 'Reserve Bank (RBI)', domain: 'rbi.org.in' },
            { name: 'NPCI Digital Payments', domain: 'npci.org.in' },
            { name: 'National Portal', domain: 'india.gov.in' },
            { name: 'Election Commission', domain: 'eci.gov.in' },
            { name: 'World Health (WHO)', domain: 'who.int' },
          ].map((src, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-surface border border-border text-center flex flex-col items-center justify-center hover:border-primary/40 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center mb-2">
                <Shield size={14} />
              </div>
              <span className="text-xs font-bold text-text-primary truncate w-full">
                {src.name}
              </span>
              <span className="text-[10px] text-text-muted font-mono truncate w-full mt-0.5">
                {src.domain}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/sources')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-border hover:bg-surface-secondary text-xs font-bold text-text-primary transition-colors"
        >
          <span>{t('sources_view_all')}</span>
          <ArrowRight size={13} />
        </button>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 8 — WHAT FACTSETU CAN CHECK
          ══════════════════════════════════════════════════ */}
      <section className="w-full bg-surface-secondary/60 border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-text-secondary text-xs font-bold mb-3">
              <FileSearch size={13} className="text-primary" />
              <span>{t('categories_badge')}</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-text-primary mb-3">
              {t('categories_title')}
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {t('categories_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 spotlight-group">
            <div className="p-6 rounded-3xl bg-surface border border-border">
              <h3 className="font-bold text-base text-text-primary mb-2">
                🏛️ {t('cat_gov_title')}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {t('cat_gov_desc')}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border">
              <h3 className="font-bold text-base text-text-primary mb-2">
                💳 {t('cat_fin_title')}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {t('cat_fin_desc')}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border">
              <h3 className="font-bold text-base text-text-primary mb-2">
                🏥 {t('cat_health_title')}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {t('cat_health_desc')}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border">
              <h3 className="font-bold text-base text-text-primary mb-2">
                ⚠️ {t('cat_scam_title')}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {t('cat_scam_desc')}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border">
              <h3 className="font-bold text-base text-text-primary mb-2">
                🗳️ {t('cat_elections_title')}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {t('cat_elections_desc')}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border">
              <h3 className="font-bold text-base text-text-primary mb-2">
                🚆 {t('cat_civic_title')}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {t('cat_civic_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 8.5 — COMMUNITY MISINFORMATION RADAR
          ══════════════════════════════════════════════════ */}
      <CommunityRadar onVerifyClaim={(claim) => onStartCheck(claim, 'text')} />

      {/* ══════════════════════════════════════════════════
          SECTION 9 — UNCERTAINTY & HONESTY
          ══════════════════════════════════════════════════ */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800 mb-3">
            <HelpCircle size={13} />
            <span>{t('uncertainty_badge')}</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-text-primary mb-3">
            {t('uncertainty_title')}
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {t('uncertainty_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-surface border border-border">
            <h3 className="font-bold text-base text-text-primary mb-2">
              {t('uncertainty_card1_title')}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {t('uncertainty_card1_desc')}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-surface border border-border">
            <h3 className="font-bold text-base text-text-primary mb-2">
              {t('uncertainty_card2_title')}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {t('uncertainty_card2_desc')}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-surface border border-border">
            <h3 className="font-bold text-base text-text-primary mb-2">
              {t('uncertainty_card3_title')}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {t('uncertainty_card3_desc')}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 10 — PRIVACY
          ══════════════════════════════════════════════════ */}
      <section className="w-full bg-surface-secondary/60 border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-text-secondary text-xs font-bold mb-3">
              <Lock size={13} className="text-primary" />
              <span>{t('privacy_badge')}</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-text-primary mb-3">
              {t('privacy_title')}
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {t('privacy_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-surface border border-border">
              <h3 className="font-bold text-base text-text-primary mb-2">
                {t('privacy_point1_title')}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {t('privacy_point1_desc')}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border">
              <h3 className="font-bold text-base text-text-primary mb-2">
                {t('privacy_point2_title')}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {t('privacy_point2_desc')}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-border">
              <h3 className="font-bold text-base text-text-primary mb-2">
                {t('privacy_point3_title')}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {t('privacy_point3_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 11 — FINAL CTA
          ══════════════════════════════════════════════════ */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="p-8 sm:p-14 rounded-3xl bg-surface border border-border shadow-sm">
          <h2 className="font-display font-black text-2xl sm:text-4xl text-text-primary mb-4">
            {t('cta_title')}
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto mb-8 leading-relaxed">
            {t('cta_subtitle')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => onStartCheck('', 'text')}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-primary text-white font-bold text-sm shadow-xs hover:bg-primary-hover active:scale-[0.98] transition-all"
            >
              <Sparkles size={16} />
              <span>{t('cta_button')}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/sources')}
              className="px-6 py-3.5 rounded-2xl bg-surface-secondary hover:bg-surface border border-border font-bold text-sm text-text-primary transition-colors"
            >
              <span>{t('cta_secondary')}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
