import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AuthProvider } from './context/AuthContext';
import { LenisScroller } from './components/common/LenisScroller';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

import { LandingPage } from './pages/LandingPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { WhyFactSetuPage } from './pages/WhyFactSetuPage';
import { SourcesPage } from './pages/SourcesPage';
import { ExamplesPage } from './pages/ExamplesPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

import { NewVerificationPage } from './pages/NewVerificationPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { SettingsModal } from './pages/SettingsModal';
import { AuthModal } from './pages/AuthModal';

import type { VerificationResultData, InputMode } from './types';
import { MOCK_VERIFICATIONS_DB, ApiService } from './services/api';

export function AppContent() {
  // Determine initial route from pathname or fallback to '/'
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path && path !== '/') return path;
    }
    return '/';
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Active composer parameters
  const [initialInputText, setInitialInputText] = useState('');
  const [initialInputMode, setInitialInputMode] = useState<InputMode>('text');

  // Active verification data
  const [activeVerification, setActiveVerification] = useState<VerificationResultData>(
    MOCK_VERIFICATIONS_DB['upi-ban']
  );

  // Sync route with browser history (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      setCurrentRoute(path);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', route);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartCheck = (text: string = '', mode: InputMode = 'text') => {
    setInitialInputText(text);
    setInitialInputMode(mode);
    navigate('/app');
  };

  const handleOpenWorkspaceWithDemo = async (demoId: string) => {
    const data = await ApiService.getVerificationById(demoId);
    if (data) {
      setActiveVerification(data);
      navigate('/app/workspace');
    }
  };

  const handleVerificationComplete = (result: VerificationResultData) => {
    setActiveVerification(result);
    navigate('/app/workspace');
  };

  const handleSelectFromHistory = async (id: string) => {
    const data = await ApiService.getVerificationById(id);
    if (data) {
      setActiveVerification(data);
      navigate('/app/workspace');
    }
  };

  // Render the active view based on currentRoute
  const renderRoute = () => {
    switch (currentRoute) {
      case '/':
      case '/login':
        return <LoginPage onNavigate={navigate} />;

      case '/home':
      case '/landing':
        return (
          <LandingPage
            onStartCheck={handleStartCheck}
            onOpenWorkspaceWithDemo={handleOpenWorkspaceWithDemo}
            onNavigate={navigate}
          />
        );

      case '/how-it-works':
        return <HowItWorksPage onNavigate={navigate} />;

      case '/why-factsetu':
        return <WhyFactSetuPage onNavigate={navigate} />;

      case '/sources':
        return <SourcesPage />;

      case '/examples':
        return <ExamplesPage onStartCheck={handleStartCheck} />;

      case '/about':
        return <AboutPage onNavigate={navigate} />;

      case '/privacy':
        return <PrivacyPage />;

      case '/signup':
        return <SignupPage onNavigate={navigate} />;

      case '/app':
      case '/app/new':
      case '/verify':
        return (
          <NewVerificationPage
            initialInput={initialInputText}
            initialMode={initialInputMode}
            onVerificationComplete={handleVerificationComplete}
            onNavigate={navigate}
          />
        );

      case '/app/workspace':
      case '/workspace':
        return (
          <WorkspacePage
            data={activeVerification}
            onNewCheck={() => handleStartCheck()}
          />
        );

      case '/app/history':
      case '/history':
        return (
          <HistoryPage
            onSelectVerification={handleSelectFromHistory}
            onNewCheck={() => handleStartCheck()}
          />
        );

      case '/app/settings':
      case '/settings':
        return <SettingsPage />;

      default:
        return (
          <LandingPage
            onStartCheck={handleStartCheck}
            onOpenWorkspaceWithDemo={handleOpenWorkspaceWithDemo}
            onNavigate={navigate}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary transition-colors duration-200">
      {/* Global Universal Navigation */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigate}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Content View with fade-in */}
      <main className="flex-1 w-full flex flex-col animate-fade-in" key={currentRoute}>
        {renderRoute()}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={navigate} />

      {/* Global Dialog Modals */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
      <AuthModal />
    </div>
  );
}

import { LowBandwidthProvider } from './context/LowBandwidthContext';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AccessibilityProvider>
          <LowBandwidthProvider>
            <AuthProvider>
              <LenisScroller>
                <AppContent />
              </LenisScroller>
            </AuthProvider>
          </LowBandwidthProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
