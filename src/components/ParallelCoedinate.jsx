import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import translation from "../data/translation.json";

function ParallelCoordinates({ data }) {
  const ref = useRef();
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    d3.select(ref.current).selectAll("*").remove();

    const margin = { top: -50, right: 150, bottom: 50, left: 50 };
    const width = 1100 - margin.left - margin.right;
    const dimensionHeight = 200;

    const allKeys = new Set();
    data.forEach((d) => Object.keys(d).forEach((key) => allKeys.add(key)));

    const dimensions = [
      "EN Load",
      "Weight",
      ...Array.from(allKeys).filter(
        (key) =>
          !["Name", "Weapon Kinds", "LeftOnly", "EN Load", "Weight"].includes(
            key
          )
      ),
    ];

    const height =
      dimensions.length * dimensionHeight - margin.top - margin.bottom;

    const svg = d3
      .select(ref.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const processedData = data.map((d) => {
      const processed = { ...d };
      dimensions.forEach((dim) => {
        if (!(dim in processed)) {
          processed[dim] = 0;
        }
      });
      return processed;
    });

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const x = {};
    for (let name of dimensions) {
      x[name] = d3
        .scaleLinear()
        .domain(d3.extent(processedData, (d) => +d[name]))
        .nice()
        .range([0, width]);
    }

    const y = d3
      .scalePoint()
      .range([0, height])
      .padding(0.5)
      .domain(dimensions);

    const line = (d) => d3.line()(dimensions.map((p) => [x[p](d[p]), y(p)]));

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "#f9f9f9")
      .style("border", "1px solid #d3d3d3")
      .style("padding", "5px")
      .style("display", "none")
      .style("pointer-events", "none");

    const paths = svg
      .selectAll("myPath")
      .data(processedData)
      .enter()
      .append("path")
      .attr("d", line)
      .style("fill", "none")
      .style("stroke-width", 3)
      .style("stroke", (d, i) => color(i))
      .style("opacity", (d) => (selected.includes(d.Name) ? 0.3 : 0.7))
      .on("mouseover", function (event, d) {
        d3.select(this).style("stroke", "orange").style("stroke-width", 5);
        tooltip.style("display", "block").html(d.Name);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .style("stroke", (d) => (selected.includes(d.Name) ? "o" : color(processedData.indexOf(d))))
          .style("stroke-width", 3);
        tooltip.style("display", "none");
      })
      .on("click", function (event, d) {
        if (selected.includes(d.Name)) {
          setSelected(selected.filter((name) => name !== d.Name));
        } else {
          setSelected([...selected, d.Name]);
        }
      });

    svg
      .selectAll("myAxis")
      .data(dimensions)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(0,${y(d)})`)
      .each(function (d) {
        d3.select(this).call(d3.axisBottom().scale(x[d]).ticks(5));
      })
      .append("text")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .attr("x", width + 70)
      .attr("y", 0)
      .text((d) => translation[0][d] || d)
      .style("fill", "black");

    return () => {
      tooltip.remove();
    };
  }, [data, selected]);

  return (
    <div>
      <aside>
        <svg ref={ref}></svg>
      </aside>
    </div>
  );
}

export default ParallelCoordinates;
