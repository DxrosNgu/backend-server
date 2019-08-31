// Requires
var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutenticacion = require('../middleware/autenticacion');
const app = express();

const Usuario = require('../models/usuario');

//=========================================
// Obtener todos los usuarios
//=========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0 ;
    desde = Number(desde);
        Usuario.find({}, 'nombre email img role')
            .skip(desde)
            .limit(5)
            .exec( (err, usuarios)=>{
            if(err){
                res.status(500).json({
                    ok: true,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            }

            Usuario.count({}, (err,count) =>{
                res.status(200).json({
                    ok: true,
                    mensaje: 'Get de usuarios!',
                    usuarios: usuarios,
                    total: count
                });
            });
        });
});

//=========================================
// Actualizar un nuevo usuario
// =========================================
app.put('/:id',mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;
    const body = req.body;

    Usuario.findById(id , (err, usuario) =>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
         }

        if(!usuario){
           return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id '+ id + 'no existe',
                errors: { message: 'No existe un usuario con ese ID'}
            });
        }

        usuario.nombre= body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( (err, usuarioGuardado) =>{

            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});
//=========================================
// Crear un nuevo usuario
// =========================================
app.post('/', (req, res)=> {

    var body= req.body;

    var usuario= new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save( (err,usuarioGuardado) =>{
        if(err){
            res.status(400).json({
                ok: true,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });
});
//=========================================
// Eliminar un nuevo usuario
// ========================================
app.delete('/:id',mdAutenticacion.verificaToken, (req, res)=> {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado)=>{
        if(err){
            res.status(500).json({
                ok: true,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if(!usuarioBorrado){
            res.status(400).json({
                ok: true,
                mensaje: 'Error al borrar usuario',
                errors: { message: 'No existe ningun usuario con ese ID'}
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports= app;
