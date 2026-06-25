export type AnswerKind = 'choice' | 'custom' | 'unknown' | 'skip' | 'text';

export type QuestionType = 'single' | 'multiple' | 'text';

export type QuestionOption = {
  id: string;
  label: string;
  kind?: AnswerKind;
  opensTextInput?: boolean;
  exclusive?: boolean;
};

export type Question = {
  id: string;
  block: string;
  title: string;
  type: QuestionType;
  subtitle?: string;
  hint?: string;
  placeholder?: string;
  options: QuestionOption[];
};

export type BriefAnswer = {
  questionId: string;
  questionTitle: string;
  block: string;
  kind: AnswerKind;
  value: string | string[];
};
