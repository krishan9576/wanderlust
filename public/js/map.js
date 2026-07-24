console.log(coordinates);

if (!coordinates || coordinates.length === 0) {
    console.log("No coordinates found");
} else {

    // Map create karo
    const map = L.map("map").setView(
        [coordinates[1], coordinates[0]],
        13
    );

    // OpenStreetMap
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    // Red Marker
    const redIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    L.marker([coordinates[1], coordinates[0]], { icon: redIcon })
        .addTo(map)
        .bindPopup(`
            <b>${locationName}</b><br>
            Exact location provided after booking.
        `)
        .openPopup();
}