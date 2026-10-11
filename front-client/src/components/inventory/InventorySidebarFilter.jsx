/* eslint-disable react/prop-types */
import * as React from 'react';
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputBase,
  Paper,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const DEFAULT_FILTERS = {
  titleType: [],
  odometer: [0, 250000],
  year: [],
  condition: [],
  vehicleType: [],
  make: [],
  model: [],
  engine: [],
  transmission: [],
  fuelType: [],
  drivetrain: [],
};

const DEFAULT_OPTIONS = {};
const DEFAULT_COUNTS = {};
const DEFAULT_ODOMETER = [0, 250000];
const EMPTY_ARRAY = [];

const INITIAL_EXPANDED = {
  titleType: true,
  odometer: true,
  year: false,
  condition: false,
  vehicleType: false,
  make: true,
  model: false,
  engine: false,
  transmission: false,
  fuelType: false,
  drivetrain: false,
};

function SectionHeader({ title, expanded, onToggleExpanded, onReset }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.25,
        userSelect: 'none',
      }}
    >
      <Box
        onClick={onToggleExpanded}
        sx={{
          flex: 1,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '0.875rem',
            color: '#1E293B',
          }}
        >
          {title}
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          size="small"
          variant="text"
          disableRipple
          aria-label={`Reset ${title}`}
          onClick={(e) => {
            e.stopPropagation();
            if (onReset) onReset();
          }}
          sx={{
            color: '#0055E5',
            fontSize: '0.8rem',
            fontWeight: 500,
            minWidth: { xs: 44, md: 'auto' },
            minHeight: { xs: 44, md: 'auto' },
            p: 0.25,
            textTransform: 'none',
            '&:hover': {
              bgcolor: 'transparent',
              textDecoration: 'underline',
            },
          }}
        >
          Reset
        </Button>
        <IconButton
          size="small"
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${title}`}
          aria-expanded={Boolean(expanded)}
          onClick={onToggleExpanded}
          sx={{
            p: 0.25,
            minWidth: { xs: 44, md: 'auto' },
            minHeight: { xs: 44, md: 'auto' },
            color: '#64748B',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          {expanded ? (
            <RemoveIcon sx={{ fontSize: 18 }} />
          ) : (
            <AddIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>
      </Stack>
    </Box>
  );
}

function CheckboxSection({
  title,
  sectionKey,
  options = EMPTY_ARRAY,
  selected = EMPTY_ARRAY,
  expanded = false,
  onToggleExpanded,
  onReset,
  onToggleValue,
  searchable = false,
  searchLabel,
  scrollable = false,
}) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const safeOptions = options || EMPTY_ARRAY;

  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchQuery.trim()) {
      return safeOptions;
    }
    const query = searchQuery.toLowerCase().trim();
    return safeOptions.filter((opt) =>
      (opt.label || '').toLowerCase().includes(query)
    );
  }, [safeOptions, searchable, searchQuery]);

  const handleReset = () => {
    setSearchQuery('');
    if (onReset) onReset();
  };

  return (
    <Box sx={{ py: 0.5 }}>
      <SectionHeader
        title={title}
        expanded={expanded}
        onToggleExpanded={onToggleExpanded}
        onReset={handleReset}
      />
      <Collapse in={Boolean(expanded)}>
        <Box sx={{ pt: 0.5, pb: 1.5 }}>
          {searchable ? (
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 1.25,
                py: 0.35,
                mb: 1.25,
                border: '1px solid #CBD5E1',
                borderRadius: 1,
                bgcolor: '#FFFFFF',
              }}
            >
              <InputBase
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                inputProps={{
                  'aria-label': searchLabel || `Search ${title.toLowerCase()}`,
                }}
                sx={{ flex: 1, fontSize: '0.85rem' }}
              />
              <SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
            </Paper>
          ) : null}

          {filteredOptions.length === 0 ? (
            <Typography sx={{ fontSize: '0.8rem', color: '#64748B', py: 0.5 }}>
              No options available
            </Typography>
          ) : (
            <FormGroup
              sx={
                scrollable
                  ? {
                      maxHeight: 240,
                      overflowY: 'auto',
                      pr: 0.5,
                    }
                  : undefined
              }
            >
              {filteredOptions.map((opt) => {
                const isChecked = (selected || EMPTY_ARRAY).includes(opt.value);
                const countFormatted =
                  typeof opt.count === 'number'
                    ? opt.count.toLocaleString()
                    : (opt.count ?? 0).toLocaleString();
                const labelText = `${opt.label} (${countFormatted})`;
                return (
                  <FormControlLabel
                    key={String(opt.value)}
                    control={
                      <Checkbox
                        size="small"
                        checked={isChecked}
                        onChange={() => onToggleValue(opt.value, sectionKey)}
                        sx={{
                          color: '#CBD5E1',
                          '&.Mui-checked': { color: '#0055E5' },
                          py: 0.35,
                        }}
                      />
                    }
                    label={
                      <Typography
                        sx={{ fontSize: '0.85rem', color: '#334155' }}
                      >
                        {labelText}
                      </Typography>
                    }
                    sx={{ ml: 0, mr: 0 }}
                  />
                );
              })}
            </FormGroup>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

const POST_ODOMETER_SECTIONS = [
  {
    title: 'Year',
    sectionKey: 'year',
  },
  {
    title: 'Vehicle condition type',
    sectionKey: 'condition',
  },
  {
    title: 'Vehicle type',
    sectionKey: 'vehicleType',
  },
  {
    title: 'Make',
    sectionKey: 'make',
    scrollable: true,
/* remove  searchable, searchLabel, and scrollable for Make */
  },
  {
    title: 'Model',
    sectionKey: 'model',
    searchable: true,
    searchLabel: 'Search models',
    scrollable: true,
  },
  {
    title: 'Engine type',
    sectionKey: 'engine',
    searchable: true,
    searchLabel: 'Search engines',
    scrollable: true,
  },
  {
    title: 'Transmission',
    sectionKey: 'transmission',
  },
  {
    title: 'Fuel type',
    sectionKey: 'fuelType',
  },
  {
    title: 'Drive train',
    sectionKey: 'drivetrain',
  },
];

export default function InventorySidebarFilter({
  filters = DEFAULT_FILTERS,
  onFilterChange,
  onResetSection,
  onResetAll,
  counts = DEFAULT_COUNTS,
  options = DEFAULT_OPTIONS,
}) {
  void counts;

  const [expanded, setExpanded] = React.useState(INITIAL_EXPANDED);

  const safeFilters = filters || DEFAULT_FILTERS;
  const safeOptions = options || DEFAULT_OPTIONS;

  const filterOdo = safeFilters.odometer;
  const odoMin = filterOdo?.[0];
  const odoMax = filterOdo?.[1];

  const [localOdometer, setLocalOdometer] = React.useState(
    filterOdo && filterOdo.length === 2 ? filterOdo : DEFAULT_ODOMETER
  );

  React.useEffect(() => {
    if (odoMin !== undefined && odoMax !== undefined) {
      setLocalOdometer([odoMin, odoMax]);
    }
  }, [odoMin, odoMax]);

  const toggleSection = (sectionKey) => {
    setExpanded((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const handleToggleValue = (sectionKey, value) => {
    const current = safeFilters[sectionKey] || EMPTY_ARRAY;
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    if (onFilterChange) {
      onFilterChange(sectionKey, next);
    }
  };

  const handleResetSection = (sectionKey) => {
    if (sectionKey === 'odometer') {
      setLocalOdometer(DEFAULT_ODOMETER);
    }
    if (onResetSection) {
      onResetSection(sectionKey);
    } else if (onFilterChange) {
      onFilterChange(
        sectionKey,
        sectionKey === 'odometer' ? DEFAULT_ODOMETER : EMPTY_ARRAY
      );
    }
  };

  const handleApplyOdometer = () => {
    let [minVal, maxVal] = localOdometer;
    if (typeof minVal !== 'number' || Number.isNaN(minVal)) minVal = 0;
    if (typeof maxVal !== 'number' || Number.isNaN(maxVal)) maxVal = 250000;
    minVal = Math.max(0, Math.min(250000, minVal));
    maxVal = Math.max(0, Math.min(250000, maxVal));
    const orderedPair = minVal > maxVal ? [maxVal, minVal] : [minVal, maxVal];
    setLocalOdometer(orderedPair);
    if (onFilterChange) {
      onFilterChange('odometer', orderedPair);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        bgcolor: '#FFFFFF',
        borderRadius: 2,
        border: '1px solid #E2E8F0',
        p: 2,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Top Header Row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1.5,
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontWeight: 700,
            fontSize: '1.125rem',
            color: '#0F172A',
          }}
        >
          Filters
        </Typography>
        {onResetAll ? (
          <Button
            size="small"
            variant="text"
            disableRipple
            onClick={() => {
              setLocalOdometer(DEFAULT_ODOMETER);
              onResetAll();
            }}
            sx={{
              color: '#0055E5',
              fontSize: '0.85rem',
              fontWeight: 500,
              minWidth: 'auto',
              p: 0,
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'transparent',
                textDecoration: 'underline',
              },
            }}
          >
            Clear all
          </Button>
        ) : null}
      </Box>

      <Divider sx={{ borderColor: '#E2E8F0', mb: 1 }} />

      {/* 1. Vehicle title type */}
      <CheckboxSection
        title="Vehicle title type"
        sectionKey="titleType"
        options={safeOptions.titleType}
        selected={safeFilters.titleType}
        expanded={Boolean(expanded.titleType)}
        onToggleExpanded={() => toggleSection('titleType')}
        onReset={() => handleResetSection('titleType')}
        onToggleValue={(val) => handleToggleValue('titleType', val)}
        searchable
        searchLabel="Search title types"
      />

      <Divider sx={{ borderColor: '#E2E8F0' }} />

      {/* 2. Odometer */}
      <Box sx={{ py: 0.5 }}>
        <SectionHeader
          title="Odometer"
          expanded={expanded.odometer}
          onToggleExpanded={() => toggleSection('odometer')}
          onReset={() => handleResetSection('odometer')}
        />
        <Collapse in={Boolean(expanded.odometer)}>
          <Box sx={{ pt: 1, pb: 1.5 }}>
            {/* Min and Max boxes */}
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mb: 1.25 }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  component="label"
                  htmlFor="odometer-min"
                  sx={{
                    fontSize: '0.75rem',
                    color: '#64748B',
                    mb: 0.35,
                    display: 'block',
                  }}
                >
                  Min
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    px: 1,
                    py: 0.5,
                    border: '1px solid #CBD5E1',
                    borderRadius: 1,
                  }}
                >
                  <InputBase
                    id="odometer-min"
                    type="number"
                    value={localOdometer[0] ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') {
                        setLocalOdometer([0, localOdometer[1]]);
                        return;
                      }
                      const num = Number(raw);
                      const val = Number.isNaN(num) ? 0 : Math.max(0, num);
                      setLocalOdometer([val, localOdometer[1]]);
                    }}
                    inputProps={{
                      'aria-label': 'Min',
                      min: 0,
                      max: 250000,
                    }}
                    sx={{ fontSize: '0.85rem', width: '100%' }}
                  />
                </Paper>
              </Box>

              <Typography sx={{ color: '#94A3B8', pt: 2, fontWeight: 700 }}>
                —
              </Typography>

              <Box sx={{ flex: 1 }}>
                <Typography
                  component="label"
                  htmlFor="odometer-max"
                  sx={{
                    fontSize: '0.75rem',
                    color: '#64748B',
                    mb: 0.35,
                    display: 'block',
                  }}
                >
                  Max
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    px: 1,
                    py: 0.5,
                    border: '1px solid #CBD5E1',
                    borderRadius: 1,
                  }}
                >
                  <InputBase
                    id="odometer-max"
                    type="number"
                    value={localOdometer[1] ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') {
                        setLocalOdometer([localOdometer[0], 250000]);
                        return;
                      }
                      const num = Number(raw);
                      const val =
                        Number.isNaN(num) ? 250000 : Math.min(250000, num);
                      setLocalOdometer([localOdometer[0], val]);
                    }}
                    inputProps={{
                      'aria-label': 'Max',
                      min: 0,
                      max: 250000,
                    }}
                    sx={{ fontSize: '0.85rem', width: '100%' }}
                  />
                </Paper>
              </Box>
            </Stack>

            {/* Slider labels */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: '#0055E5',
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              <span>{(localOdometer[0] ?? 0).toLocaleString()} Miles</span>
              <span>
                {(localOdometer[1] ?? 250000) >= 250000
                  ? '250,000+ Miles'
                  : `${(localOdometer[1] ?? 250000).toLocaleString()} Miles`}
              </span>
            </Box>

            {/* Dual Slider */}
            <Slider
              getAriaLabel={(index) => (index === 0 ? 'Minimum odometer' : 'Maximum odometer')}
              getAriaValueText={(val) => (val >= 250000 ? '250,000+ miles' : `${val.toLocaleString()} miles`)}
              value={[
                Math.min(localOdometer[0] ?? 0, localOdometer[1] ?? 250000),
                Math.max(localOdometer[0] ?? 0, localOdometer[1] ?? 250000),
              ]}
              onChange={(e, newVal) => setLocalOdometer(newVal)}
              min={0}
              max={250000}
              step={5000}
              sx={{
                color: '#0055E5',
                py: 1,
                '& .MuiSlider-thumb': {
                  width: 18,
                  height: 18,
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #0055E5',
                  '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                    boxShadow: '0 0 0 6px rgba(0, 85, 229, 0.16)',
                  },
                },
                '& .MuiSlider-track': {
                  height: 4,
                },
                '& .MuiSlider-rail': {
                  height: 4,
                  bgcolor: '#CBD5E1',
                },
              }}
            />

            {/* Apply Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                variant="contained"
                disableElevation
                size="small"
                onClick={handleApplyOdometer}
                sx={{
                  bgcolor: '#0055E5',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  px: 3,
                  py: 0.6,
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: '#0043B8',
                  },
                }}
              >
                Apply
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* 3–11 Remaining Checkbox Sections */}
      {POST_ODOMETER_SECTIONS.map((sec) => (
        <React.Fragment key={sec.sectionKey}>
          <Divider sx={{ borderColor: '#E2E8F0' }} />
          <CheckboxSection
            title={sec.title}
            sectionKey={sec.sectionKey}
            options={safeOptions[sec.sectionKey]}
            selected={safeFilters[sec.sectionKey]}
            expanded={Boolean(expanded[sec.sectionKey])}
            onToggleExpanded={() => toggleSection(sec.sectionKey)}
            onReset={() => handleResetSection(sec.sectionKey)}
            onToggleValue={(val) => handleToggleValue(sec.sectionKey, val)}
            searchable={sec.searchable}
            searchLabel={sec.searchLabel}
            scrollable={sec.scrollable}
          />
        </React.Fragment>
      ))}
    </Paper>
  );
}
