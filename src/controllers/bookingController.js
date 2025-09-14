import Booking from "../models/Booking.js";
import Property from "../models/Property.js";

export const createBooking = async (req, res) => {
  try {
    const { property, checkIn, checkOut, totalPrice } = req.body;

    const foundProperty = await Property.findById(property);
    if (!foundProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    const booking = await Booking.create({
      guest: req.user._id,
      property,
      checkIn,
      checkOut,
      totalPrice,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("guest", "name email")
      .populate("property", "title pricePerNight");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ guest: req.user._id }).populate(
      "property",
      "title pricePerNight images address"
    );
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("guest", "name email")
      .populate("property", "title pricePerNight images address");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (
      booking.guest.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (
      booking.guest.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { checkIn, checkOut, status, paymentStatus } = req.body;

    if (checkIn) booking.checkIn = checkIn;
    if (checkOut) booking.checkOut = checkOut;
    if (status && req.user.isAdmin) booking.status = status;
    if (paymentStatus && req.user.isAdmin)
      booking.paymentStatus = paymentStatus;

    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (
      booking.guest.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await booking.deleteOne();
    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
