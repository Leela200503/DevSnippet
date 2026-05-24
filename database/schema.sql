-- Create DevSnippet Database
CREATE DATABASE IF NOT EXISTS devsnippet_db;
USE devsnippet_db;

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Snippets Table
CREATE TABLE IF NOT EXISTS snippets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    code LONGTEXT NOT NULL,
    language VARCHAR(100) NOT NULL,
    tags VARCHAR(500),
    description TEXT,
    visibility ENUM('PUBLIC', 'PRIVATE') NOT NULL DEFAULT 'PRIVATE',
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_visibility (visibility),
    INDEX idx_language (language),
    INDEX idx_created_at (created_at),
    INDEX idx_title (title),
    FULLTEXT INDEX ft_title (title),
    FULLTEXT INDEX ft_description (description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data (optional)
-- Users
INSERT INTO users (email, name, password) VALUES 
('john@example.com', 'John Doe', '$2a$10$slYQmyNdGzin7olVN3YO2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUe'),
('jane@example.com', 'Jane Smith', '$2a$10$slYQmyNdGzin7olVN3YO2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUe');

-- Snippets
INSERT INTO snippets (title, code, language, tags, description, visibility, user_id) VALUES 
('Hello World Java', 'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}', 'Java', 'basic, hello', 'A simple Hello World program in Java', 'PUBLIC', 1),
('Python List Operations', 'my_list = [1, 2, 3, 4, 5]\nprint(my_list)\nmy_list.append(6)\nprint(my_list)', 'Python', 'list, operations', 'Basic Python list operations', 'PUBLIC', 1),
('JavaScript Arrow Function', 'const greet = (name) => {\n    return `Hello, ${name}!`;\n}\nconsole.log(greet("World"));', 'JavaScript', 'arrow, function', 'Arrow function example in JavaScript', 'PUBLIC', 2),
('SQL User Query', 'SELECT id, email, name FROM users WHERE created_at >= NOW() - INTERVAL 7 DAY ORDER BY created_at DESC;', 'SQL', 'query, users', 'Get recent users from the database', 'PRIVATE', 2);

-- Create Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    snippet_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_snippet_id (snippet_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Follows Table (User following another user)
CREATE TABLE IF NOT EXISTS follows (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    follower_id BIGINT NOT NULL,
    following_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_follow (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_follower_id (follower_id),
    INDEX idx_following_id (following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Likes Table (Users liking snippets)
CREATE TABLE IF NOT EXISTS likes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    snippet_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (snippet_id, user_id),
    FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_snippet_id (snippet_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Views Table (Track snippet views)
CREATE TABLE IF NOT EXISTS views (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    snippet_id BIGINT NOT NULL,
    user_id BIGINT,
    view_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_snippet_id (snippet_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Snippet Favorites Table
CREATE TABLE IF NOT EXISTS snippet_favorites (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    snippet_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_favorite (snippet_id, user_id),
    FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_snippet_id (snippet_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
