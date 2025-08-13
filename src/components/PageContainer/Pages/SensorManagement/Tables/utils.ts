// Function Calculates the Center Point of some BoundingBox
export const calculateCenterPointOfBoundingBox = (boundingBox: string): [number, number] => {
    const coordinatesArray: string[] = boundingBox.split('((')[1].split('))')[0].split(',');
    const latitudes: number[] = [];
    const longitudes: number[] = [];

    coordinatesArray.forEach((item: string) => {
        const coords: string = item.trim();
        const [lngStr, latStr] = coords.split(" ");
        latitudes.push(parseFloat(latStr));
        longitudes.push(parseFloat(lngStr));
    });

    const meanLat: number = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
    const meanLng: number = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;
    return [meanLng, meanLat];
};

export function FilterTable(key: number, value: string): void {
    const filter = value.toUpperCase();
    const table = document.getElementById("searchtable") as HTMLTableElement | null;
    if (!table) return;
    const tr = table.getElementsByTagName("tr");
    for (let i = 0; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName("td")[key] as HTMLTableCellElement | undefined;

        // skip embedded table headers and values
        if (td?.id === "embedded_header" || td?.id === "embedded_value") continue;

        if (td) {
            const txtValue = td.textContent || td.innerText || "";
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                (tr[i] as HTMLElement).style.display = "";
            } else {
                (tr[i] as HTMLElement).style.display = "none";
            }
        }
    }
}
