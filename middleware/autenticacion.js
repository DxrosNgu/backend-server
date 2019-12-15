var jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;

//=========================================
// Verificar el token
// ========================================
exports.verificaToken = function(req, res, next){
    const token = req.query.token;

    jwt.verify(token, SEED, (err,decoded )=>{
        if(err){
            return res.status(401).json({
                ok: true,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        req.usuario = decoded.usuario;

        next();
        /*res.status(200).json({
            ok: true,
            decoded: decoded
        });*/
    });

};
//=========================================
// Verificar el ADMIN
// ========================================
exports.verificaAdminRole = function(req, res, next){

    var usuario = req.usuario;
    if(usuario.role === 'ADMIN_ROLE'){
        next();
        return;
    } else {
        return res.status(401).json({
            ok: true,
            mensaje: 'Token incorrecto - No es administrador',
            errors: { message: 'Token incorrecto - No es administrador'}
        });
    }
};
//=========================================
// Verificar el ADMIN o Mismo Usuario
// ========================================
exports.verificaAdminRoleMismoUsuario = function(req, res, next){

    var usuario = req.usuario;
    var id = req.params.id;

    if(usuario.role === 'ADMIN_ROLE' || usuario._id === id){
        next();
        return;
    } else {
        return res.status(401).json({
            ok: true,
            mensaje: 'No es administrador o no es el mismo usuario',
            errors: { message: 'No es administrador o no es el mismo usuario'}
        });
    }
};


