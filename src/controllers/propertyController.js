import Property from "../models/Property.js";
import cloudinary from "../config/cloudinary.js";


const uploadToCloudinary = async (fileBuffer, folder = "propertys") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      })
      .end(fileBuffer);
  });
};


export const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      pricePerNight,
      address,
      amenities,
      maxGuests,
      bedrooms,
      bathrooms,
      coordinates,
    } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file.buffer, "propertys"))
      );
    }

    const property = new Property({
      title,
      description,
      pricePerNight,
      address,
      location: { type: "Point", coordinates: JSON.parse(coordinates) },
      amenities,
      images: imageUrls,
      maxGuests,
      bedrooms,
      bathrooms,
      host: req.user._id,
    });

    await property.save();
    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getPropertys = async (req, res) => {
  try {
    const lang = req.query.lang || "en";
    const propertys = await Property.find().populate("host", "name email");

    const translated = propertys.map((property) => ({
      ...property.toObject(),
      title: property.title?.get(lang) || property.title?.get("en"),
      description:
        property.description?.get(lang) || property.description?.get("en"),
      address: {
        street:
          property.address?.street?.get(lang) ||
          property.address?.street?.get("en"),
        city:
          property.address?.city?.get(lang) || property.address?.city?.get("en"),
        state:
          property.address?.state?.get(lang) ||
          property.address?.state?.get("en"),
        country:
          property.address?.country?.get(lang) ||
          property.address?.country?.get("en"),
        zipCode: property.address?.zipCode,
      },
      amenities: property.amenities?.map((a) => a.get(lang) || a.get("en")),
    }));

    res.json(translated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getPropertyById = async (req, res) => {
  try {
    const lang = req.query.lang || "en";
    const property = await Property.findById(req.params.id).populate(
      "host",
      "name email"
    );
    if (!property) return res.status(404).json({ message: "property not found" });

    const translated = {
      ...property.toObject(),
      title: property.title?.get(lang) || property.title?.get("en"),
      description:
        property.description?.get(lang) || property.description?.get("en"),
      address: {
        street:
          property.address?.street?.get(lang) ||
          property.address?.street?.get("en"),
        city:
          property.address?.city?.get(lang) || property.address?.city?.get("en"),
        state:
          property.address?.state?.get(lang) ||
          property.address?.state?.get("en"),
        country:
          property.address?.country?.get(lang) ||
          property.address?.country?.get("en"),
        zipCode: property.address?.zipCode,
      },
      amenities: property.amenities?.map((a) => a.get(lang) || a.get("en")),
    };

    res.json(translated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "property not found" });

    if (property.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (req.files && req.files.length > 0) {
      const newImageUrls = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file.buffer, "propertys"))
      );
      property.images = [...property.images, ...newImageUrls];
    }

    Object.assign(property, req.body);

    await property.save();
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "property not found" });

    if (property.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await property.deleteOne();
    res.json({ message: "property deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
