import React from "react";

interface CustomRowSelectionProps {
  selectedRows: { [key: number]: boolean };
}

const CustomRowSelection: React.FC<CustomRowSelectionProps> = ({ selectedRows }) => {
  const selectedIds = Object.keys(selectedRows).filter((key) => selectedRows[Number(key)]);

  return (
    <div>
      <h4>Selected Rows</h4>
      {selectedIds.length > 0 ? (
        <ul>
          {selectedIds.map((id) => (
            <li key={id}>Row ID: {id}</li>
          ))}
        </ul>
      ) : (
        <p>No rows selected.</p>
      )}
    </div>
  );
};

export default CustomRowSelection;
