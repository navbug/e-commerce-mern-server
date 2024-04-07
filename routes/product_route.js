const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ProductModel = mongoose.model("ProductModel");
const protectedRoute = require("../middleware/protectedResource");

router.get("/products", async (req, res) => {
  const {
    category,
    price,
    rating,
    fastDelivery,
    inStock,
    sort,
    search,
    page,
    limit,
  } = req.query;
  const filters = {};
  let sortOption = {};

  //Search filter
  if (search) {
    filters.title = new RegExp(search, "i");
  }
  // Price filter
  if (price) {
    const min = price.gte,
      max = price.lte;
    if (min) filters.price = { $gte: parseFloat(min) };
    if (max) filters.price = { ...filters.price, $lte: parseFloat(max) };
  }
  // Fast Delivery filter
  if (fastDelivery === "true") {
    filters.fastDelivery = fastDelivery === "true";
  }

  switch (sort) {
    case "Featured":
      sortOption = { featured: -1 };
      break;
    case "Lowest Price":
      sortOption = { price: 1 };
      break;
    case "Highest Price":
      sortOption = { price: -1 };
      break;
    case "Alphabetically A-Z":
      sortOption = { title: 1 };
      break;
    case "Alphabetically Z-A":
      sortOption = { title: -1 };
      break;
    default:
      sortOption = { _id: -1 };
  }

  try {
    const totalProductsCount = await ProductModel.countDocuments(filters);
    const products = await ProductModel.find(filters)
      .sort(sortOption)
      .limit(limit * page);

    let filteredProducts = products;

    if (category) {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === category
      );
    }
    if (inStock === "true") {
      filteredProducts = filteredProducts.filter(
        (product) => product.stock > 0
      );
    }
    if (rating > 0) {
      filteredProducts = filteredProducts.filter((product) => {
        const calculateAverageRating = (reviews) => {
          if (reviews.length === 0) return 0;
          const totalRating = reviews.reduce(
            (acc, curr) => acc + curr.rating,
            0
          );
          return (totalRating / reviews.length).toFixed(1);
        };
        return calculateAverageRating(product.reviews) >= parseInt(rating);
      });
    }

    const hasMore = totalProductsCount > page * limit;

    res.status(200).json({ filteredProducts, hasMore });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/products/:productId", (req, res) => {
  const productId = req.params.productId;
  ProductModel.findById(productId)
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

router.post("/addProduct", protectedRoute, (req, res) => {
  const {
    title,
    price,
    quantity,
    desc,
    images,
    stock,
    fastDelivery,
    ratings,
    category,
  } = req.body;
  if (!title && !price && !desc && !category && !images) {
    return res
      .status(400)
      .json({ error: "One or more mandatory fields are empty" });
  }

  const newProduct = new ProductModel({
    title,
    price,
    quantity,
    desc,
    images,
    stock,
    fastDelivery,
    ratings,
    category,
  });
  newProduct
    .save()
    .then((product) => {
      res.status(201).json({ product });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.delete("/deleteProduct/:productId", protectedRoute, (req, res) => {
  const productId = req.params.productId;
  ProductModel.findOneAndDelete({ _id: productId })
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res
        .status(200)
        .json({ message: "Product deleted successfully", product: product });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.put("/updateProduct/:productId", protectedRoute, (req, res) => {
  const {
    _id,
    title,
    price,
    quantity,
    desc,
    images,
    stock,
    fastDelivery,
    review,
    category,
  } = req.body;

  ProductModel.findByIdAndUpdate(
    _id,
    {
      title,
      price,
      quantity,
      desc,
      images,
      stock,
      fastDelivery,
      review,
      category,
    },
    { new: true }
  )
    .then((updatedProduct) => {
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      res
        .status(200)
        .json({ message: "Product updated successfully", updatedProduct });
    })
    .catch((error) => {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.patch(
  "/updateProductStock/:productId",
  protectedRoute,
  async (req, res) => {
    const productId = req.params.productId;
    const newStock = req.body.stock;
    console.log(newStock);

    // Find the product by productId
    ProductModel.findById(productId)
      .then((product) => {
        if (!product) {
          return res.status(404).json({ error: "Order not found" });
        }

        product.stock = newStock;
        return product.save();
      })
      .then((updatedProduct) => {
        res.json(updatedProduct);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      });
  }
);

router.patch("/addReview/:productId", async (req, res) => {
  const productId = req.params.productId;
  const { userId, rating, review } = req.body;
  const newReview = {
    user: userId,
    rating,
    review,
  };

  // Find the product by productId
  ProductModel.findById(productId)
    .then((product) => {
      if (!product) {
        return res.status(404).json({ error: "Order not found" });
      }

      product.reviews.push(newReview);
      return product.save();
    })
    .then((updatedProduct) => {
      res.json(updatedProduct);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    });
});

module.exports = router;
