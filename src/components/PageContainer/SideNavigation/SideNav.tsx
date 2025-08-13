import { VscClose } from "react-icons/vsc";
import { Link } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { BiExport, BiUserCircle } from "react-icons/bi";
import { BsGearFill, BsSearch } from "react-icons/bs";
import { GoCode } from "react-icons/go";
import { RiArrowDropDownLine } from "react-icons/ri";
import { NavLinks } from "./data/Navlinks.ts";
import { UserAuth } from "../../context/AuthContext.tsx";
import { SiMapbox } from "react-icons/si";
import { FaUserLock } from "react-icons/fa";
import { useState, MouseEvent } from "react";

interface SideNavProps {
    setsideNavMenu: (open: boolean) => void;
}

interface SideNavMenuItemProps {
    icon: React.ReactNode;
    url: string;
    text?: string;
    setsideNavMenu: (open: boolean) => void;
}

interface DropdownItem {
    url: string;
    routeName: string;
}

interface SideNavDropdownProps {
    icon: React.ReactNode;
    text?: string;
    dropdown_items: DropdownItem[];
    setsideNavMenu: (open: boolean) => void;
}

interface DropdownItemsProps {
    dropdown_item: DropdownItem;
    setsideNavMenu: (open: boolean) => void;
}

const SideNav = (props: SideNavProps) => {
    const { user } = UserAuth() || {};;

    function handleClose(e: MouseEvent<HTMLDivElement>) {
        if ((e.target as HTMLElement).id === "sideMenu") {
            props.setsideNavMenu(false);
        }
    }

    return (
        <div id="sideMenu" onClick={handleClose} className="modal-container z-50">
            <div className="sidenav">
                {/* Header */}
                <div className="relative p-2.5 ">
                    <Link to="/" className="flex items-center pl-2.5 mb-2">
                        <img src="/crest.png" className="mr-3 h-12 sm:h-14" alt="IoT logo" />
                        <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
                            Aston Air Quality
                        </span>
                    </Link>

                    <button
                        onClick={() => props.setsideNavMenu(false)}
                        className="text-gray-400 hover:bg-gray-200 hover:text-gray-900  dark:hover:bg-gray-600 dark:hover:text-white rounded-lg p-2.5 mb-5 absolute top-2 sm:top-3 right-0"
                    >
                        <VscClose size={32} />
                    </button>
                </div>

                {/* Content/Navlinks */}
                <div className="overflow-y-auto py-4 px-3 bg-gray-50 rounded dark:bg-gray-800">
                    <ul className="space-y-2">
                        <SideNavMenuItem
                            icon={<AiFillHome size={28} />}
                            text="Home"
                            url="/"
                            setsideNavMenu={props.setsideNavMenu}
                        />
                        {user && (
                            <SideNavMenuItem
                                icon={<BiUserCircle size={28} />}
                                text="Profile"
                                url="/profile"
                                setsideNavMenu={props.setsideNavMenu}
                            />
                        )}
                        {user?.role === "admin" && (
                            <SideNavMenuItem
                                icon={<FaUserLock size={28} />}
                                text="Manage Users"
                                url="/manage-users"
                                setsideNavMenu={props.setsideNavMenu}
                            />
                        )}
                        <SideNavMenuItem
                            icon={<SiMapbox size={28} />}
                            text="Sensor Maps"
                            url="/sensor-mapping"
                            setsideNavMenu={props.setsideNavMenu}
                        />
                        <SideNavMenuItem
                            icon={<BiExport size={28} />}
                            text="Export Data"
                            url="/export-data"
                            setsideNavMenu={props.setsideNavMenu}
                        />
                        {user?.role === "admin" || user?.role === "sensortech" ? (
                            <SideNavDropdown
                                icon={<BsGearFill size={28} />}
                                text={NavLinks["manage-sensors"]["title"]}
                                dropdown_items={NavLinks["manage-sensors"]["dropdown_items"]}
                                setsideNavMenu={props.setsideNavMenu}
                            />
                        ) : (
                            <SideNavDropdown
                                icon={<BsSearch size={28} />}
                                text={NavLinks["view-sensors"]["title"]}
                                dropdown_items={NavLinks["view-sensors"]["dropdown_items"]}
                                setsideNavMenu={props.setsideNavMenu}
                            />
                        )}
                        <SideNavMenuItem
                            icon={<GoCode size={28} />}
                            text="API docs"
                            url="/docs"
                            setsideNavMenu={props.setsideNavMenu}
                        />
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SideNav;

const SideNavMenuItem = ({
    icon,
    url,
    text = "default page 💡",
    setsideNavMenu,
}: SideNavMenuItemProps) => {
    if (url !== "/docs") {
        return (
            <li>
                <Link
                    onClick={() => setsideNavMenu(false)}
                    to={url}
                    className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    {icon}
                    <span className="ml-3">{text}</span>
                </Link>
            </li>
        );
    } else {
        return (
            <li>
                <a
                    href={process.env.REACT_APP_AIRQUALITY_API_URL + "docs"}
                    className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    {icon}
                    <span className="ml-3">{text}</span>
                </a>
            </li>
        );
    }
};

const SideNavDropdown = ({
    icon,
    text = "default page 💡",
    dropdown_items,
    setsideNavMenu,
}: SideNavDropdownProps) => {
    const [expanded, setExpanded] = useState(true);

    return (
        <li>
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
                {icon}
                <span className="ml-3">{text}</span>
                <div className=" ml-24">
                    <RiArrowDropDownLine size={32} />
                </div>
            </button>

            <ul id="dropdown" className={expanded ? "hidden" : "py-2 space-y-2"}>
                {dropdown_items.map((dropdown_item, index) => (
                    <DropdownItems key={index} dropdown_item={dropdown_item} setsideNavMenu={setsideNavMenu} />
                ))}
            </ul>
        </li>
    );
};

const DropdownItems = ({ dropdown_item, setsideNavMenu }: DropdownItemsProps) => (
    <li className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
        <Link
            onClick={() => setsideNavMenu(false)}
            to={dropdown_item.url}
            className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
        >
            {dropdown_item.routeName}
        </Link>
    </li>
);