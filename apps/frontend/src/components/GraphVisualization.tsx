import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import * as d3 from 'd3';
import { GET_GRAPH_DATA } from '../graphql/queries';
import type {
  GraphData,
  GraphNode,
  GraphEdge,
  GraphNodeType,
  GraphEdgeType,
} from '../types/schema';

/**
 * GraphVisualization Component
 * Epic 3.1: D3.js Force-Directed Graph
 *
 * Interactive force-directed graph visualization of database schema relationships
 * Features:
 * - Force simulation with collision detection
 * - Zoom and pan controls
 * - Color-coded nodes by type
 * - Relationship filtering
 * - Hover tooltips
 */

interface GetGraphDataResponse {
  getGraphData: GraphData;
}

interface GraphVisualizationProps {
  minConfidence?: number;
}

export function GraphVisualization({
  minConfidence = 0.5,
}: GraphVisualizationProps): JSX.Element {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNodeTypes, setSelectedNodeTypes] = useState<
    Set<GraphNodeType>
  >(new Set(['DATABASE', 'TABLE', 'COLUMN']));
  const [selectedEdgeTypes, setSelectedEdgeTypes] = useState<
    Set<GraphEdgeType>
  >(new Set(['HAS_TABLE', 'HAS_COLUMN', 'REFERENCES', 'SIMILAR_TO']));

  const { data, loading, error } = useQuery<GetGraphDataResponse>(
    GET_GRAPH_DATA,
    {
      variables: {
        input: {
          minConfidence,
          nodeTypes: Array.from(selectedNodeTypes),
          edgeTypes: Array.from(selectedEdgeTypes),
        },
      },
      pollInterval: 10000, // Refresh every 10 seconds
    }
  );

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous visualization
    svg.selectAll('*').remove();

    // Create zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create container for zoom/pan
    const container = svg.append('g');

    // Clone data to avoid mutating original
    const nodes: GraphNode[] = JSON.parse(
      JSON.stringify(data.getGraphData.nodes)
    );
    const edges: GraphEdge[] = JSON.parse(
      JSON.stringify(data.getGraphData.edges)
    );

    // Color scales
    const nodeColors: Record<GraphNodeType, string> = {
      DATABASE: '#8b5cf6', // Purple
      TABLE: '#3b82f6', // Blue
      COLUMN: '#10b981', // Green
    };

    const edgeColors: Record<GraphEdgeType, string> = {
      HAS_TABLE: '#6b7280', // Gray
      HAS_COLUMN: '#6b7280', // Gray
      REFERENCES: '#ef4444', // Red
      SIMILAR_TO: '#f59e0b', // Amber
    };

    // Node radius based on type
    const nodeRadius = (d: GraphNode): number => {
      switch (d.type) {
        case 'DATABASE':
          return 12;
        case 'TABLE':
          return 9;
        case 'COLUMN':
          return 6;
      }
    };

    // Create force simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphEdge>(edges)
          .id((d) => d.id)
          .distance((d) => {
            // Shorter links for hierarchy, longer for relationships
            if (d.type === 'HAS_TABLE' || d.type === 'HAS_COLUMN') return 50;
            return 100;
          })
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collision',
        d3.forceCollide<GraphNode>().radius((d) => nodeRadius(d) + 5)
      );

    // Create edge lines
    const link = container
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('stroke', (d) => edgeColors[d.type])
      .attr('stroke-opacity', (d) => {
        // SIMILAR_TO edges show confidence via opacity
        if (d.type === 'SIMILAR_TO' && d.confidence !== undefined) {
          return 0.2 + d.confidence * 0.6;
        }
        return 0.6;
      })
      .attr('stroke-width', (d) => {
        if (d.type === 'REFERENCES') return 2;
        if (d.type === 'SIMILAR_TO') return 2;
        return 1;
      })
      .attr('stroke-dasharray', (d) => {
        // Dashed lines for similarity relationships
        if (d.type === 'SIMILAR_TO') return '5,5';
        return null;
      });

    // Create node groups
    const node = container
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Add circles to nodes
    node
      .append('circle')
      .attr('r', (d) => nodeRadius(d))
      .attr('fill', (d) => nodeColors[d.type])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add labels to nodes
    node
      .append('text')
      .text((d) => d.label)
      .attr('x', (d) => nodeRadius(d) + 5)
      .attr('y', 4)
      .attr('font-size', '10px')
      .attr('fill', '#e5e7eb')
      .attr('pointer-events', 'none');

    // Add tooltips
    node.append('title').text((d) => {
      let info = `${d.type}: ${d.label}`;
      if (d.type === 'COLUMN' && d.properties.dataType) {
        info += `\nType: ${d.properties.dataType}`;
      }
      if (d.type === 'TABLE' && d.properties.rowCount) {
        info += `\nRows: ${d.properties.rowCount}`;
      }
      return info;
    });

    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as GraphNode).x ?? 0)
        .attr('y1', (d) => (d.source as GraphNode).y ?? 0)
        .attr('x2', (d) => (d.target as GraphNode).x ?? 0)
        .attr('y2', (d) => (d.target as GraphNode).y ?? 0);

      node.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, selectedNodeTypes, selectedEdgeTypes]);

  const toggleNodeType = (type: GraphNodeType): void => {
    setSelectedNodeTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const toggleEdgeType = (type: GraphEdgeType): void => {
    setSelectedEdgeTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  if (loading && !data) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 flex items-center justify-center">
        <p className="text-gray-400">Loading graph...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-8">
        <p className="text-red-400">Error loading graph: {error.message}</p>
      </div>
    );
  }

  const nodeCount = data?.getGraphData.nodes.length ?? 0;
  const edgeCount = data?.getGraphData.edges.length ?? 0;

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Header with Controls */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Knowledge Graph</h2>
            <p className="text-sm text-gray-400 mt-1">
              {nodeCount} nodes, {edgeCount} edges
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-6">
          {/* Node Type Filters */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Node Types:</p>
            <div className="flex gap-2">
              {(['DATABASE', 'TABLE', 'COLUMN'] as GraphNodeType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => toggleNodeType(type)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                      selectedNodeTypes.has(type)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {type}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Edge Type Filters */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Edge Types:</p>
            <div className="flex gap-2">
              {(['REFERENCES', 'SIMILAR_TO'] as GraphEdgeType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => toggleEdgeType(type)}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                    selectedEdgeTypes.has(type)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="relative" style={{ height: '600px' }}>
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ background: '#1f2937' }}
        />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-gray-900/90 rounded-lg p-4 text-sm">
          <p className="text-white font-semibold mb-2">Legend</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-gray-300">Database</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-300">Table</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-300">Column</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-red-500"></div>
              <span className="text-gray-300">Foreign Key</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-0.5 bg-amber-500"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #f59e0b 50%, transparent 50%)',
                  backgroundSize: '8px 2px',
                }}
              ></div>
              <span className="text-gray-300">Similarity</span>
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-3">Drag nodes to reposition</p>
          <p className="text-gray-400 text-xs">Scroll to zoom</p>
        </div>
      </div>
    </div>
  );
}
