import React, { useState } from 'react';
import {
  Avatar,
  Box,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  ContactsOutlined,
  ContentCopy,
  Delete,
  Edit,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Send,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { AddressBookEntry } from '../../utils/Types';
import { copyToClipboard, cropString } from '../../common/functions';
import { EMPTY_STRING, TIME_SECONDS_2 } from '../../common/constants';
import {
  getAddressBookAvatarColor,
  getAddressBookAvatarSx,
} from './avatarPalette';

interface AddressBookTableProps {
  entries: AddressBookEntry[];
  onEdit: (entry: AddressBookEntry) => void;
  onDelete: (entry: AddressBookEntry) => void;
  onUse?: (entry: AddressBookEntry) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const getInitial = (value: string) =>
  value.trim().charAt(0).toUpperCase() || '?';

const formatRange = (page: number, rowsPerPage: number, count: number) => {
  if (count === 0) return '0-0 of 0';
  const start = page * rowsPerPage + 1;
  const end = Math.min(count, (page + 1) * rowsPerPage);
  return `${start}-${end} of ${count}`;
};

const headerSx = {
  color: 'text.secondary',
  fontSize: { xs: 12, md: 12 },
  fontWeight: 800,
  letterSpacing: 0,
  lineHeight: 1,
  textTransform: 'uppercase',
} as const;

const cellTextSx = {
  display: 'block',
  fontSize: { xs: 14, md: 13 },
  fontWeight: 800,
  lineHeight: 1.12,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

export const AddressBookTable: React.FC<AddressBookTableProps> = ({
  entries,
  onEdit,
  onDelete,
  onUse,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const { t } = useTranslation(['core']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const maxPage = Math.max(0, Math.ceil(entries.length / rowsPerPage) - 1);
  const paginatedEntries = entries.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleCopy = async (address: string, id: string) => {
    try {
      await copyToClipboard(address);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), TIME_SECONDS_2);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const handleRowsPerPageSelect = (event: SelectChangeEvent<string>) => {
    onRowsPerPageChange?.({
      target: { value: event.target.value },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const renderActions = (entry: AddressBookEntry) => (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        gap: { xs: 0.45, md: 0.55 },
        justifyContent: 'flex-end',
      }}
    >
      {onUse && (
        <Tooltip
          title={t('core:address_book_use', {
            postProcess: 'capitalizeFirstChar',
          })}
          placement="top"
        >
          <IconButton
            size="small"
            onClick={() => onUse(entry)}
            aria-label={t('core:address_book_use', {
              postProcess: 'capitalizeFirstChar',
            })}
            sx={{
              color: 'primary.main',
              p: { xs: 0.45, md: 0.45 },
              '&:hover': { bgcolor: 'rgba(24,189,242,0.09)' },
            }}
          >
            <Send sx={{ fontSize: { xs: 19, md: 21 } }} />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip
        title={t('core:address_book_edit', {
          postProcess: 'capitalizeFirstChar',
        })}
        placement="top"
      >
        <IconButton
          size="small"
          onClick={() => onEdit(entry)}
          aria-label={t('core:address_book_edit', {
            postProcess: 'capitalizeFirstChar',
          })}
          sx={{
            color: 'primary.main',
            p: { xs: 0.45, md: 0.45 },
            '&:hover': { bgcolor: 'rgba(24,189,242,0.09)' },
          }}
        >
          <Edit sx={{ fontSize: { xs: 19, md: 21 } }} />
        </IconButton>
      </Tooltip>
      <Tooltip
        title={t('core:address_book_delete', {
          postProcess: 'capitalizeFirstChar',
        })}
        placement="top"
      >
        <IconButton
          size="small"
          onClick={() => onDelete(entry)}
          aria-label={t('core:address_book_delete', {
            postProcess: 'capitalizeFirstChar',
          })}
          sx={{
            color: 'error.main',
            p: { xs: 0.45, md: 0.45 },
            '&:hover': { bgcolor: 'rgba(255,91,105,0.09)' },
          }}
        >
          <Delete sx={{ fontSize: { xs: 19, md: 21 } }} />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const footer = (
    <Box
      sx={{
        alignItems: { xs: 'stretch', sm: 'center' },
        borderTop: (t) => `1px solid ${t.palette.divider}`,
        display: 'grid',
        gap: { xs: 1.5, md: 1.2 },
        gridTemplateColumns: { xs: '1fr', md: '1fr auto auto' },
        minHeight: { xs: 88, md: 52 },
        px: { xs: 2, md: 1.4 },
      }}
    >
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.8 }}>
        <ContactsOutlined
          sx={{ color: 'primary.main', fontSize: { xs: 24, md: 17 } }}
        />
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: { xs: 15, md: 13 },
            fontWeight: 600,
            letterSpacing: 0,
          }}
        >
          <Box
            component="span"
            sx={{ color: 'primary.main', fontWeight: 800, mr: 0.45 }}
          >
            {entries.length}
          </Box>
          {entries.length === 1 ? 'address' : 'addresses'}
        </Typography>
      </Box>

      <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: { xs: 14, md: 12.5 },
            fontWeight: 500,
            letterSpacing: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {t('core:rows_per_page', {
            postProcess: 'capitalizeFirstChar',
          })}
        </Typography>
        <Select
          value={String(rowsPerPage)}
          onChange={handleRowsPerPageSelect}
          sx={{
            bgcolor: 'rgba(0,8,16,0.24)',
            borderRadius: 1,
            color: 'text.primary',
            fontSize: { xs: 15, md: 13 },
            fontWeight: 800,
            height: { xs: 44, md: 34 },
            minWidth: { xs: 86, md: 62 },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(116,158,180,0.2)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(24,189,242,0.5)',
            },
            '& .MuiSelect-icon': {
              color: 'text.primary',
              fontSize: 22,
            },
          }}
        >
          {[5, 10, 15].map((value) => (
            <MenuItem key={value} value={String(value)}>
              {value}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          gap: { xs: 1.3, md: 0.65 },
          justifyContent: { xs: 'space-between', md: 'flex-end' },
        }}
      >
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: { xs: 14, md: 12.5 },
            fontWeight: 500,
            minWidth: { md: 68 },
            whiteSpace: 'nowrap',
          }}
        >
          {formatRange(page, rowsPerPage, entries.length)}
        </Typography>
        <IconButton
          disabled={page <= 0}
          onClick={(event) => onPageChange(event, page - 1)}
          sx={{
            color: 'text.secondary',
            p: { xs: 0.5, md: 0.35 },
            '&:not(:disabled):hover': {
              bgcolor: 'rgba(24,189,242,0.09)',
              color: 'primary.main',
            },
          }}
        >
          <KeyboardArrowLeft sx={{ fontSize: { xs: 24, md: 21 } }} />
        </IconButton>
        <IconButton
          disabled={page >= maxPage}
          onClick={(event) => onPageChange(event, page + 1)}
          sx={{
            color: 'primary.main',
            p: { xs: 0.5, md: 0.35 },
            '&:disabled': { color: 'text.disabled' },
            '&:not(:disabled):hover': {
              bgcolor: 'rgba(24,189,242,0.09)',
            },
          }}
        >
          <KeyboardArrowRight sx={{ fontSize: { xs: 24, md: 21 } }} />
        </IconButton>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'rgba(2,16,27,0.54)',
          border: (t) => `1px solid ${t.palette.divider}`,
          borderRadius: 1.2,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'grid' }}>
          {paginatedEntries.map((entry, index) => (
            <Box
              key={entry.id}
              sx={{
                borderBottom: (t) => `1px solid ${t.palette.divider}`,
                display: 'grid',
                gap: 1.1,
                p: 2,
              }}
            >
              <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.2 }}>
                <Avatar
                  sx={{
                    ...getAddressBookAvatarSx(
                      getAddressBookAvatarColor(
                        `${entry.name}-${entry.address}`,
                        page * rowsPerPage + index
                      )
                    ),
                    fontSize: 16,
                    fontWeight: 800,
                    height: 42,
                    width: 42,
                  }}
                >
                  {getInitial(entry.name)}
                </Avatar>
                <Typography sx={{ ...cellTextSx, color: 'text.primary' }}>
                  {entry.name || '-'}
                </Typography>
                {renderActions(entry)}
              </Box>
              <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.65 }}>
                <Typography
                  sx={{
                    ...cellTextSx,
                    color: 'text.secondary',
                    fontWeight: 700,
                  }}
                >
                  {cropString(entry.address, 22)}
                </Typography>
                <Tooltip
                  title={
                    copiedId === entry.id
                      ? t('core:address_book_copied', {
                          postProcess: 'capitalizeFirstChar',
                        })
                      : t('core:address_book_copy', {
                          postProcess: 'capitalizeFirstChar',
                        })
                  }
                  placement="top"
                >
                  <IconButton
                    size="small"
                    onClick={() => handleCopy(entry.address, entry.id)}
                    sx={{
                      color:
                        copiedId === entry.id
                          ? 'success.main'
                          : 'text.secondary',
                      p: 0.35,
                    }}
                  >
                    <ContentCopy sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography
                sx={{
                  ...cellTextSx,
                  color: entry.note ? 'text.secondary' : 'text.disabled',
                  fontWeight: 600,
                }}
              >
                {entry.note || '-'}
              </Typography>
            </Box>
          ))}
        </Box>
        {footer}
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'rgba(2,16,27,0.54)',
        border: (t) => `1px solid ${t.palette.divider}`,
        borderRadius: 1.2,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.025)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ overflowX: 'auto' }}>
        <Box sx={{ minWidth: 760 }}>
          <Box
            aria-hidden
            sx={{
              alignItems: 'center',
              borderBottom: (t) => `1px solid ${t.palette.divider}`,
              display: 'grid',
              gap: 1.2,
              gridTemplateColumns:
                'minmax(132px, 0.88fr) minmax(194px, 1fr) minmax(226px, 1.12fr) minmax(96px, 0.48fr)',
              minHeight: 44,
              px: 1.4,
            }}
          >
            <Typography sx={headerSx}>
              {t('core:address_book_name', {
                postProcess: 'capitalizeFirstChar',
              })}
            </Typography>
            <Typography sx={headerSx}>
              {t('core:address_book_address', {
                postProcess: 'capitalizeFirstChar',
              })}
            </Typography>
            <Typography sx={headerSx}>
              {t('core:address_book_note', {
                postProcess: 'capitalizeFirstChar',
              })}
            </Typography>
            <Typography sx={{ ...headerSx, textAlign: 'right' }}>
              {t('core:address_book_actions', {
                postProcess: 'capitalizeFirstChar',
              })}
            </Typography>
          </Box>

          {paginatedEntries.map((entry, index) => (
            <Box
              key={entry.id}
              sx={{
                alignItems: 'center',
                borderBottom: (t) => `1px solid ${t.palette.divider}`,
                display: 'grid',
                gap: 1.2,
                gridTemplateColumns:
                  'minmax(132px, 0.88fr) minmax(194px, 1fr) minmax(226px, 1.12fr) minmax(96px, 0.48fr)',
                minHeight: 54,
                px: 1.4,
                transition: 'background-color 150ms ease',
                '&:hover': {
                  bgcolor: 'rgba(24,189,242,0.035)',
                },
              }}
            >
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  gap: 0.85,
                  minWidth: 0,
                }}
              >
                <Avatar
                  sx={{
                    ...getAddressBookAvatarSx(
                      getAddressBookAvatarColor(
                        `${entry.name}-${entry.address}`,
                        page * rowsPerPage + index
                      )
                    ),
                    fontSize: 13,
                    fontWeight: 800,
                    height: 28,
                    width: 28,
                  }}
                >
                  {getInitial(entry.name)}
                </Avatar>
                <Tooltip title={entry.name || EMPTY_STRING} placement="top">
                  <Typography sx={{ ...cellTextSx, color: 'text.primary' }}>
                    {entry.name || '-'}
                  </Typography>
                </Tooltip>
              </Box>

              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  gap: 1,
                  minWidth: 0,
                }}
              >
                <Tooltip title={entry.address} placement="top">
                  <Typography
                    sx={{
                      ...cellTextSx,
                      color: 'text.secondary',
                      fontWeight: 800,
                    }}
                  >
                    {cropString(entry.address, 24)}
                  </Typography>
                </Tooltip>
                <Tooltip
                  title={
                    copiedId === entry.id
                      ? t('core:address_book_copied', {
                          postProcess: 'capitalizeFirstChar',
                        })
                      : t('core:address_book_copy', {
                          postProcess: 'capitalizeFirstChar',
                        })
                  }
                  placement="top"
                >
                  <IconButton
                    size="small"
                    onClick={() => handleCopy(entry.address, entry.id)}
                    sx={{
                      color:
                        copiedId === entry.id
                          ? 'success.main'
                          : 'text.secondary',
                      flexShrink: 0,
                      p: 0.35,
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    <ContentCopy sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>

              <Tooltip title={entry.note || EMPTY_STRING} placement="top">
                <Typography
                  sx={{
                    ...cellTextSx,
                    color: entry.note ? 'text.secondary' : 'text.disabled',
                    fontWeight: 800,
                  }}
                >
                  {entry.note ? cropString(entry.note, 34) : '-'}
                </Typography>
              </Tooltip>
              {renderActions(entry)}
            </Box>
          ))}
        </Box>
      </Box>
      {footer}
    </Paper>
  );
};
