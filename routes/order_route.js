const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const OrderModel = mongoose.model("OrderModel");
const protectedRoute = require("../middleware/protectedResource");

router.get("/getAllOrders", protectedRoute, async (req, res) => {
  OrderModel.find()
    .then((orders) => {
      res.status(200).json({ orders });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/getMyOrders/:userId", async (req, res) => {
  const {userId} = req.params;

  OrderModel.find()
    .then((orders) => {
      if (!orders) {
        return res.status(404).json({ message: "No orders" });
      }
      orders = orders.filter(order => order.user.toString() === userId);
      res.json(orders);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

router.get("/getOrder/:orderId", async (req, res) => {
  const orderId = req.params.orderId;
  OrderModel.findById(orderId)
    .then((order) => {
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
})

router.post("/newOrder", async (req, res) => {
  const { shippingInfo, orderItems, subtotal, shippingCharges, total, user } =
    req.body;

  if (!shippingInfo && !orderItems && !subtotal && !total && !user) {
    return res
      .status(400)
      .json({ error: "One or more mandatory fields are empty" });
  }
  const order = new OrderModel({
    shippingInfo,
    orderItems,
    subtotal,
    shippingCharges,
    total,
    user,
  });
  order
    .save()
    .then((order) => {
      res.status(201).json({ order });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.patch("/processOrder/:orderId", protectedRoute, async (req, res) => {
  const orderId = req.params.orderId;
  const newStatus = req.body.status;

  // Validate the new status
  const allowedStatuses = ['Processing', 'Shipped', 'Delivered'];
  if (!allowedStatuses.includes(newStatus)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  // Find the order by orderId
  OrderModel.findById(orderId)
    .then(order => {
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Update the order status
      order.status = newStatus;
      return order.save();
    })
    .then(updatedOrder => {
      res.json(updatedOrder);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

router.delete("/deleteOrder/:orderId", protectedRoute, async (req, res) => {
  const orderId = req.params.orderId;
  OrderModel.findOneAndDelete({ _id: orderId })
    .then((order) => {
      if (!order) {
        return res.status(404).json({ message: "order not found" });
      }
      res
        .status(200)
        .json({ message: "Order removed successfully", order: order });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

module.exports = router;
