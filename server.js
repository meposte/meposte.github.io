// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Путь к файлу с постами
const POSTS_FILE = './posts.json';

// === МИДЛВЕРЫ ===
app.use(express.static('public')); // раздаём HTML/CSS/JS
app.use(express.json()); // для JSON-запросов

// === ЧИТАЕМ ПОСТЫ ИЗ ФАЙЛА ===
function readPosts() {
  try {
    if (fs.existsSync(POSTS_FILE)) {
      const data = fs.readFileSync(POSTS_FILE, 'utf8');
      return JSON.parse(data);
    } else {
      return [];
    }
  } catch (err) {
    console.error('Ошибка чтения posts.json:', err);
    return [];
  }
}

function writePosts(posts) {
  try {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8');
  } catch (err) {
    console.error('Ошибка записи posts.json:', err);
  }
}

let posts = readPosts();

// === API: Получить все посты ===
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

// === API: Создать пост ===
app.post('/api/posts', (req, res) => {
  const { author, content, image } = req.body;

  if (!content || !author) {
    return res.status(400).json({ error: 'Нет автора или текста' });
  }

  const newPost = {
    id: Date.now(),
    author: author.trim(),
    content: content.trim(),
    image: image?.trim() || '',
    timestamp: new Date().toLocaleString('ru-RU'),
    comments: []
  };

  posts.unshift(newPost); // новый сверху
  writePosts(posts);
  res.json(newPost);
});

// === API: Добавить комментарий ===
app.post('/api/posts/:id/comments', (req, res) => {
  const postId = parseInt(req.params.id);
  const { author, text } = req.body;

  if (!author || !text) {
    return res.status(400).json({ error: 'Нет автора или текста' });
  }

  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: 'Пост не найден' });
  }

  const newComment = {
    author: author.trim(),
    text: text.trim(),
    timestamp: new Date().toLocaleString('ru-RU')
  };

  post.comments.push(newComment);
  writePosts(posts);
  res.json(newComment);
});

// === Запуск сервера ===
app.listen(PORT, () => {
  console.log(`✅ MePost запущен: http://localhost:${PORT}`);
  console.log(`📁 Посты хранятся в posts.json`);
});