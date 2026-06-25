type ProgressBarProps = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = Math.round((current / total) * 100);

  return (
    <div className="progress" aria-label={`Прогресс ${progress}%`}>
      <div className="progress__top">
        <span className="progress__brand">Clario</span>
        <span className="progress__meta">
          <span>Вопрос {current} из {total}</span>
          <span>{progress}%</span>
        </span>
      </div>
      <div className="progress__track">
        <div className="progress__fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
