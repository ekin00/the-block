/* eslint-disable react/prop-types */
import * as React from 'react';
import {
  Box,
  Button,
  Paper,
  InputBase,
  InputAdornment,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  ClickAwayListener,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

export default function InventorySearchBar({
  value = '',
  onChange,
  onSearch,
  suggestions = [],
  placeholder = 'Search by make, model, year, VIN...',
}) {
  const [open, setOpen] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const inputRef = React.useRef(null);

  // Filter suggestions based on current value
  const trimmed = (value || '').trim().toLowerCase();
  const filteredSuggestions = React.useMemo(() => {
    if (!trimmed) return [];
    const unique = new Set();
    const results = [];
    for (const item of suggestions) {
      const lower = item.toLowerCase();
      if (lower.includes(trimmed) && !unique.has(lower)) {
        unique.add(lower);
        results.push(item);
      }
      if (results.length >= 8) break;
    }
    return results;
  }, [suggestions, trimmed]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    setOpen(true);
    setFocusedIndex(-1);
  };

  const handleSelectSuggestion = (suggestion) => {
    onChange(suggestion);
    setOpen(false);
    if (onSearch) {
      onSearch(suggestion);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setFocusedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filteredSuggestions.length) {
        handleSelectSuggestion(filteredSuggestions[focusedIndex]);
      } else {
        setOpen(false);
        if (onSearch) {
          onSearch(value);
        }
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setOpen(false);
    if (onSearch) {
      onSearch('');
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const renderHighlightedText = (text, query) => {
    if (!query) return text;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const idx = lowerText.indexOf(lowerQuery);
    if (idx === -1) return text;

    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + query.length);
    const after = text.slice(idx + query.length);

    return (
      <span>
        {before}
        <strong style={{ fontWeight: 800, color: '#0F172A' }}>{match}</strong>
        {after}
      </span>
    );
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          width: '100%',
          maxWidth: 760,
          mb: 2.5,
        }}
      >
        {/* Search Input Box with Relative Positioning for Dropdown */}
        <Box sx={{ position: 'relative', flex: 1 }}>
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              px: 1.5,
              py: 0.5,
              border: '1.5px solid',
              borderColor: open && filteredSuggestions.length ? 'primary.main' : '#CBD5E1',
              borderRadius: 1.5,
              bgcolor: '#FFFFFF',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                borderColor: '#94A3B8',
              },
              '&:focus-within': {
                borderColor: 'primary.main',
                boxShadow: '0 0 0 3px rgba(0, 85, 229, 0.12)',
              },
            }}
          >
            <SearchIcon sx={{ color: '#64748B', mr: 1, fontSize: 22, flexShrink: 0 }} />
            <InputBase
              inputRef={inputRef}
              value={value}
              onChange={handleInputChange}
              onFocus={() => {
                if (filteredSuggestions.length > 0) setOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              sx={{
                flex: 1,
                minWidth: 0,
                fontSize: '0.95rem',
                color: '#1E293B',
                '& input': {
                  pr: 1,
                },
                '& input::placeholder': {
                  color: '#94A3B8',
                  opacity: 1,
                },
              }}
            />
            {value ? (
              <IconButton
                size="small"
                onClick={handleClear}
                aria-label="clear search"
                sx={{
                  color: '#94A3B8',
                  p: 0.5,
                  ml: 0.5,
                  flexShrink: 0,
                  '&:hover': { color: '#475569', bgcolor: 'rgba(0,0,0,0.05)' },
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            ) : null}
          </Paper>

          {/* Suggestions Dropdown */}
          {open && filteredSuggestions.length > 0 && (
            <Paper
              elevation={4}
              sx={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                width: '100%',
                maxHeight: 280,
                overflowY: 'auto',
                zIndex: 1300,
                borderRadius: 1.5,
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                bgcolor: '#FFFFFF',
                py: 0.5,
              }}
            >
              <List disablePadding>
                {filteredSuggestions.map((suggestion, index) => (
                  <ListItemButton
                    key={suggestion}
                    selected={index === focusedIndex}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    sx={{
                      py: 1,
                      px: 2,
                      fontSize: '0.9rem',
                      color: '#334155',
                      transition: 'background-color 0.15s ease',
                      '&:hover': {
                        bgcolor: '#F1F5F9',
                      },
                      '&.Mui-selected': {
                        bgcolor: '#E2E8F0',
                      },
                    }}
                  >
                    <ListItemText
                      primary={renderHighlightedText(suggestion, trimmed)}
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        color: 'text.primary',
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          )}
        </Box>

        {/* Search Inventory Button */}
        <Button
          variant="contained"
          disableElevation
          onClick={() => {
            setOpen(false);
            if (onSearch) onSearch(value);
          }}
          sx={{
            bgcolor: '#F5A623',
            color: '#111827',
            fontWeight: 700,
            fontSize: '0.9rem',
            textTransform: 'none',
            px: 2.75,
            py: 1.1,
            borderRadius: 1.5,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 6px rgba(245, 166, 35, 0.28)',
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: '#E09216',
              boxShadow: '0 4px 10px rgba(245, 166, 35, 0.4)',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
          }}
        >
          Search inventory
        </Button>
      </Box>
    </ClickAwayListener>
  );
}
