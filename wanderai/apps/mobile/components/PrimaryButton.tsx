import type { LucideIcon } from 'lucide-react-native';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';
import { theme } from '../constants/theme';

type PrimaryButtonProps = TouchableOpacityProps & {
  label: string;
  icon?: LucideIcon;
  loading?: boolean;
  variant?: 'primary' | 'accent' | 'ghost';
};

export const PrimaryButton = ({
  label,
  icon: Icon,
  loading = false,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: PrimaryButtonProps): JSX.Element => {
  const background =
    variant === 'ghost' ? 'bg-white/10' : variant === 'accent' ? 'bg-accent' : 'bg-primary';
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className={`min-h-12 flex-row items-center justify-center gap-2 rounded-lg px-4 ${background} ${
        disabled || loading ? 'opacity-60' : ''
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.text} />
      ) : (
        <>
          {Icon ? <Icon size={18} color={theme.colors.text} /> : null}
          <Text className="font-inter-semibold text-base text-white">{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};
