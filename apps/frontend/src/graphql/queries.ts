import { gql } from '@apollo/client';

/**
 * GraphQL queries for SiloBreaker
 * Epic 1.4: Schema Explorer UI
 */

export const GET_DATABASES = gql`
  query GetDatabases {
    databases {
      id
      name
      path
      addedAt
    }
  }
`;

export const GET_DATABASE = gql`
  query GetDatabase($id: ID!) {
    database(id: $id) {
      id
      name
      path
      addedAt
      tables {
        id
        name
        rowCount
        columns {
          id
          name
          dataType
          primaryKey
          notNull
          defaultValue
        }
      }
    }
  }
`;

export const ADD_DATABASE = gql`
  mutation AddDatabase($input: AddDatabaseInput!) {
    addDatabase(input: $input) {
      success
      database {
        id
        name
        path
        addedAt
      }
      error
    }
  }
`;
