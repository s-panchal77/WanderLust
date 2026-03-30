// app.js

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// DB Connection
main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true })); // MUST FIRST
app.use(methodOverride("_method")); // ✅ FIXED
app.use(express.static(path.join(__dirname, "public")));

// Method Override Middleware
// app.use(
//   methodOverride(function (req, res) {
//     if (req.body && "_method" in req.body) {
//       return req.body._method;
//     }
//   }),
// );

// Root Route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// ================= ROUTES ================= //

// INDEX
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
});

// NEW
app.get("/listings/new", (req, res) => {
  res.render("listings/new");
});

// CREATE
app.post(
  "/listings",
  wrapAsync(async (req, res, next) => {
    if (!req.body.listing) {
      throw new ExpressError(400, "Send valid Listing Data");
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  }),
);

// SHOW
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show", { listing });
  }),
);

// EDIT
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", { listing });
  }),
);

// UPDATE
app.put(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    // console.log("PUT route hit");
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  }),
);

// DELETE
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  }),
);

// ================= END OF ROUTES ================= //

// 404 Route
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong! " } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});

// Server
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
