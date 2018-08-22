var passport = require("passport");
var Usuarios = require("./models/usuarios");

var LocalStrategy = require("passport-local").Strategy;

module.exports = () => {
    passport.serializeUser((usuarios, done) => {
        done(null, usuarios._id);
    });
    passport.deserializeUser((id, done) => {
        Usuarios.findById(id, (err, usuarios) => {
            done(err, usuarios);
        });
    });
};

passport.use("login", new LocalStrategy(function(username, password, done) {
    Usuarios.findOne({ username: username }, function(err, usuarios) {
        if (err) {
            return done(err);
        }
        if (!usuarios) {
            return done(null, false, { message: "No existe ningun usuario con ese nombre" })
        }
        usuarios.checkPassword(password, (err, isMatch) => {
            if (err) {
                return done(err);
            }
            if (isMatch) {
                return done(null, usuarios)
            } else {
                return done(null, false, { message: "La contraseña no es valida" })
            }
        })
    })
}))