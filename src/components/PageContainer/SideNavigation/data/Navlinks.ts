// Update here to update navbar
export interface DropdownItem {
    routeName: string;
    url: string;
}

export interface NavLink {
    dropdown_title: string;
    dropdown_items: DropdownItem[];
}

export const NavLinks: Record<string, NavLink> = {
    "technician-role": {
        dropdown_title: 'Manage Sensor Platforms',
        dropdown_items: [
            { routeName: "sensor platform type", url: "sensor-platform-type"},
            { routeName: "sensor platform", url: "sensor-platform" },
            { routeName: "sensor platform configuration", url: "sensor-platform-config"},
            { routeName: "observable properties", url: "observable-properties"},
            { routeName: "units of mesaurement", url: "units-of-measurement" },
            { routeName: "data logs", url: "logs" }
        ],
    },
    "user-role": {
        dropdown_title: 'View Sensor Platforms',
        dropdown_items: [
            { routeName: "sensor platform types ", url: "sensor-platform-types" },
            { routeName: "sensor platforms", url: "sensor-platforms" },
            { routeName: "observable properties", url: "observable-properties"},
            { routeName: "units of mesaurement", url: "units-of-measurement" },
        ],
    },
};
