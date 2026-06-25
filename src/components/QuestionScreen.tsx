import { useMemo, useState } from 'react';
import type { AnswerKind, BriefAnswer, Question, QuestionOption } from '../types';
import { Icon } from './Icon';
import { OptionButton } from './OptionButton';
import { ProgressBar } from './ProgressBar';

type QuestionScreenProps = {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  existingAnswer?: BriefAnswer;
  onBack: () => void;
  onSkip: () => void;
  onAnswer: (answer: BriefAnswer) => void;
};

const asValueList = (value?: BriefAnswer['value']) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

const isExclusiveOption = (option: QuestionOption) =>
  option.exclusive || option.kind === 'unknown';

const getInitialSelectedIds = (question: Question, existingAnswer?: BriefAnswer) => {
  if (!existingAnswer) {
    return [];
  }

  const values = asValueList(existingAnswer.value);

  return question.options
    .filter((option) =>
      values.some(
        (value) =>
          option.label === value ||
          value.startsWith(`${option.label}:`) ||
          (option.kind === 'custom' && existingAnswer.kind === 'custom') ||
          (option.kind === 'unknown' && existingAnswer.kind === 'unknown'),
      ),
    )
    .map((option) => option.id);
};

const getInitialTextValue = (existingAnswer?: BriefAnswer) => {
  if (existingAnswer?.kind !== 'text') {
    return '';
  }

  return Array.isArray(existingAnswer.value) ? existingAnswer.value.join(', ') : existingAnswer.value;
};

const getInitialCustomValues = (question: Question, existingAnswer?: BriefAnswer) => {
  if (!existingAnswer) {
    return {};
  }

  const values = asValueList(existingAnswer.value);

  return question.options.reduce<Record<string, string>>((customValues, option) => {
    if (!option.opensTextInput) {
      return customValues;
    }

    const prefixedValue = values.find((value) => value.startsWith(`${option.label}:`));
    if (prefixedValue) {
      return {
        ...customValues,
        [option.id]: prefixedValue.replace(/^.*?:\s*/, ''),
      };
    }

    if (option.kind === 'custom' && existingAnswer.kind === 'custom') {
      const knownLabels = new Set(question.options.map((item) => item.label));
      const customValue = values.find((value) => !knownLabels.has(value));

      if (customValue) {
        return {
          ...customValues,
          [option.id]: customValue,
        };
      }
    }

    return customValues;
  }, {});
};

