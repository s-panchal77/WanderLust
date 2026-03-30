const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./Schema.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// DB Connection
async function main() {
  await mongoose.connect(MONGO_URL);
}
main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));

app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      return req.body._method;
    }
  }),
);

app.use(express.static(path.join(__dirname, "public")));

// Root
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// ================= VALIDATION =================

function validateListing(req, res, next) {
  if (!req.body.listing) {
    throw new ExpressError(400, "Invalid listing data");
  }

  let { error } = listingSchema.validate({ listing: req.body.listing });

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }

  next();
}

// ================= ROUTES =================

// INDEX
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  }),
);

// NEW
app.get("/listings/new", (req, res) => {
  res.render("listings/new");
});

// CREATE
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  }),
);

// SHOW
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/show", { listing });
  }),
);

// EDIT
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/edit", { listing });
  }),
);

// UPDATE
app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const updated = await Listing.findByIdAndUpdate(id, req.body.listing, {
      new: true,
    });

    if (!updated) {
      throw new ExpressError(404, "Listing not found");
    }

    res.redirect(`/listings/${id}`);
  }),
);

// DELETE
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const deleted = await Listing.findByIdAndDelete(id);

    if (!deleted) {
      throw new ExpressError(404, "Listing not found");
    }

    res.redirect("/listings");
  }),
);

// ================= 404 =================

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// ================= ERROR =================

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// Server
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
