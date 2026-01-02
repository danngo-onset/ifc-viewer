import { useState, useEffect, useRef } from "react";

import type * as OBCF from "@thatopen/components-front";

import { ChevronUpIcon, RulerHorizontalIcon, RulerSquareIcon } from "@radix-ui/react-icons";

import { useBimComponent } from "@/hooks/BIM";

import type { CameraDistanceLocker } from "@/lib/utils/BIM";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

import { WithTooltip } from "./WithTooltip";

import { IconCamera, IconPaintRoller } from "./icons";

import { AreaMeasurer, LengthMeasurer, Highlighter } from "../BIM";

export const BottomToolbar = () => {
  const [areaMeasurerEnabled, setAreaMeasurerEnabled] = useState(false);
  const [showAreaMeasurer, setShowAreaMeasurer] = useState(false);

  const [lengthMeasurerEnabled, setLengthMeasurerEnabled] = useState(false);
  const [showLengthMeasurer, setShowLengthMeasurer] = useState(false);

  const [cameraDistanceLockEnabled, setCameraDistanceEnabled] = useState(false);

  const [highlighterEnabled, setHighlighterEnabled] = useState(false);
  const [showHighlighter, setShowHighlighter] = useState(false);
  
  const areaContainerRef = useRef<HTMLDivElement>(null);
  const lengthContainerRef = useRef<HTMLDivElement>(null);
  const highlighterContainerRef = useRef<HTMLDivElement>(null);

  const measurer = useBimComponent<OBCF.AreaMeasurement>(BimComponent.AreaMeasurer);
  const lengthMeasurer = useBimComponent<OBCF.LengthMeasurement>(BimComponent.LengthMeasurer);
  const cameraDistanceLocker = useBimComponent<CameraDistanceLocker>(BimComponent.CameraDistanceLocker);
  const highlighter = useBimComponent<OBCF.Highlighter>(BimComponent.Highlighter);

  useEffect(() => {
    if (measurer) {
      setAreaMeasurerEnabled(measurer.enabled);
    }
  }, [measurer]);

  useEffect(() => {
    if (lengthMeasurer) {
      setLengthMeasurerEnabled(lengthMeasurer.enabled);
    }
  }, [lengthMeasurer]);

  useEffect(() => {
    if (cameraDistanceLocker) {
      setCameraDistanceEnabled(cameraDistanceLocker.enabled);
    }
  }, [cameraDistanceLocker]);

  useEffect(() => {
    if (highlighter) {
      setHighlighterEnabled(highlighter.enabled);
    }
  }, [highlighter]);

  // Handle click outside to close options
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (showAreaMeasurer && areaContainerRef.current && !areaContainerRef.current.contains(target)) {
        setShowAreaMeasurer(false);
      }
      
      if (showLengthMeasurer && lengthContainerRef.current && !lengthContainerRef.current.contains(target)) {
        setShowLengthMeasurer(false);
      }

      if (showHighlighter && highlighterContainerRef.current && !highlighterContainerRef.current.contains(target)) {
        setShowHighlighter(false);
      }
    };

    const abortController = new AbortController();

    document.addEventListener("mousedown", handleClickOutside, { signal: abortController.signal });

    return () => {
      abortController.abort();
    };
  }, [showAreaMeasurer, showLengthMeasurer, showHighlighter]);

  const handleAreaMeasurerEnabled = () => {
    if (!measurer) return;

    measurer.enabled = !areaMeasurerEnabled;
    setAreaMeasurerEnabled(measurer.enabled);
  };

  const handleLengthMeasurerEnabled = () => {
    if (!lengthMeasurer) return;

    lengthMeasurer.enabled = !lengthMeasurerEnabled;
    setLengthMeasurerEnabled(lengthMeasurer.enabled);
  };

  const handleCameraDistanceLockEnabled = () => {
    if (!cameraDistanceLocker) return;
    
    const newEnabled = !cameraDistanceLockEnabled;
    setCameraDistanceEnabled(newEnabled);
    cameraDistanceLocker.setEnabled(newEnabled);
  };

  const handleHighlighterEnabled = () => {
    if (!highlighter) return;

    highlighter.enabled = !highlighterEnabled;
    setHighlighterEnabled(highlighter.enabled);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
      <div className="bg-white border border-gray-300 rounded-md shadow-xl p-1 flex items-end gap-2">
        <div ref={areaContainerRef} className="relative flex flex-col items-center">
          {showAreaMeasurer && <AreaMeasurer />}

          <ChevronUpIcon 
            onClick={() => setShowAreaMeasurer(!showAreaMeasurer)}
            className={`bottom-toolbar-chevron-up ${showAreaMeasurer ? 'rotate-180' : ''}`}
          />

          <WithTooltip message="Area Measurer">
            <button
              onClick={handleAreaMeasurerEnabled}
              className={`button-toolbar-button 
                ${areaMeasurerEnabled ? "button-toolbar-button-active" 
                                      : "button-toolbar-button-inactive"}
              `}
            >
              <RulerSquareIcon className={`w-4 h-4 ${areaMeasurerEnabled ? "text-gray-100" : ""}`} />
            </button>
          </WithTooltip>
        </div>

        <div ref={lengthContainerRef} className="relative flex flex-col items-center">
          {showLengthMeasurer && <LengthMeasurer />}

          <ChevronUpIcon 
            onClick={() => setShowLengthMeasurer(!showLengthMeasurer)}
            className={`bottom-toolbar-chevron-up ${showLengthMeasurer ? 'rotate-180' : ''}`}
          />

          <WithTooltip message="Length Measurer">
            <button
              onClick={handleLengthMeasurerEnabled}
              className={`button-toolbar-button 
                ${lengthMeasurerEnabled ? "button-toolbar-button-active" 
                                        : "button-toolbar-button-inactive"}
              `}
            >
              <RulerHorizontalIcon className={`w-4 h-4 ${lengthMeasurerEnabled ? "text-gray-100" : ""}`} />
            </button>
          </WithTooltip>
        </div>

        <WithTooltip message="Lock Camera Distance">
          <button
            onClick={handleCameraDistanceLockEnabled}
            className={`button-toolbar-button 
              ${cameraDistanceLockEnabled ? "button-toolbar-button-active" 
                                          : "button-toolbar-button-inactive"}
            `}
          >
            <IconCamera classes={`w-4 h-4 ${cameraDistanceLockEnabled ? "text-gray-100" : ""}`} />
          </button>
        </WithTooltip>

        <div ref={highlighterContainerRef} className="relative flex flex-col items-center">
          {showHighlighter && <Highlighter />}

          <ChevronUpIcon 
            onClick={() => setShowHighlighter(!showHighlighter)}
            className={`bottom-toolbar-chevron-up ${showHighlighter ? 'rotate-180' : ''}`}
          />

          <WithTooltip message="Highlighter">
            <button 
              onClick={handleHighlighterEnabled} 
              className={`button-toolbar-button 
                ${highlighterEnabled ? "button-toolbar-button-active" 
                                     : "button-toolbar-button-inactive"}
              `}
            >
              <IconPaintRoller classes={`w-4 h-4 ${highlighterEnabled ? "text-gray-100" : ""}`} />
            </button>
          </WithTooltip>
        </div>
      </div>
    </div>
  );
};
