import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface WaveformProps {
  url: string;
  duration: number;
  currentTime: number;
}

const Waveform = ({ url, duration, currentTime }: WaveformProps) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      fetch(url)
        .then(response => response.json())
        .then(data => {
          const svg = d3.select(ref.current);
          const xScale = d3.scaleLinear().domain([0, data.samples.length - 1]).range([0, data.width * 2]);
          const yScale = d3.scaleLinear().domain([d3.min(data.samples), d3.max(data.samples)]).range([data.height, 0]);
          const line = d3.line().x((d, i) => xScale(i)).y(d => yScale(d));
          svg.append('path').attr('d', line(data.samples));
        });
    }
  }, [url]);

  useEffect(() => {
    if (ref.current) {
      const svg = d3.select(ref.current);
      const durationScale = d3.scaleLinear().domain([0, duration / 1000]).range([0, svg.node().getBoundingClientRect().width]);
      svg.select('.position-marker').remove();
      svg.append('line')
        .attr('class', 'position-marker')
        .attr('x1', durationScale(currentTime))
        .attr('y1', 0)
        .attr('x2', durationScale(currentTime))
        .attr('y2', svg.node().getBoundingClientRect().height)
        .attr('stroke', 'red');
    }
  }, [duration, currentTime]);

  return (
    <svg ref={ref} style={{width: "100%"}} />
  );
}

export default Waveform;