import type { QuestionOption } from '../types';
import { Icon } from './Icon';

type OptionButtonProps = {
  option: QuestionOption;
  isSelected: boolean;
  onSelect: (option: QuestionOption) => void;
};

export function OptionButton({ option, isSelected, onSelect }: OptionButtonProps) {
  return (
    <button
      type="button"
      className={`option-button ${isSelected ? 'option-button--selected' : ''}`}
      onClick={() => onSelect(option)}
      aria-pressed={isSelected}
    >
      <span>{option.label}</span>
      {isSelected && <Icon name="check" />}
    </button>
  );
}
