import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const RadarChartComponent = ({ data, partTypes }) => {
  const width = "50%";
  const height = 300;
  const aggregatedData = {
    Weight: 0,
    "Arms Weight": 0,
    "EN Load": 0,
    Impact: 0,
    "Direct Hit Adjustment": 0,
    "Attack Power": 0,
    AP: 0,
  };

  const radiusAxisProps = {
    Weight: { domain: [0, 0] },
    "EN Capacity": { domain: [0, 0] },
    "Arms Weight": { domain: [0, 0] },
    Impact: { domain: [0, 0] },
    "Direct Hit Adjustment": { domain: [0, 0] },
    "Attack Power": { domain: [0, 0] },
    AP: { domain: [0, 0] },
  };

  Object.entries(data).forEach(([partType, selectedName]) => {
    if (selectedName) {
      const partTypeData = partTypes.find((part) => part.label === partType);
      if (partTypeData) {
        const partData = partTypeData.data;
        const selectedPart = partData.find(
          (item) => item.Name === selectedName
        );
        if (selectedPart) {
          aggregatedData.Weight += selectedPart.Weight || 0;
          if (partType.includes("unit")) {
            aggregatedData["Arms Weight"] += selectedPart.Weight * 5 || 0;
          }
          aggregatedData["EN Load"] += (selectedPart["EN Load"] || 0) * 10;
          aggregatedData.Impact += selectedPart.Impact * 25 || 0;
          aggregatedData["Direct Hit Adjustment"] +=
            selectedPart["Direct Hit Adjustment"] * 100 || 0;
          aggregatedData["Attack Power"] +=
            (selectedPart["Attack Power"] || 0) * 10;
          aggregatedData.AP += (selectedPart.AP || 0) * 5;

          if (partType === "Legs") {
            radiusAxisProps.Weight.domain[1] =
              selectedPart["Load Limit"] || radiusAxisProps.Weight.domain[1];
          } else if (partType === "Generator") {
            radiusAxisProps["EN Capacity"].domain[1] =
              (selectedPart["EN Capacity"] || 0) * 10;
          } else if (partType === "Arms") {
            radiusAxisProps["Arms Weight"].domain[1] =
              selectedPart["Arms Load Limit"] * 5 ||
              radiusAxisProps["Arms Weight"].domain[1];
          }
        }
      }
    }
  });

  const chartData = [
    { subject: "Weight", value: aggregatedData.Weight },
    { subject: "Arms Weight", value: aggregatedData["Arms Weight"] },
    { subject: "EN Load", value: aggregatedData["EN Load"] },
    { subject: "Impact", value: aggregatedData.Impact },
    {
      subject: "Direct Hit Adjustment",
      value: aggregatedData["Direct Hit Adjustment"],
    },
    { subject: "Attack Power", value: aggregatedData["Attack Power"] },
    { subject: "AP", value: aggregatedData.AP },
  ];

  const upperLimitData = [
    { subject: "Weight", value: radiusAxisProps.Weight.domain[1] },
    { subject: "Arms Weight", value: radiusAxisProps["Arms Weight"].domain[1] },
    { subject: "EN Load", value: radiusAxisProps["EN Capacity"].domain[1] },
    { subject: "Impact", value: radiusAxisProps.Impact.domain[1] },
    {
      subject: "Direct Hit Adjustment",
      value: radiusAxisProps["Direct Hit Adjustment"].domain[1],
    },
    {
      subject: "Attack Power",
      value: radiusAxisProps["Attack Power"].domain[1],
    },
    { subject: "AP", value: radiusAxisProps.AP.domain[1] },
  ];

  const overWeight = aggregatedData.Weight > radiusAxisProps.Weight.domain[1];
  const overArmsWeight =
    aggregatedData["Arms Weight"] > radiusAxisProps["Arms Weight"].domain[1];
  const overENLoad =
    aggregatedData["EN Load"] > radiusAxisProps["EN Capacity"].domain[1];
  const missionImpossible = overArmsWeight || overENLoad;

  return (
    <div>
      <ResponsiveContainer width={width} height={height}>
        <RadarChart data={chartData} domain={[0, 100000]}>
          <PolarGrid />
          <PolarRadiusAxis domain={[0, 100000]} tick={false} />
          <PolarAngleAxis dataKey="subject" />
          <Radar
            name="Selected Data"
            dataKey="value"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
            isAnimationActive={false}
          />
          <Radar
            name="Upper Limits"
            dataKey="value"
            stroke="#ff7300"
            fill="#ff7300"
            fillOpacity={0.3}
            dot={{ r: 4 }}
            data={upperLimitData}
            isAnimationActive={false}
          />
          <Tooltip />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
      <div>
        {overWeight && <p>積載量超過</p>}
        {overArmsWeight && <p>腕部積載量超過</p>}
        {overENLoad && <p>EN出力不足</p>}
        {missionImpossible && <p>出撃不可</p>}
      </div>
    </div>
  );
};

export default RadarChartComponent;
