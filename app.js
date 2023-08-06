const express = require("express");
const app = express();
const port = 3000;
const countriesRoute = require("./routes/countries");

app.use(express.json());

app.use("/api", countriesRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
