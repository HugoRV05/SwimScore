import { useState } from 'react';
import { useAppStore } from '../lib/store';
import type { ScoringConfig, CategoryConfig } from '../types';
import { Save, RotateCcw, Plus, Trash2, Info, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Select from '../components/ui/Select';

export default function SettingsPage() {
  const { scoringConfig, setScoringConfig, setPreset, availablePresets } = useAppStore();
  const [localConfig, setLocalConfig] = useState<ScoringConfig>(scoringConfig);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'points' | 'categories' | 'bonus'>('presets');
  const { t, language, setLanguage } = useLanguage();
  
  const updateConfig = (updates: Partial<ScoringConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };
  
  const saveChanges = () => {
    setScoringConfig(localConfig);
    setHasChanges(false);
  };
  
  const resetToPreset = (presetId: string) => {
    const preset = availablePresets[presetId];
    if (preset) {
      setLocalConfig(preset);
      setPreset(presetId);
      setHasChanges(false);
    }
  };
  
  const addCategory = () => {
    const newCategory: CategoryConfig = {
      id: `custom-${Date.now()}`,
      name: 'New Category',
      displayName: 'New Category',
      minAge: 10,
      maxAge: 12,
      birthYearStart: null,
      birthYearEnd: null,
    };
    updateConfig({
      categories: [...localConfig.categories, newCategory],
    });
  };
  
  const updateCategory = (index: number, updates: Partial<CategoryConfig>) => {
    const newCategories = [...localConfig.categories];
    newCategories[index] = { ...newCategories[index], ...updates };
    updateConfig({ categories: newCategories });
  };
  
  const removeCategory = (index: number) => {
    const newCategories = localConfig.categories.filter((_, i) => i !== index);
    updateConfig({ categories: newCategories });
  };
  
  const updateCategoryScoringRule = (categoryId: string, canScoreIn: string[]) => {
    const existingRuleIndex = localConfig.categoryScoring.findIndex(r => r.categoryId === categoryId);
    const newRules = [...localConfig.categoryScoring];
    
    if (existingRuleIndex >= 0) {
      newRules[existingRuleIndex] = { categoryId, canScoreIn };
    } else {
      newRules.push({ categoryId, canScoreIn });
    }
    
    updateConfig({ categoryScoring: newRules });
  };

  const languageOptions = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' }
  ];
  
  return (
    <div>
      <header className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">{t('settings.title')}</h1>
            <p className="page-subtitle">{t('settings.subtitle')}</p>
          </div>
          
          <div className="card, language-select" style={{ padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg-secondary)', minWidth: '160px' }}>
            <Globe size={16} className="text-muted" style={{ marginLeft: 'var(--space-2)' }} />
            <div style={{ flex: 1 }}>
              <Select
                value={language}
                onChange={(val) => setLanguage(val as any)}
                options={languageOptions}
                className="language-select" 
              />
            </div>
          </div>
        </div>
      </header>
      
      {/* Save Bar */}
      {hasChanges && (
        <div className="card" style={{ 
          marginBottom: 'var(--space-6)', 
          background: 'rgba(245, 158, 11, 0.1)', 
          borderColor: 'var(--color-warning)',
          padding: 'var(--space-4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-warning)' }}>
              <Info size={18} style={{ marginRight: 'var(--space-2)', verticalAlign: 'middle' }} />
              {t('settings.unsavedChanges')}
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn btn-secondary" onClick={() => setLocalConfig(scoringConfig)}>
                <RotateCcw size={16} />
                {t('settings.discard')}
              </button>
              <button className="btn btn-primary" onClick={saveChanges}>
                <Save size={16} />
                {t('settings.save')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'presets' ? 'active' : ''}`}
          onClick={() => setActiveTab('presets')}
        >
          {t('settings.tabs.presets')}
        </button>
        <button 
          className={`tab ${activeTab === 'points' ? 'active' : ''}`}
          onClick={() => setActiveTab('points')}
        >
          {t('settings.tabs.points')}
        </button>
        <button 
          className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          {t('settings.tabs.categories')}
        </button>
        <button 
          className={`tab ${activeTab === 'bonus' ? 'active' : ''}`}
          onClick={() => setActiveTab('bonus')}
        >
          {t('settings.tabs.bonus')}
        </button>
      </div>
      
      {/* Presets Tab */}
      {activeTab === 'presets' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>{t('settings.presets.title')}</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
            {t('settings.presets.description')}
          </p>
          
          <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {Object.entries(availablePresets).map(([id, preset]) => (
              <div 
                key={id}
                onClick={() => resetToPreset(id)}
                style={{
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-lg)',
                  border: localConfig.id === id ? '2px solid var(--color-primary)' : '1px solid var(--glass-border)',
                  background: localConfig.id === id ? 'rgba(8, 145, 178, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <h4 style={{ marginBottom: 'var(--space-2)' }}>{preset.name}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  {preset.description}
                </p>
                <div style={{ marginTop: 'var(--space-3)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {preset.maxSwimmersPerClubPerEvent === null 
                    ? t('settings.presets.noLimit') 
                    : t('settings.presets.limitPerClub', { n: preset.maxSwimmersPerClubPerEvent })
                  }
                  {' • '}
                  {t('settings.presets.categoriesCount', { n: preset.categories.length })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Points Tab */}
      {activeTab === 'points' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>{t('settings.points.title')}</h3>
          
          <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
            {/* Individual Points */}
            <div>
              <label>{t('settings.points.individual')}</label>
              <input
                type="text"
                value={localConfig.individualPoints.join(', ')}
                onChange={(e) => {
                  const points = e.target.value.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
                  updateConfig({ individualPoints: points });
                }}
                placeholder="19, 16, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1"
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                {t('settings.points.commaSeparated')}
              </p>
            </div>
            
            {/* Relay Points */}
            <div>
              <label>{t('settings.points.relay')}</label>
              <input
                type="text"
                value={localConfig.relayPoints.join(', ')}
                onChange={(e) => {
                  const points = e.target.value.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
                  updateConfig({ relayPoints: points });
                }}
                placeholder="38, 32, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2"
              />
            </div>
            
            {/* Club Limit */}
            <div>
              <label>{t('settings.points.clubLimit')}</label>
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={localConfig.maxSwimmersPerClubPerEvent || ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value) : null;
                    updateConfig({ maxSwimmersPerClubPerEvent: val });
                  }}
                  placeholder={t('settings.points.noLimitPlaceholder')}
                  style={{ width: '120px' }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={localConfig.redistributeExcessPoints}
                    onChange={(e) => updateConfig({ redistributeExcessPoints: e.target.checked })}
                    style={{ width: 'auto' }}
                  />
                  {t('settings.points.redistribute')}
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('settings.categories.title')}</h3>
            <button className="btn btn-secondary" onClick={addCategory}>
              <Plus size={16} />
              {t('settings.categories.add')}
            </button>
          </div>
          
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
            {t('settings.categories.description')}
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {localConfig.categories.map((category, index) => {
              const scoringRule = localConfig.categoryScoring.find(r => r.categoryId === category.id);
              const canScoreIn = scoringRule?.canScoreIn || [category.id];
              
              return (
                <div 
                  key={category.id}
                  style={{ 
                    padding: 'var(--space-4)', 
                    background: 'var(--color-bg-tertiary)', 
                    borderRadius: 'var(--radius-md)' 
                  }}
                >
                  <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1', minWidth: '150px' }}>
                      <label>{t('settings.categories.name')}</label>
                      <input
                        type="text"
                        value={category.displayName}
                        onChange={(e) => updateCategory(index, { displayName: e.target.value, name: e.target.value.toLowerCase() })}
                      />
                    </div>
                    
                    <div style={{ width: '100px' }}>
                      <label>{t('settings.categories.minAge')}</label>
                      <input
                        type="number"
                        value={category.minAge || ''}
                        onChange={(e) => updateCategory(index, { minAge: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder={t('settings.categories.none')}
                      />
                    </div>
                    
                    <div style={{ width: '100px' }}>
                      <label>{t('settings.categories.maxAge')}</label>
                      <input
                        type="number"
                        value={category.maxAge || ''}
                        onChange={(e) => updateCategory(index, { maxAge: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder={t('settings.categories.none')}
                      />
                    </div>
                    
                    <div style={{ flex: '2', minWidth: '200px' }}>
                      <label>{t('settings.categories.canScoreIn')}</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                        {localConfig.categories.map(targetCat => (
                          <label 
                            key={targetCat.id} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 'var(--space-1)', 
                              fontSize: '0.875rem',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              background: canScoreIn.includes(targetCat.id) ? 'rgba(8, 145, 178, 0.2)' : 'transparent'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={canScoreIn.includes(targetCat.id)}
                              onChange={(e) => {
                                const newCanScore = e.target.checked
                                  ? [...canScoreIn, targetCat.id]
                                  : canScoreIn.filter(id => id !== targetCat.id);
                                updateCategoryScoringRule(category.id, newCanScore);
                              }}
                              style={{ width: 'auto' }}
                            />
                            {targetCat.displayName}
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => removeCategory(index)}
                      style={{ alignSelf: 'flex-end', padding: 'var(--space-2)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Bonus Points Tab */}
      {activeTab === 'bonus' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>{t('settings.bonus.title')}</h3>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={localConfig.bonusPoints.enabled}
              onChange={(e) => updateConfig({ 
                bonusPoints: { ...localConfig.bonusPoints, enabled: e.target.checked } 
              })}
              style={{ width: 'auto' }}
            />
            {t('settings.bonus.enable')}
          </label>
          
          {localConfig.bonusPoints.enabled && (
            <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              <div>
                <label>{t('settings.bonus.regionalBest')}</label>
                <input
                  type="number"
                  value={localConfig.bonusPoints.regionalBest}
                  onChange={(e) => updateConfig({ 
                    bonusPoints: { ...localConfig.bonusPoints, regionalBest: parseInt(e.target.value) || 0 } 
                  })}
                />
              </div>
              
              <div>
                <label>{t('settings.bonus.championshipRecord')}</label>
                <input
                  type="number"
                  value={localConfig.bonusPoints.championshipRecord}
                  onChange={(e) => updateConfig({ 
                    bonusPoints: { ...localConfig.bonusPoints, championshipRecord: parseInt(e.target.value) || 0 } 
                  })}
                />
              </div>
              
              <div>
                <label>{t('settings.bonus.absoluteRegional')}</label>
                <input
                  type="number"
                  value={localConfig.bonusPoints.absoluteRegional}
                  onChange={(e) => updateConfig({ 
                    bonusPoints: { ...localConfig.bonusPoints, absoluteRegional: parseInt(e.target.value) || 0 } 
                  })}
                />
              </div>
              
              <div>
                <label>{t('settings.bonus.nationalBest')}</label>
                <input
                  type="number"
                  value={localConfig.bonusPoints.nationalBest}
                  onChange={(e) => updateConfig({ 
                    bonusPoints: { ...localConfig.bonusPoints, nationalBest: parseInt(e.target.value) || 0 } 
                  })}
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Current Config Summary */}
      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>{t('settings.summary.title')}</h3>
        <div style={{ 
          display: 'grid', 
          gap: 'var(--space-3)', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          fontSize: '0.875rem'
        }}>
          <div>
            <strong>{t('settings.summary.configName')}</strong>
            <p style={{ color: 'var(--color-text-secondary)' }}>{localConfig.name}</p>
          </div>
          <div>
            <strong>{t('settings.summary.individualPoints')}</strong>
            <p style={{ color: 'var(--color-text-secondary)' }}>{localConfig.individualPoints.slice(0, 3).join(', ')}...</p>
          </div>
          <div>
            <strong>{t('settings.summary.clubLimit')}</strong>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              {localConfig.maxSwimmersPerClubPerEvent === null ? t('settings.points.noLimitPlaceholder') : t('settings.summary.perEvent') + `: ${localConfig.maxSwimmersPerClubPerEvent}`}
            </p>
          </div>
          <div>
            <strong>{t('settings.summary.categories')}</strong>
            <p style={{ color: 'var(--color-text-secondary)' }}>{t('settings.summary.defined', { n: localConfig.categories.length })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
