var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const CLIENT_ID =  require('../config/config').CLIENT_ID;
const SEED = require('../config/config').SEED;
const app = express();
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

const Usuario = require('../models/usuario');
//=============================
// Autentificación de Google
//=============================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

app.post('/google', async (req, res) => {
    var token = req.body.token;

    var GoogleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: true,
                mensaje: 'Token no válido'
            });
        }
    );

    Usuario.findOne({email:GoogleUser.nombre},(err, usuarioDB) => {

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if( usuarioDB){
            if(usuarioDB.google === false){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal'
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB}, SEED, { expiresIn: 14400}); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }
        } else {
            // El usuario no existe... crear nuevo usuario
            var usuario = new Usuario();

            usuario.nombre = GoogleUser.nombre;
            usuario.email =  GoogleUser.email;
            usuario.img = GoogleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {

                var token = jwt.sign({ usuario: usuarioDB}, SEED, { expiresIn: 14400}); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });

            });
        }
    });
});
//=============================
// Autentificación normal
//=============================
app.post('/', (req,res) =>{

    var body = req.body;

    Usuario.findOne({email: body.email}, (err, usuarioDB) =>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if(!usuarioDB){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if(!bcrypt.compareSync(body.password, usuarioDB.password)){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }
        //Crear un token!!!
        usuarioDB.password = 'lol';
        var token = jwt.sign({ usuario: usuarioDB}, SEED, { expiresIn: 14400}); // 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });
});
module.exports = app;
