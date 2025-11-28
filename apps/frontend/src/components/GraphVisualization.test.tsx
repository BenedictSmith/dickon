import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { GraphVisualization } from './GraphVisualization';
import { GET_GRAPH_DATA } from '../graphql/queries';
import type { GraphData } from '../types/schema';

/**
 * GraphVisualization Component Tests
 * Epic 3.1: D3.js Force-Directed Graph
 */

describe('GraphVisualization', () => {
  const mockGraphData: GraphData = {
    nodes: [
      {
        id: 'db1',
        label: 'users_db',
        type: 'DATABASE',
        properties: {
          path: '/path/to/users.db',
        },
      },
      {
        id: 'table1',
        label: 'users',
        type: 'TABLE',
        databaseId: 'db1',
        properties: {
          rowCount: 100,
        },
      },
      {
        id: 'col1',
        label: 'user_id',
        type: 'COLUMN',
        databaseId: 'db1',
        tableId: 'table1',
        properties: {
          dataType: 'INTEGER',
          primaryKey: true,
          notNull: true,
        },
      },
      {
        id: 'col2',
        label: 'email',
        type: 'COLUMN',
        databaseId: 'db1',
        tableId: 'table1',
        properties: {
          dataType: 'TEXT',
          primaryKey: false,
          notNull: true,
        },
      },
    ],
    edges: [
      {
        source: 'db1',
        target: 'table1',
        type: 'HAS_TABLE',
      },
      {
        source: 'table1',
        target: 'col1',
        type: 'HAS_COLUMN',
      },
      {
        source: 'table1',
        target: 'col2',
        type: 'HAS_COLUMN',
      },
      {
        source: 'col1',
        target: 'col2',
        type: 'SIMILAR_TO',
        confidence: 0.85,
        discoveredAt: '2024-01-15T10:00:00Z',
      },
    ],
  };

  const mockGraphQuery = {
    request: {
      query: GET_GRAPH_DATA,
      variables: {
        input: {
          minConfidence: 0.5,
          nodeTypes: ['DATABASE', 'TABLE', 'COLUMN'],
          edgeTypes: ['HAS_TABLE', 'HAS_COLUMN', 'REFERENCES', 'SIMILAR_TO'],
        },
      },
    },
    result: {
      data: {
        getGraphData: mockGraphData,
      },
    },
  };

  it('should display loading state initially', () => {
    render(
      <MockedProvider mocks={[mockGraphQuery]} addTypename={false}>
        <GraphVisualization minConfidence={0.5} />
      </MockedProvider>
    );

    expect(screen.getByText(/loading graph/i)).toBeInTheDocument();
  });

  it('should display graph header with node and edge counts', async () => {
    render(
      <MockedProvider mocks={[mockGraphQuery]} addTypename={false}>
        <GraphVisualization minConfidence={0.5} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Knowledge Graph')).toBeInTheDocument();
    });

    expect(screen.getByText('4 nodes, 4 edges')).toBeInTheDocument();
  });

  it('should render SVG canvas', async () => {
    const { container } = render(
      <MockedProvider mocks={[mockGraphQuery]} addTypename={false}>
        <GraphVisualization minConfidence={0.5} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Knowledge Graph')).toBeInTheDocument();
    });

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should display node type filters', async () => {
    render(
      <MockedProvider mocks={[mockGraphQuery]} addTypename={false}>
        <GraphVisualization minConfidence={0.5} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Knowledge Graph')).toBeInTheDocument();
    });

    expect(screen.getByText('Node Types:')).toBeInTheDocument();
    expect(screen.getByText('DATABASE')).toBeInTheDocument();
    expect(screen.getByText('TABLE')).toBeInTheDocument();
    expect(screen.getByText('COLUMN')).toBeInTheDocument();
  });

  it('should display edge type filters', async () => {
    render(
      <MockedProvider mocks={[mockGraphQuery]} addTypename={false}>
        <GraphVisualization minConfidence={0.5} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Knowledge Graph')).toBeInTheDocument();
    });

    expect(screen.getByText('Edge Types:')).toBeInTheDocument();
    expect(screen.getByText('REFERENCES')).toBeInTheDocument();
    expect(screen.getByText('SIMILAR_TO')).toBeInTheDocument();
  });

  it('should display legend with node and edge types', async () => {
    render(
      <MockedProvider mocks={[mockGraphQuery]} addTypename={false}>
        <GraphVisualization minConfidence={0.5} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Knowledge Graph')).toBeInTheDocument();
    });

    expect(screen.getByText('Legend')).toBeInTheDocument();
    expect(screen.getByText('Database')).toBeInTheDocument();
    expect(screen.getByText('Table')).toBeInTheDocument();
    expect(screen.getByText('Column')).toBeInTheDocument();
    expect(screen.getByText('Foreign Key')).toBeInTheDocument();
    expect(screen.getByText('Similarity')).toBeInTheDocument();
  });

  it('should display user instructions', async () => {
    render(
      <MockedProvider mocks={[mockGraphQuery]} addTypename={false}>
        <GraphVisualization minConfidence={0.5} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Knowledge Graph')).toBeInTheDocument();
    });

    expect(screen.getByText('Drag nodes to reposition')).toBeInTheDocument();
    expect(screen.getByText('Scroll to zoom')).toBeInTheDocument();
  });

  it('should handle empty graph data', async () => {
    const emptyMock = {
      request: {
        query: GET_GRAPH_DATA,
        variables: {
          input: {
            minConfidence: 0.5,
            nodeTypes: ['DATABASE', 'TABLE', 'COLUMN'],
            edgeTypes: ['HAS_TABLE', 'HAS_COLUMN', 'REFERENCES', 'SIMILAR_TO'],
          },
        },
      },
      result: {
        data: {
          getGraphData: {
            nodes: [],
            edges: [],
          },
        },
      },
    };

    render(
      <MockedProvider mocks={[emptyMock]} addTypename={false}>
        <GraphVisualization minConfidence={0.5} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Knowledge Graph')).toBeInTheDocument();
    });

    expect(screen.getByText('0 nodes, 0 edges')).toBeInTheDocument();
  });

  it('should display error message on query failure', async () => {
    const errorMock = {
      request: {
        query: GET_GRAPH_DATA,
        variables: {
          input: {
            minConfidence: 0.5,
            nodeTypes: ['DATABASE', 'TABLE', 'COLUMN'],
            edgeTypes: ['HAS_TABLE', 'HAS_COLUMN', 'REFERENCES', 'SIMILAR_TO'],
          },
        },
      },
      error: new Error('Failed to fetch graph data'),
    };

    render(
      <MockedProvider mocks={[errorMock]} addTypename={false}>
        <GraphVisualization minConfidence={0.5} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/error loading graph/i)).toBeInTheDocument();
    });
  });

  it('should use custom minConfidence prop', async () => {
    const customMock = {
      request: {
        query: GET_GRAPH_DATA,
        variables: {
          input: {
            minConfidence: 0.8,
            nodeTypes: ['DATABASE', 'TABLE', 'COLUMN'],
            edgeTypes: ['HAS_TABLE', 'HAS_COLUMN', 'REFERENCES', 'SIMILAR_TO'],
          },
        },
      },
      result: {
        data: {
          getGraphData: mockGraphData,
        },
      },
    };

    render(
      <MockedProvider mocks={[customMock]} addTypename={false}>
        <GraphVisualization minConfidence={0.8} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Knowledge Graph')).toBeInTheDocument();
    });

    expect(screen.getByText('4 nodes, 4 edges')).toBeInTheDocument();
  });
});
