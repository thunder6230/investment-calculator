import { useState } from 'react';
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
  headerRight?: ReactNode;
}

export default function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  prefix,
  suffix,
  step = 1,
  hint,
  headerRight,
}: Props) {
  const [localValue, setLocalValue] = useState<string | null>(null);

  // When focused and typing, show localValue. Otherwise, show external value cleanly formatted.
  const displayValue = localValue !== null ? localValue : (value === 0 ? '0' : String(Number(value.toFixed(2))));

  const handleFocus = () => {
    setLocalValue(value === 0 ? '0' : String(Number(value.toFixed(2))));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalValue(raw);

    if (raw === '' || raw === '-') {
      onChange(min);
      return;
    }

    const num = Number(raw);
    if (!isNaN(num)) {
      onChange(Math.max(min, num));
    }
  };

  const handleBlur = () => {
    if (localValue !== null) {
      if (localValue === '' || isNaN(Number(localValue))) {
        onChange(min);
      } else {
        const num = Math.max(min, Number(localValue));
        onChange(num);
      }
      setLocalValue(null);
    }
  };

  return (
    <div className="number-input-group">
      <div className="input-header">
        <label className="input-label">{label}</label>
        {headerRight ? headerRight : (hint && <div className="input-hint">{hint}</div>)}
      </div>
      <div className="input-wrapper">
        {prefix && <span className="input-adornment">{prefix}</span>}
        <input
          type="number"
          min={min}
          step={step}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="number-input"
        />
        {suffix && <span className="input-adornment input-suffix">{suffix}</span>}
      </div>
      {headerRight && hint && (
        <div className="input-hint" style={{ marginTop: '0.3rem', textAlign: 'right' }}>
          {hint}
        </div>
      )}
    </div>
  );
}
