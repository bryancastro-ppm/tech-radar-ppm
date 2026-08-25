import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Chip } from '@/base/Chip/Chip';

describe('Chip', () => {
  it('renders with children', () => {
    render(<Chip>Test Label</Chip>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with frameworks-librerias quadrant', () => {
    render(<Chip quadrant="frameworks-librerias">Frameworks</Chip>);
    expect(screen.getByText('Frameworks')).toBeInTheDocument();
  });

  it('renders with testing quadrant', () => {
    render(<Chip quadrant="testing">Testing</Chip>);
    expect(screen.getByText('Testing')).toBeInTheDocument();
  });

  it('renders with sin-categorizar quadrant', () => {
    render(<Chip quadrant="sin-categorizar">Sin Categorizar</Chip>);
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
