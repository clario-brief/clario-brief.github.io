import { useEffect, useRef, useState } from 'react';
import { QuestionScreen } from './components/QuestionScreen';
import { ResultScreen } from './components/ResultScreen';
import { StartScreen } from './components/StartScreen';
import { questions } from './data/questions';
import type { BriefAnswer } from './types';
import { trackEvent, trackPageView } from './utils/analytics';
import { buildBrief } from './utils/buildBrief';

type AppStep = 'start' | 'questions' | 'result';

export default function App() {
  const [step, setStep] = useState<AppStep>('start');
  const [initialDescription, setInitialDescription] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<BriefAnswer[]>([]);
  const [visitedQuestionIndexes, setVisitedQuestionIndexes] = useState<number[]>([]);
  const [skippedQuestionIds, setSkippedQuestionIds] = useState<string[]>([]);
  const [mascotNudgeHasShown, setMascotNudgeHasShown] = useState(false);
  const [mascotNudgeActiveIndex, setMascotNudgeActiveIndex] = useState<number | null>(null);
  const appOpenedTracked = useRef(false);

  const currentQuestion = questions[questionIndex];

  useEffect(() => {
    if (appOpenedTracked.current) {
      return;
    }

    appOpenedTracked.current = true;
    trackEvent('app_opened');
  }, []);

  useEffect(() => {
    if (step === 'questions') {
      trackPageView(`/questions/${questionIndex + 1}`, {
        screen: step,
        questionNumber: questionIndex + 1,
      });
      return;
    }

    trackPageView(step === 'result' ? '/result' : '/', { screen: step });
  }, [questionIndex, step]);

  useEffect(() => {
    if (step !== 'questions') {
      return;
    }

    setVisitedQuestionIndexes((currentIndexes) =>
      currentIndexes.includes(questionIndex)
        ? currentIndexes
        : [...currentIndexes, questionIndex],
    );
  }, [questionIndex, step]);

  useEffect(() => {
    if (questionIndex !== 7) {
      setMascotNudgeActiveIndex(null);
    }
  }, [questionIndex]);

  const upsertAnswer = (answer: BriefAnswer) => {
    setAnswers((current) => [
      ...current.filter((item) => item.questionId !== answer.questionId),
      answer,
    ]);
    setSkippedQuestionIds((current) => current.filter((questionId) => questionId !== answer.questionId));
  };

  const trackAnswerEvents = (answer: BriefAnswer) => {
    trackEvent('question_answered', {
      kind: answer.kind,
      questionId: answer.questionId,
      questionNumber: questionIndex + 1,
    });

    if (answer.kind === 'custom') {
      trackEvent('custom_answer_used', {
        questionId: answer.questionId,
        questionNumber: questionIndex + 1,
      });
    }

    if (answer.kind === 'unknown') {
      trackEvent('unknown_used', {
        questionId: answer.questionId,
        questionNumber: questionIndex + 1,
      });
    }
  };

  const trackBriefCompleted = (nextAnswers: BriefAnswer[]) => {
    const brief = buildBrief({
      initialDescription,
      answers: nextAnswers,
      questions,
    });

    trackEvent('brief_completed', {
      totalQuestions: questions.length,
      answeredQuestions: brief.known.length + brief.unknown.length,
      skippedQuestions: brief.skipped.length,
      unknownQuestions: brief.unknown.length,
      completion: brief.completion,
    });
  };

  const goNext = () => {
    if (questionIndex >= questions.length - 1) {
      setStep('result');
      return;
    }

    setQuestionIndex((current) => current + 1);
  };

  const saveAnswer = (answer: BriefAnswer) => {
    upsertAnswer(answer);
    trackAnswerEvents(answer);
    if (questionIndex >= questions.length - 1) {
      const nextAnswers = [
        ...answers.filter((item) => item.questionId !== answer.questionId),
        answer,
      ];
      trackBriefCompleted(nextAnswers);
    }
    goNext();
  };

  const skipQuestion = () => {
    const nextAnswers = answers.filter((item) => item.questionId !== currentQuestion.id);

    setAnswers(nextAnswers);
    setSkippedQuestionIds((current) =>
      current.includes(currentQuestion.id) ? current : [...current, currentQuestion.id],
    );
    trackEvent('skip_used', {
      questionId: currentQuestion.id,
      questionNumber: questionIndex + 1,
    });
    if (questionIndex >= questions.length - 1) {
      trackBriefCompleted(nextAnswers);
    }
    goNext();
  };

  const goBack = () => {
    if (questionIndex === 0) {
      setStep('start');
      return;
    }

    setQuestionIndex((current) => current - 1);
  };

  const restart = () => {
    trackEvent('brief_restarted');
    setStep('start');
    setInitialDescription('');
    setQuestionIndex(0);
    setAnswers([]);
    setVisitedQuestionIndexes([]);
    setSkippedQuestionIds([]);
    setMascotNudgeHasShown(false);
    setMascotNudgeActiveIndex(null);
  };

  const navigateToQuestion = (targetIndex: number, currentDraftAnswer?: BriefAnswer) => {
    if (targetIndex < 0 || targetIndex >= questions.length) {
      return;
    }

    if (currentDraftAnswer) {
      upsertAnswer(currentDraftAnswer);
      trackAnswerEvents(currentDraftAnswer);
    }

    setQuestionIndex(targetIndex);
  };

  const startBrief = () => {
    trackEvent('brief_started', {
      hasInitialDescription: initialDescription.trim().length > 0,
      questionCount: questions.length,
    });
    setStep('questions');
  };

  if (step === 'start') {
    return (
      <StartScreen
        value={initialDescription}
        onChange={setInitialDescription}
        onStart={startBrief}
      />
    );
  }

  if (step === 'result') {
    return (
      <ResultScreen
        initialDescription={initialDescription}
        answers={answers}
        onRestart={restart}
      />
    );
  }

  return (
    <QuestionScreen
      key={currentQuestion.id}
      question={currentQuestion}
      questionIndex={questionIndex}
      totalQuestions={questions.length}
      existingAnswer={answers.find((answer) => answer.questionId === currentQuestion.id)}
      showMascotNudge={questionIndex === 7 && (!mascotNudgeHasShown || mascotNudgeActiveIndex === 7)}
      questions={questions}
      answers={answers}
      visitedQuestionIndexes={visitedQuestionIndexes}
      skippedQuestionIds={skippedQuestionIds}
      onMascotNudgeShown={() => {
        setMascotNudgeHasShown(true);
        setMascotNudgeActiveIndex(7);
      }}
      onQuestionNavigate={navigateToQuestion}
      onBack={goBack}
      onSkip={skipQuestion}
      onAnswer={saveAnswer}
    />
  );
}
