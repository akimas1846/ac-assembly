import React, { useState } from "react";
import acPartsData from "../data/acPartsData.json";
import ParallelCordinate from "./ParallelCoedinate";
function Main() {
  // パーツタイプのデータ
  const rightArmunit = acPartsData.armunit.filter((item) => {
    return item.LeftOnly == false;
  });
  const rightBackunit = acPartsData.backunit.filter((item) => {
    return item.LeftOnly == false;
  });
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

  const [selectedParts, setSelectedParts] = useState({
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
  });

  const handleSelectChange = (e, partType) => {
    const selectedName = e.target.value;
    setSelectedParts((prevSelectedParts) => ({
      ...prevSelectedParts,
      [partType]: selectedName,
    }));
  };

  return (
    <div>
      {partTypes.map((partType, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <label>
            {partType.label}:
            <select
              value={selectedParts[partType.label]}
              onChange={(e) => handleSelectChange(e, partType.label)}
            >
              <option value="">Select {partType.label}</option>
              {partType.data.map((item, idx) => (
                <option
                  key={idx}
                  value={item.Name}
                >
                  {item.Name}
                </option>
              ))}
            </select>
          </label>
        </div>
      ))}

      {/* 選択結果の表示 */}
      <div style={{ marginTop: "20px" }}>
        <h2>選択されたパーツ</h2>
        <ul>
          {Object.entries(selectedParts).map(([partType, selectedName]) => (
            <li key={partType}>
              <strong>{partType}:</strong> {selectedName || "Not selected"}
            </li>
          ))}
        </ul>
      </div>
      <ParallelCordinate data={acPartsData.armunit}/>
    </div>
  );
}

export default Main;
