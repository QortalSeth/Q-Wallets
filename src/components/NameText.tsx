import { Typography, type TypographyProps } from '@mui/material';
import { hasInvisibleCharacters } from '../utils/invisibleCharacters';

type NameTextProps = Omit<TypographyProps, 'children'> & {
  children?: TypographyProps['children'];
  fallback?: TypographyProps['children'];
  name?: string | null;
};

export function NameText({
  children,
  fallback = '-',
  name,
  sx,
  ...props
}: NameTextProps) {
  const displayName = name || fallback;
  const shouldMark =
    typeof name === 'string' && name !== '' && hasInvisibleCharacters(name);

  return (
    <Typography
      {...props}
      sx={[
        ...(Array.isArray(sx) ? sx : [sx]),
        shouldMark && {
          textDecoration: 'line-through',
          textDecorationColor: 'rgba(255, 91, 105, 0.95)',
          textDecorationThickness: '2px',
          textUnderlineOffset: '3px',
        },
      ]}
    >
      {displayName}
      {children}
    </Typography>
  );
}
