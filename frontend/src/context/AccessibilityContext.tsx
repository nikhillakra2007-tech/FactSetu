import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilitySettings {
  reducedMotion: boolean;
  largeText: boolean;
  spokenAudio: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  setReducedMotion: (val: boolean) => void;
  setLargeText: (val: boolean) => void;
  setSpokenAudio: (val: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('factsetu_a11y');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore fallback
      }
    }
    return {
      reducedMotion: false,
      largeText: false,
      spokenAudio: true,
    };
  });

  useEffect(() => {
    localStorage.setItem('factsetu_a11y', JSON.stringify(settings));
    
    // Apply classes to root element
    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }

    if (settings.largeText) {
      document.documentElement.classList.add('large-text-mode');
    } else {
      document.documentElement.classList.remove('large-text-mode');
    }
  }, [settings]);

  const setReducedMotion = (val: boolean) => {
    setSettings((prev) => ({ ...prev, reducedMotion: val }));
  };

  const setLargeText = (val: boolean) => {
    setSettings((prev) => ({ ...prev, largeText: val }));
  };

  const setSpokenAudio = (val: boolean) => {
    setSettings((prev) => ({ ...prev, spokenAudio: val }));
  };

  return (
    <AccessibilityContext.Provider
      value={{ settings, setReducedMotion, setLargeText, setSpokenAudio }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used within an AccessibilityProvider');
  return context;
};
