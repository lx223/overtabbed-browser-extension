export const selectStyles = {
  backgroundColor: 'var(--input-bg)',
  color: 'var(--text-primary)',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--input-border)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-default)' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--accent-primary)' },
  '& .MuiSelect-icon': { color: 'var(--text-tertiary)' },
};

export const searchFieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'var(--input-bg)',
    borderRadius: 2,
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    '& fieldset': { borderColor: 'var(--input-border)' },
    '&:hover fieldset': { borderColor: 'var(--border-default)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--input-border-focus)', borderWidth: 1 },
  },
  '& .MuiInputBase-input::placeholder': { color: 'var(--text-muted)', opacity: 1 },
};

export const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'var(--input-bg)',
    color: 'var(--text-primary)',
    '& fieldset': { borderColor: 'var(--input-border)' },
    '&:hover fieldset': { borderColor: 'var(--border-default)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--accent-primary)' },
  },
  '& .MuiInputLabel-root': { color: 'var(--text-tertiary)' },
};



