var bcrypt = require("bcrypt-nodejs");
var mongoose = require("mongoose");

var SALT_FACTOR = 10;

var usuariosSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: String,
    createdAt: { type: Date, default: Date.now },
    displayName: { type: String },

});

var donothing = () => {

}
usuariosSchema.pre("save", function(done) {
    var usuarios = this;
    if (!usuarios.isModified("password")) {
        return done();
    }
    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        if (err) {
            return done(err);
        }
        bcrypt.hash(usuarios.password, salt, donothing,
            function(err, hashedpassword) {
                if (err) {
                    return done(err);
                }
                usuarios.password = hashedpassword;
                done();
            });
    });
});
usuariosSchema.methods.checkPassword = function(guess, done) {
    bcrypt.compare(guess, this.password, function(err, isMatch) {
        done(err, isMatch);
    });
}

usuariosSchema.methods.name = function() {
    return this.displayName || this.username;
}
usuariosSchema.methods.rol = function() {
    return this.role;
}
var Usuarios = mongoose.model("Usuarios", usuariosSchema);
module.exports = Usuarios;