export function QuestionScreen({
  question,
  questionIndex,
  totalQuestions,
  existingAnswer,
  onBack,
  onSkip,
  onAnswer,
}: QuestionScreenProps) {
  const initialSelectedIds = useMemo(
    () => getInitialSelectedIds(question, existingAnswer),
    [existingAnswer, question],
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [textValue, setTextValue] = useState(getInitialTextValue(existingAnswer));
  const [customValues, setCustomValues] = useState<Record<string, string>>(() =>
    getInitialCustomValues(question, existingAnswer),
  );

  const selectedOptions = question.options.filter((option) => selectedIds.includes(option.id));
  const shouldShowTextInput = question.type === 'text' && selectedOptions.length === 0;
  const selectedNeedsCustom = selectedOptions.some((option) => option.opensTextInput);
  const selectedTextOptions = selectedOptions.filter((option) => option.opensTextInput);

  const canContinue =
    (question.type === 'text' && selectedOptions.length === 0 && textValue.trim().length > 0) ||
    (selectedOptions.length > 0 &&
      (!selectedNeedsCustom || selectedTextOptions.every((option) => customValues[option.id]?.trim().length > 0)));

  const handleSelect = (option: QuestionOption) => {
    const wasSelected = selectedIds.includes(option.id);

    setSelectedIds((currentIds) => {
      const isSelected = currentIds.includes(option.id);

      if (question.type === 'single') {
        return [option.id];
      }

      if (question.type === 'text') {
        return isSelected ? [] : [option.id];
      }

      if (isExclusiveOption(option)) {
        return isSelected ? [] : [option.id];
      }

      const withoutExclusive = currentIds.filter((id) => {
        const currentOption = question.options.find((item) => item.id === id);
        return currentOption ? !isExclusiveOption(currentOption) : true;
      });
      return isSelected
        ? withoutExclusive.filter((id) => id !== option.id)
        : [...withoutExclusive, option.id];
    });

    if (question.type === 'single' || isExclusiveOption(option) || (option.opensTextInput && wasSelected)) {
      setCustomValues((currentValues) => {
        if (question.type === 'single' || isExclusiveOption(option)) {
          return option.opensTextInput && !wasSelected ? currentValues : {};
        }

        const { [option.id]: _removedValue, ...nextValues } = currentValues;
        return nextValues;
      });
    }

    if (question.type === 'text') {
      setTextValue('');
    }
  };

  const handleCustomValueChange = (optionId: string, value: string) => {
    setCustomValues((currentValues) => ({
      ...currentValues,
      [optionId]: value,
    }));
  };

  const handleSubmit = () => {
    if (question.type === 'text' && selectedOptions.length === 0) {
      onAnswer({
        questionId: question.id,
        questionTitle: question.title,
        block: question.block,
        kind: 'text',
        value: textValue.trim(),
      });
      return;
    }

    const values = selectedOptions.map((option) => {
      if (option.opensTextInput) {
        const customValue = customValues[option.id]?.trim() ?? '';

        return option.kind === 'custom'
          ? customValue
          : `${option.label}: ${customValue}`;
      }

      return option.label;
    });

    let kind: AnswerKind = 'choice';
    if (selectedOptions.some((option) => option.kind === 'unknown')) {
      kind = 'unknown';
    } else if (selectedOptions.some((option) => option.kind === 'custom')) {
      kind = 'custom';
    }

    onAnswer({
      questionId: question.id,
      questionTitle: question.title,
      block: question.block,
      kind,
      value: question.type === 'multiple' ? values : values[0],
    });
  };

  return (
    <main className="screen question-screen">
      <ProgressBar current={questionIndex + 1} total={totalQuestions} />

      <section className="question-layout">
        <div className="question-copy">
          <p className="block-label">{question.block}</p>
          <h1>{question.title}</h1>
          {question.subtitle && <p className="question-subtitle">{question.subtitle}</p>}
          {question.hint && <p className="question-hint">{question.hint}</p>}
        </div>

        <div className="answer-area">
          {shouldShowTextInput && (
            <textarea
              className="free-input"
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
              placeholder={question.placeholder ?? 'Напишите как получается. Коротко или подробно - оба варианта подходят.'}
              autoFocus
            />
          )}

          {question.options.length > 0 && (
            <div className="option-grid" aria-label="Варианты ответа">
              {question.options.map((option) => (
                <OptionButton
                  key={option.id}
                  option={option}
                  isSelected={selectedIds.includes(option.id)}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}

          {selectedTextOptions.map((option) => (
            <label className="custom-input" key={option.id}>
              <span>
                <Icon name="turn" />
                {option.kind === 'custom' ? 'Уточните свой вариант' : option.label}
              </span>
              <input
                value={customValues[option.id] ?? ''}
                onChange={(event) => handleCustomValueChange(option.id, event.target.value)}
                placeholder={question.placeholder ?? 'Например: ссылка, комментарий или конкретная формулировка'}
                autoFocus
              />
            </label>
          ))}
        </div>
      </section>

      <nav className="question-actions" aria-label="Навигация по вопросам">
        <button className="ghost-button" type="button" onClick={onBack}>
          <Icon name="arrow-left" />
          Назад
        </button>
        <div>
          <button className="skip-button" type="button" onClick={onSkip}>
            Пропустить
          </button>
          <button className="primary-button" type="button" onClick={handleSubmit} disabled={!canContinue}>
            Дальше
            <Icon name="arrow-right" />
          </button>
        </div>
      </nav>
    </main>
  );
}
