const mongoose = require("mongoose");
const Listing = require("./models/listing");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function updateListings() {
    await mongoose.connect(MONGO_URL);

    let listings = await Listing.find({});

    for (let listing of listings) {

        let response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(listing.location)}`,
            {
                headers:{
                    "User-Agent":"Wanderlust-App"
                }
            }
        );

        let text = await response.text();

        let data;

        try {
            data = JSON.parse(text);
        } catch(err) {
            console.log("Invalid response for:", listing.location);
            continue;
        }

        if(data.length > 0){

            listing.geometry = {
                type:"Point",
                coordinates:[
                    parseFloat(data[0].lon),
                    parseFloat(data[0].lat)
                ]
            };

            await listing.save();

            console.log("Updated:", listing.title);

        } else {
            console.log("No coordinates found:", listing.location);
        }

        // avoid Nominatim rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    mongoose.connection.close();
}

updateListings();