// Requires
var express = require('express');

var  app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medicos');
var Usuario = require('../models/usuario');

//=============================
// Busqueda por colección
//=============================
app.get('/:tabla/:busqueda', (req, res )=>{
    const tabla = req.params.tabla;
    const busqueda = req.params.busqueda;
    const regex = new RegExp(busqueda, 'i');
    var promesa;

    switch (tabla){
        case 'Usuario':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'Hospital':
            promesa = buscarHospitales(busqueda, regex);
            break;
        case 'Medico':
             promesa = buscarMedicos(busqueda, regex);
            break;
        default:
            return  res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda son usuarios, hospitales y medicos',
                error: {message:'Tipo de tabla/coleccion  no valida'}
            });
    }

    promesa.then( data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});
//=============================
// Busqueda general
//=============================
// Rutas
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda=req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda,regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ]).then(respuesta =>{
        res.status(200).json({
            ok: true,
            hospitales: respuesta[0],
            medicos: respuesta[1],
            usuarios: respuesta[2]
        });
    });
});

function buscarHospitales(busqueda, regex){
    return new Promise((resolve, reject) =>{
        Hospital.find({nombre : regex})
            .populate('usuario', 'nombre email')
            .exec((err,hospitales)=>{
            if(err){
                reject('Error al cargar hospitales',err);
            } else {
                resolve(hospitales);
            }
        });
    });

}

function buscarUsuarios(busqueda, regex){
    return new Promise((resolve, reject) =>{
        Usuario.find({}, 'nombre email rol')
            .or([{'nombre': regex}, {'email': regex}])
            .exec((err,usuario) =>{
                if(err){
                    reject('Error al cargar usuarios', err);
                } else{
                    resolve(usuario);
                }
            });
    });

}

function buscarMedicos(busqueda, regex){
    return new Promise((resolve, reject) =>{
        Medico.find({nombre : regex})
            .populate( 'usuario', 'nombre email')
            .populate('hospital')
            .exec((err,medicos)=>{
            if(err){
                reject('Error al cargar hospitales',err);
            } else {
                resolve(medicos);
            }
        });
    });

}

module.exports= app;
