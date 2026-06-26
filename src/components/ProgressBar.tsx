import type { BriefAnswer, Question } from '../types';

type ProgressSegmentStatus = 'current' | 'answered' | 'skipped' | 'empty' | 'future';

type ProgressBarProps = {
  answers: BriefAnswer[];
  currentIndex: number;
  questions: Question[];
  skippedQuestionIds: string[];
  total: number;
  visitedQuestionIndexes: number[];
  onNavigate: (questionIndex: number) => void;
};

const getAnswerText = (answer?: BriefAnswer) => {
  if (!answer) {
    return '';
  }

  return Array.isArray(answer.value) ? answer.value.join(', ') : answer.value;
};

const getSegmentStatus = (
  question: Question,
  index: number,
  currentIndex: number,
  answer?: BriefAnswer,
  skippedQuestionIds: string[] = [],
  visitedQuestionIndexes: number[] = [],
): ProgressSegmentStatus => {
  if (index === currentIndex) {
    return 'current';
  }

  if (answer) {
    return 'answered';
  }

  if (skippedQuestionIds.includes(question.id)) {
    return 'skipped';
  }

  if (visitedQuestionIndexes.includes(index)) {
    return 'empty';
  }

  return 'future';
};

const getStatusText = (status: ProgressSegmentStatus, answerText: string) => {
  if (answerText) {
    return `Ответ: ${answerText}`;
  }

  if (status === 'future') {
    return 'Можно перейти к этому вопросу';
  }

  if (status === 'skipped') {
    return 'Пропущено';
  }

  return 'Пока без ответа';
};

export function ProgressBar({
  answers,
  currentIndex,
  questions,
  skippedQuestionIds,
  total,
  visitedQuestionIndexes,
  onNavigate,
}: ProgressBarProps) {
  const current = currentIndex + 1;
  const progress = Math.round((current / total) * 100);

  return (
    <nav className="progress" aria-label={`Прогресс ${progress}%`}>
      <div className="progress__top">
        <span className="progress__brand">Clario</span>
        <span className="progress__meta">
          <span>Вопрос {current} из {total}</span>
          <span>{progress}%</span>
        </span>
      </div>

      <div className="progress__segments" aria-label="Навигация по вопросам">
        {questions.map((question, index) => {
          const answer = answers.find((item) => item.questionId === question.id);
          const answerText = getAnswerText(answer);
          const status = getSegmentStatus(
            question,
            index,
            currentIndex,
            answer,
            skippedQuestionIds,
            visitedQuestionIndexes,
          );
          const statusText = getStatusText(status, answerText);
          const tooltipAnswer = statusText.length > 110 ? `${statusText.slice(0, 107)}...` : statusText;
          const tooltipAlign =
            index <= 1
              ? 'progress__segment--tooltip-start'
              : index >= questions.length - 2
                ? 'progress__segment--tooltip-end'
                : '';
          const segmentClassName = [
            'progress__segment',
            `progress__segment--${status}`,
            tooltipAlign,
          ].join(' ');

          return (
            <button
              aria-current={index === currentIndex ? 'step' : undefined}
              aria-label={`Перейти к вопросу ${index + 1}: ${question.title}`}
              className={segmentClassName}
              key={question.id}
              type="button"
              onClick={() => onNavigate(index)}
            >
              <span className="progress__segment-mark" />
              <span className="progress__tooltip" role="tooltip">
                <span className="progress__tooltip-kicker">
                  Вопрос {index + 1} · {question.block}
                </span>
                <span className="progress__tooltip-title">{question.title}</span>
                <span className="progress__tooltip-status">{tooltipAnswer}</span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
