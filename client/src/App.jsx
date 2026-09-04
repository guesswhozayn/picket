/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import api, { BASE_URL } from './api';
import { io } from 'socket.io-client';
import UploadModal from './components/UploadModal';
import ProjectsView from './components/ProjectsView';
import ProjectDetailView from './components/ProjectDetailView';
import PoWChallenge from './components/PoWChallenge';
import CandidatesPage from './components/CandidatesPage';
import AnalyticsPage from './components/AnalyticsPage';
import SettingsPage from './components/SettingsPage';
import {
  Users, LayoutDashboard, Settings, Search,
  Bell, Activity, Briefcase, Menu, X,
  Sun, Moon, BookOpen
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import AuthPages from './components/auth/AuthPages';
import SplashScreen from './components/auth/SplashScreen';
import ProfileMenu from './components/auth/ProfileMenu';

import LandingPage from './components/landing/LandingPage';
import DocsPage from './components/landing/DocsPage';
import HowItWorksPage from './components/landing/HowItWorksPage';
import AIAgentsPage from './components/landing/AIAgentsPage';
import FeaturesPage from './components/landing/FeaturesPage';
import DemoPage from './components/landing/DemoPage';
import LegalPage from './components/landing/LegalPage';

const queryClient = new QueryClient();
const socket = io(BASE_URL);

const ThemeContext = createContext({ dark: false, toggle: () => {} });

function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ── Sidebar nav link ───────────────────────────────────────────── */
function NavLink({ icon: Icon, label, active, badge, onClick }) {
  const [hovered, setHovered] = useState(false);
  const bg   = active ? 'var(--nav-active-bg)'
             : hovered ? 'var(--bg-hover)'
             : 'transparent';
  const clr  = active ? 'var(--nav-active-text)'
             : hovered ? 'var(--text-primary)'
             : 'var(--text-body)';
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick?.(); }}
      className="flex items-center justify-between px-3 py-[7px] rounded-md text-sm"
      style={{ background: bg, color: clr, fontWeight: active ? 500 : 400 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="flex items-center gap-2.5">
        <Icon size={15} />
        {label}
      </span>
      {badge && (
        <span
          className="text-[11px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: 'var(--badge-blue-bg)', color: 'var(--badge-blue-text)' }}
        >
          {badge}
        </span>
      )}
    </a>
  );
}

