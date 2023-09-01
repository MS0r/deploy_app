import { Router } from 'express';
import { createUser, getUser, getTeam } from '../db.js';
import md5 from 'md5';
import { CustomError } from '../errors/customError.js';
import checkSignIn from '../handlers/checkSignIn.js';

const router = Router();

router.get('/register', async (req, res) => {
    res.render('register', { error: '' })
})

router.post('/register', async (req, res) => {
    try {
        const data = { username: req.body.username, password: md5(req.body.password), email: req.body.email }
        await createUser(data)
        res.redirect('/login');
    } catch (error) {
        res.render('register', { error: error.message });
    }
})


router.get('/login', async (req, res) => {
    res.render('login', { error: '' });
})

router.post('/login', async (req, res) => {
    const data = req.body;
    try {
        const user = await getUser(null, data.login)
        if (md5(data.password) != user.password) {
            throw new CustomError('el usuario y/o la contraseña no son correctos', 406);
        }
        req.session.user_id = user.id;
        res.redirect('/tasks');
    } catch (error) {
        res.render('login', { error: error.message });

    }
})

router.get('/logout', async (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

router.get('/account', checkSignIn, async (req, res) => {
    let team
    if (res.locals.user.team_id) {
        team = await getTeam(res.locals.user.team_id)
        team = team.team_name
    }
    res.render('account', { team: team ?? 'No team' })
})

export default router;