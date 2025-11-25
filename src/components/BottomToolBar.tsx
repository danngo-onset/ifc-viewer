"use client";

import { useState, useEffect } from "react";
import type * as OBF from "@thatopen/components-front";
import { ChevronUpIcon } from "@radix-ui/react-icons";
import Constants from "@/domain/Constants";
import useBimComponent from "@/hooks/useBimComponent";

export default function BottomToolBar() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const measurer = useBimComponent<OBF.AreaMeasurement>(Constants.AreaMeasurementKey);

  // Update state when measurer becomes available
  useEffect(() => {
    if (measurer) {
      setEnabled(measurer.enabled);
      setVisible(measurer.visible);
    }
  }, [measurer]);

  const handleToggleEnabled = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    if (measurer) measurer.enabled = newEnabled;
  };

  return (
    <>
      {/* Options Panel */}
      {showOptions && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 space-y-3 z-50 min-w-[250px]">
          <h3 className="font-semibold text-sm mb-2">Area Measurement Options</h3>
          
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="area-measurement-enabled">Enabled</label>
            <input 
              type="checkbox" 
              id="area-measurement-enabled" 
              checked={enabled}
              onChange={(e) => {
                const checked = e.target.checked;
                setEnabled(checked);
                if (measurer) measurer.enabled = checked;
              }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label htmlFor="area-measurement-visible">Measurement Visible</label>
            <input 
              type="checkbox" 
              id="area-measurement-visible" 
              checked={visible} 
              onChange={(e) => {
                const checked = e.target.checked;
                setVisible(checked);
                if (measurer) measurer.visible = checked;
              }} 
            />
          </div>

          <button 
            className="button-gray"
            onClick={() => {
              measurer?.list.clear();
            }}
          >
            Delete all
          </button>
        </div>
      )}

      {/* Bottom Toolbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="bg-white border border-gray-300 rounded-lg shadow-xl p-2">
          {/* Tool Item */}
          <div className="relative flex flex-col items-center">
            {/* Chevron Up Button */}
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="mb-1 p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Toggle options"
            >
              <ChevronUpIcon 
                className={`w-4 h-4 transition-transform ${showOptions ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Main Tool Icon */}
            <button
              onClick={handleToggleEnabled}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className={`relative p-3 rounded-lg transition-all ${
                enabled 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label="Area Measurer"
            >
              {/* Area Measurer SVG Icon */}
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
                <path d="M14 14l3 3"/>
                <path d="M14 17l3-3"/>
              </svg>

              {/* Tooltip */}
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded whitespace-nowrap pointer-events-none">
                  Area Measurer
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
