require("dotenv").config();
const app = require("./app"),
  db = require("./config/database");
const port = process.env.PORT || 5000;
db()
  .then(() => app.listen(port,"0.0.0.0",() => console.log(`Server running on ${port}`)))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
