import React, { useState, MouseEvent, ChangeEvent } from "react";
import { HiFilter } from "react-icons/hi";
import {FilterTable} from "./utils.ts";
import { VscClose } from "react-icons/vsc";

type TableHeadersProps = {
    value: string;
    index: number;
};

const TableHeaders: React.FC<TableHeadersProps> = ({ value, index }) => {
    const [filter, setFilter] = useState<boolean>(false);

    const handleFilter = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setFilter((prev) => !prev);
        FilterTable(index, "");
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        FilterTable(index, e.target.value);
    };

    return (
        <th scope="col" className="py-3 pl-6">
            <div className="flex flex-col items-center">
                <span className="font-medium flex flex-row items-center">
                    <button onClick={handleFilter}>
                        <HiFilter className="w-6 h-6 p-1 focus:outline-none focus:shadow-outline" />
                    </button>
                    {value}
                </span>
                {filter && (
                    <div className="relative text-gray-600 dark:text-gray-500 focus-within:text-gray-400 dark:focus-within:text-gray-700">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-0.5">
                            <HiFilter className="w-6 h-6 p-1 focus:outline-none focus:shadow-outline" />
                        </span>
                        <button
                            onClick={handleFilter}
                            className="table-filter-close-button"
                        >
                            <VscClose size={16} />
                        </button>
                        <input
                            type="text"
                            className="table-filter-input"
                            placeholder="Filter results"
                            onChange={handleInputChange}
                        />
                    </div>
                )}
            </div>
        </th>
    );
};
export default TableHeaders;