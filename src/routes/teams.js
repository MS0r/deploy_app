import { Router } from 'express'
import { createTeam, addMember, getTeam, getTeamMembers, leaveTeam } from '../db.js';
import checkSignIn from '../handlers/checkSignIn.js';

const router = Router();


router.post('/teams', checkSignIn, async (req, res) => {
    const newTeam = req.body
    await createTeam(newTeam.id, newTeam.team_name)
    res.redirect('/myteam')
})

router.post('/teams/enterTeam', checkSignIn, async (req, res) => {
    const teamId = req.body.id
    await addMember(res.locals.user.id, teamId)
    res.redirect('/myteam')
})

router.get('/teams', checkSignIn, async (req, res) => {
    res.render('teams')
})

router.get('/myteam', checkSignIn, async (req, res) => {
    if (!res.locals.user.team_id) {
        res.redirect('/teams')
    } else {
        const team_id = res.locals.user.team_id
        const team = await getTeam(team_id)
        const members = await getTeamMembers(team_id)
        res.render('myteam', { team: team, members: members })
    }

})

router.post('/teams/quitTeam', checkSignIn, async (req, res) => {
    const id = res.locals.user.id
    await leaveTeam(id)
    res.redirect('/teams')
})

export default router