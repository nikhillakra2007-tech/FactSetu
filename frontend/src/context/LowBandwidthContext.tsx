import React, { createContext, useContext, useState, useEffect } from 'react';

interface LowBandwidthContextType {
  isLowBandwidth: boolean;
  toggleLowBandwidth: () => void;
  networkType: string;
  isAutoDetected: boolean;
}

const LowBandwidthContext = createContext<LowBandwidthContextType | undefined>(undefined);

export const LowBandwidthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [networkType, setNetworkType] = useState<string>('4g');
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(false);

  const [isLowBandwidth, setIsLowBandwidth] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('factsetu_data_saver');
      if (saved !== null) {
        return saved === 'true';
      }
      // Check device connection
      const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (conn) {
        if (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') {
          return true;
        }
      }
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn) {
      setNetworkType(conn.effectiveType || '4g');
      if (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') {
        setIsAutoDetected(true);
      }

      const updateConnection = () => {
        setNetworkType(conn.effectiveType || '4g');
        if (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') {
          setIsAutoDetected(true);
          const saved = localStorage.getItem('factsetu_data_saver');
          if (saved === null) {
            setIsLowBandwidth(true);
          }
        }
      };

      conn.addEventListener('change', updateConnection);
      return () => conn.removeEventListener('change', updateConnection);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('factsetu_data_saver', String(isLowBandwidth));
      if (isLowBandwidth) {
        document.documentElement.classList.add('data-saver-mode');
      } else {
        document.documentElement.classList.remove('data-saver-mode');
      }
    }
  }, [isLowBandwidth]);

  const toggleLowBandwidth = () => {
    setIsLowBandwidth((prev) => !prev);
  };

  return (
    <LowBandwidthContext.Provider
      value={{
        isLowBandwidth,
        toggleLowBandwidth,
        networkType,
        isAutoDetected,
      }}
    >
      {children}
    </LowBandwidthContext.Provider>
  );
};

export const useLowBandwidth = () => {
  const context = useContext(LowBandwidthContext);
  if (!context) throw new Error('useLowBandwidth must be used within a LowBandwidthProvider');
  return context;
};
