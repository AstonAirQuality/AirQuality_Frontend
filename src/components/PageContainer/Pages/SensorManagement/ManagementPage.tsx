import { useState } from "react";
import WriteContainer from "./CRUD/Write/WriteContainer.tsx";
import DeleteContainer from "./CRUD/Delete/DeleteContainer.tsx";
import ViewContainer from "./CRUD/View/ViewContainer.tsx";
import SensorPlatformTypeTable from "./Tables/SensorPlatformTypeTable.tsx";
import SensorPlatformTable from "./Tables/SensorPlatformTable.tsx";


interface ManagementPageProps {
    page: string;
}

const ManagementPage: React.FC<ManagementPageProps> = ({ page }) => {
    const [tableRefresh, setTableRefresh] = useState<boolean>(false);
    const [menuOpen, setMenuOpen] = useState<string>("false");
    const [rowData, setRowData] = useState<any>(null);

    if (page === "sensor-platform-type") {
        return (
            <div className="page">
                <SensorPlatformTypeTable
                    tableRefresh={tableRefresh} setTableRefresh={setTableRefresh}
                    setMenuOpen={setMenuOpen} setRowData={setRowData}
                />
                {menuOpen && (menuOpen.includes("Create") || menuOpen.includes("Edit")) && (
                    <WriteContainer menuOpen={menuOpen} setMenuOpen={setMenuOpen} setTableRefresh={setTableRefresh} rowData={rowData} />
                )}
                {menuOpen && menuOpen.includes("Delete") && (
                    <DeleteContainer menuOpen={menuOpen} setMenuOpen={setMenuOpen} rowData={rowData} setTableRefresh={setTableRefresh} />
                )}
            </div>
        );
    } else if (page === "sensor-platform") {
        return (
            <div className="page">
                <SensorPlatformTable
                    tableRefresh={tableRefresh} setTableRefresh={setTableRefresh}
                    setMenuOpen={setMenuOpen} setRowData={setRowData}
                />
                {menuOpen && menuOpen.includes("View") && rowData && (
                    <ViewContainer menuOpen={menuOpen} setMenuOpen={setMenuOpen} rowData={rowData} />
                )}
                {menuOpen && (menuOpen.includes("Create") || menuOpen.includes("Edit")) && (
                    <WriteContainer menuOpen={menuOpen} setMenuOpen={setMenuOpen} setTableRefresh={setTableRefresh} rowData={rowData} />
                )}
                {menuOpen && menuOpen.includes("Delete") && (
                    <DeleteContainer menuOpen={menuOpen} setMenuOpen={setMenuOpen} rowData={rowData} setTableRefresh={setTableRefresh} />
                )}
            </div>
        );
    }
    return null;
};

export default ManagementPage;
