import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders with default props', () => {
    render(<Badge><span>5</span></Badge>);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders with adopt ring (default)', () => {
    const { container } = render(<Badge><span>Test</span></Badge>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with trial ring', () => {
    const { container } = render(<Badge ring="trial"><span>Trial</span></Badge>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with assess ring', () => {
    const { container } = render(<Badge ring="assess"><span>Assess</span></Badge>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with hold ring', () => {
    const { container } = render(<Badge ring="hold"><span>Hold</span></Badge>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom-class"><span>Test</span></Badge>);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
