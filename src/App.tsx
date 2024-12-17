import React, { useState } from "react";
import ArtworkTable from "./components/ArtworkTable";
import CustomRowSelection from "./components/CustomRowSelection";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const App: React.FC = () => {
  const [selectedRows, setSelectedRows] = useState<{ [key: number]: boolean }>({});

  return (
    <div>
      <h2>Artworks Table</h2>
      <ArtworkTable />
      <CustomRowSelection selectedRows={selectedRows} />
    </div>
  );
};

export default App;
