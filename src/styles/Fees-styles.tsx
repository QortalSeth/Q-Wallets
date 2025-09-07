import { Box, InputLabel, styled } from '@mui/material';

export const CoinSelectRow = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  gap: '5px',
  justifyContent: 'flex-start',
  marginBottom: '5px',
  width: '100%',
  flexWrap: 'wrap',
});

export const CoinActionContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '25px',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
});

export const CoinActionRow = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
});

export const HeaderRow = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  gap: '10px',
  alignItems: 'center',
  justifyContent: 'center',
});

export const CustomLabel = styled(InputLabel)`
  font-weight: 400;
  font-family: Inter;
  font-size: 14px;
  line-height: 1.2;
  white-space: normal;
`;
