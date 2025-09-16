import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    pricePerNight: { type: Number, required: true },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    amenities: [{ type: String }],
    images: [{ type: String }],
    maxGuests: { type: Number, required: true },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

propertySchema.index({ location: "2dsphere" });

export default mongoose.model("Property", propertySchema);
