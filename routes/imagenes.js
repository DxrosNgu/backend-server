// Requires
var express = require('express');

var  app = express();
const path = require('path');
const fs = require('fs');

// Rutas
app.get('/:tipo/:img', (req, res, next) => {

    const tipo = req.params.tipo;
    const img = req.params.img;

    const pathImage = path.resolve( __dirname, `../upload/${tipo}/${img}`);

    if(fs.existsSync(pathImage) ){
        res.sendFile( pathImage);
    } else {
        const pathNoImage = path.resolve( __dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImage);
    }

});

module.exports= app;
