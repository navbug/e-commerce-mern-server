const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { PORT, MONGODB_URL } = require("./config");

const port = PORT;
const mongoURI = MONGODB_URL;

global.__basedir = __dirname;
mongoose.connect(mongoURI);
mongoose.connect(mongoURI, {
  dbName: "ecommerce",
})

mongoose.connection.on("connected", () => {
  console.log("Connected");
});
mongoose.connection.on("error", (error) => {
  console.log(`Error connecting to DB: ${error}`);
});

require("./models/user_model");
require("./models/product_model");
require("./models/order_model");

app.use(cors());
app.use(express.json());

app.use(require("./routes/user_route"));
app.use(require("./routes/product_route"));
app.use(require("./routes/file_route"));
app.use(require("./routes/order_route"));
app.use(require("./routes/payment_route"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
