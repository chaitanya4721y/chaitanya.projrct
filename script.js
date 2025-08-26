const productContainer = document.getElementById('product-container');

data.forEach((product) => {
  const productHTML = `
    <div class="box">
      <div class="box-content">
        <h2>${product.name}</h2>
        <div class="box-img" style="background-image: url('${product.image_url}');"></div>
        <p>See more</p>
      </div>
    </div>
  `;
  productContainer.innerHTML += productHTML;
});
const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const emailValue = email.value.trim();
  const passwordValue = password.value.trim();

  if (!emailValue.includes("@") || passwordValue.length < 6) {
    errorMsg.textContent = "Invalid email or password must be 6+ characters.";
  } else {
    errorMsg.textContent = "";
    alert("Login successful!");
    // You can redirect to dashboard here if needed
    // window.location.href = "dashboard.html";
  }
});

function togglePassword() {
  if (password.type === "password") {
    password.type = "text";
  } else {
    password.type = "password";
  }
}
