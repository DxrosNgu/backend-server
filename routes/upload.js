// Requires
var express = require('express');
const fileUpload = require('express-fileupload');
var fs = require('fs');
var  app = express();

// default options
app.use(fileUpload());

var Usuario = require('../models/usuario');
var Medicos = require('../models/medicos');
var Hospital = require('../models/hospital');
// Rutas
app.put('/:tipo/:id', function(req, res) {
    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipos de colección
    var tiposValidos = ['hospitales','medicos','usuarios'];
    if(tiposValidos.indexOf(tipo) < 0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es válida'}
        });
    }
    if(!req.files){
            return res.status(400).json({
                ok: false,
                mensaje: 'No selecciono nada',
                errors: { message: 'Debe de seleccionar una imagen'}
            });
    }

    //Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length-1];

    //Extensiones de archivos permitidas
    const extensionesValidas = ['png','jpg','gif','jpeg'];

    if(extensionesValidas.indexOf(extensionArchivo) < 0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones validas son: '+ extensionesValidas.join(', ')}
        });
    }
    //Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    var path = `./upload/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err =>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Extension al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
        /*res.status(200).json({
            ok: true,
            mensaje: 'Archivo movido',
            nombreCortado:nombreCortado
        });*/
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res){

    if(tipo === 'usuarios'){
        Usuario.findById(id, (err,usuario)=>{
            if(!usuario){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: { message:  'Usuario no existente'}
                });
            }

            var pathViejo = '../upload/usuarios/'+ usuario.img;

            //Si existe, elimina la imagen anterior
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }
            usuario.img = nombreArchivo;

            usuario.save( (err, UsuarioActualizado) =>{
               return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: UsuarioActualizado
                });
            });
        });
    }
    if(tipo === 'medicos'){
        Medicos.findById(id, (err,medico)=>{
            if(!medico){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Medico no existe',
                    errors: { message:  'Medico no existente'}
                });
            }
            var pathViejo = '../upload/medicos/'+ medico.img;

            //Si existe, elimina la imagen anterior
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }
            medico.img = nombreArchivo;

            medico.save( (err, MedicoActualizado) =>{
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: MedicoActualizado
                });
            });
        });
    }

    if(tipo === 'hospitales'){
        Hospital.findById(id, (err,hospital)=>{
            if(!hospital){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: { message:  'Hospital no existente'}
                });
            }
            var pathViejo = '../upload/hospitales/'+ hospital.img;

            //Si existe, elimina la imagen anterior
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }
            hospital.img = nombreArchivo;

            hospital.save( (err, HospitalActualizado) =>{
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: HospitalActualizado
                });
            });
        });
    }
}

module.exports= app;
