import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import translation from "../data/translation.json";

function ParallelCoordinate({ data, highlighted = [] }) {
  const ref = useRef();
  const [selected, setSelected] = useState([]);
  const [colorMode, setColorMode] = useState("weight"); // 'part', 'weight', 'ENLoad'

  useEffect(() => {
    d3.select(ref.current).selectAll("*").remove();

    const margin = { top: 50, right: 170, bottom: 50, left: 50 };
    const width = 1000 - margin.left - margin.right;
    const dimensionHeight = 150;

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

    const colorPart = d3.scaleOrdinal(d3.schemeCategory10);

    const colorWeight = d3
      .scaleThreshold()
      .domain([
        d3.min(processedData, (d) => d["Weight"]),
        (d3.min(processedData, (d) => d["Weight"]) +
          d3.max(processedData, (d) => d["Weight"])) /
          3,
        ((d3.max(processedData, (d) => d["Weight"]) +
          d3.min(processedData, (d) => d["Weight"])) *
          2) /
          3,
        d3.max(processedData, (d) => d["Weight"]),
      ])
      .range(d3.schemeBlues[4]);

    const colorEnLoad = d3
      .scaleThreshold()
      .domain([
        d3.min(processedData, (d) => d["EN Load"]),
        (d3.min(processedData, (d) => d["EN Load"]) +
          d3.max(processedData, (d) => d["EN Load"])) /
          3,
        ((d3.max(processedData, (d) => d["EN Load"]) +
          d3.min(processedData, (d) => d["EN Load"])) *
          2) /
          3,
        d3.max(processedData, (d) => d["EN Load"]),
      ])
      .range(d3.schemeGreens[4]);

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
      .style("stroke", (d) => {
        switch (colorMode) {
          case "weight":
            return colorWeight(d["Weight"]);
          case "enLoad":
            return colorEnLoad(d["EN Load"]);
          case "part":
          default:
            return colorPart(d.Name);
        }
      })
      .style("opacity", (d) => {
        if (selected.includes(d.Name)) return 0.3;
        if (highlighted.includes(d.Name)) return 1;
        return 0.7;
      })
      .style("stroke", (d) => {
        if (highlighted.includes(d.Name)) {
          return "red";
        } else {
          return colorMode === "weight"
            ? colorWeight(d["Weight"])
            : colorMode === "ENLoad"
            ? colorEnLoad(d["EN Load"])
            : colorPart(d.Name);
        }
      })
      .on("mouseover", function (event, d) {
        if (!selected.includes(d.Name) && !highlighted.includes(d.Name)) {
          d3.select(this).style("stroke", "orange").style("stroke-width", 5);
        }
        tooltip.style("display", "block").html(d.Name);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mouseout", function (event, d) {
        if (!selected.includes(d.Name) && !highlighted.includes(d.Name)) {
          d3.select(this)
            .style(
              "stroke",
              colorMode === "weight"
                ? colorWeight(d["Weight"])
                : colorMode === "ENLoad"
                ? colorEnLoad(d["EN Load"])
                : colorPart(d.Name)
            )
            .style("stroke-width", 3);
        }
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

    if (colorMode !== "part") {
      const legendData =
        colorMode === "weight"
          ? [
              { text: "軽量", color: d3.schemeBlues[4][1] },
              { text: "中量", color: d3.schemeBlues[4][2] },
              { text: "重量", color: d3.schemeBlues[4][3] },
            ]
          : [
              { text: "低め", color: d3.schemeGreens[4][1] },
              { text: "中間", color: d3.schemeGreens[4][2] },
              { text: "高め", color: d3.schemeGreens[4][3] },
            ];

      const legend = svg
        .selectAll(".legend")
        .data(legendData)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width + 90},${i * 20})`);

      legend
        .append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", (d) => d.color);

      legend
        .append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text((d) => d.text);
    }

    return () => {
      tooltip.remove();
    };
  }, [data, selected, colorMode, highlighted]);

  return (
    <div>
      <div>
        <button onClick={() => setColorMode("part")}>パーツごと</button>
        <button onClick={() => setColorMode("weight")}>重量ごと</button>
        <button onClick={() => setColorMode("ENLoad")}>EN負荷ごと</button>
      </div>
      <aside>
        <svg ref={ref}></svg>
      </aside>
    </div>
  );
}

export default ParallelCoordinate;
