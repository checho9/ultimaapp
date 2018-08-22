var bcrypt = require("bcrypt-nodejs");
var mongoose = require("mongoose");

var SALT_FACTOR = 10

var publicacionSchema = mongoose.Schema({
    description: { type: String, require: true },
    date: { type: String, require: true },
    category: { type: String, require: true }
});

var Publicacion = mongoose.model("Publicacion", publicacionSchema);
module.exports = Publicacion;