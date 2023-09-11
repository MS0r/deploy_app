CREATE TABLE IF NOT EXISTS users (
    id integer PRIMARY KEY AUTO_INCREMENT,
    team_id integer ,
    username VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS teams(
    id integer PRIMARY KEY AUTO_INCREMENT,
    team_name VARCHAR(255) UNIQUE NOT NULL,
    admin_id int NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS tasks (
    id integer PRIMARY KEY AUTO_INCREMENT,
    user_id integer NOT NULL,
    team_id integer,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    done BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
)