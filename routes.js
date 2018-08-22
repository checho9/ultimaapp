var express = require("express");
var Usuarios = require("./models/usuarios");
var passport = require("passport");
var acl = require("express-acl");
var Publicacion = require("./models/publicacion");
var pdf = require('pdfkit');
var fs = require('fs');
var router = express.Router();

acl.config({
    baseUrl: '/',
    defaultRole: 'Usuario',
    decodedObjectName: 'usuarios',
    roleSearchPath: 'usuarios.role'
});
router.use(acl.authorize);


router.use((req, res, next) => {
    res.locals.currentUsuarios = req.usuarios;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    if (req.isAuthenticated()) {
        req.session.role = req.usuarios.role;
    }
    console.log(req.usuarios);
    next();
});
router.use((req, res, next) => {
    res.locals.currentPublicacion = req.publicacion;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    next();
});

router.get("/", (req, res, next) => {
    Usuarios.find()
        .sort({ createdAt: "descending" })
        .exec((err, usuarios) => {
            if (err) {
                return next(err);
            }
            res.render("index", { usuarios: usuarios });
        });
});
router.get("/allpublicaciones", (req, res, next) => {
    Publicacion.find()
        .exec((err, allpublicaciones) => {
            if (err) {
                return next(err);
            }
            res.render("allpublicaciones", { allpublicaciones: allpublicaciones });
        });
});
router.post("/createpdf", (req, res, next) => {
    var titulo1 = req.body.titulo1;
    var titulo2 = req.body.titulo2;
    var titulo3 = req.body.titulo3;
    var myDoc = new pdf();
    var stream = myDoc.pipe(fs.createWriteStream('img/' + titulo1 + 'pdf'));
    if ((titulo1 + '.pdf') != myDoc.pipe(fs.createWriteStream('img/' + titulo1 + '.pdf'))) {

        myDoc.fontSize(10).text('Publicacion: ' + titulo1, 100, 120);
        myDoc.font('Times-Roman').fontSize(10).text('Categoria:' + titulo2, 100, 140);
        myDoc.fontSize(10).text('Fecha: ' + titulo3, 100, 160);
        myDoc.end();
        return res.redirect("/allpublicaciones");
    } else {

        req.flash("error", "Esta publicación ya se ha guardado");
        return res.redirect('/img/' + titulo1 + '.pdf');
    }
});

router.post("/crearpublicacion", (req, res, next) => {

    var description = req.body.description;
    var date = req.body.date;
    var category = req.body.category;

    Publicacion.findOne({ description: description }, (err, Public) => {
        if (err) {
            return next(err);
        }
        if (Public) {
            req.flash("error", "Esta publicación ya se ha registrado");
            return res.redirect("/crearpublicacion");
        }
        var newPublicacion = new Publicacion({
            description: description,
            date: date,
            category: category
        });
        newPublicacion.save(next);
        return res.redirect("/allpublicaciones");
    });
});


router.get("/signup", (req, res) => {
    res.render("signup");
});

router.post("/signup", (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    var role = req.body.role;

    Usuarios.findOne({ username: username }, (err, usuarios) => {
        if (err) {
            return next(err);
        }
        if (usuarios) {
            req.flash("error", "El nombre de usuario ya lo ha tomado otro usuario");
            return res.redirect("/signup");
        }
        var newUsuarios = new Usuarios({
            username: username,
            password: password,
            role: role
        });
        newUsuarios.save(next);
        return res.redirect("/");
    });
});

router.get("/usuarios/:username", (req, res, next) => {
    Usuarios.findOne({ username: req.params.username }, (err, usuarios) => {
        if (err) {
            return next(err);

        }
        if (!usuarios) {
            return next(404);
        }
        res.render("profile", { usuarios: usuarios });
    });
});
router.get("/allpublicaciones", (req, res) => {
    res.render("allpublicaciones");
});

router.get("/crearpublicacion", (req, res) => {
    res.render("crearpublicacion");
});
router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

router.get("/edit", ensureAuthenticated, (req, res) => {
    res.render("edit");
});

router.post("/edit", ensureAuthenticated, (req, res, next) => {
    req.usuarios.displayName = req.body.displayName;
    req.usuarios.bio = req.body.bio;
    req.usuarios.save((err) => {
        if (err) {
            next(err);
            return;
        }
        req.flash("info", "Perfil Actualizado");
        res.redirect("/edit");
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("info", "Necesitas iniciar sesion para poder ver esta seccion");
        res.redirect("/login");
    }
}
module.exports = router;