import { useEffect, useRef, useState } from 'react';
import { ClarioMascot, type MascotState } from './ClarioMascot';
import { Icon } from './Icon';
import styles from './StartScreen.module.css';

type StartScreenProps = {
  value: string;
  onChange: (value: string) => void;
  onStart: () => void;
};

export function StartScreen({ value, onChange, onStart }: StartScreenProps) {
  const [mascotState, setMascotState] = useState<MascotState>('idle');
  const typingTimer = useRef<number | undefined>(undefined);
  const sleepTimer = useRef<number | undefined>(undefined);
  const hasActivatedInput = useRef(false);

  const clearTypingTimer = () => {
    if (typingTimer.current) {
      window.clearTimeout(typingTimer.current);
    }
  };

  const clearSleepTimer = () => {
    if (sleepTimer.current) {
      window.clearTimeout(sleepTimer.current);
    }
  };

  const scheduleSleep = () => {
    if (!hasActivatedInput.current) {
      return;
    }

    clearSleepTimer();
    sleepTimer.current = window.setTimeout(() => {
      setMascotState('sleeping');
    }, 10000);
  };

  useEffect(() => {
    return () => {
      if (typingTimer.current) {
        window.clearTimeout(typingTimer.current);
      }
      if (sleepTimer.current) {
        window.clearTimeout(sleepTimer.current);
      }
    };
  }, []);

  const schedulePause = () => {
    clearTypingTimer();

    typingTimer.current = window.setTimeout(() => {
      setMascotState('pause');
    }, 1000);
  };

  const registerActivity = (nextState: MascotState = 'idle') => {
    hasActivatedInput.current = true;

    if (nextState !== 'reading') {
      clearTypingTimer();
    }
    setMascotState(nextState);
    scheduleSleep();
  };

  const handleFocus = () => {
    registerActivity('idle');
  };

  const handleChange = (nextValue: string) => {
    onChange(nextValue);
    registerActivity('reading');
    schedulePause();
  };

  const handleKeyDown = () => {
    registerActivity('reading');
    schedulePause();
  };

  const handleStageClick = () => {
    if (!hasActivatedInput.current) {
      return;
    }

    if (mascotState === 'sleeping') {
      registerActivity('idle');
      return;
    }

    scheduleSleep();
  };

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <div className={styles.logo}>Clario</div>
        <div className={styles.badge}>MVP · визуальные проекты</div>
      </header>

      <div className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.kicker}>Conversational design tool</p>
          <h1>
            Превращаем «сделайте красиво»
            <br />в понятное ТЗ
          </h1>
          <p className={styles.lead}>
            Опиши задачу своими словами. Clario задаст короткие уточняющие вопросы и соберёт
            структурированный бриф для дизайнера, AI-креатора или подрядчика.
          </p>
        </section>

        <section className={styles.stage} aria-label="Начало диалога с Clario" onClick={handleStageClick}>
          <div className={styles.assistant}>
            <ClarioMascot state={mascotState} />
            <p className={styles.bubble}>
              Опиши задачу как получится. Я помогу собрать её в понятное ТЗ.
            </p>
          </div>

          <div className={styles.composer}>
            <label className={styles.label} htmlFor="initial-description">
              Что нужно сделать?
            </label>
            <textarea
              className={styles.textarea}
              id="initial-description"
              value={value}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              onChange={(event) => handleChange(event.target.value)}
              placeholder="Например: нужна карточка товара для маркетплейса, баннер для LinkedIn или визуал для поста..."
            />
            <p className={styles.hint}>Можно коротко и сумбурно — Clario уточнит детали дальше.</p>
            <button className={styles.button} type="button" onClick={onStart} disabled={!value.trim()}>
              Начать бриф
              <Icon name="arrow-right" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
