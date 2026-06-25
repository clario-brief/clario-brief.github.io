import { useState } from 'react';
import { Icon } from './Icon';

type SharedBriefScreenProps = {
  briefText: string;
  hasError: boolean;
  onCreateBrief: () => void;
};

export function SharedBriefScreen({ briefText, hasError, onCreateBrief }: SharedBriefScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!briefText) {
      return;
    }

    await navigator.clipboard.writeText(briefText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    if (!briefText) {
      return;
    }

    const blob = new Blob([briefText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clario-shared-brief.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="screen result-screen">
      <section className="result-summary">
        <p className="block-label">Clario</p>
        <h1>ТЗ из Clario</h1>
        <p>
          {hasError
            ? 'Не удалось открыть ТЗ. Возможно, ссылка повреждена.'
            : 'Текстовый документ, которым с вами поделились.'}
        </p>
      </section>

      {!hasError && (
        <section className="brief-output" aria-label="Текстовый документ">
          <pre>{briefText}</pre>
        </section>
      )}

      <div className="result-actions">
        <button className="primary-button" type="button" onClick={handleCopy} disabled={hasError}>
          <Icon name="copy" />
          {copied ? 'Скопировано' : 'Скопировать текст'}
        </button>
        <button className="ghost-button" type="button" onClick={handleDownload} disabled={hasError}>
          <Icon name="download" />
          Скачать
        </button>
        <button className="ghost-button" type="button" onClick={onCreateBrief}>
          <Icon name="restart" />
          Создать свой бриф
        </button>
      </div>
    </main>
  );
}
