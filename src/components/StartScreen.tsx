import { useEffect, useRef, useState } from 'react';
import { ClarioMascot, type MascotState } from './ClarioMascot';
import { Icon } from './Icon';
import styles from './StartScreen.module.css';
import { trackEvent } from '../utils/analytics';

type StartScreenProps = {
  value: string;
  onChange: (value: string) => void;
  onStart: () => void;
};

const exampleBrief = `ТЗ для исполнителя

Задача:
Создать карточку товара для маркетплейса.

Что нужно сделать:
Сделать главный слайд для карточки товара — детские бантики на резинке.

Где будет использоваться:
Wildberries / Ozon.

Целевая аудитория:
Родители девочек 3–8 лет, которые выбирают аккуратные аксессуары для волос.

Что важно показать:
— бантики 7 см в диаметре;
— ручная работа;
— аккуратная форма;
— как изделие выглядит на волосах;
— нежный, но не слишком детский стиль.

Стиль:
Светлый, чистый, современный. Без перегруза, кислотных цветов и шаблонной маркетплейс-инфографики.

Текст на карточке:
«Ручная работа»
«7 см в диаметре»

Что нужно уточнить:
— точные цвета в ассортименте;
— нужны ли дополнительные слайды;
— есть ли ограничения площадки по тексту и оформлению.`;

export function StartScreen({ value, onChange, onStart }: StartScreenProps) {
  const [mascotState, setMascotState] = useState<MascotState>('idle');
  const [isExampleOpen, setIsExampleOpen] = useState(false);
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

  useEffect(() => {
    if (!isExampleOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExampleOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExampleOpen]);

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

  const openExample = () => {
    setIsExampleOpen(true);
    trackEvent('example_brief_opened');
  };

  const startFromExample = () => {
    setIsExampleOpen(false);
    onStart();
  };

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <div className={styles.logo}>Clario</div>
      </header>

      <div className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.kicker}>Conversational design tool</p>
          <h1>
            Превращаем «сделайте красиво»
            <br />в <span className={styles.heroHighlight}>понятное ТЗ</span>
          </h1>
          <p className={styles.lead}>
            Ответьте на короткие вопросы — и Clario соберёт аккуратное ТЗ, которое можно скопировать и отправить исполнителю.
          </p>
          <div className={styles.chips} aria-label="Что внутри Clario">
            <span>2–3 минуты</span>
            <span>Можно пропускать вопросы</span>
            <span>На выходе — ТЗ для исполнителя</span>
          </div>
        </section>

        <section className={styles.stage} aria-label="Начало диалога с Clario" onClick={handleStageClick}>
          <div className={styles.assistant}>
            <ClarioMascot state={mascotState} />
            <p className={styles.bubble}>
              Опишите задачу как получится. Я помогу собрать её в понятное ТЗ.
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
            <p className={styles.hint}>Короткий бриф: можно пропускать вопросы и возвращаться назад.</p>
            <div className={styles.actions}>
              <button className={styles.button} type="button" onClick={onStart} disabled={!value.trim()}>
                Начать бриф
                <Icon name="arrow-right" />
              </button>
              <button className={styles.secondaryButton} type="button" onClick={openExample}>
                Посмотреть пример готового ТЗ
              </button>
            </div>
          </div>
        </section>
      </div>

      {isExampleOpen && (
        <div className={styles.modalOverlay} role="presentation" onMouseDown={() => setIsExampleOpen(false)}>
          <section
            aria-labelledby="example-brief-title"
            aria-modal="true"
            className={styles.modal}
            role="dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 id="example-brief-title">Пример готового ТЗ</h2>
              <button className={styles.closeButton} type="button" onClick={() => setIsExampleOpen(false)} aria-label="Закрыть пример">
                ×
              </button>
            </div>
            <pre className={styles.exampleText}>{exampleBrief}</pre>
            <div className={styles.modalActions}>
              <button className={styles.button} type="button" onClick={startFromExample}>
                Начать бриф
                <Icon name="arrow-right" />
              </button>
              <button className={styles.secondaryButton} type="button" onClick={() => setIsExampleOpen(false)}>
                Закрыть
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
