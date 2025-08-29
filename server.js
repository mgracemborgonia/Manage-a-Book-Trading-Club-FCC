require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const path = require("path");
const cors = require("cors");

const userRoutes = require("./routes/users");
const bookRoutes = require("./routes/books");
const tradeRoutes = require("./routes/trades");

const setupPassport = require("./config/passport");

const app = express();
const port = process.env.PORT || 8080;
const db = process.env.DB;
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error(error));

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ 
  secret: "secret", 
  resave: true, 
  saveUninitialized: true 
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
setupPassport(passport);

app.use(express.static("public"));

app.use("/users", userRoutes);
app.use("/books", bookRoutes);
app.use("/trades", tradeRoutes);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/main.html"));
});
app.get("/booktrade.html", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/booktrading/booktrade.html"));
});
app.use((req, res) => res.status(404).json({ message: "Not found" }));
app.listen(port, () => console.log(`Port ${port} is listening.`));