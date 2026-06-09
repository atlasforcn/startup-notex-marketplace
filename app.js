const typeLabels = {
  exam: "考前整理",
  lecture: "課堂逐字",
  template: "報告模板",
};

let notes = [
  { id: 1, course: "資料結構", title: "期中考重點與題型索引", type: "exam", school: "國立臺灣大學", rating: 4.9, price: 160, sales: 23 },
  { id: 2, course: "普通心理學", title: "教授口頭補充逐字稿", type: "lecture", school: "政治大學", rating: 4.7, price: 120, sales: 17 },
  { id: 3, course: "服務設計", title: "使用者訪談報告模板", type: "template", school: "臺灣科技大學", rating: 4.8, price: 90, sales: 31 },
  { id: 4, course: "財務管理", title: "公式速查與歷屆題整理", type: "exam", school: "成功大學", rating: 4.6, price: 140, sales: 14 },
];

let cart = [];

const grid = document.querySelector("#noteGrid");
const cartEl = document.querySelector("#cart");
const weeklyTotal = document.querySelector("#weeklyTotal");
const search = document.querySelector("#search");
const typeFilter = document.querySelector("#typeFilter");
const sortBy = document.querySelector("#sortBy");
const form = document.querySelector("#listingForm");
const checkout = document.querySelector("#checkout");

function money(value) {
  return `NT$${Number(value).toLocaleString("zh-TW")}`;
}

function filteredNotes() {
  const query = search.value.trim().toLowerCase();
  const type = typeFilter.value;
  const sorted = notes.filter((note) => {
    const hay = `${note.course} ${note.title} ${note.school}`.toLowerCase();
    return (!query || hay.includes(query)) && (type === "all" || note.type === type);
  });

  if (sortBy.value === "price") sorted.sort((a, b) => a.price - b.price);
  if (sortBy.value === "rating") sorted.sort((a, b) => b.rating - a.rating);
  if (sortBy.value === "match") sorted.sort((a, b) => b.sales + b.rating - (a.sales + a.rating));
  return sorted;
}

function renderNotes() {
  const items = filteredNotes();
  grid.innerHTML = items.map((note) => `
    <article class="note-card">
      <div class="tag-row">
        <span class="tag">${typeLabels[note.type]}</span>
        <span class="rating">${note.rating.toFixed(1)} 分</span>
      </div>
      <div>
        <h3>${note.course}</h3>
        <p>${note.title}</p>
      </div>
      <p>${note.school} / 已售出 ${note.sales} 份</p>
      <div class="note-bottom">
        <span class="price">${money(note.price)}</span>
        <button type="button" data-id="${note.id}">收藏</button>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => addToCart(Number(button.dataset.id)));
  });
}

function renderCart() {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  weeklyTotal.textContent = money(notes.reduce((sum, item) => sum + item.price * item.sales, 0) + total);

  if (!cart.length) {
    cartEl.className = "cart-empty";
    cartEl.textContent = "尚未收藏筆記。";
    return;
  }

  cartEl.className = "cart-list";
  cartEl.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <span>${item.course}</span>
      <strong>${money(item.price)}</strong>
    </div>
  `).join("");
}

function addToCart(id) {
  const note = notes.find((item) => item.id === id);
  if (note && !cart.some((item) => item.id === id)) cart.push(note);
  renderCart();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  notes.unshift({
    id: Date.now(),
    course: data.get("course"),
    title: data.get("title"),
    type: data.get("type"),
    school: "我的學校",
    rating: 0,
    price: Number(data.get("price")),
    sales: 0,
  });
  form.reset();
  renderNotes();
  renderCart();
});

checkout.addEventListener("click", () => {
  if (!cart.length) return;
  alert(`交易草稿已建立，共 ${cart.length} 份筆記，總計 ${money(cart.reduce((sum, item) => sum + item.price, 0))}`);
});

[search, typeFilter, sortBy].forEach((el) => el.addEventListener("input", renderNotes));

renderNotes();
renderCart();
