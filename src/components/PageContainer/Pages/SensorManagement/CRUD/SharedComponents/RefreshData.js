async function RefreshData(refresh,dataURL,tableName) {
    
    let result = window.sessionStorage.getItem(tableName);

    //TODO REMOVE THIS MOCK DATA
    // let result = [
    //     {"id":3,"lookup_id":"18699","serial_number":"02:00:00:00:48:13","active":false,"stationary_box":null,"time_updated":null,"type_name":"Plume","username":"None None"},
    //     {"id":6,"lookup_id":"18749","serial_number":"02:00:00:00:48:45","active":true,"stationary_box":"POLYGON((-1.8866789340343928 52.484852559701096, -1.8851674223984958 52.484852559701096, -1.8851674223984958 52.485723707752015, -1.8866789340343928 52.485723707752015, -1.8866789340343928 52.484852559701096))","time_updated":"2022-09-29T00:00:00","type_name":"Plume","username":"TestUser MAFpvkOqwLSFRQ3wsBEqNCXQP9a2"}
    // ]
    // result = JSON.stringify(result)
    //TODO REMOVE THIS MOCK DATA

    //if data is not in session storage, fetch it and cache it
    if (result === null || refresh) {
        await fetch(dataURL)
        .then(res => res.json()) 
        .then((result) => {
            window.sessionStorage.setItem(tableName, JSON.stringify(result));
        })
        .catch(err => console.log("error"))
        
        // put the cached data into result
        result = window.sessionStorage.getItem(tableName);
        console.log("fetching data")
    }

    else {
        console.log("using cached data")
    }

    return JSON.parse(result)
}

export default RefreshData;


//testdata = {[{"name":"Plume","description":"Single sensor platform","id":1},{"name":"Zephyr","description":"Single sensor platform","id":2}]}
//testdata = {[{"id": 2,"lookup_id": "18749","serial_number": "02:00:00:00:48:45","active": true,"stationary_box": null,"time_updated": "2022-09-13T00:00:00","type_name": "Plume","username": null}]} 

// //mock data
// result = testdata //mock data
// window.sessionStorage.setItem(dataURL, JSON.stringify(result));//mock data
// //mock data