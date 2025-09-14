import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: Map,
      of: String, // { en: "Nice Apartment", es: "Bonito Apartamento" }
      required: true,
    },
    description: {
      type: Map,
      of: String,
    },
    pricePerNight: { type: Number, required: true },
    address: {
      street: { type: Map, of: String },
      city: { type: Map, of: String },
      state: { type: Map, of: String },
      country: { type: Map, of: String },
      zipCode: String,
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    amenities: [{ type: Map, of: String }],
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
