import { useMemo, useState } from 'react';
import { questions } from '../data/questions';
import type { BriefAnswer } from '../types';
import { buildBrief } from '../utils/buildBrief';
import { trackEvent } from '../utils/analytics';
import { Icon } from './Icon';

type ResultScreenProps = {
  initialDescription: string;
  answers: BriefAnswer[];
  onRestart: () => void;
};

const buildExecutorMessage = (briefText: string) =>
  [
    'Привет! Я собрала задачу через Clario, чтобы было проще сориентироваться.',
    '',
    'Вот бриф:',
    '',
    briefText,
    '',
    'Если нужно, можно уточнить детали по пунктам, где стоит “не знаю” или “пропущено”.',
  ].join('\n');

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
    trackEvent('brief_downloaded', { completion: brief.completion });
    setFeedback('Файл скачан. Можно открыть его и вручную поправить формулировки.');
  };

  const handleCopyBrief = async () => {
    try {
      await navigator.clipboard.writeText(buildExecutorMessage(brief.text));
      trackEvent('brief_copied', { completion: brief.completion });
      setFeedback('Готово. Теперь можно вставить ТЗ в чат, письмо или задачу.');
    } catch {
      setFeedback('Не удалось скопировать автоматически. Скопируйте текст вручную.');
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
          <h2>Передайте ТЗ исполнителю</h2>
          <p>Скопируйте готовое сообщение и вставьте его в чат, письмо, Notion или задачу.</p>
          <p>Скачайте .txt, если хотите открыть файл и вручную поправить формулировки.</p>
        </div>
        <div className="result-export__actions">
          <button className="primary-button" type="button" onClick={handleCopyBrief}>
            <Icon name="copy" />
            Скопировать ТЗ для исполнителя
          </button>

          <button className="ghost-button" type="button" onClick={handleDownload}>
            <Icon name="download" />
            Скачать .txt
          </button>

          <button className="ghost-button ghost-button--quiet" type="button" onClick={onRestart}>
            <Icon name="restart" />
            Начать новый бриф
          </button>
        </div>
        {feedback && <p className="send-hint">{feedback}</p>}
      </section>
    </main>
  );
}