/* ── Theme toggle button ─────────────────────────────────────────── */
function ThemeToggle() {
  const { dark, toggle } = useContext(ThemeContext);
  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="p-1.5 rounded-md transition-colors"
      style={{
        color: 'var(--text-muted)',
        background: 'transparent',
        boxShadow: 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

/* ── Dashboard shell ─────────────────────────────────────────────── */
const fetchProjects = () =>
  api.get('/api/projects').then(r => r.data);

function Dashboard() {
  const [view, setView] = useState('projects'); // 'projects' | 'project-detail' | 'candidates' | 'analytics'
  const [selectedProject, setSelectedProject] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 15_000,
  });

  const activeCount = projects.filter(p => p.status === 'active').length;

  const goToProject   = (p) => { setSelectedProject(p); setView('project-detail'); };
  const goToProjects  = () => { setView('projects'); };
  const goToCandidates = () => { setView('candidates'); };
  const goToAnalytics  = () => { setView('analytics'); };
  const goToSettings   = () => { setView('settings'); };

  if (view === 'docs') {
    return <DocsPage onBack={() => setView('projects')} />;
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg)', color: 'var(--text-primary)', fontFeatureSettings: '"liga"' }}
    >

      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'var(--overlay)' }}
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 w-[220px] shrink-0 fixed lg:static inset-y-0 left-0 z-50
          flex flex-col transition-transform duration-300`}
        style={{ background: 'var(--bg)', boxShadow: 'var(--sh-div-r)' }}
      >

        <div
          className="h-16 shrink-0 flex items-center px-5 gap-2.5"
          style={{ boxShadow: 'var(--sh-div-t)' }}
        >

          <svg
            width="26" height="32" viewBox="0 0 44 54" fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Picket logo"
            className="shrink-0"
          >
            <defs>

              <linearGradient id="pk-g-back" x1="6" y1="6" x2="20" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#1565C0" />
                <stop offset="100%" stopColor="#1E88E5" />
              </linearGradient>

              <linearGradient id="pk-g-front" x1="22" y1="2" x2="34" y2="46" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#26C6DA" />
                <stop offset="100%" stopColor="#1565C0" />
              </linearGradient>
            </defs>

            <rect
              x="4" y="6" width="17" height="40" rx="8.5"
              fill="url(#pk-g-back)"
              transform="rotate(14 12.5 26)"
            />

            <rect
              x="20" y="3" width="15" height="38" rx="7.5"
              fill="url(#pk-g-front)"
              transform="rotate(-6 27.5 22)"
            />
          </svg>

          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              fontSize: '18px',
              letterSpacing: '-0.8px',
              color: 'var(--text-primary)',
              lineHeight: 1,
            }}
          >
            picket
          </span>

          <button
            className="ml-auto lg:hidden"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 custom-scrollbar">
          <p className="mono-label px-3 py-2">Overview</p>
          <NavLink
            icon={LayoutDashboard}
            label="Projects"
            active={view === 'projects'}
            badge={activeCount || undefined}
            onClick={goToProjects}
          />
          <NavLink
            icon={Users}
            label="Candidates"
            active={view === 'candidates'}
            onClick={goToCandidates}
          />
          <NavLink icon={Activity} label="Analytics" active={view === 'analytics'} onClick={goToAnalytics} />
          <NavLink icon={BookOpen} label="Documentation" active={view === 'docs'} onClick={() => setView('docs')} />
          {projects.length > 0 && (
            <div className="pt-3">
              <p className="mono-label px-3 py-2">Recent</p>
              {projects.slice(0, 5).map(p => (
                <NavLink
                  key={p._id}
                  icon={Briefcase}
                  label={p.title}
                  active={view === 'project-detail' && selectedProject?._id === p._id}
                  onClick={() => goToProject(p)}
                />
              ))}
            </div>
          )}
        </nav>

        <div className="p-3" style={{ boxShadow: 'var(--sh-div-b)' }}>
          <NavLink
            icon={Settings}
            label="Settings"
            active={view === 'settings'}
            onClick={goToSettings}
          />
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0" style={{ background: 'var(--bg)' }}>

        <header
          className="h-16 shrink-0 flex items-center justify-between px-6 sticky top-0 z-30"
          style={{ background: 'var(--bg)', boxShadow: 'var(--sh-div-t)' }}
        >
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden"
              style={{ color: 'var(--text-muted)' }}
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden md:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-placeholder)' }}
                size={14}
              />
              <input
                type="text"
                placeholder="Search candidates…"
                className="pl-9 pr-4 py-1.5 text-sm"
                style={{ width: '240px' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <button
              className="relative p-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              <Bell size={17} />
              <span
                className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                style={{ background: '#0a72ef' }}
              />
            </button>

            <ProfileMenu />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1200px] mx-auto w-full px-6 py-10">

            {view === 'projects' && (
              <ProjectsView onSelectProject={goToProject} />
            )}

            {view === 'project-detail' && selectedProject && (
              <ProjectDetailView
                project={selectedProject}
                socket={socket}
                onBack={goToProjects}
                onUpload={() => setIsUploadModalOpen(true)}
              />
            )}

            {view === 'candidates' && (
              <CandidatesPage
                projectId={selectedProject?._id}
                socket={socket}
                onBack={selectedProject ? () => setView('project-detail') : goToProjects}
                onUpload={() => setIsUploadModalOpen(true)}
              />
            )}

            {view === 'analytics' && (
              <AnalyticsPage
                projectId={selectedProject?._id}
                project={selectedProject}
                onBack={selectedProject ? () => setView('project-detail') : goToProjects}
                onSelectProject={goToProject}
              />
            )}

            {view === 'settings' && (
              <SettingsPage />
            )}

          </div>
        </div>

      </main>

      {isUploadModalOpen && (
        <UploadModal
          onClose={() => setIsUploadModalOpen(false)}
          projectId={selectedProject?._id}
          projectTitle={selectedProject?.title}
        />
      )}
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState('landing'); // 'landing' | 'login' | 'register'
  const [docsSection, setDocsSection] = useState('welcome');
  const [legalTab, setLegalTab] = useState('privacy');

  const [assessCandidateId] = useState(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('assess');
  });

  if (loading) return <SplashScreen />;

  if (assessCandidateId) {
    return (
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]" style={{ color: 'var(--text-primary)' }}>
            <div className="w-full max-w-md rounded-xl border border-[var(--bg-hover)] bg-[var(--bg)] overflow-hidden shadow-[var(--sh-card)]">
              <div className="px-6 py-4 flex items-center gap-2 border-b border-[var(--bg-hover)]">
                <span className="mono-label" style={{ color: 'var(--badge-blue-text)' }}>Picket Candidate Verification</span>
              </div>
              <PoWChallenge
                candidateId={assessCandidateId}
                onComplete={() => {}}
              />
            </div>
          </div>
        </QueryClientProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {user ? (
          <Dashboard />
        ) : authMode === 'landing' ? (
          <LandingPage
            onStartHiring={() => setAuthMode('register')}
            onLogin={() => setAuthMode('login')}
            onDocs={(section) => { setDocsSection(section || 'welcome'); setAuthMode('docs'); }}
            onHowItWorks={() => setAuthMode('how-it-works')}
            onAIAgents={() => setAuthMode('ai-agents')}
            onFeatures={() => setAuthMode('features')}
            onDemo={() => setAuthMode('demo')}
            onLegal={(tab) => { setLegalTab(tab || 'privacy'); setAuthMode('legal'); }}
          />
        ) : authMode === 'docs' ? (
          <DocsPage initialSection={docsSection} onBack={() => setAuthMode('landing')} />
        ) : authMode === 'how-it-works' ? (
          <HowItWorksPage onBack={() => setAuthMode('landing')} />
        ) : authMode === 'ai-agents' ? (
          <AIAgentsPage onBack={() => setAuthMode('landing')} />
        ) : authMode === 'features' ? (
          <FeaturesPage onBack={() => setAuthMode('landing')} />
        ) : authMode === 'demo' ? (
          <DemoPage onBack={() => setAuthMode('landing')} />
        ) : authMode === 'legal' ? (
          <LegalPage initialTab={legalTab} onBack={() => setAuthMode('landing')} />
        ) : (
          <AuthPages
            initialView={authMode}
            onBack={() => setAuthMode('landing')}
          />
        )}
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
