import { useMemo, useState } from 'react';
import { questions } from '../data/questions';
import type { BriefAnswer } from '../types';
import { buildBrief } from '../utils/buildBrief';
import { Icon } from './Icon';

type ResultScreenProps = {
  initialDescription: string;
  answers: BriefAnswer[];
  onRestart: () => void;
};

const TELEGRAM_SHARE_TEXT = 'Готовое ТЗ из Clario. Текст скопирован — вставьте его в чат.';

export function ResultScreen({ initialDescription, answers, onRestart }: ResultScreenProps) {
  const [feedback, setFeedback] = useState('');
  const brief = useMemo(
    () => buildBrief({ initialDescription, answers, questions }),
    [answers, initialDescription],
  );

  const handleDownload = () => {
    const blob = new Blob([brief.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clario-brief.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenTelegram = async () => {
    try {
      await navigator.clipboard.writeText(brief.text);
      setFeedback('ТЗ скопировано — вставьте его в Telegram.');
    } catch {
      setFeedback('Не удалось скопировать автоматически. Скопируйте ТЗ вручную.');
    }

    window.open(
      `https://t.me/share/url?text=${encodeURIComponent(TELEGRAM_SHARE_TEXT)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <main className="screen result-screen">
      <section className="result-summary">
        <p className="block-label">Готовое ТЗ</p>
        <h1>{brief.completion}% готовности</h1>
        <p>{brief.status}</p>
        <div className="status-meter">
          <div style={{ width: `${brief.completion}%` }} />
        </div>
      </section>

      <section className="brief-output" aria-label="Итоговое техническое задание">
        <pre>{brief.text}</pre>
      </section>

      <section className="result-export" aria-label="Экспорт ТЗ">
        <p>ТЗ скачается в .txt — его можно открыть и поправить вручную.</p>
        <div className="result-export__actions">
          <button className="primary-button" type="button" onClick={handleDownload}>
            <Icon name="download" />
            Скачать
          </button>

          <button className="ghost-button telegram-button" type="button" onClick={handleOpenTelegram} aria-label="Открыть Telegram">
            <Icon name="telegram" />
            В Telegram
          </button>

          <button className="ghost-button ghost-button--quiet" type="button" onClick={onRestart}>
            <Icon name="restart" />
            Начать заново
          </button>
        </div>
        {feedback && <p className="send-hint">{feedback}</p>}
      </section>
    </main>
  );
}
