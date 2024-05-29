const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
dotenv.config({ path: "./config.env" });
const app = require("./server");

const { PORT, DB_URL } = process.env;

mongoose.set('strictQuery', false);
mongoose
  .connect(DB_URL)
  .then(() => console.log("db has connected"))
  .catch((err) => console.log(err));

app.listen(PORT || 4000, () => console.log("server is running at",PORT));
