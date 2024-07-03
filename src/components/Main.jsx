import React, { useState ,useEffect} from "react";
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

  const parallelData = [
    { label: "armunit", data: acPartsData.armunit },
    { label: "backunit", data: acPartsData.backunit },
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

  const [parallelCoordinateData, setParallelCoordinateData] = useState(
    acPartsData.armunit
  );

  const handleSelectChange = (e, partType) => {
    const selectedName = e.target.value;
    setSelectedParts((prevSelectedParts) => ({
      ...prevSelectedParts,
      [partType]: selectedName,
    }));
    // パーツのデータを更新
    const partData = partTypes.find((part) => part.label === partType).data;
    const selectedData = partData.filter((item) => item.Name === selectedName);
    setSelectedPartData(selectedData);
  };

  const handleParallelCoordinateChange = (e) => {
    const selectedPartType = e.target.value;
    const partData = parallelData.find(
      (part) => part.label === selectedPartType
    ).data;
    setParallelCoordinateData(partData);
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
                <option key={idx} value={item.Name}>
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

      {/* ParallelCordinateに渡すデータを選択するプルダウンバー */}
      <div style={{ marginTop: "20px" }}>
        <h2>Parallel Coordinateに表示するパーツを選択</h2>
        <select onChange={handleParallelCoordinateChange}>
          {parallelData.map((partType, index) => (
            <option key={index} value={partType.label}>
              {partType.label}
            </option>
          ))}
        </select>
      </div>

      {/* ParallelCordinateの表示 */}
      <ParallelCordinate data={parallelCoordinateData} />
    </div>
  );
}

export default Main;
