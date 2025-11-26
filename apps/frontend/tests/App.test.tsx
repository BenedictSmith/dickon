import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../src/App';

describe('App', () => {
  it('should render placeholder content', () => {
    render(<App />);
    expect(screen.getByText('SiloBreaker')).toBeInTheDocument();
    expect(screen.getByText('Phase 1 coming soon')).toBeInTheDocument();
  });
});
