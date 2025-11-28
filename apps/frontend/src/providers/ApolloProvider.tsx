import { ApolloProvider as BaseApolloProvider } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { ReactNode } from 'react';
import { apolloClient } from '../lib/apollo-client';
import { GET_DATABASES, GET_DATABASE } from '../graphql/queries';
import { mockDatabases } from '../mocks/data';

/**
 * Apollo Provider with mock support
 *
 * Uses MockedProvider in development until Epic 1.3 (GraphQL API) is ready
 * Switch to real client by setting VITE_USE_REAL_API=true
 */

const useMockData = import.meta.env.VITE_USE_REAL_API !== 'true';

const mocks = [
  {
    request: {
      query: GET_DATABASES,
    },
    result: {
      data: {
        databases: mockDatabases.map((db) => ({
          id: db.id,
          name: db.name,
          path: db.path,
          addedAt: db.addedAt,
        })),
      },
    },
  },
  ...mockDatabases.map((db) => ({
    request: {
      query: GET_DATABASE,
      variables: { id: db.id },
    },
    result: {
      data: {
        database: db,
      },
    },
  })),
];

interface ApolloProviderProps {
  children: ReactNode;
  /**
   * Override mock mode for testing
   * Useful for component tests that need MockedProvider
   */
  useMocks?: boolean;
}

export function ApolloProvider({
  children,
  useMocks = useMockData,
}: ApolloProviderProps): JSX.Element {
  if (useMocks) {
    return (
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    );
  }

  return (
    <BaseApolloProvider client={apolloClient}>{children}</BaseApolloProvider>
  );
}
