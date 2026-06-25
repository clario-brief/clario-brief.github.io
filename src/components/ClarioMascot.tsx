import styles from './ClarioMascot.module.css';

export type MascotState = 'idle' | 'reading' | 'pause' | 'sleeping';

type ClarioMascotProps = {
  state: MascotState;
  size?: 'sm' | 'md';
};

export function ClarioMascot({ state, size = 'md' }: ClarioMascotProps) {
  return (
    <div className={`${styles.mascot} ${styles[size]} ${styles[state]}`} aria-hidden="true">
      <div className={styles.head}>
        <span className={styles.tuft} />
        <span className={styles.eye}>
          <span className={styles.pupil} />
        </span>
        <span className={styles.eye}>
          <span className={styles.pupil} />
        </span>
        <span className={styles.mouth} />
      </div>
      <span className={`${styles.sleepZ} ${styles.sleepZOne}`}>Z</span>
      <span className={`${styles.sleepZ} ${styles.sleepZTwo}`}>Z</span>
      <span className={`${styles.sleepZ} ${styles.sleepZThree}`}>Z</span>
    </div>
  );
}
