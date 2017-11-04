"use strict";
const express = require('express'),
	pug = require('pug'),
	bodyParser = require('body-parser'),
	favicon = require('serve-favicon')(`${__dirname}/public/favicon.png`),
	publicDir = express.static(`${__dirname}/public`),  // archivos de carpeta publica
	viewDir = `${__dirname}/public/views`,// directorio de vistas
	//puerto applicacion
	port = (process.env.PORT || 2222),
	mysql = require('mysql'),
	myConnection = require('express-myconnection'),
	dbOptions ={
		host: 'localhost',
		user:'juan',
		password: 'juan',
		port: 3306,
		database:'usuarios'
	},
	conn= myConnection(mysql, dbOptions,'request');
      // estrategia de express-myconnection .. request crea nueva conexion a cada peticion

let app = express();

// node .. metodos set -- establecer parametros
//                          get
//                            use


app.set( 'views', viewDir ); //
app.set( 'view engine', 'pug' ); // motor de vistas
app.set( 'port', port );  // puerto  2222


// definir middleware
app.use( bodyParser.json() ); // para manipular el envio en formato json
app.use( bodyParser.urlencoded({ extended: false }) );//
app.use( publicDir );
app.use( favicon );

app.use( conn );
// RUTAS
// middelawwre paramatros:  PETICION, RESPUESTA Y NEXT
app.get('/', (req,res,next)=>{
        req.getConnection((err,conn)=>{
        	conn.query("select * from usuario",(error,data)=>{
               if(!error){
               	res.render('index',{
               		titulo: "DATOS",
               		data:data
               	});
               }
        	});
        });
} );
//ruta
app.get('/agregar', (req,res,next)=>{
        res.render('add',{ // VISUALIZA LA VISTA ADD.PUG
        	title: 'AGREGAR USUARIO'
        });
} );


// AGREAGAR A LA BASE DE DATOS POR POST
app.post('/', (req,res,next) =>{
         req.getConnection((err,conn)=>{
         	let usuario= {
                        id:0,
         		clave: req.body.password,
         		nombre: req.body.nombre,
         		correo: req.body.correo,
         		ciudad: req.body.ciudad
         	};

         	// ejecutar  el update
         	// 'inser into usuarios SET ?'
         	conn.query('insert into usuarios.usuario SET ?',usuario, (err,data)=>{
                                   if(!err){
                                   	res.redirect('/');
                                   	console.log(data   +"éxito al insertar ")
                                   }else {
                                   	res.redirect('/agregar');
                                   	console.log(err+ "error al insertar ");
                                   }
         	})
         })
});

// consulta para actualizar los datos
app.get('/editar/:id', (req,res,next)=>{
	let id = req.params.id;
	 req.getConnection((err,conn)=>{
	conn.query('select * from usuario  where id=?',id,(err,data)=>{
		if(!err){
			res.render('editar' , {
				titulo: 'EDITAR USUARIO',
				data: data
			});
		}else{
			console.log(err);
		}
	});
});
	});

// EDITAR LOS DATO S
app.post('/actualizar/:id', (req, res, next) => {
	req.getConnection((err, conn) => {
		let usuario = {
                        id:req.body.id,
         		clave: req.body.password,
         		nombre: req.body.nombre,
         		correo: req.body.correo,
         		ciudad: req.body.ciudad
         	};

		conn.query('UPDATE usuario SET ? WHERE id = ?', [usuario, usuario.id],(err, data) => {
			if(!err) {
				res.redirect('/');
			} else {
				res.redirect('/editar/'+req.body.id);
			}
		});
	});
});

// eliminar registro de base de datos
app.post('/eliminar/:id', (req, res, next) => {
	req.getConnection((err, conn) => {
		let id = req.params.id;

		conn.query('DELETE FROM usuario WHERE id = ?', id, (err, data) => {
			if(!err) {
				res.redirect('/');
			} else {
				return next(new Error('Registro no encontrado'));
			}
		});
	});
});

// manejo de 404
app.use((req,res)=>{
	let err = new Error();
	err.status = 404;
	err.statusText = "NOT FOUND";
	res.render('error',{error:err});
});
app.listen( app.get('port'), () => console.log('Iniciando API CRUD Express con MySQL en puerto '+port) );

