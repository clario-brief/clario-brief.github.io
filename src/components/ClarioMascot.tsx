import styles from './ClarioMascot.module.css';

export type MascotState = 'idle' | 'reading' | 'pause' | 'sleeping';

type ClarioMascotProps = {
  state: MascotState;
  size?: 'sm' | 'md' | 'lg';
  expression?: 'neutral' | 'friendly';
};

export function ClarioMascot({ state, size = 'md', expression = 'neutral' }: ClarioMascotProps) {
  return (
    <div className={`${styles.mascot} ${styles[size]} ${styles[state]} ${styles[expression]}`} aria-hidden="true">
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
