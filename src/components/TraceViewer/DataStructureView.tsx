import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@/hooks/ThemeContext';

interface DataNode {
  id: string;
  value?: string;
  children?: DataNode[];
  edges?: { source: string; target: string }[];
}

interface DataStructureViewProps {
  data: DataNode | null;
}

const DataStructureView = ({ data }: DataStructureViewProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!data || !svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth || 400;
    const height = svgRef.current.clientHeight || 300;

    const nodes: { id: string; value?: string }[] = [];
    const links: { source: string; target: string }[] = [];

    const traverse = (node: DataNode) => {
      nodes.push({ id: node.id, value: node.value });
      if (node.children) {
        node.children.forEach((child) => {
          links.push({ source: node.id, target: child.id });
          traverse(child);
        });
      }
    };
    traverse(data);

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(60))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', theme === 'dark' ? '#6D28D9' : '#7C3AED')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6);

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g');

    node.append('circle')
      .attr('r', 14)
      .attr('fill', theme === 'dark' ? '#D49A20' : '#B8860B')
      .attr('opacity', 0.85);

    node.append('text')
      .text((d: any) => d.value ?? d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('fill', '#FFF')
      .attr('font-size', 11)
      .attr('font-family', 'var(--font-mono)');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      node.attr('transform', (d: any) => 'translate(' + d.x + ',' + d.y + ')');
    });

    return () => { simulation.stop(); };
  }, [data, theme]);

  return (
    <div className="h-full w-full overflow-hidden" style={{ background: 'var(--color-bg-surface)', borderRadius: 8 }}>
      <svg ref={svgRef} width="100%" height="100%" style={{ background: theme === 'dark' ? '#030712' : '#F3F4F6' }} />
    </div>
  );
};

export default DataStructureView;
