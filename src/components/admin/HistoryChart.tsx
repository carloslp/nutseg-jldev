'use client';

import React, { useState } from 'react';
import { BiometricLog } from '@/lib/types/clinical';

interface HistoryChartProps {
  logs: BiometricLog[];
  heightCm: number;
}

export function HistoryChart({ logs, heightCm }: HistoryChartProps) {
  const [activeMetric, setActiveMetric] = useState<'weight' | 'fat' | 'waist' | 'muscle'>('weight');

  if (logs.length === 0) {
    return (
      <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 text-center text-xs text-on-surface-variant">
        No hay registros antropométricos previos para graficar.
      </div>
    );
  }

  // Sort chronologically
  const sorted = [...logs].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

  // Extract values based on metric
  const points = sorted.map((log) => {
    let value = 0;
    if (activeMetric === 'weight') value = log.weightKg;
    else if (activeMetric === 'fat') value = log.bodyFatPct || 0;
    else if (activeMetric === 'waist') value = log.waistCm || 0;
    else if (activeMetric === 'muscle') value = log.muscleMassKg || 0;

    const bmi = Math.round((log.weightKg / ((heightCm / 100) * (heightCm / 100))) * 10) / 10;

    return {
      date: log.recordedAt,
      value,
      bmi,
      weight: log.weightKg,
      fat: log.bodyFatPct,
      waist: log.waistCm,
      muscle: log.muscleMassKg,
    };
  });

  const validValues = points.map((p) => p.value).filter((v) => v > 0);
  const minVal = validValues.length > 0 ? Math.min(...validValues) : 0;
  const maxVal = validValues.length > 0 ? Math.max(...validValues) : 100;

  // Add 10% padding on y-axis
  const range = maxVal - minVal || 1;
  const yMin = Math.floor(minVal - range * 0.1);
  const yMax = Math.ceil(maxVal + range * 0.1);

  // SVG coordinates
  const svgWidth = 700;
  const svgHeight = 220;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 20;
  const padBottom = 35;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  const getX = (index: number) => {
    if (points.length === 1) return padLeft + chartWidth / 2;
    return padLeft + (index / (points.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    if (yMax === yMin) return padTop + chartHeight / 2;
    const norm = (val - yMin) / (yMax - yMin);
    return padTop + chartHeight - norm * chartHeight;
  };

  const pathD = points
    .map((p, i) => {
      const x = getX(i);
      const y = getY(p.value);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const areaD = `${pathD} L ${getX(points.length - 1)} ${padTop + chartHeight} L ${getX(0)} ${padTop + chartHeight} Z`;

  const metricColors = {
    weight: { stroke: '#00685f', fill: 'rgba(0, 104, 95, 0.1)', unit: 'kg', label: 'Peso Corporal' },
    fat: { stroke: '#4b41e1', fill: 'rgba(75, 65, 225, 0.1)', unit: '%', label: '% Grasa Corporal' },
    waist: { stroke: '#d97706', fill: 'rgba(217, 119, 6, 0.1)', unit: 'cm', label: 'Perímetro Cintura' },
    muscle: { stroke: '#2563eb', fill: 'rgba(37, 99, 235, 0.1)', unit: 'kg', label: 'Masa Muscular' },
  };

  const currentConfig = metricColors[activeMetric];

  // Overall progress
  const first = points[0];
  const last = points[points.length - 1];
  const totalDelta = Math.round((last.value - first.value) * 10) / 10;

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-semibold text-base text-on-surface">Curva Histórica de Evolución</h3>
          <p className="text-xs text-on-surface-variant">Trazabilidad biométrica longitudinal por consulta</p>
        </div>

        {/* Metric Selector Pills */}
        <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl">
          <button
            onClick={() => setActiveMetric('weight')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeMetric === 'weight'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Peso (kg)
          </button>
          <button
            onClick={() => setActiveMetric('fat')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeMetric === 'fat'
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            % Grasa
          </button>
          <button
            onClick={() => setActiveMetric('waist')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeMetric === 'waist'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Cintura (cm)
          </button>
          <button
            onClick={() => setActiveMetric('muscle')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeMetric === 'muscle'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Masa Magra
          </button>
        </div>
      </div>

      {/* Metric Delta Badge */}
      <div className="flex items-center justify-between text-xs px-2">
        <span className="text-on-surface-variant">
          Total acumulado en seguimiento:{' '}
          <strong className="text-on-surface font-semibold">
            {first.date} &rarr; {last.date}
          </strong>
        </span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1 ${
            totalDelta <= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}
        >
          <span>{totalDelta <= 0 ? 'Progreso: ↓' : 'Incremento: ↑'}</span>
          <span>{totalDelta > 0 ? `+${totalDelta}` : totalDelta} {currentConfig.unit}</span>
        </span>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-48 min-w-[550px] overflow-visible"
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac, idx) => {
            const y = padTop + chartHeight * frac;
            const val = Math.round(yMax - frac * (yMax - yMin));
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Fill Area under curve */}
          <path d={areaD} fill={currentConfig.fill} />

          {/* Main Curve Line */}
          <path
            d={pathD}
            fill="none"
            stroke={currentConfig.stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, i) => {
            const cx = getX(i);
            const cy = getY(p.value);
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r="5" fill="#ffffff" stroke={currentConfig.stroke} strokeWidth="2.5" />
                <text
                  x={cx}
                  y={cy - 10}
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {p.value}
                </text>
                <text
                  x={cx}
                  y={padTop + chartHeight + 18}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="sans-serif"
                >
                  {p.date.slice(5)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
