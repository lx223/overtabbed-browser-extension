import React from 'react';
import { Box } from '@mui/material';
import { getMatchIndices } from '@/utils/fuzzySearch';

export interface HighlightedTextProps {
  text: string;
  query: string;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({ text, query }) => {
  if (!query || !text) return <>{text}</>;
  const indices = new Set(getMatchIndices(query, text));
  if (indices.size === 0) return <>{text}</>;

  return (
    <>
      {text.split('').map((char, i) =>
        indices.has(i) ? (
          <Box key={i} component="span" sx={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            {char}
          </Box>
        ) : (
          <span key={i}>{char}</span>
        )
      )}
    </>
  );
};



