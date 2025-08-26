import React, { useState } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import StaticSensorMapMarker from "./StaticSensorMapMarker.tsx";
import { User } from "../../../../../types/User.ts";

interface TableBodyProps {
    props: {
        setMenuOpen: (menuPath: string) => void;
        setRowData: (rowData: any) => void;
    };
    tableType: string;
    headers: string[];
    rowData: Record<string, any>;
    user: User;
    disableActions?: boolean;
}

interface TableRowProps {
    header: string;
    value: any;
}

interface TableActionsBtn {
    buttonText: string;
    buttonStyle: string;
    menuPath: string;
    setMenuOpen: (menuPath: string) => void;
    setRowData: (rowData: any) => void;
    rowData: any;
}

interface TableActionsDropDownProps {
    btns: TableActionsBtn[];
}

interface TableActionsDropdownItemsProps {
    btn: TableActionsBtn;
}

// Recursive tree renderer
const ObjectTree: React.FC<{ data: any; level?: number }> = ({ data, level = 0 }) => {
    const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({});

    if (typeof data !== "object" || data === null) {
        return <span>{String(data)}</span>;
    }

    const handleToggle = (key: string) => {
        setOpenKeys((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <ul style={{ marginLeft: level * 16 }}>
            {Object.entries(data).map(([key, val]) => {
                const isObject = typeof val === "object" && val !== null;
                const isOpen = openKeys[key] ?? false;
                return (
                    <li key={key}>
                        {isObject && (
                            <button
                                onClick={() => handleToggle(key)}
                                style={{
                                    marginRight: 4,
                                    cursor: "pointer",
                                    background: "none",
                                    border: "none",
                                    color: "#2563eb",
                                    fontWeight: "bold",
                                }}
                                aria-label={isOpen ? "Collapse" : "Expand"}
                            >
                                {isOpen ? "▼" : "▶"}
                            </button>
                        )}
                        <strong>{key}:</strong>{" "}
                        {isObject ? (
                            isOpen ? (
                                <ObjectTree data={val} level={level + 1} />
                            ) : (
                                <span style={{ color: "#888" }}>{Array.isArray(val) ? "[...]" : "{...}"}</span>
                            )
                        ) : (
                            <span>{String(val)}</span>
                        )}
                    </li>
                );
            })}
        </ul>
    );
};

const TableBody: React.FC<TableBodyProps> = ({
    props,
    tableType,
    headers,
    rowData,
    user,
    disableActions,
}) => {
    const editBtnMenuPath = `Edit-${tableType}`;
    const viewBtnMenuPath = "View";
    const deleteBtnMenuPath = `Delete-${tableType}`;

    const allbtns: TableActionsBtn[] = [
        {
            buttonText: "View",
            buttonStyle: "table-view-button",
            menuPath: viewBtnMenuPath,
            setMenuOpen: props.setMenuOpen,
            setRowData: props.setRowData,
            rowData,
        },
        {
            buttonText: "Edit",
            buttonStyle: "table-edit-button",
            menuPath: editBtnMenuPath,
            setMenuOpen: props.setMenuOpen,
            setRowData: props.setRowData,
            rowData,
        },
        {
            buttonText: "Delete",
            buttonStyle: "table-delete-button",
            menuPath: deleteBtnMenuPath,
            setMenuOpen: props.setMenuOpen,
            setRowData: props.setRowData,
            rowData,
        },
    ];

    return (
        <tr
            id={rowData[headers[1]]}
            className="bg-white border-b dark:bg-gray-700 dark:border-gray-800 hover:bg-gray-300 dark:hover:bg-gray-900"
        >
            {headers.map((header, idx) => (
                <TableRow key={idx} header={header} value={rowData[header]} />
            ))}
            {disableActions === false ? (
                <td className="py-4 px-6">
                    {(user?.role === "admin" || user?.role === "sensortech") ? (
                        <TableActionsDropDown btns={allbtns} />
                    ) : (
                        <TableActionsDropdownItems btn={allbtns[0]} />
                    )}
                </td>
            ) : null}
        </tr>
    );
};

// Describes how to render each row based on different header and value types like coordinates, booleans, objects, etc.
const TableRow: React.FC<TableRowProps> = ({ header, value }) => {
    if (header === "stationary_box") {
        return (
            <td className="py-3 px-6 flex items-center justify-center">
                <StaticSensorMapMarker boundingBox={value} />
            </td>
        );
    }

    let displayValue = value;

    if (header === "active") {
        const isActive = Boolean(value);
        displayValue = (
            <div className="flex items-center">
                <div
                    className={`h-2.5 w-2.5 rounded-full mr-2 ${
                        isActive ? "bg-green-400" : "bg-red-500"
                    }`}
                ></div>
                {isActive ? "Online" : "Offline"}
            </div>
        );
    } else if (header === "username" && typeof value === "string") {
        displayValue = value.split(" ")[0];
    } else if (typeof value === "object") {
        displayValue = (
            <div className="w-full">
                <ObjectTree data={value} />
            </div>
        );
    } else if (header === "time_updated" && value !== null) {
        displayValue = new Date(value).toLocaleString();
    }

    return (
        <td className="py-3 px-6">
            <div className="flex items-center justify-center">{displayValue}</div>
        </td>
    );
};

const TableActionsDropDown: React.FC<TableActionsDropDownProps> = ({ btns }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <button
                onClick={() => setExpanded((prev) => !prev)}
                className="table-actions-dropdown flex justify-between"
            >
                <span>Actions</span>
                <RiArrowDropDownLine size={32} />
            </button>
            <ul
                id="dropdown"
                className={expanded ? "py-2 space-y-2 w-full" : "hidden"}
            >
                {btns.map((btn, idx) => (
                    <li key={idx}>
                        <TableActionsDropdownItems btn={btn} />
                    </li>
                ))}
            </ul>
        </>
    );
};

const TableActionsDropdownItems: React.FC<TableActionsDropdownItemsProps> = ({
    btn,
}) => (
    <button
        onClick={() => {
            btn.setMenuOpen(btn.menuPath);
            btn.setRowData(btn.rowData);
        }}
        className={btn.buttonStyle}
    >
        {btn.buttonText}
    </button>
);

export default TableBody;