const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  desc: {
    type: String,
    required: true,
  },
  images: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    default: 1,
  },
  fastDelivery: {
    type: Boolean,
    default: false,
  },
  reviews: [
    {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      review: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
      user: {
        type: mongoose.Types.ObjectId,
        ref: "UserModel",
      }
    }
  ],
  category: {
    type: String,
    required: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  sortOrder: {
    type: Number,
    default: 0,
  }
});

mongoose.model("ProductModel", ProductSchema);
