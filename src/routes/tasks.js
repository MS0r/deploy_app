import { Router } from 'express';
import { getTasksByUserID, getTeamTasks, addTask, editTask, deleteTask, doneTask } from '../db.js';
import checkSignIn from '../handlers/checkSignIn.js';

const router = Router();

router.get('/tasks', checkSignIn, async (req, res) => {
    try {
        const tasks = await getTasksByUserID(res.locals.user.id)
        const teams = res.locals.user.team_id ? await getTeamTasks(res.locals.user.team_id) : []
        res.render('tasks', { tasks: tasks, groupTask: teams });
    } catch (e) {
        console.log(e)
    }
})

router.post('/tasks', checkSignIn, async (req, res) => {
    try {
        const task = req.body
        if (task.id) {
            await editTask(task.id, { title: task.title, body: task.body })
        } else {
            await addTask({ id: res.locals.user.id, team_id: task.team_id || null, title: task.title, body: task.body })
        }
        res.redirect('/tasks');
    } catch (e) {
        console.log(e);
    }
})

router.post('/tasks/delete', checkSignIn, async (req, res) => {
    await deleteTask(req.body.id)
    res.redirect('/tasks')
})
router.post('/tasks/done', checkSignIn, async (req, res) => {
    await doneTask(req.body.id, req.body.done)
    res.redirect('/tasks')
})


export default router;