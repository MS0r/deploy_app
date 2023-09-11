import express from 'express'
import morgan from 'morgan'
import session from 'express-session'
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getTeams, createDatabase } from './db.js';
import usersRouter from './routes/users.js';
import tasksRouter from './routes/tasks.js';
import teamsRouter from './routes/teams.js';
import loggedHandler from './handlers/logged.js';

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config();

//Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SECRET_KEY || '20LzwQjP5x',
    resave: false,
    saveUninitialized: true
}))
app.use(loggedHandler)
createDatabase()

app.use(express.static(join(__dirname, 'public')))
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');

//routes
app.use(usersRouter);
app.use(tasksRouter);
app.use(teamsRouter);

app.get('/api/teams', async (req, res) => {
    const teams = await getTeams();
    res.status(200).json(teams);
})


app.get('/', async (req, res) => {
    if (res.locals.user) {
        res.redirect('/tasks')
    } else {
        res.render('index')
    }

})

app.listen(3000, () => {
    console.log('Server Started')
})