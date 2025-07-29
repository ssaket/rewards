import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * BackgroundAnimation uses D3 to render a gentle, nature-inspired animation
 * behind the main UI. The animation consists of translucent circles that
 * drift across the screen like clouds or pollen. When a circle exits
 * the viewport it reappears on the opposite side, creating an infinite
 * floating effect. The SVG is absolutely positioned and does not
 * intercept pointer events so it won't interfere with user interaction.
 */
const BackgroundAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing SVG content in case the component rerenders.
    container.innerHTML = '';

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // Create an SVG element sized to the container. Position it absolutely
    // behind everything else and disable pointer events to allow clicks to pass through.
    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0)
      .style('pointer-events', 'none');

    // Generate a set of floating elements. Each item stores its position,
    // radius and horizontal speed. These values are randomized for variety.
    const numElements = 25;
    type ElementState = { x: number; y: number; radius: number; speed: number };
    const elements: ElementState[] = d3.range(numElements).map(() => {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 20 + Math.random() * 30,
        speed: 0.2 + Math.random() * 0.6,
      };
    });

    // Bind data to circle elements. Use a soft white fill with low opacity
    // to mimic clouds or floating petals.
    const circles = svg
      .selectAll('circle')
      .data(elements)
      .enter()
      .append('circle')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', (d) => d.radius)
      .attr('fill', 'rgba(255, 255, 255, 0.4)')
      .attr('stroke', 'none');

    // Use a d3 timer to update positions on each animation frame. This
    // approach avoids tying into React state updates and delivers smooth
    // animations via requestAnimationFrame under the hood.
    const timer = d3.timer(() => {
      for (const elem of elements) {
        elem.x += elem.speed;
        if (elem.x - elem.radius > width) {
          elem.x = -elem.radius;
          elem.y = Math.random() * height;
        }
      }
      circles.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
    });

    // Resize handler to update the SVG dimensions and reposition elements
    // when the window size changes. Without this the animation would
    // maintain outdated bounds after resizing the browser.
    const handleResize = () => {
      const newWidth = container.offsetWidth;
      const newHeight = container.offsetHeight;
      svg.attr('width', newWidth).attr('height', newHeight);
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
