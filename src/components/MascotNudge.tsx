import { ClarioMascot } from './ClarioMascot';
import styles from './MascotNudge.module.css';

export function MascotNudge() {
  return (
    <aside className={styles.nudge} aria-live="polite">
      <div className={styles.mascotStage}>
        <ClarioMascot state="idle" size="lg" expression="friendly" />
      </div>
      <div className={styles.bubble}>Ещё чуть-чуть — уже собирается нормальное ТЗ.</div>
    </aside>
  );
}
