import styles from './MascotNudge.module.css';

export function MascotNudge() {
  return (
    <aside className={styles.nudge} aria-live="polite">
      <div className={styles.bubble}>Ещё чуть-чуть — уже собирается нормальное ТЗ.</div>
      <div className={styles.mascot} aria-hidden="true">
        <div className={styles.tuft} />
        <div className={styles.head}>
          <div className={styles.eyes}>
            <span className={styles.eye}>
              <span className={styles.pupil} />
            </span>
            <span className={styles.eye}>
              <span className={styles.pupil} />
            </span>
          </div>
          <div className={styles.mouth} />
        </div>
      </div>
    </aside>
  );
}
