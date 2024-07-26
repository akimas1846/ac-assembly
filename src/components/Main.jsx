import React, { useState, useEffect } from "react";
import acPartsData from "../data/acPartsData.json";
import ParallelCoordinate from "./ParallelCoordinate";
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
  const [parallelCoordinateData, setParallelCoordinateData] = useState(acPartsData.armunit);
  const [recommendedLegs, setRecommendedLegs] = useState([]);
  const [recommendedArms, setRecommendedArms] = useState([]);
  const [recommendedGenerator, setRecommendedGenerator] = useState([]);
  const [activeTab, setActiveTab] = useState("parts");
  const [activeComponent, setActiveComponent] = useState("parallel");

  const handleSelectChange = (e, partType) => {
    const selectedName = e.target.value;
    setSelectedParts((prevSelectedParts) => ({
      ...prevSelectedParts,
      [partType]: selectedName,
    }));
  };

  const handleParallelCoordinateChange = (e) => {
    const selectedPartType = e.target.value;
    const partData = parallelData.find(
      (part) => part.label === selectedPartType
    ).data;
    setParallelCoordinateData(partData);
  };

  const calculateRecommendations = () => {
    let totalWeight = 0;
    let totalEnLoad = 0;
    let armLoad = 0;

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
            if (
              partType.includes("Arm unit") ||
              partType.includes("Back unit")
            ) {
              armLoad += selectedPart.Weight || 0;
            }
          }
        }
      }
    });

    const filteredLegs = acPartsData.legs.filter(
      (leg) => leg["Load Limit"] >= totalWeight
    );
    setRecommendedLegs(filteredLegs);

    const filteredArms = acPartsData.arms.filter(
      (arm) => arm["Arms Load Limit"] >= armLoad
    );
    setRecommendedArms(filteredArms);

    const filteredGenerators = acPartsData.generator.filter(
      (gen) => gen["EN Capacity"] >= totalEnLoad
    );
    setRecommendedGenerator(filteredGenerators);
  };

  useEffect(() => {
    calculateRecommendations();
  }, [selectedParts]);

  const handleTabChange = (e) => {
    const tab = e.target.value;
    setActiveTab(tab);
    setSelectedParts(initialSelectedParts);
  };

  const handleComponentChange = (component) => {
    setActiveComponent(component);
  };

  const currentPartTypes =
    activeTab === "weapons"
      ? [
          ...partTypes.filter((part) => ["Head", "Arms", "Booster"].includes(part.label)),
          ...partTypes.filter((part) =>
            ["Right Arm unit", "Left Arm unit", "Right Back unit", "Left Back unit"].includes(part.label)
          ),
        ]
      : partTypes;

  const selectedPartNames = Object.keys(selectedParts)
    .filter((key) => currentPartTypes.some((part) => part.label === key))
    .reduce((obj, key) => {
      obj[key] = selectedParts[key];
      return obj;
    }, {});

  return (
    <div className="container">
      <div className="content">
        {/* <div className="tabs">
          <label>
            <input
              type="radio"
              name="tab"
              value="weapons"
              checked={activeTab === "weapons"}
              onChange={handleTabChange}
            />
            武器を選択してパーツを推奨
          </label>
          <label>
            <input
              type="radio"
              name="tab"
              value="parts"
              checked={activeTab === "parts"}
              onChange={handleTabChange}
            />
            パーツを選択して武器を推奨
          </label>
        </div> */}

        {currentPartTypes.map((partType, index) => (
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

        <div style={{ marginTop: "20px" }}>
          <h2>選択されたパーツ</h2>
          <ul>
            {Object.entries(selectedPartNames).map(
              ([partType, selectedName]) => (
                <li key={partType}>
                  <strong>{partType}:</strong> {selectedName || "Not selected"}
                </li>
              )
            )}
          </ul>
        </div>

        {/* <div style={{ marginTop: "20px" }}>
          <h2>データ表示するパーツを選択</h2>
          <select onChange={handleParallelCoordinateChange}>
            {parallelData.map((partType, index) => (
              <option key={index} value={partType.label}>
                {partType.label}
              </option>
            ))}
          </select>
        </div> */}

        {/* <div className="component-toggle">
          <button onClick={() => handleComponentChange("parallel")}>
            平行座標プロット
          </button>
          <button onClick={() => handleComponentChange("radar")}>
            レーダーチャート
          </button>
        </div> */}
      </div>

      <div className="plot-container">
        {/* {activeComponent === "parallel" ? (
          <ParallelCoordinate
            data={parallelCoordinateData}
            highlighted={Object.values(selectedParts).filter((name) => name)}
          />
        ) : (
          <RadarChart data={selectedParts} partTypes={partTypes} />
        )} */}
        <RadarChart data={selectedParts} partTypes={partTypes} />
      </div>

      <div className="recommendations-container">
        <h2>推奨パーツ</h2>
        {activeTab === "weapons" && (
          <div>
            <h3>推奨レッグ</h3>
            <ul>
              {recommendedLegs.map((leg, index) => (
                <li key={index}>{leg.Name}</li>
              ))}
            </ul>

            <h3>推奨アーム</h3>
            <ul>
              {recommendedArms.map((arm, index) => (
                <li key={index}>{arm.Name}</li>
              ))}
            </ul>

            <h3>推奨ジェネレーター</h3>
            <ul>
              {recommendedGenerator.map((gen, index) => (
                <li key={index}>{gen.Name}</li>
              ))}
            </ul>
          </div>
        )}
        {activeTab === "parts" && (
          <div>
            <h3>推奨武器</h3>
            {/* 武器の推奨表示ロジック */}
          </div>
        )}
      </div>
    </div>
  );
}

export default Main;
