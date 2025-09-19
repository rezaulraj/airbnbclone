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

// protected api get all
export const getPropertys = async (req, res) => {
  try {
    const propertys = await Property.find().populate("host", "name email");
    // console.log("place data", propertys);
    res.json(propertys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// protected api get all
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "host",
      "name email"
    );
    if (!property)
      return res.status(404).json({ message: "property not found" });

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPropertiesPublic = async (req, res) => {
  try {
    const properties = await Property.find().populate("host", "_id name email");
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "property not found" });

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
    if (!property)
      return res.status(404).json({ message: "property not found" });

    if (property.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await property.deleteOne();
    res.json({ message: "property deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchProperties = async (req, res) => {
  try {
    const { location, startDate, endDate, guests } = req.query;

    const query = {};

    if (location) {
      query.address = { $regex: location, $options: "i" };
    }

    if (guests) {
      query.maxGuests = { $gte: Number(guests) };
    }

    const properties = await Property.find(query).populate(
      "host",
      "_id name email"
    );
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
