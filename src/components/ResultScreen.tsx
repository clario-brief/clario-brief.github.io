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
    setFeedback('Файл скачан — можно открыть и поправить вручную');
  };

  const handleCopyBrief = async () => {
    try {
      await navigator.clipboard.writeText(brief.text);
      setFeedback('ТЗ скопировано');
    } catch {
      setFeedback('Не удалось скопировать автоматически. Скопируйте ТЗ вручную.');
    }
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

      <section className="result-export" aria-label="Действия с готовым ТЗ">
        <div className="result-export__copy">
          <h2>Заберите готовое ТЗ удобным способом.</h2>
          <p>Скопируйте текст сразу или скачайте .txt, если хотите вручную его поправить.</p>
        </div>
        <div className="result-export__actions">
          <button className="primary-button" type="button" onClick={handleCopyBrief}>
            <Icon name="copy" />
            Скопировать ТЗ
          </button>

          <button className="ghost-button" type="button" onClick={handleDownload}>
            <Icon name="download" />
            Скачать .txt
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
