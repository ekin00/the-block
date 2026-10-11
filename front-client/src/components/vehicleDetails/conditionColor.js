// Same thresholds as the reference details page condition badge.
// Returns an MUI Chip color.
export function conditionColor(grade) {
  if (!Number.isFinite(grade)) {
    return 'default';
  }
  if (grade >= 4) {
    return 'success';
  }
  return grade >= 2.5 ? 'warning' : 'error';
}

// Dark backgrounds that keep white 12px badge text at WCAG AA contrast.
export function conditionBadgeBg(grade) {
  if (!Number.isFinite(grade)) {
    return 'grey.800';
  }
  if (grade >= 4) {
    return 'success.dark';
  }
  return grade >= 2.5 ? '#8a5300' : 'error.dark';
}
