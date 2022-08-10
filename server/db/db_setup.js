const mongoose = require("mongoose");

const dbSetup = async (uri) => {
  await mongoose.connect(`${uri}pet`);
   mongoose.connection.once("open", () => {
    console.log("Database is connected");
  });
  mongoose.connection.on("error", (err) => {
    console.log(err);
  });
};

module.exports = dbSetup;
