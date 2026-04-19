// script.js — MePost (всё на одной странице)

function loadPosts() {
  const postsContainer = document.getElementById("posts");
  if (!postsContainer) return;

  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  postsContainer.innerHTML = "";

  if (posts.length === 0) {
    postsContainer.innerHTML = "<p>Пока нет постов. Создайте первый!</p>";
    return;
  }

  // Отображаем посты сверху вниз (новые — сверху)
  posts.forEach(post => {
    const postDiv = document.createElement("div");
    postDiv.className = "post";
    postDiv.innerHTML = `
      <h4>${escapeHtml(post.author)}</h4>
      <p>${post.content.replace(/\n/g, "<br>")}</p>
      ${post.image ? `<img src="${escapeHtml(post.image)}" alt="Картинка" style="max-width:100%;">` : ""}
      <small>${post.timestamp}</small>
      <hr>
      <div class="comments">
        <h5>Комментарии (${post.comments.length}):</h5>
        ${renderComments(post.comments)}
      </div>
      <div class="add-comment">
        <textarea placeholder="Ваш комментарий" rows="2" cols="50"></textarea><br>
        <input type="text" placeholder="Ваш ник" value="Аноним" style="width: 200px;"><br>
        <button onclick="addComment(${post.id})">Добавить</button>
      </div>
    `;
    postsContainer.appendChild(postDiv);
  });
}

// Экранирование HTML (защита от XSS)
function escapeHtml(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Генерация HTML для комментариев
function renderComments(comments) {
  if (comments.length === 0) {
    return "<p><i>Нет комментариев.</i></p>";
  }
  return comments.map(com => `
    <div class="comment">
      <b>${escapeHtml(com.author)}</b>: ${escapeHtml(com.text).replace(/\n/g, "<br>")}
      <br><small>${com.timestamp}</small>
    </div>
  `).join("");
}

// Добавление комментария к посту
function addComment(postId) {
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  const textarea = document.querySelector(`.post:nth-child(${getPostIndex(posts, postId)}) .add-comment textarea`);
  const inputNick = document.querySelector(`.post:nth-child(${getPostIndex(posts, postId)}) .add-comment input`);

  const text = textarea.value.trim();
  const author = inputNick.value.trim() || "Аноним";

  if (!text) {
    alert("Комментарий не может быть пустым.");
    return;
  }

  const newComment = {
    author: author,
    text: text,
    timestamp: new Date().toLocaleString("ru-RU")
  };

  post.comments.push(newComment);
  localStorage.setItem("posts", JSON.stringify(posts));

  // Очистим поле и перезагрузим посты
  textarea.value = "";
  loadPosts(); // перерисовываем всё (простое решение)
}

// Вспомогательная функция: получаем порядковый номер поста (для querySelector)
function getPostIndex(posts, postId) {
  const index = posts.findIndex(p => p.id === postId);
  return index + 1; // nth-child начинается с 1
}

// Загружаем посты при открытии страницы
window.onload = function () {
  loadPosts();
};