import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const RadarChartComponent = ({ data, partTypes }) => {
  const aggregatedData = {
    Weight: 0,
    "EN Capacity": 0,
    Impact: 0,
    "Direct Hit Adjustment": 0,
    "Attack Power": 0,
    AP: 0,
  };

  const radiusAxisProps = {
    Weight: { domain: [0, 85000] },
    "EN Capacity": { domain: [0, 50000] }, // 10倍した後の最大値
    Impact: { domain: [0, 10000] },
    "Direct Hit Adjustment": { domain: [0, 30000] },
    "Attack Power": { domain: [0, 100000] }, // 10倍した後の最大値
    AP: { domain: [0, 75000] }, // 5倍した後の最大値
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
          aggregatedData["EN Capacity"] += (selectedPart["EN Capacity"] || 0) * 10;
          aggregatedData.Impact += selectedPart.Impact * 50 || 0;
          aggregatedData["Direct Hit Adjustment"] += selectedPart["Direct Hit Adjustment"] * 100 || 0;
          aggregatedData["Attack Power"] += (selectedPart["Attack Power"] || 0) * 10;
          aggregatedData.AP += (selectedPart.AP || 0) * 5;
        }
      }
    }
    console.log(aggregatedData.Weight);
  });

  const chartData = [
    { subject: "Weight", value: aggregatedData.Weight },
    { subject: "EN Capacity", value: aggregatedData["EN Capacity"] },
    { subject: "Impact", value: aggregatedData.Impact },
    { subject: "Direct Hit Adjustment", value: aggregatedData["Direct Hit Adjustment"] },
    { subject: "Attack Power", value: aggregatedData["Attack Power"] },
    { subject: "AP", value: aggregatedData.AP },
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} tickCount={6}
        domain={radiusAxisProps["Weight"].domain}/>
        <Radar
          name="Selected Data"
          dataKey="value"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChartComponent;
