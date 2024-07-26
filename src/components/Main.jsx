import React, { useState, useEffect } from "react";
import acPartsData from "../data/acPartsData.json";
import RadarChart from "./RadarChart";

function Main() {
  const rightArmunit = acPartsData.armunit.filter((item) => !item.LeftOnly);
  const rightBackunit = acPartsData.backunit.filter((item) => !item.LeftOnly);
  const partTypes = [
    { label: "Right Arm unit", data: rightArmunit },
    { label: "Left Arm unit", data: acPartsData.armunit },
    { label: "Right Back unit", data: rightBackunit },
    { label: "Left Back unit", data: acPartsData.backunit },
    { label: "Head", data: acPartsData.head },
    { label: "Core", data: acPartsData.core },
    { label: "Arms", data: acPartsData.arms },
    { label: "Legs", data: acPartsData.legs },
    { label: "Booster", data: acPartsData.booster },
    { label: "Generator", data: acPartsData.generator },
    { label: "Fcs", data: acPartsData.fcs },
  ];

  const unitsPartsType = partTypes.filter((item) =>
    item.label.includes("unit")
  );
  const otherParts = partTypes.filter((item) => !item.label.includes("unit"));

  const initialSelectedParts = {
    "Right Arm unit": "",
    "Left Arm unit": "",
    "Right Back unit": "",
    "Left Back unit": "",
    Head: "",
    Core: "",
    Arms: "",
    Legs: "",
    Booster: "",
    Generator: "",
    Fcs: "",
  };

  const [selectedParts, setSelectedParts] = useState(initialSelectedParts);
  const [sortOption, setSortOption] = useState("weight"); // Default sorting option for otherParts
  const [unitPartsSortOption, setUnitPartsSortOption] = useState("weight"); // Default sorting option for unitParts
  const [totals, setTotals] = useState({
    weight: 0,
    ap: 0,
    enLoad: 0,
    attackPower: 0,
  });

  const handleSelectChange = (e, partType) => {
    const selectedName = e.target.value;
    setSelectedParts((prevSelectedParts) => ({
      ...prevSelectedParts,
      [partType]: selectedName,
    }));
  };

  const calculateRecommendations = () => {
    let totalWeight = 0;
    let totalEnLoad = 0;
    let totalAp = 0;
    let totalAttackPower = 0;

    Object.entries(selectedParts).forEach(([partType, selectedName]) => {
      if (selectedName) {
        const partTypeData = partTypes.find((part) => part.label === partType);
        if (partTypeData) {
          const partData = partTypeData.data;
          const selectedPart = partData.find(
            (item) => item.Name === selectedName
          );
          if (selectedPart) {
            totalWeight += selectedPart.Weight || 0;
            totalEnLoad += selectedPart["EN Load"] || 0;
            totalAp += selectedPart["AP"] || 0;
            totalAttackPower += selectedPart["Attack Power"] || 0;
          }
        }
      }
    });

    setTotals({
      weight: totalWeight,
      ap: totalAp,
      enLoad: totalEnLoad,
      attackPower: totalAttackPower,
    });
  };

  useEffect(() => {
    calculateRecommendations();
  }, [selectedParts]);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleUnitPartsSortChange = (e) => {
    setUnitPartsSortOption(e.target.value);
  };

  // Sorting functions
  const sortData = (data, option) => {
    return data.slice().sort((a, b) => {
      if (option === "weight") return a.Weight - b.Weight;
      if (option === "atk") return a["Attack Power"] - b["Attack Power"];
      if (option === "enLoad") return a["EN Load"] - b["EN Load"];
      if (option === "ap") return a["AP"] - b["AP"];
      return 0;
    });
  };

 const sortedOtherParts = otherParts.map((partType) => ({
    ...partType,
    data: sortData(partType.data, sortOption),
  }));

  const sortedUnitParts = unitsPartsType.map((partType) => ({
    ...partType,
    data: sortData(partType.data, unitPartsSortOption),
  }));

  return (
    <div className="container">
      <div className="content">
        <h2>機体パーツを選択</h2>
        <div>
          <label>
            <span>並び替え:</span>
            <select value={sortOption} onChange={handleSortChange}>
              <option value="weight">重量順</option>
              <option value="ap">AP順</option>
              <option value="enLoad">EN容量順</option>
            </select>
          </label>
        </div>
        {sortedOtherParts.map((partType, index) => (
          <div key={index} style={{ marginBottom: "5px" }}>
            <label>
              {partType.label}:
              <select
                value={selectedParts[partType.label]}
                onChange={(e) => handleSelectChange(e, partType.label)}
                style={{ marginLeft: "10px" }}
              >
                <option value="">Select {partType.label}</option>
                {partType.data.map((item, idx) => (
                  <option key={idx} value={item.Name}>
                    {item.Name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}

        <div style={{ marginTop: "10px" }}>
          <h2>選択されたパーツ</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {Object.entries(selectedParts).map(([partType, selectedName], index) => (
              <li key={index} style={{ marginBottom: "5px" }}>
                {selectedName ? (
                  <span>{partType}: {selectedName}</span>
                ) : (
                  <span>{partType}: Non Selected</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="plot-container">
        <RadarChart data={selectedParts} partTypes={partTypes} />
      </div>

      <div className="recommendations-container">
        <h2>武器を選択</h2>
        <div>
          並び替え:
          <label>
            <select
              value={unitPartsSortOption}
              onChange={handleUnitPartsSortChange}
            >
              <option value="weight">重量順</option>
              <option value="atk">攻撃力順</option>
              <option value="enLoad">EN容量順</option>
            </select>
          </label>
        </div>
        {sortedUnitParts.map((partType, index) => (
          <div key={index} style={{ marginBottom: "5px" }}>
            <label>
              {partType.label}:
              <select
                value={selectedParts[partType.label]}
                onChange={(e) => handleSelectChange(e, partType.label)}
                style={{ marginLeft: "10px" }}
              >
                <option value="">Select {partType.label}</option>
                {partType.data.map((item, idx) => (
                  <option key={idx} value={item.Name}>
                    {item.Name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}
        <div style={{ marginTop: "10px" }}>
          <h2>選択されたパーツの詳細</h2>
          <p>合計重量: {totals.weight}</p>
          <p>合計AP: {totals.ap}</p>
          <p>合計EN容量: {totals.enLoad}</p>
          <p>合計攻撃力: {totals.attackPower}</p>
        </div>
      </div>
    </div>
  );
}

export default Main;
