import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Task } from '../types';

export interface ProgressChartProps {
  /** All recorded tasks */
  tasks: Task[];
}

/**
 * ProgressChart renders a simple D3 bar chart showing how many points
 * were earned over the last seven days. This provides a quick visual
 * summary of recent productivity.
 */
const ProgressChart: React.FC<ProgressChartProps> = ({ tasks }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // clear previous svg if any
    container.innerHTML = '';

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = container.offsetWidth - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // compute points per day for last 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data: { label: string; points: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const label = day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const total = tasks
        .filter(t => {
          const d = new Date(t.timestamp);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === day.getTime();
        })
        .reduce((sum, t) => sum + (t.points || 0), 0);
      data.push({ label, points: total });
    }

    const x = d3
      .scaleBand()
      .domain(data.map(d => d.label))
      .range([0, width])
      .padding(0.1);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.points) || 0])
      .nice()
      .range([height, 0]);

    g.append('g')
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.label)!)
      .attr('y', d => y(d.points))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.points))
      .attr('fill', '#4ade80'); // Tailwind green-400

    g.append('g').call(d3.axisLeft(y).ticks(4));
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'middle');
  }, [tasks]);

  return <div ref={ref} className="w-full" />;
};

export default ProgressChart;
