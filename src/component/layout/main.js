
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = localStorage.getItem("currentUser") || null;
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let likes = JSON.parse(localStorage.getItem("likes")) || [];

document.addEventListener("DOMContentLoaded", () => {
  initLoginModal();
  initAuth();
  initCart();
  initLikes();
  initSearch();
});


function initLoginModal() {
  const loginBtn = document.getElementById("loginBtn");
  const modal = document.getElementById("loginModal");
  const closeBtn = modal.querySelector(".close");

  loginBtn.addEventListener("click", e => {
    e.preventDefault();
    modal.style.display = "block";
  });

  closeBtn.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
}

function initAuth() {
  const form = document.getElementById("loginForm");
  const loginBtn = document.getElementById("loginBtn");
  let isSignup = false;

  function renderForm() {
    if (isSignup) {
      form.innerHTML = `
        <label>ایمیل:</label><input type="email" name="email" required>
        <label>رمز عبور:</label><input type="password" name="password" required>
        <label>تکرار رمز عبور:</label><input type="password" name="confirm" required>
        <button class="login-btn">ثبت نام</button>
        <p><a class="switch-form">حساب دارم (ورود)</a></p>`;
    } else {
      form.innerHTML = `
        <label>ایمیل:</label><input type="email" name="email" required>
        <label>رمز عبور:</label><input type="password" name="password" required>
        <button class="login-btn">ورود</button>
        <p><a class="switch-form">ایجاد حساب کاربری</a></p>`;
    }

    form.querySelector(".switch-form").addEventListener("click", e => {
      e.preventDefault();
      isSignup = !isSignup;
      renderForm();
    });
  }

  renderForm();

  form.addEventListener("submit", e => {
    e.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert("ایمیل معتبر نیست"); return; }
    if (password.length < 6) { alert("رمز عبور حداقل ۶ کاراکتر باشد"); return; }

    if (isSignup) {
      const confirm = form.confirm.value.trim();
      if (password !== confirm) { alert("رمزها یکسان نیستند"); return; }
      if (users.find(u => u.email === email)) { alert("این ایمیل قبلا ثبت شده است"); return; }

      users.push({ email, password });
      localStorage.setItem("users", JSON.stringify(users));
      alert("ثبت نام موفقیت‌آمیز بود ✅");
      isSignup = false;
      renderForm();
    } else {
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) { alert("ایمیل یا رمز عبور اشتباه است"); return; }

      localStorage.setItem("currentUser", email);
      currentUser = email;
      alert("ورود موفقیت‌آمیز بود ✅");
      document.getElementById("loginModal").style.display = "none";
      loginBtn.innerText = "خروج";
      loginBtn.onclick = logout;
    }
  });

  if (currentUser) {
    loginBtn.innerText = "خروج";
    loginBtn.onclick = logout;
  }

  function logout() {
    if (confirm("آیا می‌خواهید خارج شوید؟")) {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("cart");
      cart = [];
      currentUser = null;
      updateCartCount();
      location.reload();
    }
  }
}

function toEnglishNumber(str){
  const pers = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  const eng = ['0','1','2','3','4','5','6','7','8','9'];
  for(let i=0;i<10;i++){ str = str.replaceAll(pers[i],eng[i]); }
  return str;
}

function getPrice(text){
  return Number(toEnglishNumber(text).replace(/[^0-9]/g,''));
}

function initCart() {
  const cartIcon = document.querySelector(".cart-icon");
  const cartBtns = document.querySelectorAll(".add-cart");

  function updateCartCount() { cartIcon.innerText = `🛒 سبد خرید (${cart.length})`; }
  updateCartCount();

  cartBtns.forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      if (!currentUser) return alert("لطفا ابتدا وارد حساب شوید");

      const card = btn.closest(".product-card");
      const name = card.querySelector(".product-name").innerText;
      const price = getPrice(card.querySelector(".product-price").innerText);
      const img = card.querySelector("img").src;

      cart.push({ name, price, img });
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount();
      alert("به سبد خرید اضافه شد ✅");
    });
  });

  cartIcon.addEventListener("click", e => {
    e.preventDefault();
    if (cart.length === 0) return alert("سبد خرید خالی است");

    let text = "سبد خرید شما:\n\n";
    let total = 0;
    cart.forEach(item => {
      text += `${item.name} - ${item.price.toLocaleString()} ریال\n`;
      total += item.price;
    });
    text += `\nمجموع: ${total.toLocaleString()} ریال`;

    if (confirm(text + "\n\nپرداخت انجام شود؟")) {
      alert("پرداخت با موفقیت انجام شد ✅");
      cart = [];
      localStorage.removeItem("cart");
      updateCartCount();
    }
  });

  window.updateCartCount = updateCartCount; 
}

function initLikes() {
  const likeBtns = document.querySelectorAll(".like");
  likeBtns.forEach(btn => {
    const card = btn.closest(".product-card");
    const name = card.querySelector(".product-name").innerText;

    if (likes.includes(name)) btn.style.color = "red";

    btn.addEventListener("click", e => {
      if (likes.includes(name)) {
        likes = likes.filter(l => l !== name);
        btn.style.color = "black";
      } else {
        likes.push(name);
        btn.style.color = "red";
      }
      localStorage.setItem("likes", JSON.stringify(likes));
    });
  });
}

function initSearch() {
  const input = document.querySelector(".search");
  const btn = document.querySelector(".search-button");
  const cards = document.querySelectorAll(".product-card");

  function search() {
    const value = input.value.toLowerCase();
    cards.forEach(card => {
      const name = card.querySelector(".product-name").innerText.toLowerCase();
      card.style.display = name.includes(value) ? "block" : "none";
    });
  }

  btn.addEventListener("click", search);
  input.addEventListener("keyup", e => { if(e.key==="Enter") search(); });
}
