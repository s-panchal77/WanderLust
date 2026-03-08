const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connect to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
  res.send("Hi, i am root");
});

app.get("/testListing", async (req,res) =>{
  let sampleListing = new Listing({
    title: "My Home",
    description: "By the beach",
    price: 1200,
    location: "Fregarencia, Sumanio",
    country: "Colambo"
  });
  await sampleListing.save();
  console.log("Sample was saved");
  res.send("Successfull testing");
}),

app.listen(8080, () => {
  console.log("Server is listening to port 8080");
});
