import { useEffect, useState } from 'react';
import { QuestionScreen } from './components/QuestionScreen';
import { ResultScreen } from './components/ResultScreen';
import { SharedBriefScreen } from './components/SharedBriefScreen';
import { StartScreen } from './components/StartScreen';
import { questions } from './data/questions';
import type { BriefAnswer } from './types';

type AppStep = 'start' | 'questions' | 'result';
type SharedBriefState = {
  text: string;
  hasError: boolean;
} | null;

const parseSharedBrief = (): SharedBriefState => {
  const hash = window.location.hash;

  if (!hash.startsWith('#brief=')) {
    return null;
  }

  try {
    const text = decodeURIComponent(hash.slice('#brief='.length));
    return text ? { text, hasError: false } : { text: '', hasError: true };
  } catch {
    return { text: '', hasError: true };
  }
};

export default function App() {
  const [step, setStep] = useState<AppStep>('start');
  const [initialDescription, setInitialDescription] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<BriefAnswer[]>([]);
  const [mascotNudgeHasShown, setMascotNudgeHasShown] = useState(false);
  const [sharedBrief, setSharedBrief] = useState<SharedBriefState>(() => parseSharedBrief());

  const currentQuestion = questions[questionIndex];

  useEffect(() => {
    const handleHashChange = () => {
      setSharedBrief(parseSharedBrief());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const goNext = () => {
    if (questionIndex >= questions.length - 1) {
      setStep('result');
      return;
    }

    setQuestionIndex((current) => current + 1);
  };

  const saveAnswer = (answer: BriefAnswer) => {
    setAnswers((current) => [
      ...current.filter((item) => item.questionId !== answer.questionId),
      answer,
    ]);
    goNext();
  };

  const skipQuestion = () => {
    setAnswers((current) => current.filter((item) => item.questionId !== currentQuestion.id));
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
    setStep('start');
    setInitialDescription('');
    setQuestionIndex(0);
    setAnswers([]);
    setMascotNudgeHasShown(false);
  };

  const createBriefFromSharedScreen = () => {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    setSharedBrief(null);
    restart();
  };

  if (sharedBrief) {
    return (
      <SharedBriefScreen
        briefText={sharedBrief.text}
        hasError={sharedBrief.hasError}
        onCreateBrief={createBriefFromSharedScreen}
      />
    );
  }

  if (step === 'start') {
    return (
      <StartScreen
        value={initialDescription}
        onChange={setInitialDescription}
        onStart={() => setStep('questions')}
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
      showMascotNudge={questionIndex === 7 && !mascotNudgeHasShown}
      onMascotNudgeDismiss={() => setMascotNudgeHasShown(true)}
      onBack={goBack}
      onSkip={skipQuestion}
      onAnswer={saveAnswer}
    />
  );
}
