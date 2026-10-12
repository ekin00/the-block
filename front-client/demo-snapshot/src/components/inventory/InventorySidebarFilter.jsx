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
  InputAdornment,
  InputBase,
  Paper,
  Slider,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export default function InventorySidebarFilter({
  filters,
  onFilterChange,
  onResetSection,
  onResetAll,
  counts = {},
}) {
  // Controlled or internal expand/collapse states
  const [expanded, setExpanded] = React.useState({
    titleType: true,
    odometer: true,
    year: false,
    condition: false,
    vehicleType: false,
    make: false,
    model: false,
    engine: false,
    transmission: false,
    fuelType: false,
    drivetrain: false,
  });

  const [titleSearch, setTitleSearch] = React.useState('');
  const [makeSearch, setMakeSearch] = React.useState('');
  const [modelSearch, setModelSearch] = React.useState('');

  // Local state for odometer slider until "Apply" is clicked
  const [localOdometer, setLocalOdometer] = React.useState(
    filters.odometer || [0, 250000]
  );

  React.useEffect(() => {
    if (filters.odometer) {
      setLocalOdometer(filters.odometer);
    }
  }, [filters.odometer]);

  const toggleSection = (section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const renderSectionHeader = (title, sectionKey, onReset) => {
    const isOpen = expanded[sectionKey];
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
          onClick={() => toggleSection(sectionKey)}
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
            onClick={(e) => {
              e.stopPropagation();
              if (onReset) onReset();
              else if (onResetSection) onResetSection(sectionKey);
            }}
            sx={{
              color: '#0055E5',
              fontSize: '0.8rem',
              fontWeight: 500,
              minWidth: 'auto',
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
            onClick={() => toggleSection(sectionKey)}
            sx={{
              p: 0.25,
              color: '#64748B',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {isOpen ? (
              <RemoveIcon sx={{ fontSize: 18 }} />
            ) : (
              <AddIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Stack>
      </Box>
    );
  };

  // Title types options
  const titleOptions = [
    { key: 'Clean Title', label: 'Clean Title (100+)' },
    { key: 'Non Repairable', label: 'Non Repairable (100+)' },
    { key: 'Salvage Title', label: 'Salvage Title (1,000+)' },
  ];

  const filteredTitles = titleOptions.filter((opt) =>
    opt.label.toLowerCase().includes(titleSearch.toLowerCase())
  );

  // Year options
  const yearOptions = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];

  // Vehicle types
  const vehicleTypeOptions = ['SUV', 'Sedan', 'Hatchback', 'Truck', 'Coupe', 'Van'];

  // Condition options
  const conditionOptions = [
    { key: '4', label: 'Grade 4.0+ (Excellent)' },
    { key: '3', label: 'Grade 3.0 – 3.9 (Good)' },
    { key: '2', label: 'Grade 2.0 – 2.9 (Fair)' },
    { key: '1', label: 'Grade < 2.0 (Needs Repair)' },
  ];

  // Makes
  const makeOptions = ['Kia', 'Volkswagen', 'GMC', 'Toyota', 'Mazda', 'Chevrolet', 'Ford', 'Honda'];
  const filteredMakes = makeOptions.filter((m) =>
    m.toLowerCase().includes(makeSearch.toLowerCase())
  );

  // Models
  const modelOptions = ['Telluride', 'Golf GTI', 'Terrain', 'Forte', 'Camry', 'Corolla', 'RAV4', 'CX-5', 'Equinox'];
  const filteredModels = modelOptions.filter((m) =>
    m.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const transmissionOptions = ['Automatic', 'Manual', 'Intelligent Variable (IVT)'];
  const fuelOptions = ['Gasoline', 'Hybrid', 'Electric', 'Diesel'];
  const drivetrainOptions = ['AWD', 'FWD', 'RWD', '4WD'];
  const engineOptions = ['4-Cylinder', 'V6 GDI', 'Turbocharged TSI', 'Turbo 4-Cylinder'];

  const handleCheckboxToggle = (category, value) => {
    const current = filters[category] || [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onFilterChange(category, next);
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
  
      <Divider sx={{ borderColor: '#E2E8F0', mb: 1 }} />

      {/* 1. Vehicle title type */}
      <Box sx={{ py: 0.5 }}>
        {renderSectionHeader('Vehicle title type', 'titleType', () =>
          onFilterChange('titleType', [])
        )}
        <Collapse in={expanded.titleType}>
          <Box sx={{ pt: 0.5, pb: 1.5 }}>
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
                value={titleSearch}
                onChange={(e) => setTitleSearch(e.target.value)}
                placeholder="Search..."
                sx={{ flex: 1, fontSize: '0.85rem' }}
              />
              <SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
            </Paper>

            <FormGroup>
              {filteredTitles.map((opt) => (
                <FormControlLabel
                  key={opt.key}
                  control={
                    <Checkbox
                      size="small"
                      checked={(filters.titleType || []).includes(opt.key)}
                      onChange={() => handleCheckboxToggle('titleType', opt.key)}
                      sx={{
                        color: '#CBD5E1',
                        '&.Mui-checked': { color: '#0055E5' },
                        py: 0.35,
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '0.85rem', color: '#334155' }}>
                      {opt.label}
                    </Typography>
                  }
                  sx={{ ml: 0, mr: 0 }}
                />
              ))}
            </FormGroup>
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ borderColor: '#E2E8F0' }} />

      {/* 2. Odometer */}
      <Box sx={{ py: 0.5 }}>
        {renderSectionHeader('Odometer', 'odometer', () => {
          setLocalOdometer([0, 250000]);
          onFilterChange('odometer', [0, 250000]);
        })}
        <Collapse in={expanded.odometer}>
          <Box sx={{ pt: 1, pb: 1.5 }}>
            {/* Min and Max boxes */}
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.25 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B', mb: 0.35 }}>
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
                    type="number"
                    value={localOdometer[0]}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value));
                      setLocalOdometer([val, localOdometer[1]]);
                    }}
                    sx={{ fontSize: '0.85rem', width: '100%' }}
                  />
                </Paper>
              </Box>

              <Typography sx={{ color: '#94A3B8', pt: 2, fontWeight: 700 }}>
                —
              </Typography>

              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B', mb: 0.35 }}>
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
                    type="number"
                    value={localOdometer[1]}
                    onChange={(e) => {
                      const val = Math.min(250000, Number(e.target.value));
                      setLocalOdometer([localOdometer[0], val]);
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
              <span>{localOdometer[0].toLocaleString()} Miles</span>
              <span>{localOdometer[1] >= 250000 ? '250,000+ Miles' : `${localOdometer[1].toLocaleString()} Miles`}</span>
            </Box>

            {/* Dual Slider */}
            <Slider
              value={localOdometer}
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
                onClick={() => onFilterChange('odometer', localOdometer)}
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

      <Divider sx={{ borderColor: '#E2E8F0' }} />

      {/* 3. Year */}
      <Box sx={{ py: 0.5 }}>
        {renderSectionHeader('Year', 'year', () => onFilterChange('year', []))}
        <Collapse in={expanded.year}>
          <Box sx={{ pt: 0.5, pb: 1.5 }}>
            <FormGroup>
              {yearOptions.map((yr) => (
                <FormControlLabel
                  key={yr}
                  control={
                    <Checkbox
                      size="small"
                      checked={(filters.year || []).includes(yr)}
                      onChange={() => handleCheckboxToggle('year', yr)}
                      sx={{
                        color: '#CBD5E1',
                        '&.Mui-checked': { color: '#0055E5' },
                        py: 0.35,
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '0.85rem', color: '#334155' }}>
                      {yr}
                    </Typography>
                  }
                  sx={{ ml: 0, mr: 0 }}
                />
              ))}
            </FormGroup>
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ borderColor: '#E2E8F0' }} />

      {/* 4. Vehicle condition type */}
      <Box sx={{ py: 0.5 }}>
        {renderSectionHeader('Vehicle condition type', 'condition', () =>
          onFilterChange('condition', [])
        )}
        <Collapse in={expanded.condition}>
          <Box sx={{ pt: 0.5, pb: 1.5 }}>
            <FormGroup>
              {conditionOptions.map((c) => (
                <FormControlLabel
                  key={c.key}
                  control={
                    <Checkbox
                      size="small"
                      checked={(filters.condition || []).includes(c.key)}
                      onChange={() => handleCheckboxToggle('condition', c.key)}
                      sx={{
                        color: '#CBD5E1',
                        '&.Mui-checked': { color: '#0055E5' },
                        py: 0.35,
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '0.85rem', color: '#334155' }}>
                      {c.label}
                    </Typography>
                  }
                  sx={{ ml: 0, mr: 0 }}
                />
              ))}
            </FormGroup>
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ borderColor: '#E2E8F0' }} />

      {/* 5. Vehicle type */}
      <Box sx={{ py: 0.5 }}>
        {renderSectionHeader('Vehicle type', 'vehicleType', () =>
          onFilterChange('vehicleType', [])
        )}
        <Collapse in={expanded.vehicleType}>
          <Box sx={{ pt: 0.5, pb: 1.5 }}>
            <FormGroup>
              {vehicleTypeOptions.map((vt) => (
                <FormControlLabel
                  key={vt}
                  control={
                    <Checkbox
                      size="small"
                      checked={(filters.vehicleType || []).includes(vt)}
                      onChange={() => handleCheckboxToggle('vehicleType', vt)}
                      sx={{
                        color: '#CBD5E1',
                        '&.Mui-checked': { color: '#0055E5' },
                        py: 0.35,
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '0.85rem', color: '#334155' }}>
                      {vt}
                    </Typography>
                  }
                  sx={{ ml: 0, mr: 0 }}
                />
              ))}
            </FormGroup>
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ borderColor: '#E2E8F0' }} />

      {/* 6. Make */}
      <Box sx={{ py: 0.5 }}>
        {renderSectionHeader('Make', 'make', () => onFilterChange('make', []))}
        <Collapse in={expanded.make}>
          <Box sx={{ pt: 0.5, pb: 1.5 }}>
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
              }}
            >
              <InputBase
                value={makeSearch}
                onChange={(e) => setMakeSearch(e.target.value)}
                placeholder="Search make..."
                sx={{ flex: 1, fontSize: '0.85rem' }}
              />
              <SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
            </Paper>

            <FormGroup>
              {filteredMakes.map((m) => (
                <FormControlLabel
                  key={m}
                  control={
                    <Checkbox
                      size="small"
                      checked={(filters.make || []).includes(m)}
                      onChange={() => handleCheckboxToggle('make', m)}
                      sx={{
                        color: '#CBD5E1',
                        '&.Mui-checked': { color: '#0055E5' },
                        py: 0.35,
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '0.85rem', color: '#334155' }}>
                      {m}
                    </Typography>
                  }
                  sx={{ ml: 0, mr: 0 }}
                />
              ))}
            </FormGroup>
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ borderColor: '#E2E8F0' }} />

      {/* 7. Model */}
      <Box sx={{ py: 0.5 }}>
        {renderSectionHeader('Model', 'model', () => onFilterChange('model', []))}
        <Collapse in={expanded.model}>
          <Box sx={{ pt: 0.5, pb: 1.5 }}>
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
              }}
            >
              <InputBase
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                placeholder="Search model..."
                sx={{ flex: 1, fontSize: '0.85rem' }}
              />
              <SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
            </Paper>

            <FormGroup>
              {filteredModels.map((mod) => (
                <FormControlLabel
                  key={mod}
                  control={
                    <Checkbox
                      size="small"
                      checked={(filters.model || []).includes(mod)}
                      onChange={() => handleCheckboxToggle('model', mod)}
                      sx={{
                        color: '#CBD5E1',
                        '&.Mui-checked': { color: '#0055E5' },
                        py: 0.35,
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '0.85rem', color: '#334155' }}>
                      {mod}
                    </Typography>
                  }
                  sx={{ ml: 0, mr: 0 }}
                />
              ))}
            </FormGroup>
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ borderColor: '#E2E8F0' }} />

      {/* 8. Engine type */}
      <Box sx={{ py: 0.5 }}>
        {renderSectionHeader('Engine type', 'engine', () =>
          onFilterChange('engine', [])
        )}
        <Collapse in={expanded.engine}>
          <Box sx={{ pt: 0.5, pb: 1.5 }}>
            <FormGroup>
              {engineOptions.map((eng) => (
                <FormControlLabel
                  key={eng}
                  control={
                    <Checkbox
                      size="small"
                      checked={(filters.engine || []).includes(eng)}
                      onChange={() => handleCheckboxToggle('engine', eng)}
                      sx={{
                        color: '#CBD5E1',
                        '&.Mui-checked': { color: '#0055E5' },
                        py: 0.35,
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '0.85rem', color: '#334155' }}>
                      {eng}
                    </Typography>
                  }
                  sx={{ ml: 0, mr: 0 }}
                />
              ))}
            </FormGroup>
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ borderColor: '#E2E8F0' }} />

      {/* 9. Transmission */}
      <Box sx={{ py: 0.5 }}>
        {renderSectionHeader('Transmission', 'transmission', () =>
          onFilterChange('transmission', [])
        )}
        <Collapse in={expanded.transmission}>
          <Box sx={{ pt: 0.5, pb: 1.5 }}>
            <FormGroup>
              {transmissionOptions.map((tr) => (
                <FormControlLabel
                  key={tr}
                  control={
                    <Checkbox
                      size="small"
                      checked={(filters.transmission || []).includes(tr)}
                      onChange={() => handleCheckboxToggle('transmission', tr)}
                      sx={{
                        color: '#CBD5E1',
                        '&.Mui-checked': { color: '#0055E5' },
                        py: 0.35,
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '0.85rem', color: '#334155' }}>
                      {tr}
                    </Typography>
                  }
                  sx={{ ml: 0, mr: 0 }}
                />
              ))}
            </FormGroup>
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ borderColor: '#E2E8F0' }} />

      {/* 10. Fuel type */}
      <Box sx={{ py: 0.5 }}>
        {renderSectionHeader('Fuel type', 'fuelType', () =>
          onFilterChange('fuelType', [])
        )}
        <Collapse in={expanded.fuelType}>
          <Box sx={{ pt: 0.5, pb: 1.5 }}>
            <FormGroup>
              {fuelOptions.map((fl) => (
                <FormControlLabel
                  key={fl}
                  control={
                    <Checkbox
                      size="small"
                      checked={(filters.fuelType || []).includes(fl)}
                      onChange={() => handleCheckboxToggle('fuelType', fl)}
                      sx={{
                        color: '#CBD5E1',
                        '&.Mui-checked': { color: '#0055E5' },
                        py: 0.35,
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '0.85rem', color: '#334155' }}>
                      {fl}
                    </Typography>
                  }
                  sx={{ ml: 0, mr: 0 }}
                />
              ))}
            </FormGroup>
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ borderColor: '#E2E8F0' }} />

      {/* 11. Drive train */}
      <Box sx={{ py: 0.5 }}>
        {renderSectionHeader('Drive train', 'drivetrain', () =>
          onFilterChange('drivetrain', [])
        )}
        <Collapse in={expanded.drivetrain}>
          <Box sx={{ pt: 0.5, pb: 1.5 }}>
            <FormGroup>
              {drivetrainOptions.map((dt) => (
                <FormControlLabel
                  key={dt}
                  control={
                    <Checkbox
                      size="small"
                      checked={(filters.drivetrain || []).includes(dt)}
                      onChange={() => handleCheckboxToggle('drivetrain', dt)}
                      sx={{
                        color: '#CBD5E1',
                        '&.Mui-checked': { color: '#0055E5' },
                        py: 0.35,
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '0.85rem', color: '#334155' }}>
                      {dt}
                    </Typography>
                  }
                  sx={{ ml: 0, mr: 0 }}
                />
              ))}
            </FormGroup>
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
}
