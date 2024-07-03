import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import translation from "../data/translation.json";

function ParallelCoordinates({ data }) {
  const ref = useRef();

  useEffect(() => {
    const margin = { top: 30, right: 10, bottom: 50, left: 10 };
    const width = 4700 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;
    // const [simpleWidth, setSimpleWisth] = useState(
    //   4700 - margin.left - margin.right
    // );
    // const [simpleHeight, setSimpleHeight] = useState(
    //   700 - margin.top - margin.bottom
    // );

    const svg = d3
      .select(ref.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // 1. データからすべてのキーを収集
    const allKeys = new Set();
    data.forEach((d) => Object.keys(d).forEach((key) => allKeys.add(key)));

    // 次元生成のキーを収集
    // EN LoadとWeightは一番左へ
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

    // 3. 各データオブジェクトに対して共通のキーを設定
    const processedData = data.map((d) => {
      const processed = { ...d };
      dimensions.forEach((dim) => {
        if (!(dim in processed)) {
          processed[dim] = 0; // 存在しないキーに対しては0
        }
      });
      return processed;
    });

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const y = {};
    for (let name of dimensions) {
      y[name] = d3
        .scaleLinear()
        .domain(d3.extent(processedData, (d) => +d[name]))
        .nice()
        .range([height, 0]);
    }

    // X軸スケール設定
    const x = d3.scalePoint().range([0, width]).padding(0.5).domain(dimensions);

    // 点と点を結ぶ関数
    const line = (d) => d3.line()(dimensions.map((p) => [x(p), y[p](d[p])]));

    // データプロット
    svg
      .selectAll("myPath")
      .data(processedData)
      .enter()
      .append("path")
      .attr("d", line)
      .style("fill", "none")
      .style("stroke", "steelblue")
      .style("stroke", (d, i) => color(i))
      .style("opacity", 0.7);

    // 各軸の描画
    svg
      .selectAll("myAxis")
      .data(dimensions)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${x(d)})`)
      .each(function (d) {
        d3.select(this).call(d3.axisLeft().scale(y[d]).ticks(5));
      })
      .append("text")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .attr("y", -20)
      .attr("x", 0)
      .text((d) => translation[0][d] || d)
      .style("fill", "black");
  }, [data]);

  return <svg ref={ref}></svg>;
}

export default ParallelCoordinates;
