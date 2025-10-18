const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { PORT, MONGODB_URL } = require("./config");

const port = PORT;
const mongoURI = MONGODB_URL;

const corsOptions = {
  origin: ["https://e-commerce-mern-frontend-kappa.vercel.app/", "http://localhost:5173"]
}

app.use(cors(corsOptions));
app.use(express.json());
global.__basedir = __dirname;

mongoose.connect(mongoURI, {
  dbName: "ecommerce_db",
})
mongoose.connection.on("connected", () => {
  console.log("Connected");
});
mongoose.connection.on("error", (error) => {
  console.log(`Error connecting to DB: ${error}`);
});

// let isConnected = false;

// async function connectToMongoDB() {
//   try {
//     await mongoose.connect(process.env.MONGODB_URL, {
//       useNewUrlParser: true,
//       useUnifiedTopolog: true
//     });
//     isConnected = true;
//     console.log("Connected to MongoDB");
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//   }
// }

// app.use((req, res, next) => {
//   if(!isConnected) {
//     connectToMongoDB();
//   }
//   next();
// })

require("./models/user_model");
require("./models/product_model");
require("./models/order_model");


app.use(require("./routes/user_route"));
app.use(require("./routes/product_route"));
app.use(require("./routes/file_route"));
app.use(require("./routes/order_route"));
app.use(require("./routes/payment_route"));



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// module.exports = app