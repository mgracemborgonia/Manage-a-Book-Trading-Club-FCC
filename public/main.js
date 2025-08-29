document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const userProfile = document.getElementById("user-profile");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const addBookForm = document.getElementById("add-book-form");
  const addBookBtn = document.getElementById("add-book-btn");
  const bookTradeBtn = document.getElementById("book-trade-btn");
  const booksBtn = document.getElementById("books-btn");
  const tradesBtn = document.getElementById("trades-btn");
  const booksList = document.getElementById("books-list");
  const tradesList = document.getElementById("trades-list");
  const addBookSection = document.getElementById("add-book-section");
  const booksSection = document.getElementById("books-section");
  const tradesSection = document.getElementById("trade-section");
  let currentUser = null;

  const showLoginForm = () => {
    loginForm.style.display = "block";
    signupForm.style.display = "none";
  };
  const showRegisterForm = () => {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
  };
  const showBooksSection = () => {
    tradesList.style.display = "none";
    addBookBtn.style.display = currentUser ? "block" : "none";
    fetchBooks();
  };
  const showMyTradesSection = () => {
    tradesList.style.display = "block";
    fetchMyTrades();
  };
  const hideBooksAndTrades = () => {
    booksSection.style.display = "none";
    tradesSection.style.display = "none";
  };
  const showLoginAndSignUpForm = () => {
    loginBtn.style.display = "block";
    signupBtn.style.display = "block";
  };
  const hideLoginAndSignUpForm = () => {
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
  };
  const fetchBooks = async () => {
    try {
      const res = await fetch("/books");
      const books = await res.json();
      booksList.innerHTML = books.map(book => {
        return `
          <div class="book">
            <h3>${book.title}</h3>
            <p><strong>Author: </strong>${book.author}</p>
            <p><strong>Description: </strong>${book.description}</p>
            ${currentUser ? `<button class="trade-btn" data-id="${book._id}">Trade</button>` : ''}
          </div>
        `;
      }).join("");
      document.querySelectorAll(".trade-btn").forEach(button => {
        button.addEventListener("click", (e) => initiateTrade(e.target.dataset.id));
      });
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };
  const initiateTrade = async (bookId) => {
    try {
      const res = await fetch("/trades/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, userId: currentUser._id })
      });
      const data = await res.json();
      if (data.message) {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error initiating trade:", error);
    }
  };
  const fetchMyTrades = async () => {
    if(!currentUser){
      tradesList.innerHTML = "<p>You must log in to show trades.</p>";
      return;
    }
    try {
      const res = await fetch("/trades/mytrades");
      if(!res.ok){
        throw new Error("Failed to show trades.");
      };
      const trades = await res.json();
      console.log(trades); 
      if (Array.isArray(trades) && trades.length > 0) {
        tradesList.innerHTML = trades.map(trade => {
          return `
            <div class="trade">
              <p><strong>Book title: </strong>${trade.book.title}</p>
              <p><strong>Proposed by: </strong>${trade.proposer.username}</p>
              <p><strong>Received by: </strong>${trade.receiver.username}</p>
              <p><strong>Status: </strong>${trade.status}</p>
              <button class="accept-btn" data-id="${trade._id}">Accept</button>
              <button class="decline-btn" data-id="${trade._id}">Decline</button>
            </div>
          `;
        }).join("");
        document.querySelectorAll(".accept-btn").forEach(button => {
          button.addEventListener("click", (e) => acceptTrade(e.target.dataset.id));
        });
        document.querySelectorAll(".decline-btn").forEach(button => {
          button.addEventListener("click", (e) => declineTrade(e.target.dataset.id));
        });
      } else {
        tradesList.innerHTML = "<p>You have no trade requests yet.</p>";
      }
    } catch (error) {
      console.error("Error fetching trades:", error);
    }
  };
  const acceptTrade = async (tradeId) => {
    try {
      const res = await fetch(`/trades/${tradeId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.message) {
        alert(data.message);
        fetchMyTrades();
      }
    } catch (error) {
      console.error("Error accepting trade:", error);
    }
  };
  const declineTrade = async (tradeId) => {
    try {
      const res = await fetch(`/trades/${tradeId}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.message) {
        alert(data.message);
        fetchMyTrades();
      }
    } catch (error) {
      console.error("Error declining trade:", error);
    }
  };
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username-login").value;
    const password = document.getElementById("password-login").value;
    try {
      const res = await fetch("/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.message === "You are now logged in.") {
        currentUser = data.user;
        logoutBtn.style.display = "block";
        userProfile.innerText = `Hi, ${username}`;
        loginForm.style.display = "none";
        booksSection.style.display = "block";
        tradesSection.style.display = "block";
        bookTradeBtn.style.display = "block";
        hideLoginAndSignUpForm();
        hideBooksAndTrades();
        showBooksSection();
        showMyTradesSection();
      }
    } catch (error) {
      document.getElementById("login-error").textContent = "Invalid Login.";
    }
  });
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullName = document.getElementById("fullName").value;
    const username = document.getElementById("username-register").value;
    const password = document.getElementById("password-register").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    try {
      const res = await fetch("/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, username, password, city, state })
      });
      const data = await res.json();
      if (data.message === "You are successfully registered.") {
        alert("Registration successful! You can now log in.");
        showLoginForm();
      }
    } catch (error) {
      document.getElementById("signup-error").textContent = "Registration failed!";
    }
  });
  addBookForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("book-title").value;
    const author = document.getElementById("book-author").value;
    const description = document.getElementById("book-description").value;
    try {
      const res = await fetch("/books/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author, description })
      });
      const data = await res.json();
      if (data.message === "You successfully added a new book.") {
        alert("Book added successfully!");
        addBookSection.style.display = "none";
        booksSection.style.display = "block";
        showBooksSection();
      } else {
        document.getElementById("add-book-error").textContent = "Error adding book!";
      }
    } catch (error) {
      console.error("Error adding book:", error);
      document.getElementById("add-book-error").textContent = "Error adding book!";
    }
  });
  logoutBtn.addEventListener("click", async () => {
    try {
      await fetch("/users/logout");
      currentUser = null;
      logoutBtn.style.display = "none";
      userProfile.innerText = "";
      addBookSection.style.display = "none";
      addBookBtn.style.display = "none";
      document.querySelectorAll(".trade-btn").forEach(trade => trade.style.display = "none")
      document.querySelectorAll(".accept-btn").forEach(accept => accept.style.display = "none")
      document.querySelectorAll(".decline-btn").forEach(decline => decline.style.display = "none")
      showLoginAndSignUpForm();
      hideBooksAndTrades();
      showBooksSection();
      showMyTradesSection();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  });
  booksBtn.addEventListener("click", () => {
    booksSection.style.display = "block";
    tradesSection.style.display = "none";
  });
  tradesBtn.addEventListener("click", () => {
    booksSection.style.display = "none";
    tradesSection.style.display = "block";
    addBookSection.style.display = "none";
  });
  addBookBtn.addEventListener("click", () => {
    addBookSection.style.display = "block";
    booksSection.style.display = "none";
    document.getElementById("book-title").value = "";
    document.getElementById("book-author").value = "";
    document.getElementById("book-description").value = "";
  });
  loginBtn.addEventListener("click", () => {
    document.getElementById("username-login").value = "";
    document.getElementById("password-login").value = "";
    bookTradeBtn.style.display = "none";
    hideLoginAndSignUpForm();
    hideBooksAndTrades();
    showLoginForm();
  });
  signupBtn.addEventListener("click", () => {
    bookTradeBtn.style.display = "none";
    hideLoginAndSignUpForm();
    hideBooksAndTrades();
    showRegisterForm();
  });
  const checkUserSession = async () => {
    try {
      const res = await fetch("/users/current");
      const data = await res.json();
      if (data.user) {
        currentUser = data.user;
        logoutBtn.style.display = "block";
        hideLoginAndSignUpForm();
        showBooksSection();
        showMyTradesSection();
      } else {
        logoutBtn.style.display = "none";
        showLoginAndSignUpForm();
        showBooksSection();
        showMyTradesSection();
      }
    } catch (error) {
      console.error("Error checking session:", error);
      showBooksSection();
      showMyTradesSection();
    };
  };
  checkUserSession();
  showBooksSection();
});