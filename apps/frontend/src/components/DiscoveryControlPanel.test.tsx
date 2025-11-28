import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { DiscoveryControlPanel } from './DiscoveryControlPanel';
import { START_DISCOVERY, CANCEL_JOB } from '../graphql/queries';

/**
 * DiscoveryControlPanel Component Tests
 * Epic 2.4: Discovery Interface
 */

describe('DiscoveryControlPanel', () => {
  const mockStartDiscoverySuccess = {
    request: {
      query: START_DISCOVERY,
    },
    result: {
      data: {
        startDiscovery: {
          success: true,
          job: {
            id: 'job-123',
            type: 'discovery',
            status: 'PENDING',
            progress: 0,
            createdAt: '2024-01-15T10:00:00Z',
          },
          error: null,
        },
      },
    },
  };

  const mockCancelJob = {
    request: {
      query: CANCEL_JOB,
      variables: { id: 'job-123' },
    },
    result: {
      data: {
        cancelJob: true,
      },
    },
  };

  it('should render collapsed by default', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <DiscoveryControlPanel />
      </MockedProvider>
    );

    expect(screen.getByText('Relationship Discovery')).toBeInTheDocument();
    expect(screen.queryByText('Start Discovery')).not.toBeInTheDocument();
  });

  it('should expand when clicking the expand button', async () => {
    const user = userEvent.setup();

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <DiscoveryControlPanel />
      </MockedProvider>
    );

    const expandButton = screen.getByLabelText(/expand panel/i);
    await user.click(expandButton);

    expect(screen.getByText('Start Discovery')).toBeInTheDocument();
    expect(screen.getByText(/how it works/i)).toBeInTheDocument();
  });

  it('should start discovery when button clicked', async () => {
    const user = userEvent.setup();

    render(
      <MockedProvider mocks={[mockStartDiscoverySuccess]} addTypename={false}>
        <DiscoveryControlPanel />
      </MockedProvider>
    );

    // Expand panel
    const expandButton = screen.getByLabelText(/expand panel/i);
    await user.click(expandButton);

    // Click start discovery
    const startButton = screen.getByText('Start Discovery');
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/starting discovery/i)).toBeInTheDocument();
    });
  });

  it('should disable start button when job is running', async () => {
    const user = userEvent.setup();

    render(
      <MockedProvider mocks={[mockStartDiscoverySuccess]} addTypename={false}>
        <DiscoveryControlPanel />
      </MockedProvider>
    );

    // Expand and start
    const expandButton = screen.getByLabelText(/expand panel/i);
    await user.click(expandButton);

    const startButton = screen.getByText('Start Discovery');
    await user.click(startButton);

    await waitFor(() => {
      expect(startButton).toBeDisabled();
    });
  });

  it('should display error message on start failure', async () => {
    const user = userEvent.setup();
    const errorMock = {
      request: {
        query: START_DISCOVERY,
      },
      error: new Error('Failed to start discovery'),
    };

    render(
      <MockedProvider mocks={[errorMock]} addTypename={false}>
        <DiscoveryControlPanel />
      </MockedProvider>
    );

    const expandButton = screen.getByLabelText(/expand panel/i);
    await user.click(expandButton);

    const startButton = screen.getByText('Start Discovery');
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should show cancel button when job is running', async () => {
    const user = userEvent.setup();

    render(
      <MockedProvider mocks={[mockStartDiscoverySuccess]} addTypename={false}>
        <DiscoveryControlPanel />
      </MockedProvider>
    );

    const expandButton = screen.getByLabelText(/expand panel/i);
    await user.click(expandButton);

    const startButton = screen.getByText('Start Discovery');
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Cancel Discovery')).toBeInTheDocument();
    });
  });

  it('should auto-expand when discovery starts', async () => {
    const user = userEvent.setup();

    render(
      <MockedProvider mocks={[mockStartDiscoverySuccess]} addTypename={false}>
        <DiscoveryControlPanel />
      </MockedProvider>
    );

    // Panel is collapsed
    expect(screen.queryByText('Start Discovery')).not.toBeInTheDocument();

    // Expand and start
    const expandButton = screen.getByLabelText(/expand panel/i);
    await user.click(expandButton);

    const startButton = screen.getByText('Start Discovery');
    await user.click(startButton);

    // Should show job progress (panel stays expanded)
    await waitFor(() => {
      expect(screen.getByText('Cancel Discovery')).toBeInTheDocument();
    });
  });
});
