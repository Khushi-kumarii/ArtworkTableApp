import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Checkbox } from "primereact/checkbox";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputText } from "primereact/inputtext";
import { fetchArtworks } from "../services/apiService";
import { FaArrowDown } from "react-icons/fa";

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: string;
  date_end: string;
}

const ArtworkTable: React.FC = () => {
  const op = useRef<any>(null);
  const [pageData, setPageData] = useState<{ [page: number]: Artwork[] }>({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedRows, setSelectedRows] = useState<{ [id: number]: boolean }>({});
  const [first, setFirst] = useState(0);
  const [selectCount, setSelectCount] = useState<string>("");

  const fetchData = async (page: number) => {
    setLoading(true);
    try {
      const offset = (page - 1) * 12;
      const data = await fetchArtworks(offset);
      const artworksData: Artwork[] = data.data.map((item: any): Artwork => ({
        id: item.id,
        title: item.title,
        place_of_origin: item.place_of_origin,
        artist_display: item.artist_display,
        inscriptions: item.inscriptions,
        date_start: item.date_start,
        date_end: item.date_end,
      }));

      setPageData((prev) => ({
        ...prev,
        [page]: artworksData,
      }));

      setTotalRecords(data.pagination.total);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const onPageChange = (event: any) => {
    const newPage = event.page + 1;
    setCurrentPage(newPage);
    setFirst(event.first);
  };

  const toggleRowSelection = (id: number, checked: boolean | undefined) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: !!checked, // Cast undefined to false if necessary
    }));
  };

  const onSelectAllChange = (e: any) => {
    const currentPageData = pageData[currentPage] || [];
    const allSelected = e.checked;

    const updatedSelectedRows = { ...selectedRows };
    currentPageData.forEach((item) => {
      updatedSelectedRows[item.id] = allSelected;
    });

    setSelectedRows(updatedSelectedRows);
  };

  const rowSelectTemplate = (rowData: Artwork) => (
    <Checkbox
      onChange={(e) => toggleRowSelection(rowData.id, e.checked)}
      checked={!!selectedRows[rowData.id]}
    />
  );

  const headerCheckboxTemplate = () => {
    const currentPageData = pageData[currentPage] || [];
    const allChecked = currentPageData.every((item) => selectedRows[item.id]);
    const isIndeterminate =
      currentPageData.some((item) => selectedRows[item.id]) && !allChecked;

    return (
      <div className="header-checkbox-container">
        <Checkbox
          onChange={onSelectAllChange}
          checked={allChecked}
          className={isIndeterminate ? "p-indeterminate" : ""}
        />
        <FaArrowDown
          onClick={(e) => op.current?.toggle(e)}
          style={{ cursor: "pointer", marginLeft: "10px" }}
        />
      </div>
    );
  };

  const handleSelectRows = async () => {
    const count = Number(selectCount);
    if (isNaN(count) || count <= 0) return;

    const updatedSelectedRows = { ...selectedRows };
    let rowsSelected = Object.keys(updatedSelectedRows).length;
    let pageNumber = 1;

    while (rowsSelected < count && pageNumber <= Math.ceil(totalRecords / 12)) {
      if (!pageData[pageNumber]) {
        try {
          const offset = (pageNumber - 1) * 12;
          const data = await fetchArtworks(offset);
          const artworksData: Artwork[] = data.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            place_of_origin: item.place_of_origin,
            artist_display: item.artist_display,
            inscriptions: item.inscriptions,
            date_start: item.date_start,
            date_end: item.date_end,
          }));

          setPageData((prev) => ({
            ...prev,
            [pageNumber]: artworksData,
          }));

          artworksData.forEach((item) => {
            if (rowsSelected < count && !updatedSelectedRows[item.id]) {
              updatedSelectedRows[item.id] = true;
              rowsSelected++;
            }
          });
        } catch (error) {
          console.error(`Error fetching data for page ${pageNumber}:`, error);
        }
      } else {
        const currentPageData = pageData[pageNumber] || [];
        currentPageData.forEach((item) => {
          if (rowsSelected < count && !updatedSelectedRows[item.id]) {
            updatedSelectedRows[item.id] = true;
            rowsSelected++;
          }
        });
      }
      pageNumber++;
    }

    setSelectedRows(updatedSelectedRows);
    op.current?.hide();
  };

  const getSelectedArtworks = (): Artwork[] => {
    const selectedIds = Object.keys(selectedRows).map(Number);
    return Object.values(pageData)
      .flat()
      .filter((artwork) => selectedIds.includes(artwork.id));
  };

  return (
    <div>
      <OverlayPanel ref={op} style={{ width: "300px" }} dismissable>
        <div className="overlay-container">
          <h3 className="overlay-title">Select Rows</h3>
          <div className="input-container">
            <label htmlFor="select-count" className="input-label">
              Enter number of rows
            </label>
            <InputText
              id="select-count"
              value={selectCount}
              onChange={(e) => setSelectCount(e.target.value)}
              placeholder="Enter number"
              className="p-inputtext-sm"
            />
          </div>
          <button
            onClick={handleSelectRows}
            className="p-button p-button-primary submit-button"
          >
            Submit
          </button>
        </div>
      </OverlayPanel>

      <DataTable
  value={pageData[currentPage] || []}
  loading={loading}
  paginator
  rows={12}
  first={first}
  totalRecords={totalRecords}
  onPage={onPageChange}
  lazy
  responsiveLayout="scroll"
  dataKey="id"
  selectionMode="multiple"
  selection={getSelectedArtworks()}
  onSelectionChange={(e) => {
    // Ensure we are using setSelectedRows correctly
    const selectedIds = (e.value as Artwork[]).map((item) => item.id);
    const newSelectedRows = selectedIds.reduce((acc: { [key: number]: boolean }, id) => {
      acc[id] = true;
      return acc;
    }, {});

    setSelectedRows(newSelectedRows);
  }}
>

        <Column header={headerCheckboxTemplate()} body={rowSelectTemplate} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" />
        <Column field="date_end" header="Date End" />
      </DataTable>

      <div>
        <h4>Number of rows selected: {Object.keys(selectedRows).length}</h4>
      </div>
    </div>
  );
};

export default ArtworkTable;
