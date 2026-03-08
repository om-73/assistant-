const express = require("express");
const identityRoutes = require("./routes/identityRoutes");

const app = express();
app.use(express.json());
app.use("/", identityRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;