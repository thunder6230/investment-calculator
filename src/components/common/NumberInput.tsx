import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  prefix?: string;
  suffix?: string;
  step?: number;
  hint?: ReactNode;
}

export default function NumberInput({ label, value, onChange, min = 0, prefix, suffix, step = 1, hint }: Props) {
  return (
    <div className="number-input-group">
      <div className="input-header">
        <label className="input-label">{label}</label>
        {hint && <div className="input-hint">{hint}</div>}
      </div>
      <div className="input-wrapper">
        {prefix && <span className="input-adornment">{prefix}</span>}
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
          className="number-input"
        />
        {suffix && <span className="input-adornment input-suffix">{suffix}</span>}
      </div>
    </div>
  );
}
