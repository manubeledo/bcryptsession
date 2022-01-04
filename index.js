const express = require('express')
const app = express()
const path = require('path')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const serverRoutes = require('./routes/routes')
const MongoStore = require('connect-mongo')
// const { usersModel : db, usersModel } = require('./config/mongodb') //Importa la base de datos de mongo
PORT = 3000

const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }
app.use('/recursos', express.static(path.join(__dirname+'/public'))) // path join le da la barra invertida que corresponda, se usa /recursos para llamar a los estilos y scripts de public
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs");
app.set("views", "./views/layouts");

app.use(cookieParser())

app.use(session({ 
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://manuclusteraws:unpassword@cluster0.eknww.mongodb.net/desafiologin',
        mongoOptions: advancedOptions
    }),
    secret: 'keyboard cat', 
    resave: true, // if your store sets an expiration date on stored sessions, you use it
    cookie: { maxAge: 60000 }, // cookie duration in ms
    saveUninitialized: false
}))

app.get("/login", (req, res) => {
    console.log("nombre de req.session.user --->", req.session.user)
    if(req.session.user){ // entra al if si la session no expiro y renderiza el usuario (dura 60segundos la session)
        res.render('logedin', {user : req.session.user}) 
    } else {
        res.render('login')
    }
})

app.post("/login", (req, res) => {
    res.cookie('userName', `${req.body.name}`, {httpOnly: true, maxAge: 30000})
    if (req.cookies.cookieUserName){
        res.render('logout', { user : req.cookies.cookieUserName })
    } else {
        req.session.user = req.body.name.trim() // Trim() Delete all spaces in the string
        res.redirect('/login')
    }
})

app.post("/logout", async (req, res) => {
        console.log('entro por post a /logout')
        res.render('logout', { user: req.cookies.userName})
})

serverRoutes(app)

app.listen(PORT, () => console.log(`Servidor funcionando en http://localhost:${PORT}/login`))