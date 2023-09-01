import { getUser } from "../db.js";

const loggedHandler = async (req, res, next) => {
    const id = req.session.user_id;
    if (!id) {
        res.locals.user = null
    } else {
        res.locals.user = await getUser(id, null)
    }
    next()
}

export default loggedHandler