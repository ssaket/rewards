import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Task } from '../types';

export interface ProgressChartProps {
  /** List of tasks to visualize */
  tasks: Task[];
}

/**
 * ProgressChart renders a small bar chart showing the total points
 * earned each day over the last week. It uses D3 for scales and axes
 * but is otherwise a self-contained React component.
 */
const ProgressChart: React.FC<ProgressChartProps> = ({ tasks }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 360;
    const height = 180;
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build data for the last 7 days
    const data = d3.range(7).map((i) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - i));
      const label = day.toLocaleDateString(undefined, { weekday: 'short' });
      const total = tasks
        .filter((t) => t.timestamp.toDateString() === day.toDateString())
        .reduce((sum, t) => sum + (t.points || 0), 0);
      return { label, total };
    });

    const max = d3.max(data, (d) => d.total) || 0;
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([40, width - 10])
      .padding(0.2);
    const y = d3
      .scaleLinear()
      .domain([0, max]).nice()
      .range([height - 30, 10]);

    svg
      .append('g')
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => x(d.label)!)
      .attr('y', (d) => y(d.total))
      .attr('width', x.bandwidth())
      .attr('height', (d) => y(0) - y(d.total))
      .attr('fill', '#4ade80');

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y).ticks(4).tickSizeOuter(0);

    svg
      .append('g')
      .attr('transform', `translate(0,${height - 30})`)
      .call(xAxis)
      .selectAll('text')
      .attr('font-size', '10px');

    svg
      .append('g')
      .attr('transform', 'translate(40,0)')
      .call(yAxis)
      .selectAll('text')
      .attr('font-size', '10px');
  }, [tasks]);

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">
        Points Earned This Week
      </h2>
      <svg ref={svgRef} className="w-full h-48" />
    </div>
  );
};

export default ProgressChart;
