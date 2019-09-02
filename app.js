// Requires
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

var rawBodyHandler = function (req, res, buf, encoding) {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
        console.log('Raw body: ' + req.rawBody);
    }
}
//Inicializando variables
var app= express();

//CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});
// app.use(cors({origin:"http://localhost:4200"}));

//app.options('*', cors());
//BodyParser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(bodyParser.json());
//app.use(cors());

//Importar rutas
var appRoutes = require('./routes/app');
var loginRoutes = require('./routes/login');
var appUsuario = require('./routes/usuario');
var appHospital = require('./routes/hospital');
var appMedico = require('./routes/medicos');
var busquedaRoutes = require('./routes/busquedas');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

//Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true },
    (err, res)=> {
        if(err) throw err;
        console.log('Conexión correcta a la base de datos: \x1b[32m%s\x1b[0m', 'OK');
    });
//Server index config
//var serveIndex = require('serve-index');
//app.use(express.static(__dirname + '/'))
//app.use('/upload', serveIndex(__dirname + '/upload'));


//Rutas
app.use( '/hospital',appHospital);
app.use('/medico', appMedico);
app.use('/usuario',appUsuario);
app.use('/login',loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/coleccion', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/',appRoutes);

//Escuchar peticiones
app.listen(3000, () =>{
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});


