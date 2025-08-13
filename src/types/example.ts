// src/types/example.ts

// Example TypeScript type and data to import into app.tsx

export type ExampleItem = {
    id: number;
    name: string;
    description: string;
};

export const exampleData: ExampleItem[] = [
    { id: 1, name: "Sensor A", description: "Outdoor air quality sensor" },
    { id: 2, name: "Sensor B", description: "Indoor air quality sensor" },
    { id: 3, name: "Sensor C", description: "Portable air quality sensor" },
];

// Export 'example' as an alias for 'exampleData' for compatibility
export { exampleData as example };