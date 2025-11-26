import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

/**
 * Apollo Client configuration
 *
 * Uses backend GraphQL API when available, otherwise falls back to mock data
 */

const isDevelopment = import.meta.env.MODE === 'development';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql';

// Create the Apollo Client
export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: apiUrl,
    // Add credentials if needed for authentication later
    credentials: 'same-origin',
  }),
  cache: new InMemoryCache({
    typePolicies: {
      Database: {
        fields: {
          tables: {
            merge(_, incoming: unknown[]) {
              return incoming;
            },
          },
        },
      },
      Table: {
        fields: {
          columns: {
            merge(_, incoming: unknown[]) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: isDevelopment ? 'cache-and-network' : 'cache-first',
    },
  },
});
