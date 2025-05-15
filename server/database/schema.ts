export const USER_TABLE = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'User',
        active BOOLEAN DEFAULT true
        );
`;

export const TWEET_TABLE = `
    CREATE TABLE IF NOT EXISTS tweets (
         id INT AUTO_INCREMENT PRIMARY KEY,
         content TEXT NOT NULL,
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
         user_id INT,
         FOREIGN KEY (user_id) REFERENCES users(id)
);
`

export const COMMENT_TABLE = `
CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INT,
        post_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES tweets(id) ON DELETE CASCADE
);
`

export const LIKE_TABLE = `
CREATE TABLE IF NOT EXISTS likes (
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        type ENUM('Like', 'Dislike') NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES tweets(id) ON DELETE CASCADE,
        UNIQUE(user_id, post_id)
);
`

export const ROLE_TABLE = `
CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role ENUM('User', 'Moderator', 'Admin') NOT NULL
);
`
