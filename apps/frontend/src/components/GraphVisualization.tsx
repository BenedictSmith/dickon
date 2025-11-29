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
 * Modern D3.js Force-Directed Graph with glassmorphism design
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
      pollInterval: 10000,
    }
  );

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll('*').remove();

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    const container = svg.append('g');

    const nodes: GraphNode[] = JSON.parse(
      JSON.stringify(data.getGraphData.nodes)
    );
    const edges: GraphEdge[] = JSON.parse(
      JSON.stringify(data.getGraphData.edges)
    );

    // Modern color palette
    const nodeColors: Record<GraphNodeType, string> = {
      DATABASE: '#a855f7', // Violet
      TABLE: '#3b82f6',    // Blue
      COLUMN: '#10b981',   // Emerald
    };

    const edgeColors: Record<GraphEdgeType, string> = {
      HAS_TABLE: '#475569',
      HAS_COLUMN: '#475569',
      REFERENCES: '#ef4444',
      SIMILAR_TO: '#f59e0b',
    };

    const nodeRadius = (d: GraphNode): number => {
      switch (d.type) {
        case 'DATABASE':
          return 14;
        case 'TABLE':
          return 10;
        case 'COLUMN':
          return 7;
      }
    };

    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphEdge>(edges)
          .id((d) => d.id)
          .distance((d) => {
            if (d.type === 'HAS_TABLE' || d.type === 'HAS_COLUMN') return 60;
            return 120;
          })
      )
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collision',
        d3.forceCollide<GraphNode>().radius((d) => nodeRadius(d) + 8)
      );

    // Gradient definitions
    const defs = svg.append('defs');

    // Add glow filter
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const link = container
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('stroke', (d) => edgeColors[d.type])
      .attr('stroke-opacity', (d) => {
        if (d.type === 'SIMILAR_TO' && d.confidence !== undefined) {
          return 0.3 + d.confidence * 0.5;
        }
        return 0.5;
      })
      .attr('stroke-width', (d) => {
        if (d.type === 'REFERENCES') return 2.5;
        if (d.type === 'SIMILAR_TO') return 2;
        return 1.5;
      })
      .attr('stroke-dasharray', (d) => {
        if (d.type === 'SIMILAR_TO') return '6,4';
        return null;
      });

    const node = container
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .style('cursor', 'grab')
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

    // Node circles with glow effect
    node
      .append('circle')
      .attr('r', (d) => nodeRadius(d))
      .attr('fill', (d) => nodeColors[d.type])
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#glow)');

    // Node labels
    node
      .append('text')
      .text((d) => d.label)
      .attr('x', (d) => nodeRadius(d) + 6)
      .attr('y', 4)
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('fill', '#cbd5e1')
      .attr('pointer-events', 'none');

    // Tooltips
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

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as GraphNode).x ?? 0)
        .attr('y1', (d) => (d.source as GraphNode).y ?? 0)
        .attr('x2', (d) => (d.target as GraphNode).x ?? 0)
        .attr('y2', (d) => (d.target as GraphNode).y ?? 0);

      node.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

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
      <div className="glass-card p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-surface-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading graph...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 text-red-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error loading graph: {error.message}</span>
        </div>
      </div>
    );
  }

  const nodeCount = data?.getGraphData.nodes.length ?? 0;
  const edgeCount = data?.getGraphData.edges.length ?? 0;

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-surface-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyber-500/20 to-accent-500/20 border border-cyber-500/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-cyber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Knowledge Graph</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-surface-400">{nodeCount} nodes</span>
                <span className="text-surface-600">•</span>
                <span className="text-sm text-surface-400">{edgeCount} edges</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Node Types */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500 uppercase tracking-wide">Nodes</span>
              <div className="flex gap-1.5">
                {(['DATABASE', 'TABLE', 'COLUMN'] as GraphNodeType[]).map((type) => {
                  const isActive = selectedNodeTypes.has(type);
                  const colorStyles = {
                    DATABASE: {
                      bg: 'rgba(139, 92, 246, 0.2)',
                      text: '#c4b5fd',
                      border: 'rgba(139, 92, 246, 0.3)',
                    },
                    TABLE: {
                      bg: 'rgba(59, 130, 246, 0.2)',
                      text: '#93c5fd',
                      border: 'rgba(59, 130, 246, 0.3)',
                    },
                    COLUMN: {
                      bg: 'rgba(16, 185, 129, 0.2)',
                      text: '#6ee7b7',
                      border: 'rgba(16, 185, 129, 0.3)',
                    },
                  };
                  const colors = colorStyles[type];
                  return (
                    <button
                      key={type}
                      onClick={() => toggleNodeType(type)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                      style={isActive ? {
                        backgroundColor: colors.bg,
                        color: colors.text,
                        borderColor: colors.border,
                      } : {
                        backgroundColor: 'rgb(30, 41, 59)',
                        color: 'rgb(100, 116, 139)',
                        borderColor: 'transparent',
                      }}
                    >
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Edge Types */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500 uppercase tracking-wide">Edges</span>
              <div className="flex gap-1.5">
                {(['REFERENCES', 'SIMILAR_TO'] as const).map((type) => {
                  const isActive = selectedEdgeTypes.has(type);
                  const edgeColorStyles = {
                    REFERENCES: {
                      bg: 'rgba(239, 68, 68, 0.2)',
                      text: '#fca5a5',
                      border: 'rgba(239, 68, 68, 0.3)',
                    },
                    SIMILAR_TO: {
                      bg: 'rgba(245, 158, 11, 0.2)',
                      text: '#fcd34d',
                      border: 'rgba(245, 158, 11, 0.3)',
                    },
                  };
                  const colors = edgeColorStyles[type];
                  return (
                    <button
                      key={type}
                      onClick={() => toggleEdgeType(type)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                      style={isActive ? {
                        backgroundColor: colors.bg,
                        color: colors.text,
                        borderColor: colors.border,
                      } : {
                        backgroundColor: 'rgb(30, 41, 59)',
                        color: 'rgb(100, 116, 139)',
                        borderColor: 'transparent',
                      }}
                    >
                      {type === 'REFERENCES' ? 'FK References' : 'Similarity'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="relative" style={{ height: '600px' }}>
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
        />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 glass-card p-4 text-sm max-w-xs">
          <p className="text-white font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Legend
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
              <span className="text-surface-300 text-xs">Database</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <span className="text-surface-300 text-xs">Table</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-surface-300 text-xs">Column</span>
            </div>
            <div className="border-t border-surface-700/50 my-2" />
            <div className="flex items-center gap-3">
              <div className="w-6 h-0.5 bg-red-500" />
              <span className="text-surface-300 text-xs">Foreign Key</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-0.5 bg-amber-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0, #f59e0b 6px, transparent 6px, transparent 10px)' }} />
              <span className="text-surface-300 text-xs">Similarity</span>
            </div>
          </div>
          <div className="border-t border-surface-700/50 mt-3 pt-3">
            <p className="text-[10px] text-surface-500">Drag to move • Scroll to zoom</p>
          </div>
        </div>
      </div>
    </div>
  );
}
