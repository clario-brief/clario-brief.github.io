type IconName =
  | 'arrow-left'
  | 'arrow-right'
  | 'check'
  | 'copy'
  | 'download'
  | 'restart'
  | 'spark'
  | 'turn';

const icons: Record<IconName, string> = {
  'arrow-left': '<',
  'arrow-right': '>',
  check: '✓',
  copy: '⧉',
  download: '↓',
  restart: '↻',
  spark: '*',
  turn: '↳',
};

type IconProps = {
  name: IconName;
};

export function Icon({ name }: IconProps) {
  return (
    <span className="icon" aria-hidden="true">
      {icons[name]}
    </span>
  );
}
