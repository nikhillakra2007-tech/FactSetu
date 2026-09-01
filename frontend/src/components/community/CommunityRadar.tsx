import React, { useState } from 'react';
import { Users, AlertTriangle, ShieldCheck, Check, Volume2, ArrowRight, Flag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SpeechService } from '../../services/speech';

interface ViralAlert {
  id: string;
  claim_en: string;
  claim_hi: string;
  verdict: 'CONTRADICTED' | 'VERIFIED' | 'UNCERTAIN';
  reportedCount: number;
  region: string;
  region_hi: string;
  debunkedBy: string;
}

export const CommunityRadar: React.FC<{ onVerifyClaim?: (text: string) => void }> = ({ onVerifyClaim }) => {
  const { isHindi } = useLanguage();
  const [reportedIds, setReportedIds] = useState<Record<string, boolean>>({});
  const [reportCounts, setReportCounts] = useState<Record<string, number>>({
    'c-1': 482,
    'c-2': 315,
    'c-3': 189,
  });
  const [listeningId, setListeningId] = useState<string | null>(null);
  const [reportedSuccess, setReportedSuccess] = useState<string | null>(null);

  const initialAlerts: ViralAlert[] = [
    {
      id: 'c-1',
      claim_en: 'WhatsApp message: Government giving ₹5,000 to all bank account holders under festive relief scheme. Click link to claim.',
      claim_hi: 'व्हाट्सएप संदेश: सरकार सभी बैंक खाताधारकों को त्योहार राहत योजना के तहत ₹5,000 दे रही है। क्लेम करने के लिए लिंक दबाएं।',
      verdict: 'CONTRADICTED',
      reportedCount: 482,
      region: 'UP, Bihar & Rajasthan',
      region_hi: 'उत्तर प्रदेश, बिहार और राजस्थान',
      debunkedBy: 'PIB Fact Check & Ministry of Finance',
    },
    {
      id: 'c-2',
      claim_en: 'SMS warning: Electricity bill unpaid. Power will be disconnected tonight at 9:30 PM. Call this mobile number immediately.',
      claim_hi: 'एसएमएस चेतावनी: बिजली बिल बकाया है। आज रात 9:30 बजे बिजली काट दी जाएगी। तुरंत इस मोबाइल नंबर पर कॉल करें।',
      verdict: 'CONTRADICTED',
      reportedCount: 315,
      region: 'Madhya Pradesh & Haryana',
      region_hi: 'मध्य प्रदेश और हरियाणा',
      debunkedBy: 'State Electricity Boards & Cyber Crime Police',
    },
    {
      id: 'c-3',
      claim_en: 'Ayushman Bharat PM-JAY card holders can avail free medical treatment up to ₹5 lakh per year at empaneled hospitals.',
      claim_hi: 'आयुष्मान भारत कार्ड धारक संबद्ध अस्पतालों में प्रति परिवार प्रति वर्ष ₹5 लाख तक मुफ्त इलाज का लाभ उठा सकते हैं।',
      verdict: 'VERIFIED',
      reportedCount: 189,
      region: 'Pan-India',
      region_hi: 'पूरे भारत में',
      debunkedBy: 'National Health Authority (nha.gov.in)',
    },
  ];

  const handleReport = (id: string) => {
    if (reportedIds[id]) return;
    setReportedIds((prev) => ({ ...prev, [id]: true }));
    setReportCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setReportedSuccess(id);
    setTimeout(() => setReportedSuccess(null), 3000);
  };

  const handleListen = (alert: ViralAlert) => {
    if (listeningId === alert.id) {
      SpeechService.stop();
      setListeningId(null);
      return;
    }

    setListeningId(alert.id);
    const spokenText = isHindi
      ? `सामुदायिक सतर्कता: ${alert.claim_hi}। परिणाम: यह दावा ${
          alert.verdict === 'CONTRADICTED' ? 'असत्य और फर्जी है।' : 'सत्य और पुष्टीकृत है।'
        } आधिकारिक स्रोत: ${alert.debunkedBy}।`
      : `Community Alert: ${alert.claim_en}. Verdict: This claim is ${alert.verdict}. Verified by ${alert.debunkedBy}.`;

    SpeechService.speak(
      spokenText,
      isHindi ? 'hi' : 'en',
      () => setListeningId(alert.id),
      () => setListeningId(null),
      () => setListeningId(null)
    );
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="p-6 sm:p-9 rounded-3xl bg-surface border border-border shadow-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-200 dark:border-amber-800">
              <Users size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display text-text-primary">
                  {isHindi ? 'गाँव एवं सामुदायिक सतर्कता रडार' : 'Community Misinformation Radar'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse">
                  {isHindi ? 'लाइव अलर्ट' : 'Live Alerts'}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                {isHindi
                  ? 'ग्रामीण क्षेत्रों एवं व्हाट्सएप ग्रुपों में आज फैल रहे फर्जी दावों की पुष्टि'
                  : 'Trending viral claims circulating in messaging groups verified by authorities'}
              </p>
            </div>
          </div>
        </div>

        {/* Alerts Grid */}
        <div className="space-y-4 spotlight-group">
          {initialAlerts.map((alert) => {
            const claimText = isHindi ? alert.claim_hi : alert.claim_en;
            const regionText = isHindi ? alert.region_hi : alert.region;
            const isContradicted = alert.verdict === 'CONTRADICTED';
            const count = reportCounts[alert.id] || alert.reportedCount;
            const isUserReported = !!reportedIds[alert.id];

            return (
              <div
                key={alert.id}
                className="p-5 rounded-2xl bg-surface-secondary/70 border border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all"
              >
                {/* Left details */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        isContradicted
                          ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {isContradicted ? (
                        <>
                          <AlertTriangle size={12} />
                          <span>{isHindi ? 'फर्जी / खंडित' : 'CONTRADICTED'}</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={12} />
                          <span>{isHindi ? 'सत्य / पुष्टीकृत' : 'VERIFIED'}</span>
                        </>
                      )}
                    </span>

                    <span className="text-[11px] text-text-muted font-medium">
                      📍 {regionText}
                    </span>

                    <span className="text-[11px] text-text-muted">
                      👥 {count} {isHindi ? 'नागरिकों ने रिपोर्ट किया' : 'citizens reported'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-text-primary leading-snug">
                    "{claimText}"
                  </p>

                  <p className="text-[11px] text-text-secondary">
                    <span className="font-bold">{isHindi ? 'पुष्टि स्रोत:' : 'Official Ref:'}</span>{' '}
                    {alert.debunkedBy}
                  </p>
                </div>

                {/* Right action buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Listen audio button */}
                  <button
                    type="button"
                    onClick={() => handleListen(alert)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      listeningId === alert.id
                        ? 'bg-primary text-white border-primary animate-pulse'
                        : 'bg-surface border-border text-text-secondary hover:text-text-primary'
                    }`}
                    title={isHindi ? 'बोलकर सुनें' : 'Listen aloud'}
                  >
                    <Volume2 size={15} />
                    <span className="hidden sm:inline">{isHindi ? 'सुनें' : 'Listen'}</span>
                  </button>

                  {/* 1-Tap I also received this button */}
                  <button
                    type="button"
                    onClick={() => handleReport(alert.id)}
                    disabled={isUserReported}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isUserReported
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200'
                        : 'bg-surface hover:bg-surface-secondary text-text-primary border-border active:scale-95'
                    }`}
                  >
                    {isUserReported ? (
                      <>
                        <Check size={14} className="text-emerald-600" />
                        <span>{isHindi ? 'रिपोर्ट दर्ज हुई ✓' : 'Reported ✓'}</span>
                      </>
                    ) : (
                      <>
                        <Flag size={13} className="text-rose-500" />
                        <span>{isHindi ? 'मुझे भी यह मिला' : 'I received this too'}</span>
                      </>
                    )}
                  </button>

                  {/* Verify this claim */}
                  {onVerifyClaim && (
                    <button
                      type="button"
                      onClick={() => onVerifyClaim(claimText)}
                      className="px-3.5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>{isHindi ? 'जांचें' : 'Verify'}</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {reportedSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 text-center animate-fade-in">
            {isHindi
              ? '✓ धन्यवाद! आपकी रिपोर्ट दर्ज कर ली गई है और अन्य ग्रामीणों को सतर्क किया जा रहा है।'
              : '✓ Thank you! Your report has been recorded to alert other community members.'}
          </div>
        )}
      </div>
    </section>
  );
};
