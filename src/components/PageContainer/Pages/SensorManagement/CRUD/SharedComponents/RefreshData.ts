/**
 * Fetches and caches data from a specified URL, with optional refresh logic.
 *
 * @template T - The expected return type of the fetched data.
 * @param refresh - If true, forces a fresh fetch from the dataURL, bypassing the cache.
 * @param dataURL - The URL to fetch data from if not cached or if refresh is true.
 * @param cacheKey - The key used to store and retrieve data from sessionStorage.
 * @returns A promise that resolves to the fetched data of type T, or null if fetching fails.
 *
 * @remarks
 * - Data is cached in `window.sessionStorage` using the provided `cacheKey`.
 * - If `refresh` is false and cached data exists, the cached data is returned.
 * - If `refresh` is true or no cached data exists, data is fetched from `dataURL` and cached.
 * - If an error occurs during fetch, the function logs the error and returns null.
 */
async function RefreshData<T = any>(
    refresh: boolean,
    dataURL: string,
    cacheKey: string,
    headers: { [key: string]: string } = {} // e.g. { 'Authorization': `Bearer ${user?.access_token}` }
): Promise<T | null> {
    let result = window.sessionStorage.getItem(cacheKey);

    // If data is not in session storage, fetch it and cache it
    if (result === null || refresh) {
        const requestOptions: RequestInit = {
            method: "GET",
            headers: headers,
        };
        try {
            const response = await fetch(dataURL, requestOptions);
            const data: T = await response.json();
            window.sessionStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (err) {
            console.log("error");
        }
        // Put the cached data into result
        result = window.sessionStorage.getItem(cacheKey);
        console.log("fetching data");
    } else {
        console.log("using cached data");
    }

    return result ? JSON.parse(result) as T : null;
}

export default RefreshData;



//TODO REMOVE THIS MOCK DATA
// let result = [
//     {"id":3,"lookup_id":"18699","serial_number":"02:00:00:00:48:13","active":false,"stationary_box":null,"time_updated":null,"type_name":"Plume","username":"None None"},
//     {"id":6,"lookup_id":"18749","serial_number":"02:00:00:00:48:45","active":true,"stationary_box":"POLYGON((-1.8866789340343928 52.484852559701096, -1.8851674223984958 52.484852559701096, -1.8851674223984958 52.485723707752015, -1.8866789340343928 52.485723707752015, -1.8866789340343928 52.484852559701096))","time_updated":"2022-09-29T00:00:00","type_name":"Plume","username":"TestUser MAFpvkOqwLSFRQ3wsBEqNCXQP9a2"}
// ]
// result = JSON.stringify(result)
//TODO REMOVE THIS MOCK DATA

//testdata = {[{"name":"Plume","description":"Single sensor platform","id":1},{"name":"Zephyr","description":"Single sensor platform","id":2}]}
//testdata = {[{"id": 2,"lookup_id": "18749","serial_number": "02:00:00:00:48:45","active": true,"stationary_box": null,"time_updated": "2022-09-13T00:00:00","type_name": "Plume","username": null}]} 

// //mock data
// result = testdata //mock data
// window.sessionStorage.setItem(dataURL, JSON.stringify(result));//mock data
// //mock data