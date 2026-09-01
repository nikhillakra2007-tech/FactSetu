import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const HowWeChecked: React.FC = () => {
  const { t, isHindi } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    {
      num: '1',
      title: isHindi ? '1. संदेश का विश्लेषण' : '1. Claim Identified',
      desc: isHindi
        ? 'दर्ज किए गए संदेश के व्याकरण और संरचना का विश्लेषण कर जांच योग्य तथ्यात्मक दावों को अलग किया गया।'
        : 'Analyzed message structure and isolated testable factual assertions from personal opinions.',
    },
    {
      num: '2',
      title: isHindi ? '2. आधिकारिक स्रोतों में खोज' : '2. Trusted Registries Queried',
      desc: isHindi
        ? 'आरबीआई, पीआईबी, मंत्रालयों और अंतरराष्ट्रीय स्वास्थ्य पोर्टलों जैसे पूर्व-सत्यापित रिपॉजिटरी में खोज की गई।'
        : 'Searched pre-screened official registries (RBI, PIB, WHO, Ministry portals) avoiding unverified opinion forums.',
    },
    {
      num: '3',
      title: isHindi ? '3. प्रामाणिक साक्ष्य एकत्रण' : '3. Relevant Evidence Retrieved',
      desc: isHindi
        ? 'दावे के संदर्भ से मेल खाने वाले सटीक उद्धरण, परिपत्र और राजपत्र अधिसूचनाएं निकाली गईं।'
        : 'Extracted direct quotes, notifications, and gazette records matching the specific context of the claim.',
    },
    {
      num: '4',
      title: isHindi ? '4. साक्ष्य से दावे की तुलना' : '4. Evidence Compared',
      desc: isHindi
        ? 'आधिकारिक दस्तावेजों के साथ दावे की सहमति, प्रकाशन की तारीख और संभावित विरोधाभासों का मिलान किया गया।'
        : 'Evaluated semantic agreement, publication recency, and potential conflicting regulatory records.',
    },
    {
      num: '5',
      title: isHindi ? '5. सरल भाषा में परिणाम निर्धारण' : '5. Transparent Verdict Formulated',
      desc: isHindi
        ? 'परिणाम को पुष्टीकृत, खंडित या अनिश्चित में वर्गीकृत किया गया और साक्ष्यों का सीधा लिंक दिया गया।'
        : 'Classified findings into Verified, Contradicted, or Uncertain without hiding behind confusing jargon.',
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden transition-all duration-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-secondary/60 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <HelpCircle size={16} className="text-primary shrink-0" />
          <span className="text-sm font-bold text-text-primary">
            {t('workspace_how_we_checked')}
          </span>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
      </button>

      {isOpen && (
        <div className="p-4 pt-2 border-t border-border bg-surface-secondary/30">
          <div className="space-y-3 mt-1">
            {steps.map((step) => (
              <div key={step.num} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary-soft text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                  {step.num}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-text-primary">
                    {step.title}
                  </h5>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
