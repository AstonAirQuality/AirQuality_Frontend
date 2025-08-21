import React, { useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";

const ToolTip = ({
    title = "",
    message = "",
    items,
}: {
    title?: string;
    message?: string;
    items: Record<string, string>;
}) => {
    const [open, setOpen] = useState(false);

    return (
        <span
            className="ml-2 cursor-pointer relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <FaQuestionCircle
                className="h-4 w-4 dark:text-gray-400 text-gray-500 inline-block"
                tabIndex={0}
                aria-label="Show tooltip"
            />
            {open && (
                <span className="absolute left-full ml-2 w-[30vw] p-2 dark:bg-gray-700 dark:text-white bg-gray-300 text-black text-s rounded shadow-lg z-10">
                    <p className='mb-1'>{title}</p> {message}
                    <br />
                    {Object.entries(items).map(([key, value]) => (
                        <span key={key}>
                            <p>{key}</p>: <code>{value}</code>
                            <br />
                        </span>
                    ))}
                </span>
            )}
        </span>
    );
};
export default ToolTip;