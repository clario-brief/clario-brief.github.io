import type { BriefAnswer, Question } from '../types';

type BuildBriefParams = {
  initialDescription: string;
  answers: BriefAnswer[];
  questions: Question[];
};

export type BuiltBrief = {
  completion: number;
  status: string;
  text: string;
  known: BriefAnswer[];
  unknown: BriefAnswer[];
  skipped: Question[];
  discretionary: BriefAnswer[];
  risks: string[];
};

const importantQuestions = new Set(['format', 'placement', 'mainObject', 'objectDescription', 'mainMessage']);

const stringifyAnswerValue = (value: BriefAnswer['value']) =>
  Array.isArray(value) ? value.filter(Boolean).join(', ') : value;

const answerValueById = (answersById: Map<string, BriefAnswer>, questionId: string) => {
  const answer = answersById.get(questionId);

  if (!answer || answer.kind === 'skip') {
    return 'Не указано.';
  }

  const value = stringifyAnswerValue(answer.value);

  if (answer.kind === 'unknown') {
    return `${value}. Нужно уточнить.`;
  }

  if (questionId === 'requiredText' && value.includes('Документ есть, передам исполнителю отдельно')) {
    return 'Дополнительные материалы: документ/файл будет передан исполнителю отдельно.';
  }

  if (questionId === 'reference' && value.includes('Референсы есть, отправлю исполнителю отдельно')) {
    return 'Референсы: будут переданы исполнителю отдельно.';
  }

  return value || 'Не указано.';
};

const formatUnknownPoint = (answer: BriefAnswer) =>
  `${answer.block}: ${answer.questionTitle} — ${stringifyAnswerValue(answer.value)}`;

export function buildBrief({ initialDescription, answers, questions }: BuildBriefParams): BuiltBrief {
  const answersById = new Map(answers.map((answer) => [answer.questionId, answer]));
  const answeredIds = new Set(answers.map((answer) => answer.questionId));
  const known = answers.filter((answer) => answer.kind !== 'unknown' && answer.kind !== 'skip');
  const unknown = answers.filter((answer) => answer.kind === 'unknown');
  const skipped = questions.filter((question) => !answeredIds.has(question.id));
  const discretionary = known.filter((answer) =>
    [
      'Текста не нужно',
      'Нужно сформулировать вместе с исполнителем',
      'Нет, пусть исполнитель предложит направление',
      'Ограничений нет',
      'Пока не знаю — подберём с исполнителем',
    ].some((marker) => stringifyAnswerValue(answer.value).includes(marker)),
  );

  const completedCount = questions.length - skipped.length;
  const completion = Math.round((completedCount / questions.length) * 100);
  const missingImportant = questions.filter(
    (question) => importantQuestions.has(question.id) && !answeredIds.has(question.id),
  );

  let status = 'можно передавать исполнителю';
  if (completion < 55 || missingImportant.length >= 2) {
    status = 'лучше уточнить базовые детали';
  } else if (completion < 85 || unknown.length > 0 || skipped.length > 0) {
    status = 'можно передавать с уточнениями';
  }

  const unknownPoints = [
    ...unknown.map(formatUnknownPoint),
    ...skipped.map((question) => `${question.block}: ${question.title} — вопрос пропущен.`),
  ];

  const risks = [
    ...(unknown.length > 0 ? ['Есть ответы «не знаю» / «пока не знаю»: нужно обсудить с исполнителем.'] : []),
    ...(skipped.length > 0 ? ['Есть пропущенные вопросы: часть решений потребует согласования.'] : []),
    ...(!answeredIds.has('reference') ? ['Референсы или визуальные пожелания не указаны.'] : []),
    ...(!answeredIds.has('requiredText') ? ['Обязательные слова, цифры или факты не заполнены.'] : []),
  ];

  const text = [
    '# ТЗ на визуальный проект',
    '',
    `Готовность: ${completion}%`,
    `Статус: ${status}`,
    '',
    '## Исходное описание клиента',
    initialDescription.trim() || 'Не заполнено.',
    '',
    '## 1. Тип задачи и площадки',
    `* Что нужно сделать: ${answerValueById(answersById, 'format')}`,
    `* Где будет использоваться: ${answerValueById(answersById, 'placement')}`,
    '',
    '## 2. Главный объект',
    `* Что в центре визуала: ${answerValueById(answersById, 'mainObject')}`,
    `* Описание: ${answerValueById(answersById, 'objectDescription')}`,
    '',
    '## 3. Аудитория и цель',
    `* Для кого: ${answerValueById(answersById, 'audience')}`,
    `* Что человек должен понять: ${answerValueById(answersById, 'mainMessage')}`,
    `* Что человек должен сделать после просмотра: ${answerValueById(answersById, 'targetAction')}`,
    '',
    '## 4. Текст на визуале',
    `* Объём текста: ${answerValueById(answersById, 'textScope')}`,
    `* Обязательные слова, цифры или факты: ${answerValueById(answersById, 'requiredText')}`,
    '',
    '## 5. Визуальное направление',
    `* Настроение / стиль: ${answerValueById(answersById, 'mood')}`,
    `* Референсы или пожелания: ${answerValueById(answersById, 'reference')}`,
    '',
    '## 6. Ограничения',
    `* Чего точно не должно быть: ${answerValueById(answersById, 'restrictions')}`,
    '',
    '## 7. Форматы и сроки',
    `* Размеры / форматы: ${answerValueById(answersById, 'sizeFormat')}`,
    `* Сроки или важные детали: ${answerValueById(answersById, 'deadline')}`,
    '',
    '## 8. Что осталось уточнить',
    unknownPoints.length ? unknownPoints.map((point) => `* ${point}`).join('\n') : 'Ничего критичного. Можно двигаться дальше.',
    '',
    '## 9. Риски и зоны внимания',
    risks.length ? risks.map((risk) => `* ${risk}`).join('\n') : 'Критичных рисков по заполнению не видно.',
    '',
    '## 10. Следующий шаг',
    status === 'можно передавать исполнителю'
      ? 'Передать ТЗ исполнителю вместе с исходными материалами и ссылками на референсы, если они есть.'
      : 'Уточнить отмеченные пункты или передать ТЗ исполнителю с пометкой, где требуется предложение исполнителя.',
  ].join('\n');

  return {
    completion,
    status,
    text,
    known,
    unknown,
    skipped,
    discretionary,
    risks,
  };
}
