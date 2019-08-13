// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//Inicializando variables
var app= express();

//BodyParser
app.use(bodyParser.urlencoded({ extented: false}));
app.use(bodyParser.json());

//Importar rutas
var appRoutes = require('./routes/app');
var loginRoutes = require('./routes/login');
var appUsuario = require('./routes/usuario');


//Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true },
    (err, res)=> {
        if(err) throw err;
        console.log('Conexión correcta a la base de datos: \x1b[32m%s\x1b[0m', 'OK');
    });

//Rutas
app.use('/usuario',appUsuario);
app.use('/login',loginRoutes);
app.use('/',appRoutes);

//Escuchar peticiones
app.listen(3000, () =>{
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});


