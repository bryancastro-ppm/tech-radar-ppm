import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Chip } from '@/base/Chip/Chip';

describe('Chip', () => {
  it('renders with children', () => {
    render(<Chip>Test Label</Chip>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with a given color', () => {
    render(<Chip color="primary">Frameworks</Chip>);
    expect(screen.getByText('Frameworks')).toBeInTheDocument();
  });

  it('renders with success color', () => {
    render(<Chip color="success">Testing</Chip>);
    expect(screen.getByText('Testing')).toBeInTheDocument();
  });

  it('renders with default color', () => {
    render(<Chip color="default">Sin Categorizar</Chip>);
    expect(screen.getByText('Sin Categorizar')).toBeInTheDocument();
  });

  it('applies selected styles when isSelected is true', () => {
    const { container } = render(<Chip isSelected>Selected</Chip>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Chip onClick={handleClick}>Clickable</Chip>);
    
    fireEvent.click(screen.getByText('Clickable'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(<Chip className="custom-class">Test</Chip>);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
