/* eslint-disable react/prop-types */
import { Fragment, memo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { getSpecRows } from '../../features/vehicles/vehicleSpecs';

const VehicleSpecs = ({ vehicle }) => (
  <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
    <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 1.5 }}>
      Vehicle specifications
    </Typography>
    <Box
      component="dl"
      sx={{
        m: 0,
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(110px, 40%) 1fr' },
        '& dt, & dd': {
          py: 1.1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          fontSize: '0.875rem',
        },
        '& dt': { color: 'text.secondary', pr: 2 },
        '& dd': { m: 0, fontWeight: 600, textAlign: 'right', overflowWrap: 'anywhere' },
      }}
    >
      {getSpecRows(vehicle).map(([label, value]) => (
        <Fragment key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </Fragment>
      ))}
    </Box>
  </Paper>
);

export default memo(VehicleSpecs);
