/* eslint-disable react/prop-types */
import { memo, useState } from 'react';
import { Box, ButtonBase, Paper, Stack, Typography } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { placeholderImage, vehicleTitle } from '../../features/vehicles/vehicleFormat';
import { conditionBadgeBg } from './conditionColor';

/**
 * Photo gallery. Missing image lists fall back to a labelled placeholder and
 * a failed photo swaps to the placeholder once, then to a text panel, so a
 * broken URL never renders an empty frame. Thumbnails are real buttons.
 */
const VehicleGallery = ({ vehicle }) => {
  const title = vehicleTitle(vehicle);
  const images = Array.isArray(vehicle.images) && vehicle.images.length
    ? vehicle.images
    : [placeholderImage(vehicle)];
  const [activeIndex, setActiveIndex] = useState(0);
  // index -> 'fallback' | 'failed'
  const [failures, setFailures] = useState({});
  const index = Math.min(activeIndex, images.length - 1);

  const srcFor = (i) => (failures[i] ? placeholderImage(vehicle) : images[i]);
  const handleError = (i) => {
    setFailures((prev) => {
      if (prev[i] === 'failed') {
        return prev;
      }
      return { ...prev, [i]: prev[i] ? 'failed' : 'fallback' };
    });
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 3',
          borderRadius: 1.5,
          overflow: 'hidden',
          bgcolor: 'grey.900',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {failures[index] === 'failed' ? (
          <Typography sx={{ color: 'grey.300' }}>Photo unavailable</Typography>
        ) : (
          <Box
            component="img"
            src={srcFor(index)}
            alt={`${title}, photo ${index + 1} of ${images.length}`}
            onError={() => handleError(index)}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        <Box
          aria-live="polite"
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            bgcolor: 'rgba(15, 23, 42, 0.75)',
            color: 'common.white',
            fontSize: '0.75rem',
            fontWeight: 600,
            px: 1.25,
            py: 0.4,
            borderRadius: 1,
          }}
        >
          <Box component="span" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            Showing photo{' '}
          </Box>
          {index + 1} / {images.length}
        </Box>
        {/*BTW remove grade becuase it's duplicated */}
      </Box>

      {images.length > 1 && (
        <Stack
          direction="row"
          spacing={1.25}
          role="group"
          aria-label="Vehicle photos"
          sx={{ mt: 1.5, overflowX: 'auto', p: 0.5 }}
        >
          {images.map((src, i) => (
            <ButtonBase
              key={`${src}-${i}`}
              onClick={() => setActiveIndex(i)}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              aria-pressed={i === index}
              sx={{
                flexShrink: 0,
                width: 76,
                height: 56,
                borderRadius: 1,
                overflow: 'hidden',
                border: '2px solid',
                borderColor: i === index ? 'primary.main' : 'transparent',
                opacity: i === index ? 1 : 0.7,
                '&:hover, &.Mui-focusVisible': { opacity: 1 },
                '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
              }}
            >
              <Box
                component="img"
                src={srcFor(i)}
                alt=""
                onError={() => handleError(i)}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  visibility: failures[i] === 'failed' ? 'hidden' : 'visible',
                }}
              />
            </ButtonBase>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default memo(VehicleGallery);
