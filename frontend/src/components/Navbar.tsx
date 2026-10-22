import React from 'react';
import {
  Mountain, Compass, Sprout, GitCompare, Calendar, CheckSquare,
  Bug, ShieldAlert, BookOpen, Clock, Zap, Code, Settings,
  Volume2, VolumeX, Activity, ArrowRight, Sun
} from 'lucide-react';
import { soundManager } from '../utils/audio';

export type PageId =
  | 'welcome'
  | 'assessment_wizard'
  | 'land_analysis'
  | 'recommendations'
  | 'crop_comparison'
  | 'cultivation_plan'
  | 'ongoing_care'
  | 'pest_assistant'
  | 'harvest_readiness'
  | 'harvest_storage'
  | 'field_journal'
  | 'calendar'
  | 'live_challenge'
  | 'json_inspector'
  | 'settings_export';

interface NavbarProps {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  isBackendOnline: boolean;
  onOpenJsonInspector: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  assessmentCompleted: boolean;
  hasActivePlan: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  isBackendOnline,
  onOpenJsonInspector,
  isMuted,
  onToggleMute,
  assessmentCompleted,
  hasActivePlan
}) => {
  const handleNav = (page: PageId) => {
    soundManager.playClick();
    setActivePage(page);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-badge">
          <Mountain size={12} /> Hackathon Edition
        </div>
        <div className="brand-title">
          TERRAFORM
        </div>
        <div className="brand-scenario">
          Cold Mountain Terrace
        </div>
      </div>

      <nav className="nav-menu">
        <div className="nav-section-label">Core Journey</div>
        <button
          className={`nav-item ${activePage === 'welcome' ? 'active' : ''}`}
          onClick={() => handleNav('welcome')}
        >
          <Compass size={18} />
          <span>Overview</span>
        </button>

        <button
          className={`nav-item ${activePage === 'assessment_wizard' ? 'active' : ''}`}
          onClick={() => handleNav('assessment_wizard')}
        >
          <Sun size={18} />
          <span>Land Assessment</span>
          {!assessmentCompleted && <span className="nav-badge">Start</span>}
        </button>

        <button
          className={`nav-item ${activePage === 'land_analysis' ? 'active' : ''}`}
          onClick={() => handleNav('land_analysis')}
        >
          <Activity size={18} />
          <span>Terrace Analysis</span>
        </button>

        <button
          className={`nav-item ${activePage === 'recommendations' ? 'active' : ''}`}
          onClick={() => handleNav('recommendations')}
        >
          <Sprout size={18} />
          <span>Crop Selection</span>
        </button>

        <button
          className={`nav-item ${activePage === 'crop_comparison' ? 'active' : ''}`}
          onClick={() => handleNav('crop_comparison')}
        >
          <GitCompare size={18} />
          <span>Crop Comparison</span>
        </button>

        <div className="nav-section-label">Cultivation Management</div>
        <button
          className={`nav-item ${activePage === 'cultivation_plan' ? 'active' : ''}`}
          onClick={() => handleNav('cultivation_plan')}
        >
          <Calendar size={18} />
          <span>9-Stage Plan</span>
          {hasActivePlan && <span className="nav-badge">Active</span>}
        </button>

        <button
          className={`nav-item ${activePage === 'ongoing_care' ? 'active' : ''}`}
          onClick={() => handleNav('ongoing_care')}
        >
          <CheckSquare size={18} />
          <span>Care Checklist</span>
        </button>

        <button
          className={`nav-item ${activePage === 'pest_assistant' ? 'active' : ''}`}
          onClick={() => handleNav('pest_assistant')}
        >
          <Bug size={18} />
          <span>Pest & IPM Assistant</span>
        </button>

        <button
          className={`nav-item ${activePage === 'harvest_readiness' ? 'active' : ''}`}
          onClick={() => handleNav('harvest_readiness')}
        >
          <ShieldAlert size={18} />
          <span>Harvest Readiness</span>
        </button>

        <button
          className={`nav-item ${activePage === 'harvest_storage' ? 'active' : ''}`}
          onClick={() => handleNav('harvest_storage')}
        >
          <BookOpen size={18} />
          <span>Harvest & Storage</span>
        </button>

        <button
          className={`nav-item ${activePage === 'field_journal' ? 'active' : ''}`}
          onClick={() => handleNav('field_journal')}
        >
          <Clock size={18} />
          <span>Field Journal</span>
        </button>

        <button
          className={`nav-item ${activePage === 'calendar' ? 'active' : ''}`}
          onClick={() => handleNav('calendar')}
        >
          <Calendar size={18} />
          <span>Cultivation Calendar</span>
        </button>

        <div className="nav-section-label">Judging & Diagnostics</div>
        <button
          className={`nav-item ${activePage === 'live_challenge' ? 'challenge-active' : ''}`}
          onClick={() => handleNav('live_challenge')}
          style={activePage !== 'live_challenge' ? { border: '1px solid rgba(212, 163, 115, 0.4)', background: 'rgba(212, 163, 115, 0.12)', color: '#e9c46a' } : {}}
        >
          <Zap size={18} />
          <span>Live Challenge Mode</span>
          <span className="nav-badge" style={{ background: '#e76f51', color: '#fff' }}>Judge</span>
        </button>

        <button
          className={`nav-item ${activePage === 'json_inspector' ? 'active' : ''}`}
          onClick={() => handleNav('json_inspector')}
        >
          <Code size={18} />
          <span>JSON Inspector</span>
        </button>

        <button
          className={`nav-item ${activePage === 'settings_export' ? 'active' : ''}`}
          onClick={() => handleNav('settings_export')}
        >
          <Settings size={18} />
          <span>Settings & Export</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className={`server-pill ${isBackendOnline ? 'online' : 'offline'}`}>
          <span className={`status-dot ${isBackendOnline ? 'pulsing' : ''}`} />
          <span>{isBackendOnline ? 'Backend Online' : 'Connecting...'}</span>
        </div>

        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          style={{ color: 'rgba(255,255,255,0.7)', padding: 6, borderRadius: '50%' }}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </aside>
  );
};
