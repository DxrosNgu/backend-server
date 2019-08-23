// Requires
var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutenticacion = require('../middleware/autenticacion');
const app = express();

const Hospital = require('../models/hospital');

//=========================================
// Obtener todos los hospitales
//=========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(5)
        .exec((err, hospitales) => {
            if (err) {
                res.status(500).json({
                    ok: true,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                });
            }

            Hospital.count({}, (err, count) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Se obtuvo hospitales',
                    hospitales: hospitales,
                    total: count
                });
            });
        });
});

//=========================================
// Actualizar un hospital
// =========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;
    const body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + 'no existe',
                errors: {message: 'No existe un hospital con ese ID'}
            });
        }

        hospital.nombre = body.nombre;
        hospital.email = body.email;
        hospital.role = body.role;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                usuario: hospitalGuardado
            });
        });
    });
});

//=========================================
// Crear nuevo registro de hospital
//=========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            res.status(400).json({
                ok: true,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalGuardado,
            hospitaltoken: req.usuario
        });
    });
});

//=========================================
// Eliminar un hospital
//=========================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            res.status(500).json({
                ok: true,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            res.status(400).json({
                ok: true,
                mensaje: 'Error al borrar hospital',
                errors: {message: 'No existe ningun hospital con ese ID'}
            });
        }
        res.status(200).json({
            ok: true,
            usuario: hospitalBorrado
        });
    });
});

module.exports = app;
