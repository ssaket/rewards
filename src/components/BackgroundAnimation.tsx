import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * BackgroundAnimation renders a calming nature scene with falling leaves
 * and gently swaying trees. D3 drives the SVG updates so the animation
 * remains performant and independent from React's render cycle.
 */
const BackgroundAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    let width = container.offsetWidth;
    let height = container.offsetHeight;

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0)
      .style('pointer-events', 'none');

    // -- Falling leaves ----------------------------------------------------
    const numLeaves = 20;
    type Leaf = {
      x: number;
      y: number;
      rotation: number;
      speed: number;
      spin: number;
      size: number;
    };
    const leafPath = 'M0 -20 C6 -10 6 10 0 20 C-6 10 -6 -10 0 -20 Z';

    const leaves: Leaf[] = d3.range(numLeaves).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      rotation: Math.random() * 360,
      speed: 0.5 + Math.random(),
      spin: -0.5 + Math.random(),
      size: 8 + Math.random() * 8,
    }));

    const leafGroups = svg
      .selectAll('g.leaf')
      .data(leaves)
      .enter()
      .append('g')
      .attr('class', 'leaf')
      .attr('transform', d => `translate(${d.x},${d.y}) rotate(${d.rotation})`);

    leafGroups
      .append('path')
      .attr('d', leafPath)
      .attr('fill', 'rgba(34,139,34,0.6)')
      .attr('stroke', 'rgba(34,139,34,0.8)')
      .attr('stroke-width', 0.5)
      .attr('transform', d => `scale(${d.size / 20})`);

    // -- Swaying trees -----------------------------------------------------
    const treeFractions = [0.2, 0.5, 0.8];
    type Tree = { frac: number; amplitude: number; offset: number; x: number };
    const trees: Tree[] = treeFractions.map(f => ({
      frac: f,
      amplitude: 4 + Math.random() * 3,
      offset: Math.random() * Math.PI * 2,
      x: width * f,
    }));

    const treeGroups = svg
      .selectAll('g.tree')
      .data(trees)
      .enter()
      .append('g')
      .attr('class', 'tree')
      .attr('transform', d => `translate(${d.x},${height})`);

    treeGroups
      .append('rect')
      .attr('x', -3)
      .attr('y', -40)
      .attr('width', 6)
      .attr('height', 40)
      .attr('fill', '#8B5A2B');

    treeGroups
      .append('circle')
      .attr('cx', 0)
      .attr('cy', -55)
      .attr('r', 20)
      .attr('fill', '#2e7d32');

    // Animation loop ------------------------------------------------------
    const start = Date.now();
    const timer = d3.timer(() => {
      const now = Date.now();
      for (const leaf of leaves) {
        leaf.y += leaf.speed;
        leaf.rotation += leaf.spin;
        if (leaf.y - leaf.size > height) {
          leaf.y = -leaf.size;
          leaf.x = Math.random() * width;
        }
      }
      leafGroups.attr('transform', d => `translate(${d.x},${d.y}) rotate(${d.rotation})`);

      const elapsed = now - start;
      treeGroups.attr('transform', d => {
        const angle = Math.sin(elapsed / 2000 + d.offset) * d.amplitude;
        return `translate(${d.x},${height}) rotate(${angle})`;
      });
    });

    const handleResize = () => {
      width = container.offsetWidth;
      height = container.offsetHeight;
      svg.attr('width', width).attr('height', height);
      trees.forEach(t => (t.x = width * t.frac));
      treeGroups.attr('transform', d => `translate(${d.x},${height})`);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      timer.stop();
      window.removeEventListener('resize', handleResize);
      svg.remove();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" />;
};

export default BackgroundAnimation;
