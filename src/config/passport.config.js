import passport from 'passport';
import local from 'passport-local';
import github from 'passport-github2';
import jwt from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { UsersManager } from '../services/users.manager.js';
import { createHash, isValidPassword } from '../utils.js';
import dotenv from 'dotenv';


// Estrategias de autenticación de usuario
const localStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;

// inicialización de dotenv
dotenv.config();

// Extrae el token de la cookie
const cookieExtractor = (req) => {
    return req && req.signedCookies ? req.signedCookies.token : null;
};
// Inicia la configuración de Passport
const initializePassport = () => {
    // Estrategia de autenticación de usuario
    passport.use('register', new localStrategy({
        usernameField: 'email',
        passReqToCallback: true,
        session: false
    },
        async (req, username, password, done) => {
            try {
                const { first_name, last_name, age } = req.body;
                if (!first_name || !last_name || !username || !age || !password) {
                    return done(null, false, 'Faltan campos obligatorios');
                }
                const user = await UsersManager.getInstance().getUserByEmail(username);
                if (user) {
                    return done(null, false, 'Ya existe un usuario registrado con este correo electrónico');
                }
                const newUser = await UsersManager.getInstance().createUser({
                    first_name,
                    last_name,
                    email: username,
                    age,
                    password
                });
                return done(null, newUser, 'Usuario registrado con éxito');
            } catch (error) {
                return done(error);
            }
        }
    ));
    // Estrategia de autenticación de usuario
    passport.use('login', new localStrategy(
        { usernameField: 'email', passReqToCallback: true },
        async (req, username, password, done) => {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return done(null, false, 'Falta completar campos obligatorios');
                }
                if (email === process.env.EMAIL_ADMIN && password === process.env.PASSWORD_ADMIN) {
                    return done(null, {
                        first_name: 'User',
                        email: process.env.EMAIL_ADMIN,
                        role: 'admin'
                    });
                }
                const user = await UsersServices.getInstance().getUserByEmail(username);
                if (!user) {
                    return done(null, false, `No existe un usuario registrado con el correo electrónico ${username}`);
                }
                if (!isValidPassword(password, user)) {
                    return done(null, false, 'La contraseña ingresada es incorrecta');
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));


    
    // Estrategia de autenticación con GitHub
    passport.use('github', new github.Strategy({
        clientID: 'Iv1.3523fcc95d8c3f6d',
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: 'http://localhost:8080/api/sessions/githubcallback'
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await UsersManager.getInstance().getUserByEmail(profile._json.email);
            if (user) {
                return done(null, user, 'Usuario logueado con éxito');
            } else {
                const newUser = {
                    first_name: profile._json.name,
                    email: profile._json.email,
                };
                const result = await UsersManager.getInstance().createUser(newUser);
                return done(null, result, 'Usuario registrado y logueado con éxito');
            }
        } catch (error) {
            return done(error);
        }
    }
));
 // Estrategia para restaurar contraseña 
passport.use('restore', new localStrategy({
    usernameField: 'email',
    passReqToCallback: true,
    session: false
},
    async (req, username, password, done) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return done(null, false, 'Faltan campos obligatorios');
            }
            const user = await UsersManager.getInstance().getUserByEmail(username);
            if (!user) {
                return done(null, false, 'Usuario inexistente');
            }
            user.password = createHash(password);
            await user.save();
            return done(null, user, 'Contraseña restaurada con éxito');
        } catch (error) {
            return done(error);
        }
    }
));

// Estrategia para verificar la validez del token JWT
passport.use('current', new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: 'myPKey'
},
    async (jwtPayload, done) => {
        try {
            return done(null, jwtPayload);
        } catch (error) {
            return done(error);
        }
    }
));
};

export default initializePassport;