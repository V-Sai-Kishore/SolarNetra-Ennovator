import React from 'react';
import { useApp } from '@/context/AppContext';
import { strings } from '@/lib/strings';

const SettingsPage = () => {
  const { settings, updateSettings } = useApp();

  return (
    <div id="settings-panel" className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Configure analysis thresholds and options</p>
      </div>

      <div className="card-elevated p-6 space-y-6">
        <h2 className="font-semibold border-b border-border pb-2">Thresholds</h2>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="has_solar_threshold" className="block text-sm font-medium mb-1">Solar Detection Threshold</label>
            <input
              id="has_solar_threshold"
              type="number"
              min="0" max="1" step="0.05"
              value={settings.has_solar_threshold}
              onChange={(e) => updateSettings({ has_solar_threshold: parseFloat(e.target.value) })}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="plg_threshold" className="block text-sm font-medium mb-1">PLG Threshold</label>
            <input
              id="plg_threshold"
              type="number"
              min="0" max="1" step="0.05"
              value={settings.plg_threshold}
              onChange={(e) => updateSettings({ plg_threshold: parseFloat(e.target.value) })}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="shadow_threshold" className="block text-sm font-medium mb-1">Shadow Threshold</label>
            <input
              id="shadow_threshold"
              type="number"
              min="0" max="1" step="0.05"
              value={settings.shadow_threshold}
              onChange={(e) => updateSettings({ shadow_threshold: parseFloat(e.target.value) })}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="freshness_threshold" className="block text-sm font-medium mb-1">Freshness Threshold</label>
            <input
              id="freshness_threshold"
              type="number"
              min="0" max="1" step="0.05"
              value={settings.freshness_threshold}
              onChange={(e) => updateSettings({ freshness_threshold: parseFloat(e.target.value) })}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="lookalike_threshold" className="block text-sm font-medium mb-1">Lookalike Threshold</label>
            <input
              id="lookalike_threshold"
              type="number"
              min="0" max="1" step="0.05"
              value={settings.lookalike_threshold}
              onChange={(e) => updateSettings({ lookalike_threshold: parseFloat(e.target.value) })}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="buffer_meters" className="block text-sm font-medium mb-1">Buffer Radius (m)</label>
            <select
              id="buffer_meters"
              value={settings.buffer_meters}
              onChange={(e) => updateSettings({ buffer_meters: parseInt(e.target.value) })}
              className="input-field"
            >
              <option value="50">50m</option>
              <option value="100">100m</option>
              <option value="200">200m</option>
              <option value="500">500m</option>
            </select>
          </div>
        </div>

        <h2 className="font-semibold border-b border-border pb-2 pt-4">Panel Assumptions</h2>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="wp_per_m2" className="block text-sm font-medium mb-1">Watts per m²</label>
            <select
              id="wp_per_m2"
              value={settings.wp_per_m2}
              onChange={(e) => updateSettings({ wp_per_m2: parseInt(e.target.value) })}
              className="input-field"
            >
              <option value="150">150 W/m²</option>
              <option value="175">175 W/m²</option>
              <option value="200">200 W/m²</option>
              <option value="220">220 W/m²</option>
            </select>
          </div>
          <div>
            <label htmlFor="panel_standard_m2" className="block text-sm font-medium mb-1">Standard Panel Size (m²)</label>
            <input
              id="panel_standard_m2"
              type="number"
              min="1" max="3" step="0.1"
              value={settings.panel_standard_m2}
              onChange={(e) => updateSettings({ panel_standard_m2: parseFloat(e.target.value) })}
              className="input-field"
            />
          </div>
        </div>

        <div className="pt-4">
          <label className="flex items-center gap-3 cursor-pointer" id="toggle-save-artifacts">
            <input
              type="checkbox"
              checked={settings.save_artifacts}
              onChange={(e) => updateSettings({ save_artifacts: e.target.checked })}
              className="w-4 h-4 rounded border-border focus-ring"
            />
            <span className="text-sm font-medium">Save artifacts in results</span>
          </label>
        </div>
      </div>

      <div className="card-elevated p-6">
        <h2 className="font-semibold mb-3">Help & Documentation</h2>
        <p className="text-sm text-muted-foreground mb-4">{strings.help.overview}</p>
        <p className="text-sm text-muted-foreground mb-4">{strings.help.stubsExplanation}</p>
        <p className="text-sm text-warning">{strings.help.disclaimer}</p>
      </div>
    </div>
  );
};

export default SettingsPage;
