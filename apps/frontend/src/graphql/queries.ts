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

/**
 * Epic 2.4: Discovery Interface
 * Job management queries and mutations
 */

export const GET_JOB = gql`
  query GetJob($id: ID!) {
    job(id: $id) {
      id
      type
      status
      progress
      createdAt
      startedAt
      completedAt
      error
      result
    }
  }
`;

export const GET_JOBS = gql`
  query GetJobs {
    jobs {
      id
      type
      status
      progress
      createdAt
      startedAt
      completedAt
      error
      result
    }
  }
`;

export const START_DISCOVERY = gql`
  mutation StartDiscovery {
    startDiscovery {
      success
      job {
        id
        type
        status
        progress
        createdAt
        startedAt
        completedAt
        error
        result
      }
      error
    }
  }
`;

export const CANCEL_JOB = gql`
  mutation CancelJob($id: ID!) {
    cancelJob(id: $id)
  }
`;
