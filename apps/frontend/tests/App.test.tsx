import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { App } from '../src/App';
import { GET_DATABASES } from '../src/graphql/queries';

describe('App', () => {
  it('should render main application', async () => {
    const mocks = [
      {
        request: {
          query: GET_DATABASES,
        },
        result: {
          data: {
            databases: [],
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <App />
      </MockedProvider>
    );

    expect(screen.getByText('SiloBreaker')).toBeInTheDocument();
    expect(screen.getByText('Database Schema Discovery Tool')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/no databases/i)).toBeInTheDocument();
    });
  });
});
