import {
  Button,
  Card,
  Dialog,
  Slide,
  styled,
  TableCell,
  tableCellClasses,
  TableRow,
  Tooltip,
  tooltipClasses,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { ComponentProps, forwardRef, Ref } from 'react';

export const Transition = forwardRef(function Transition(
  props: ComponentProps<typeof Slide>,
  ref: Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function SlideTransition(props: ComponentProps<typeof Slide>) {
  return <Slide {...props} direction="up" />;
}

export const DialogGeneral = styled(Dialog)(({ theme }: { theme: Theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  '& .MuiDialog-paper': {
    borderRadius: 8,
  },
}));

export const LightwalletDialog = styled(Dialog)(
  ({ theme }: { theme: Theme }) => ({
    '& .MuiDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(1),
    },
    '& .MuiDialog-paper': {
      borderRadius: 8,
    },
  })
);

export const SubmitDialog = styled(Dialog)(({ theme }: { theme: Theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  '& .MuiDialog-paper': {
    borderRadius: 8,
  },
}));

export const CustomWidthTooltip = styled(
  ({ className, ...props }: ComponentProps<typeof Tooltip>) => (
    <Tooltip {...props} classes={{ popper: className }} />
  )
)({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 500,
  },
});

export const WalletCard = styled(Card)(({ theme }: { theme: Theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(13, 25, 34, 0.86)'
      : 'rgba(255,255,255,0.96)',
  backgroundImage:
    theme.palette.mode === 'dark'
      ? 'radial-gradient(circle at 18% 0%, rgba(31, 184, 242, 0.08), transparent 34%), linear-gradient(180deg, rgba(13, 28, 39, 0.9) 0%, rgba(9, 19, 27, 0.94) 100%)'
      : 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.98) 100%)',
  border: `1px solid ${
    theme.palette.mode === 'dark'
      ? 'rgba(116, 158, 180, 0.16)'
      : 'rgba(17,24,39,0.08)'
  }`,
  borderRadius: 8,
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 18px 48px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.025)'
      : '0 14px 38px rgba(16, 24, 40, 0.06)',
  margin: '0 auto',
  maxWidth: '100%',
}));

export const WalletButtons = styled(Button)(({ theme }: { theme: Theme }) => ({
  background:
    theme.palette.mode === 'dark'
      ? 'linear-gradient(180deg, #1baeed 0%, #0876d3 100%)'
      : undefined,
  borderRadius: 8,
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 12px 28px rgba(5, 139, 211, 0.22)'
      : undefined,
  color: theme.palette.primary.contrastText,
  minHeight: 42,
  paddingInline: theme.spacing(2),
  width: 'auto',
  '&:hover': {
    background:
      theme.palette.mode === 'dark'
        ? 'linear-gradient(180deg, #2ec4ff 0%, #0d86e2 100%)'
        : undefined,
    backgroundColor: theme.palette.primary.dark,
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

export const StyledTableCell = styled(TableCell)(
  ({ theme }: { theme: Theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor:
        theme.palette.mode === 'dark'
          ? 'rgba(255,255,255,0.025)'
          : 'rgba(17,24,39,0.035)',
      color: theme.palette.text.secondary,
      fontSize: 12,
      fontWeight: 700,
      borderBottom: `1px solid ${theme.palette.divider}`,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textTransform: 'uppercase',
    },
    [`&.${tableCellClasses.body}`]: {
      borderBottom: `1px solid ${theme.palette.divider}`,
      fontSize: 13,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  })
);

export const StyledTableRow = styled(TableRow)(
  ({ theme }: { theme: Theme }) => ({
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor:
        theme.palette.mode === 'dark'
          ? 'rgba(255,255,255,0.025)'
          : 'rgba(17,24,39,0.025)',
    },
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  })
);
