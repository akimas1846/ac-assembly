import React, { useState, useEffect } from "react";
import acPartsData from "../data/acPartsData.json";
import ParallelCoordinate from "./ParallelCoordinate";
import RadarChart from "./RadarChart";
import RecommendWeapon from "./RecomendWeapon";

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
  const otherWeapon = partTypes.filter((item) => !item.label.includes("unit"));
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
  const [parallelCoordinateData, setParallelCoordinateData] = useState(
    acPartsData.armunit
  );

  const [checkedData, setCheckedData] = useState(false);
  const [recommendedLegs, setRecommendedLegs] = useState([]);
  const [recommendedArms, setRecommendedArms] = useState([]);
  const [recommendedGenerator, setRecommendedGenerator] = useState([]);
  const [activeTab, setActiveTab] = useState("parts");
  const [activeComponent, setActiveComponent] = useState("parallel");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [rightArmIndex, setRightArmIndex] = useState(-1);
  const [leftArmIndex, setLeftArmIndex] = useState(-1);
  const [rightBackIndex, setRightBackIndex] = useState(-1);
  const [leftBackIndex, setLeftBackIndex] = useState(-1);

  useEffect(() => {
    console.log(selectedParts);
    checkedData ? console.log("selected") : console.log("no selected");
  }, [selectedParts]);

  const handleSelectChange = (e, partType) => {
    const selectedName = e.target.value;
    const buffParts = {
      ...selectedParts,
      [partType]: selectedName,
    };

    setSelectedParts(buffParts);
    setCheckedData(checkSelectedData(buffParts));
  };

  const checkSelectedData = (selectedParts) => {
    const ignoredKeys = [
      "Right Arm unit",
      "Right Back unit",
      "Left Arm unit",
      "Left Back unit",
    ];

    return Object.keys(selectedParts).every((key) => {
      if (ignoredKeys.includes(key)) {
        return true;
      }
      return selectedParts[key] !== "";
    });
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

    const missingParts = Object.entries(selectedParts)
      .filter(([key, value]) => !value && !key.includes("unit"))
      .map(([key]) => key);

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
          ...partTypes.filter((part) =>
            ["Head", "Arms", "Booster"].includes(part.label)
          ),
          ...partTypes.filter((part) =>
            [
              "Right Arm unit",
              "Left Arm unit",
              "Right Back unit",
              "Left Back unit",
            ].includes(part.label)
          ),
        ]
      : partTypes;

  const selectedPartNames = Object.keys(selectedParts)
    .filter((key) => currentPartTypes.some((part) => part.label === key))
    .reduce((obj, key) => {
      obj[key] = selectedParts[key];
      return obj;
    }, {});

  const missingParts = Object.entries(selectedParts)
    .filter(([key, value]) => !value && !key.includes("unit"))
    .map(([key]) => key);

  const handleMouseOverData = (index, idx) => {
    console.log(index);
    if (index === 0) {
      console.log(idx);
      setRightArmIndex(idx);
    } else if (index === 1) {
      console.log(idx);
      setLeftArmIndex(idx);
    } else if (index === 2) {
      console.log(idx);
      setRightBackIndex(idx);
    } else {
      console.log(idx);
      setLeftBackIndex(idx);
    }
  };

  const handleMouseOutData = (index) => {
    if (index === 0) {
      setRightArmIndex(-1);
    } else if (index === 1) {
      setLeftArmIndex(-1);
    } else if (index === 2) {
      setRightBackIndex(-1);
    } else {
      setLeftBackIndex(-1);
    }
  };
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

        <h2>使いたい機体パーツを選択</h2>
        {otherWeapon.map((partType, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <label>
              {partType.label}:
              <select
                value={selectedParts[partType.label]}
                onChange={(e) => handleSelectChange(e, partType.label)}
              >
                <option value="">{partType.label}を選択</option>
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
                  <strong>{partType}:</strong>{" "}
                  {selectedName || "選択されていません"}
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
        {/* <RadarChart data={selectedParts} partTypes={partTypes} />
        <ParallelCoordinate
          data={parallelCoordinateData}
          highlighted={Object.values(selectedParts).filter((name) => name)}
        /> */}
        <RadarChart
          data={selectedParts}
          partTypes={partTypes}
          hoveringItem={hoveredItem}
          checkedData={checkedData}
        />
      </div>
      <div className="recommendations-container">
        <h2>推奨武器を選択</h2>
        {checkedData ? (
          <RecommendWeapon
            unitsPartsType={unitsPartsType}
            selectedParts={selectedParts}
            handleSelectChange={handleSelectChange}
            setHoveredItem={setHoveredItem}
          />
        ) : (
          <div>
            パーツを選択してください。
            <ul>
              {missingParts.map((partType, index) => (
                <li key={index}>{partType}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Main;
