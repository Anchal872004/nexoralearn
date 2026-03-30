/* ================================================================
   NEXORALEARN — FINAL script.js
   ❌ No Gemini
   ✅ Fully working FREE AI chatbot
================================================================ */

const API = "https://nexoralearn-backend.onrender.com/api";

/* ================= NAVIGATION ================= */
function goToLogin() { window.location.href = "login.html"; }

/* ================= INFO ================= */
function showInfo() {
    alert("Welcome to NexoraLearn 🎓\n\n✔ Expert instructors\n✔ Career-focused courses\n✔ Interactive learning");
}

/* ================= LOGIN / SIGNUP ================= */
function showSignup() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signupForm").style.display = "block";
}
function showLogin() {
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
}

/* ================= LOGIN ================= */
async function loginUser() {
    try {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const res = await fetch(`${API}/auth/login`, {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        localStorage.setItem("token", data.token);
        alert("✅ Login successful!");
        window.location.href = "courses.html";

    } catch (err) {
        alert("❌ " + err.message);
    }
}

/* ================= SIGNUP ================= */
async function signupUser() {
    try {
        const name = document.getElementById("signupName").value;
        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;

        const res = await fetch(`${API}/auth/signup`, {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        alert("✅ Signup successful!");
        showLogin();

    } catch (err) {
        alert("❌ " + err.message);
    }
}

/* ================= LOGIN CHECK ================= */
function checkLogin() {
    if (!localStorage.getItem("token")) {
        alert("Please login first!");
        window.location.href = "login.html";
        return false;
    }
    return true;
}

/* ================= LOGOUT ================= */
function logout() {
    localStorage.clear();
    alert("Logged out");
    window.location.href = "login.html";
}

/* ================= COURSES ================= */
const demoCourses = [
    { title:"Web Development", description:"Learn HTML, CSS, JavaScript", price:499 },
    { title:"Python Basics", description:"Python for beginners", price:499 },
    { title:"AI Fundamentals", description:"Intro to AI", price:499 }
];

async function loadCourses() {
    const grid = document.getElementById("courseGrid");
    if (!grid) return;

    grid.innerHTML = "";
    window.allCourses = demoCourses;

    demoCourses.forEach((course, index) => {
        const card = document.createElement("div");
        card.className = "course-card";

        const purchased = JSON.parse(localStorage.getItem("purchased") || "[]");
        const isBought = purchased.includes(course.title);

        card.innerHTML = `
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <button ${isBought ? "disabled" : ""}>
                ${isBought ? "✔ Purchased" : "Buy ₹" + course.price}
            </button>
        `;

        card.onclick = () => openCourse(index);

        card.querySelector("button").onclick = (e) => {
            e.stopPropagation();
            if (!isBought) openPayment(index);
        };

        grid.appendChild(card);
    });
}

/* ================= OPEN COURSE ================= */
function openCourse(index) {
    if (!checkLogin()) return;

    const course = window.allCourses[index];
    const purchased = JSON.parse(localStorage.getItem("purchased") || "[]");

    if (!purchased.includes(course.title)) {
        alert("❌ Buy course first");
        return;
    }

    localStorage.setItem("course", JSON.stringify(course));
    window.location.href = "course.html";
}

/* ================= PROGRESS ================= */
function loadProgress() {
    updateProgressUI(parseInt(localStorage.getItem("progress") || 0));
}

function increaseProgress() {
    let p = parseInt(localStorage.getItem("progress") || 0);
    if (p >= 100) return alert("Already completed!");

    p += 20;
    localStorage.setItem("progress", p);
    updateProgressUI(p);
}

function updateProgressUI(p) {
    const fill = document.getElementById("progressFill");
    const text = document.getElementById("progressText");

    if (fill) fill.style.width = p + "%";
    if (text) text.innerText = p + "%";
}

/* ================= CERTIFICATE ================= */
function downloadCertificate() {
    if (parseInt(localStorage.getItem("progress") || 0) < 100) {
        return alert("❌ Complete course first!");
    }
    alert("🎉 Certificate Downloaded!");
}

/* ================================================================
   🤖 FREE AI CHATBOT
================================================================ */

function toggleAI() {
    const box = document.getElementById("aiBox");
    box.style.display = box.style.display === "flex" ? "none" : "flex";
}

/* Send message */
function sendAI() {
    const input = document.getElementById("aiInput");
    const msg = input.value.trim().toLowerCase();

    if (!msg) return;

    addMsg("user", msg);

    let reply = "🤖 I didn't understand. Try asking about courses or coding.";

    if (msg.includes("price") || msg.includes("cost")) {
        reply = "💰 All courses cost ₹499.";
    }
    else if (msg.includes("courses")) {
        reply = "📚 We offer Web Development, Python, and AI courses.";
    }
    else if (msg.includes("certificate")) {
        reply = "🏆 Complete 100% course to download certificate.";
    }
    else if (msg.includes("html")) {
        reply = "<code>&lt;h1&gt;Hello World&lt;/h1&gt;</code>";
    }
    else if (msg.includes("python")) {
        reply = "<code>print('Hello World')</code>";
    }
    else if (msg.includes("job")) {
        reply = "🚀 Build projects + GitHub + apply consistently.";
    }

    setTimeout(() => addMsg("bot", reply), 300);
    input.value = "";
}

/* Add message */
function addMsg(role, text) {
    const chat = document.getElementById("aiChat");

    const div = document.createElement("div");
    div.className = role === "user" ? "user-msg" : "bot-msg";
    div.innerHTML = text;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

/* Quick suggestions */
function quickAsk(q) {
    const input = document.getElementById("aiInput");
    input.value = q;
    sendAI();
}

/* Clear chat */
function clearChat() {
    const chat = document.getElementById("aiChat");
    chat.innerHTML = "";
    addMsg("bot", "🗑️ Chat cleared!");
}

/* Voice input */
function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) {
        alert("Voice not supported");
        return;
    }

    const r = new SR();
    r.lang = "en-IN";

    r.onresult = function(e) {
        const input = document.getElementById("aiInput");
        input.value = e.results[0][0].transcript;
        sendAI();
    };

    r.start();
}

/* ================= AUTO LOAD ================= */
document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("courseGrid")) loadCourses();

    const input = document.getElementById("aiInput");

    if (input) {
        input.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                e.preventDefault();
                sendAI();
            }
        });
    }

    /* Hamburger menu */
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("open");
            navLinks.classList.toggle("open");
        });
    }
});