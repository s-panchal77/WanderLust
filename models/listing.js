const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    type: String,
    default:
      "https://unsplash.com/photos/river-flowing-through-a-dense-forest-towards-mountains-WQW0uTofZiE",
    // Fall back to the default URL if an empty string is provided.
    set: (v) =>
      v === ""
        ? "https://unsplash.com/photos/river-flowing-through-a-dense-forest-towards-mountains-WQW0uTofZiE"
        : v,
  },
  price: Number,
  location: String,
  country: String,
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
