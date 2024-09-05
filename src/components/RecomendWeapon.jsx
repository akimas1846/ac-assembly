import React from "react";

function RecommendWeapon({ unitsPartsType, selectedParts ,handleSelectChange}) {
  return (
    <div>
      {unitsPartsType.map((partType, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <label>
            {partType.label}:
            <select
              value={selectedParts[partType.label]}
              onChange={(e) => handleSelectChange(e, partType.label)}
            >
              <option value="">{partType.label}を選択</option>
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
    </div>
  );
}

export default RecommendWeapon;