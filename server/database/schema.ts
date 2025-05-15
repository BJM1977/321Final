export const USER_TABLE = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'User',
        active BOOLEAN DEFAULT true
        );
`;



export const ROLE_TABLE = `
CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role ENUM('User', 'Moderator', 'Admin') NOT NULL
);
`
