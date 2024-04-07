const Stripe = require("stripe");
const { STRIPE_KEY } = require("../config");
const stripe = new Stripe(STRIPE_KEY);
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.post("/payment/create", async (req, res) => {
  const {amount} = req.body;

  if(!amount) {
    return res.status(400).json({ error: "Please enter amount" });
  }
  const paymentIntent = await stripe.paymentIntents.create({
    description: "Test Payment",
    amount: Number(amount) * 100,
    currency: "inr",
  });

  return res.status(201).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
})

module.exports = router;