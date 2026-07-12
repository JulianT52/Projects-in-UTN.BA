import express from "express"
import {z} from "zod"; // Nos permite definir un esquema que van a seguir los recursos creados en la API

const PATH_PRODUCTOS_V1 = "/v1/productos";

// Sirve para decir que toda la aplicacion utilizara JSON como lenguaje
const app = express();
app.use(express.json());

/* -----------------------------------------------------
   ------CONSTANTES UTILIZADAS PARA DEFINIR MI API------
   -----------------------------------------------------*/ 

const productSchema = z.object({
    nombre: z.string().min(3).max(10),
    descripcion: z.string(),
    precioBase: z.number().nonnegative(),
    categoria: z.enum(["Alimentos", "Bebidas", "Legumbres"])
});

const cocaCola = {
    nombre :"Coca-Cola", 
    precioBase: 2500, 
    descripcion: "1,5lt",
    categoria: "Bebidas"
};

const harina = {
    nombre :"Harina", 
    precioBase: 1000, 
    descripcion: "1kg",
    categoria: "Alimentos"
};

const fideos = {
    nombre :"Fideos", 
    precioBase: 1000, 
    descripcion: "1kg",
    categoria: "Alimentos"
};

const aceite = {
    nombre : "Aceite",
    precioBase : 1000,
    descripcion: "1lt",
    categoria: "Alimentos"
}

const productos = [
    cocaCola, harina, fideos, aceite
];

/* -----------------------------------------------------
   -------------------DEFINO LOS GETS-------------------
   -----------------------------------------------------*/ 

// Ruta para saber si se levanto bien el servidor //
app.get("/v1/healthcheck", (request, response) => {
    response.status(201); //cambio el codigo de error en base a lo que quiero
    response.json({
        status: "ok",
    });
});

app.get("/v2/healthcheck", (request, response) => {
    response.status(200);
    response.json({
        live: "ok",
    });
});

app.get(PATH_PRODUCTOS_V1, (req,res) => {
    console.log(req.query);
    const precioMenorQue = req.query.precio_lt; //Consigo el precio limite desde el query param

    if(!precioMenorQue){ //Si no encuentra el query param, mando todos los productos
      res.json(productos);
    }

    res.json(productos.filter((p) => p.precioBase <= precioMenorQue));
})

app.get(PATH_PRODUCTOS_V1, (req,res) => {
    const precioMenorQue = req.query.precio_lt; //Consigo el precio limite desde el query param
    const categoria = req.query.categoria;
    let productosFiltrados = productos

    if (precioMenorQue){
        productosFiltrados = productosFiltrados.filter((p) => p.precioBase <= precioMenorQue);
    }

    if(categoria){
        productosFiltrados = productosFiltrados.filter(
            (p) => p.categoria === categoria);
    }
    res.json(productosFiltrados);
});

//Obtener producto por ID
app.get(PATH_PRODUCTOS_V1 + "/:id", (req,res) =>{
    const id = req.params.id;
    const producto = productos[id];

    if(!producto){
        res.status(404);
        return; // Como el res.status no corta, es necesario agregar el return
    }
    res.json(producto);
})


// listen recibe el puerto y una funcion callback que se ejecuta
// cuando el servidor se inicio
const puerto = 3000;
app.listen(puerto, () => {
    console.log("El servidor se inicio correctamente en el puerto " + puerto);
});

/*
----------------------------------------------------------------
------------------------POST------------------------------------
----------------------------------------------------------------
*/

// Un post que me permite verificar si puedo crear un nuevo producto que siga el esquema
app.post(PATH_PRODUCTOS_V1, (req,res) => {
    const body = req.body;
    const result = productSchema.safeParse(body);
    if (result.error){
        res.status(400)
        res.json(result.error.issues)
    }

    // Si se respeta el esquema desarrollado, puedo verificar si puedo crear el producto o si ya existe
    const nuevoProducto = result.data;
    const productoExistente = productos.find(p => p.nombre === nuevoProducto.nombre)

    if(productoExistente){
        res.status(409)
        res.json({
            error: "PRODUCTO_EXISTENTE",
        });
    }

    productos.push(nuevoProducto)
    res.status(201);
    res.json(nuevoProducto);
});

/*
----------------------------------------------------------------
-----------------------DELETE-----------------------------------
----------------------------------------------------------------
*/

app.delete(PATH_PRODUCTOS_V1 + "/:id", (req,res) =>{
    const id = req.params.id;
    productos.splice(id,1);
    res.status(204)
    res.send();
})


