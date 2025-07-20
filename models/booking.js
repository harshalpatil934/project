// models/Booking.js

const mongoose=require("mongoose");
const Review = require("./review");
const Schema=mongoose.Schema;


const BookingSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "listing" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  checkIn: Date,
  checkOut: Date,
  totalPrice: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
