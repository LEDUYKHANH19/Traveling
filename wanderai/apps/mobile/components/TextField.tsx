import { TextInput, type TextInputProps } from 'react-native';

type TextFieldProps = TextInputProps & {
  className?: string;
};

export const TextField = ({
  className = '',
  placeholderTextColor = '#A1A1AA',
  ...props
}: TextFieldProps): JSX.Element => (
  <TextInput
    placeholderTextColor={placeholderTextColor}
    className={`min-h-12 rounded-lg border border-white/10 bg-white/10 px-4 py-3 font-inter text-base text-white ${className}`}
    {...props}
  />
);
