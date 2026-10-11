/* eslint-disable react/prop-types */
import { memo } from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { conditionColor } from './conditionColor';

const ConditionReport = ({ vehicle }) => {
  const notes = Array.isArray(vehicle.damage_notes) ? vehicle.damage_notes.filter(Boolean) : [];
  const grade = vehicle.condition_grade;

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5, flexWrap: 'wrap', rowGap: 1 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
          Condition report
        </Typography>
        <Chip
          size="small"
          color={conditionColor(grade)}
          label={Number.isFinite(grade) ? `Grade ${grade.toFixed(1)} / 5.0` : 'Grade unavailable'}
          sx={{ fontWeight: 700 }}
        />
      </Stack>
      <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 2 }}>
        {vehicle.condition_report?.trim() || 'No condition report provided.'}
      </Typography>
      <Typography variant="subtitle2" component="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
        Damage notes
      </Typography>
      {notes.length ? (
        <Box component="ul" sx={{ m: 0, pl: 2.5, '& li': { mb: 0.5, fontSize: '0.875rem' } }}>
          {notes.map((note, i) => (
            <li key={`${note}-${i}`}>{note}</li>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No damage reported.
        </Typography>
      )}
    </Paper>
  );
};

export default memo(ConditionReport);
