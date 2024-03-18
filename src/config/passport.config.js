import passport from 'passport';
import local from 'passport-local';
import github from 'passport-github2';

import userModel from '../dao/models/user.model.js';
import { createHash, isValidPassword } from '../utils.js';

const localStrategy = local.Strategy;

const initializePassport = () => {
    passport.use('register', new localStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, username, password, done) => {
            try {
                const { first_name, last_name, email, age } = req.body;
                if (!first_name || !last_name || !email || !age || !password) {
                    return done(null, false, req.flash('error', 'faltan campos obligatorios'));
                }
                const user = await userModel.findOne({ email: username });
                if (user) {
                    return done(null, false, req.flash('error', 'usuario ya registrado'));
                }
                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password)
                };
                const result = await userModel.create(newUser);
                return done(null, result);
            } catch (error) {
                return done(null, false, req.flash('error', 'error al registrarse'));
            }
        }
    ));

    passport.use('login', new localStrategy(
        { usernameField: 'email', passReqToCallback: true },
        async (req, username, password, done) => {
            try {
                const user = await userModel.findOne({ email: username });
                if (!user) {
                    return done(null, false, req.flash('error', 'usuario inexistente'));
                }
                if (!isValidPassword(password, user)) {
                    return done(null, false, req.flash('error', 'contraseña incorrecta'));
                }
                return done(null, user);
            } catch (error) {
                return done(null, false, req.flash('error', 'error al loguearse'));
            }
        }
    ));

    passport.use('github', new github.Strategy({
        clientID: 'Iv1.3523fcc95d8c3f6d',
        clientSecret: '468bda5d0555a54f090eb35685800271ba7ae5e1',
        callbackURL: 'http://localhost:8080/api/sessions/githubcallback'
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const user = await userModel.findOne({ email: profile._json.email });
                if (user) {
                    return done(null, user);
                } else {
                    const newUser = {
                        first_name: profile._json.name,
                        last_name: '',
                        email: profile._json.email,
                        age: 18,
                        password: ''
                    };
                    const result = await userModel.create(newUser);
                    return done(null, result);
                }
            } catch (error) {
                return done(null, false, req.flash('error', 'error al loguearse con GitHub'));
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userModel.findOne({ _id: id });
            done(null, user);
        }
        catch (error) {
            done(`Error al deserializar usuario: ${error}`);
        }
    });
};

export default initializePassport;