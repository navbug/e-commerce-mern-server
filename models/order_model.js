const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  shippingInfo: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
  },

  user: {
    type: String, 
    ref: "UserModel",
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  shippingCharges: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Processing", "Shipped", "Delivered"],
    default: "Processing",
  },
  orderItems: [
    {
      title: String,
      image: String,
      price: Number,
      quantity: Number,
      stock: Number,
      productId: {
        type: mongoose.Types.ObjectId,
        ref: "ProductModel",
      },
    },
  ],
});

mongoose.model("OrderModel", orderSchema);