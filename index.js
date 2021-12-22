const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()
const session = require('express-session')
const serverRoutes = require('./routes/routes')
const routes = require('./routes/routes')
PORT = 3000

app.use(express.urlencoded({ extended: false }))

app.use(cookieParser())

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

let contador = 0

app.get("/login", (req, res) => {

    if(req.session.user) contador++
        let name = "GET"
        res.cookie('cookieName', 'sessionTime', {httpOnly: true, maxAge: 10000}) // maxAge funciona en milisegundos, es el tiempo que va durar la cookie 
        res.cookie('cookieLogout', 'logoutTime', {httpOnly: true, maxAge: 20000})
        //res.cookie('sky', 'blue', {httpOnly: true, secure: true}) // Secure solo funciona en https domains (no http)
        // console.log("cookies", req.cookies) // Sin cookie parser no funciona req.cookies 
        res.send(`
        <h1>Hello ${name}<h1>
        <form action='/login' method=POST>
        <input type='text' name='name' placeholder='enter your name..'>
        <button>Submit</button>
        <h3>Se ha refrescado la pagina ${contador} veces<h3>
        </form>
        `)
})

app.post("/login", (req, res) => {
    let name = 'POST'
    req.session.user = 'created'
    if(req.session.user) name = req.body.name.trim()
    if (req.cookies.cookieName == 'sessionTime'){
    res.send(`
        <h1>Bienvenido ${name}\n<a href="/logout">Desloguarse</a><h1>
            <h1>Ingrese producto</h1>
            <input type='text' name='name' placeholder='Nombre del producto...'><br><br>
            <input type='text' name='name' placeholder='Precio...'><br><br>
            <input type='text' name='name' placeholder='Foto URL..'><br><br>
            <button>Enviar</button>
        `)
    } else {
        res.redirect('/login')
    }
})

app.get("/logout", async (req, res) => {
        if(req.cookies.cookieLogout == 'logoutTime'){
            res.send(`
            <h1>Hasta Luego ${req.session.user}<h1>
            `)
        } else {
            res.send(window.location = 'http://localhost:3000/login')
        // res.redirect('/login')
        }
})

serverRoutes(app)

app.listen(PORT, () => console.log(`Servidor funcionando en http://localhost:${PORT}/login`))