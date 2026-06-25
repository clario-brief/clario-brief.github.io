type IconName =
  | 'arrow-left'
  | 'arrow-right'
  | 'check'
  | 'copy'
  | 'download'
  | 'restart'
  | 'spark'
  | 'telegram'
  | 'turn';

const icons: Record<IconName, string> = {
  'arrow-left': '<',
  'arrow-right': '>',
  check: '✓',
  copy: '⧉',
  download: '↓',
  restart: '↻',
  spark: '*',
  telegram: '',
  turn: '↳',
};

type IconProps = {
  name: IconName;
};

export function Icon({ name }: IconProps) {
  if (name === 'telegram') {
    return (
      <span className="icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="img" focusable="false">
          <path d="M21.7 4.3 18.4 20c-.2 1-1.1 1.3-1.9.8l-5.1-3.7-2.5 2.4c-.3.3-.5.5-1 .5l.4-5.2 9.4-8.5c.4-.4-.1-.6-.6-.2L5.4 13.4.4 11.8c-1-.3-1-1 .2-1.5L20 2.8c.9-.3 1.7.2 1.7 1.5Z" />
        </svg>
      </span>
    );
  }

  return (
    <span className="icon" aria-hidden="true">
      {icons[name]}
    </span>
  );
}
