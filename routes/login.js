var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;

const app = express();
const Usuario = require('../models/usuario');

const {OAuth2Client} = require('google-auth-library');
//var OAuth2 = google.auth.OAuth2;
// const auth = new OAuth2Client();

const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

var mdAutentificacion = require('../middleware/autenticacion');
//=============================
// Renueva Token
//=============================
app.get('/renuevatoken',mdAutentificacion.verificaToken, (req, res) =>{

    var token = jwt.sign({usuario: req.usuario}, SEED, {expiresIn: 14400}); // 4 horas


    return res.status(200).json({
        ok: true,
        usuario: req.usuario,
        token: token
    });
});
//=============================
// Autentificación de Google
//=============================
app.post('/google', (req, res) => {

    const token = req.body.token || 'XXX';


    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');

    client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
    }, function (e, login) {

        if (e) {
            return res.status(400).json({
                ok: true,
                mensaje: 'Token no válido',
                errors: e
            });
        }

        var payload = login.getPayload();
        var userid = payload['sub'];
        // If request specified a G Suite domain:
        //var domain = payload['hd'];

        Usuario.findOne({email: payload.email}, (err, usuario) => {

            if (err) {
                return res.status(500).json({
                    ok: true,
                    mensaje: 'Error al buscar usuario - login',
                    errors: err
                });
            }

            if (usuario) {
                if (usuario.google === false) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Debe de usar su autenticación normal'
                    });
                } else {
                    usuario.password = ':)';
                    var token = jwt.sign({usuario: usuario}, SEED, {expiresIn: 14400}); // 4 horas
                    res.status(200).json({
                        ok: true,
                        usuario: usuario,
                        token: token,
                        id: usuario._id,
                        menu: obtenerMenu( usuario.role)
                    });
                }
                // Si el usuario no existe por correo
            } else {

                var usuario = new Usuario();

                usuario.nombre = payload.name;
                usuario.email = payload.email;
                usuario.password = ':)';
                usuario.img = payload.picture;
                usuario.google = true;

                usuario.save((err, usuarioDB) => {

                    if (err) {
                        return res.status(500).json({
                            ok: true,
                            mensaje: 'Error al crear usuario - google',
                            errors: err
                        });
                    }

                    var token = jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400}); // 4 horas

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id,
                        menu: obtenerMenu(usuarioDB.role)
                    });
                });
            }
        });

    }, (err, login) => {
        console.log(login);
    });
});
//=============================
// Autentificación normal
//=============================
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({email: body.email}, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }
        //Crear un token!!!
        usuarioDB.password = 'lol';
        var token = jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400}); // 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id,
            menu: obtenerMenu(usuarioDB.role)
        });
    });
});

function obtenerMenu(ROLE) {

    var menu = [
        {
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                {titulo: 'Dashboard', url: '/dashboard'},
                {titulo: 'ProgressBar', url: '/progress'},
                {titulo: 'Gráficas', url: '/graficas1'},
                {titulo: 'Promesas', url: '/promesas'},
                {titulo: 'Rxjs', url: '/rxjs'}
            ]
        }, {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
           //     {titulo: 'Usuarios', url: '/usuarios'},
                {titulo: 'Hospitales', url: '/hospitales'},
                {titulo: 'Medicos', url: '/medicos'}
            ]
        }
    ];

    console.log(ROLE);
    if ( ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({titulo: 'Usuarios', url: '/usuarios'});
    }

    return menu;
}
module.exports = app;
