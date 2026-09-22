import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/base/Badge/Badge';

describe('Badge', () => {
  it('renders with default props', () => {
    render(<Badge><span>5</span></Badge>);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders with a given color', () => {
    const { container } = render(<Badge color="success"><span>Adopt</span></Badge>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with primary color', () => {
    const { container } = render(<Badge color="primary"><span>Trial</span></Badge>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with warning color', () => {
    const { container } = render(<Badge color="warning"><span>Assess</span></Badge>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with danger color', () => {
    const { container } = render(<Badge color="danger"><span>Hold</span></Badge>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom-class"><span>Test</span></Badge>);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
