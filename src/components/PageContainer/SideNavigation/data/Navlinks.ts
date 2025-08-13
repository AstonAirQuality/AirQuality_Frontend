// Update here to update navbar
export interface DropdownItem {
    routeName: string;
    url: string;
}

export interface NavLink {
    title: string;
    dropdown_items: DropdownItem[];
}

export const NavLinks: Record<string, NavLink> = {
    "manage-sensors": {
        title: 'Manage Sensor Platforms',
        dropdown_items: [
            { routeName: "sensor platform", url: "sensor-platform" },
            { routeName: "sensor platform type", url: "sensor-platform-type" },
            { routeName: "data logs", url: "logs" }
        ],
    },
    "view-sensors": {
        title: 'View Sensor Platforms',
        dropdown_items: [
            { routeName: "sensor platforms", url: "sensor-platforms" },
            { routeName: "sensor platform types ", url: "sensor-platform-types" }
        ],
    },
};
