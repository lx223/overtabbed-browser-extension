import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickActions } from './QuickActions';

describe('QuickActions', () => {
  const defaultProps = {
    onSort: vi.fn(),
    onGroup: vi.fn(),
    onDedup: vi.fn(),
  };

  it('renders all three action buttons', () => {
    render(<QuickActions {...defaultProps} />);

    expect(screen.getByText('Sort')).toBeInTheDocument();
    expect(screen.getByText('Group')).toBeInTheDocument();
    expect(screen.getByText('Dedup')).toBeInTheDocument();
  });

  it('calls onSort when Sort button is clicked', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();

    render(<QuickActions {...defaultProps} onSort={onSort} />);

    const sortButton = screen.getByText('Sort');
    await user.click(sortButton);

    expect(onSort).toHaveBeenCalledTimes(1);
  });

  it('calls onGroup when Group button is clicked', async () => {
    const user = userEvent.setup();
    const onGroup = vi.fn();

    render(<QuickActions {...defaultProps} onGroup={onGroup} />);

    const groupButton = screen.getByText('Group');
    await user.click(groupButton);

    expect(onGroup).toHaveBeenCalledTimes(1);
  });

  it('calls onDedup when Dedup button is clicked', async () => {
    const user = userEvent.setup();
    const onDedup = vi.fn();

    render(<QuickActions {...defaultProps} onDedup={onDedup} />);

    const dedupButton = screen.getByText('Dedup');
    await user.click(dedupButton);

    expect(onDedup).toHaveBeenCalledTimes(1);
  });

  it('disables all buttons when disabled prop is true', () => {
    render(<QuickActions {...defaultProps} disabled={true} />);

    const sortButton = screen.getByText('Sort').closest('button');
    const groupButton = screen.getByText('Group').closest('button');
    const dedupButton = screen.getByText('Dedup').closest('button');

    expect(sortButton).toBeDisabled();
    expect(groupButton).toBeDisabled();
    expect(dedupButton).toBeDisabled();
  });

  it('enables all buttons when disabled prop is false', () => {
    render(<QuickActions {...defaultProps} disabled={false} />);

    const sortButton = screen.getByText('Sort').closest('button');
    const groupButton = screen.getByText('Group').closest('button');
    const dedupButton = screen.getByText('Dedup').closest('button');

    expect(sortButton).not.toBeDisabled();
    expect(groupButton).not.toBeDisabled();
    expect(dedupButton).not.toBeDisabled();
  });

  it('shows tooltips on hover', async () => {
    const user = userEvent.setup();
    render(<QuickActions {...defaultProps} />);

    const sortButton = screen.getByText('Sort');
    await user.hover(sortButton);

    expect(await screen.findByText('Sort all tabs by URL')).toBeInTheDocument();
  });
});
