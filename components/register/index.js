var validator = require('../../node_modules/validator/validator-min'),
    check = validator.check,
    sanitize = validator.sanitize,
    utils = require('../../utils')

exports.init = function(model) {
}

exports.create = function(model, dom) {
    model.on('set', 'username', function(username){
        if (!username) return
        try {
            check(username).isAlphanumeric();
            model.set('errors.username', '');
        } catch (err) {
            model.set('errors.username', err.message);
        }
    });

    model.on('set', 'email', function(email){
        if (!email) return
        try {
            check(email).isEmail();
            model.set('errors.email', '');
        } catch (err) {
            model.set('errors.email', err.message);
        }
    });

    model.on('set', 'passwordConfirmation', function(passwordConfirmation){
        if (!passwordConfirmation) return
        try {
            check(passwordConfirmation).equals(model.get('password'));
            model.set('errors.passwordConfirmation', '');
        } catch (err) {
            model.set('errors.passwordConfirmation', err.message);
        }
    });

    model.on('set', 'password', function(password){
        if (!password) return
        try {
            check(password).len(8);
            model.set('errors.password', '');
        } catch (err) {
            model.set('errors.password', 'Password must be at least 8 characters');
        }
    });

    model.on('set', 'errors.*', function(error){
        var m = model.get(),
            canSubmit = false;
        if (!m.errors.username && !m.errors.email && !m.errors.passwordConfirmation && !m.errors.password &&
            !!m.username && !!m.email && !!m.passwordConfirmation && !!m.password) {
            canSubmit = true;
        }
        model.set('canSubmit', canSubmit);
    })
}

exports.usernameBlur = function(e, el){
    // check username not already registered
    var model = this.model,
        rootModel = model.parent().parent(),
        username = el.value,
        q = rootModel.query('users').withUsername(username);

    if (!username) {
        model.del('errors.username');
    }
    else {
        rootModel.fetch(q, function(err, users) {
            try {
                if (err) throw new Error(err);
                var userObj = users.get()
                if (userObj) throw new Error('Username already taken');
            } catch (err) {
                model.set('errors.username', err.message);
            }
        });
    }
}

exports.emailBlur = function(e, el){
    // check email not already registered
    var model = this.model,
        rootModel = model.parent().parent(),
        email = el.value,
        q = rootModel.query('users').withEmail(email);

    if (!email) {
        model.del('errors.email');
    }
    else {
        rootModel.fetch(q, function(err, users) {
            try {
                if (err) throw new Error(err);
                var userObj = users.get()
                if (userObj) throw new Error('Email already taken');
            } catch (err) {
                model.set('errors.email', err.message);
            }
        });
    }
}