import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { CustomError } from './errors/customError.js';
import fs from 'fs'

dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT
})


const emailreg = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";

function createDatabase() {
    pool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE ?? 'users_db'}`).then(
        () => {
            console.log("Database created")
            pool.getConnection()
                .then((conn) => {
                    conn.changeUser({ database: process.env.MYSQL_DATABASE ?? 'users_db' })
                        .then(() => { createTables() })
                        .catch((err) => { throw err })
                })
                .catch((err) => { throw err })
        }).catch((err) => {
            throw new Error(err)
        })
}

function createTables() {
    var sql = fs.readFileSync('./src/schema.sql').toString().split(';')
    sql.forEach((q) => {
        pool.query(q).then(() => { console.log("Table created") }).catch((err) => {
            throw err
        })
    })

}

async function getUser(id, useremail) {
    let rows;
    if (id) {
        [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, id);
    } else if (useremail.match(emailreg)) {
        [rows] = await pool.query(`
        SELECT *
        FROM users
        WHERE email = ?
        `, useremail);
    } else {
        [rows] = await pool.query(`
        SELECT *
        FROM users
        WHERE username = ?
        `, useremail);
    }

    if (!rows.length) {
        throw new CustomError('el usuario no existe', 401);
    }

    return rows[0];
}

async function createUser({ username, password, email }) {
    const [select] = await pool.query(`
    SELECT username, email 
    FROM users 
    WHERE username = ? OR email = ?`, [username, email]);
    if (select.length) {
        throw new CustomError('El usuario o el email ya existen', 401);
    } else if (!email.match(emailreg)) {
        throw new CustomError("el email esta mal escrito", 401);
    }

    const [result] = await pool.query(`
    INSERT INTO users (username,password,email)
    VALUES (?,?,?)
    `, [username, password, email]);

    return result;
}

async function getTasksByUserID(user_id) {
    const [tasks] = await pool.query(`
    SELECT id,title, body, done
    FROM tasks WHERE 
    user_id = ? AND team_id IS NULL
    `, user_id);

    return tasks;
}

async function getTeamTasks(team_id) {
    const [tasks] = await pool.query(`
    SELECT tasks.id, tasks.title, tasks.body, tasks.done, users.username
    FROM tasks INNER JOIN users ON tasks.user_id = users.id
    WHERE tasks.team_id = ?
    `, team_id)
    return tasks
}

async function addTask({ id, team_id, title, body }) {
    const [result] = await pool.query(`
    INSERT INTO tasks (user_id,team_id,title,body)
    VALUES (?,?,?,?)
    `, [id, team_id, title, body]);

    return result;
}

async function editTask(id, { title, body }) {
    const [result] = await pool.query(`
    UPDATE tasks
    SET title = ?, body = ?
    WHERE id = ?
    `, [title, body, id])

    return result
}

async function doneTask(id, done) {
    const [task] = await pool.query(`
    UPDATE tasks
    SET done = ? WHERE 
    id = ?
    `, [done, id])
    return task;
}

async function deleteTask(id) {
    const [delte] = await pool.query(`
    DELETE FROM tasks WHERE id = ?
    `, id)
    return delte
}

async function createTeam(admin_id, team_name) {
    const [team] = await pool.query(`
    INSERT INTO teams (admin_id,team_name)
    VALUES (?,?)
    `, [admin_id, team_name])
    await pool.query(`
    UPDATE users SET team_id=? WHERE id=?
    `, [team.insertId, admin_id])

    return team;
}

async function addMember(user_id, team_id) {
    const [user] = await pool.query(`
    UPDATE users SET team_id=? WHERE id=?
    `, [team_id, user_id])
    return user;
}

async function getTeams() {
    const [teams] = await pool.query(`
    SELECT id, team_name, admin_id
    FROM teams
    `)

    return teams;
}

async function getTeamMembers(team_id) {
    const [members] = await pool.query(`
    SELECT id, username
    FROM users
    WHERE team_id = ?
    `, team_id)

    return members
}


async function getTeam(team_id) {
    const [team] = await pool.query(`
    SELECT team_name, admin_id
    FROM teams
    WHERE id = ?
    `, team_id)

    return team[0];
}

async function leaveTeam(id) {
    const [leaving] = await pool.query(`
    UPDATE users SET team_id=NULL
    WHERE id=?
    `, id)

    return leaving
}

export { createDatabase, createUser, getUser, getTasksByUserID, addTask, doneTask, editTask, getTeamTasks, createTeam, addMember, getTeams, deleteTask, getTeamMembers, getTeam, leaveTeam }
