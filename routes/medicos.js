// Requires
var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutenticacion = require('../middleware/autenticacion');
const app = express();

const Medico = require('../models/medicos');

//=========================================
// Obtener todos los medicos
//=========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, 'nombre img usuario hospital')
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .skip(desde)
        .limit(5)
        .exec((err, medicos) => {
            if (err) {
                res.status(500).json({
                    ok: true,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }

            Medico.count({}, (err, count) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Se obtuvo medicos',
                    medicos: medicos,
                    total: count
                });
            });
        });
});

//=========================================
// Obtener un medico
// =========================================
app.get('/:id', (req,res) =>{
    var id = req.params.id;

    Medico.findById(id)
        .populate('usuario', 'nombre email img')
        .populate('hospital')
        .exec((err, medico) =>{
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar medico',
                    errors: err
                });
            }

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario con el id ' + id + 'no existe',
                    errors: {message: 'No existe un hospital con ese ID'}
                });
            }

            return res.status(200).json({
                ok: true,
                medico: medico
            });
        })
});
//=========================================
// Actualizar un medico
// =========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;
    const body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + 'no existe',
                errors: {message: 'No existe un hospital con ese ID'}
            });
        }
        console.log(body);
        medico.nombre = body.nombre;
        medico.email = body.email;
        medico.img = body.img;
        medico.usuario = body.usuario;
        medico.hospital = body.hospital;


        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

//=========================================
// Crear nuevo registro de medico
//=========================================
var debug = require('debug');
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });
    console.log(req);
    medico.save((err, medicoGuardado) => {
        if (err) {
            res.status(400).json({
                ok: true,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});

//=========================================
// Eliminar un medico
//=========================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndDelete(id, (err, medicoBorrado) => {
        if (err) {
            res.status(500).json({
                ok: true,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            res.status(400).json({
                ok: true,
                mensaje: 'Error al borrar medico',
                errors: {message: 'No existe ningun medico con ese ID'}
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;
