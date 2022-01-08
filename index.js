const express = require('express')
const app = express()
const path = require('path')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const serverRoutes = require('./routes/routes')
const MongoStore = require('connect-mongo')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt') // al parecer viene con node o con express
const { usersModel : db} = require('./config/mongodb') //Importa la base de datos de mongo
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
    secret: 'keyboardcat', 
    resave: true, // if your store sets an expiration date on stored sessions, you use it
    cookie: { maxAge: 60000 }, // cookie duration in ms
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

function createHash(password){
    return bcrypt.hash(password, 10, null)
}

function isValidPswd(user, password){
    return bcrypt.compareSync(password, user.password)
}

passport.use('signup', new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'user', // los campos como vienen del front
    passwordField: 'password' // los campos como vienen del front
}, async (req, username, password, done)=>{
    try {
        const userExists = await db.findOne({user: `${username}`})
        if(userExists){
            console.log('User already exists')
            return done(null, false)
        }
        let user = req.body
        user.password = await createHash(password) //guarda un password en user con bcrypt, pasandole el password como parametro
        await db.create(user)
        const newUser = await db.findOne({user: `${username}`})
        done(null, newUser)
    }catch(error){
        console.log(error)
    }
}))

passport.use('login', new LocalStrategy({
    usernameField: 'user',
    passwordField: 'password'
}, async (username, password, done) => {
    const user = await db.findOne({user: `${username}`})
    if(!user){
        console.log('user not found', user)
        return done(null, false)
    }else{
        if(!isValidPswd(user,password)){
            console.log('Invalid pswd')
            return done(null, false)
        }else{
            done(null, user)
        }
    }
}))

passport.serializeUser((user, done) => {
    console.log('serialize', user)
    done(null, user._id)
    })
    
passport.deserializeUser((id, done) => {
    db.find({_id: `${id}`}, (err, user) => {
        done(err, user)
    })
})
    

function isAuth (req, res, next){
    if(req.isAuthenticated()){
        let user = req.user[0]
        //console.log(user.pswd)
        console.log('user logged', user)
        if(user){
            if(req.session.authenticated){
                //res.json(req.session)
                //res.render('authIndex', {userData: req.session})
                console.log('welcome again')
            }else{
                if(user.password){
                    req.session.authenticated = true
                    req.session.user = {
                        user
                    }
                    console.log('first hello')
                    //res.render('authIndex', {userData: req.session})
                }else{
                    console.log('bad credentials 1')
                }
            }
        }else{
            console.log('bad credentials 2')
        }
        console.log('session done')
        // res.render('authIndex', user)
        next()
    }else{
        res.redirect('login')
    }
}

app.get("/login", (req, res) => {
    console.log("nombre de req.session.user --->", req.session.user)
    if(req.session.user){ // entra al if si la session no expiro y renderiza el usuario (dura 60segundos la session)
        res.render('logedin', {user : req.session.user}) 
    } else {
        res.render('login')
    }
})

app.get("/signup", (req, res) => {
    res.render('signup') 
})

// Paso authenticate como middleware para verificar si el usuario esta registrado o hay que crearlo.
// Segun el nombre que le doy en passport.use('<nombre>', newLocalStrategy ...) tengo que indicarselo aca dentro
// de authenticate tambien, en este caso es signup y passport.use('signup', newLocalStrategy...)
app.post('/signup', passport.authenticate('signup', {
        successRedirect: 'success', // Ejecuta esta funcion si la autenticacion es exitosa
        failureRedirect: 'failure' // Ejecuta esta funcion si la autenticacion falla
    })
)

app.post('/logedin', passport.authenticate('login', {
    successRedirect: 'successlogin',
    failureRedirect: 'failurelogin'
}))

app.post("/logout", async (req, res) => {
        console.log('entro por post a /logout')
        res.render('logout', { user: req.cookies.userName})
})

app.get('/success', (req, res)=>{
    res.send('Usuario registrado con exito')
})

app.get('/failure', (req, res)=>{
    res.send('Error, usuario ya registrado')
})

app.get('/successlogin', isAuth, (req, res)=>{
    res.send('Ingreso exitoso')
})

app.get('/failurelogin', (req, res)=>{
    res.send('Error, usuario no encontrado o password incorrecto')
})

serverRoutes(app)

app.listen(PORT, () => console.log(`Servidor funcionando en http://localhost:${PORT}/login`))