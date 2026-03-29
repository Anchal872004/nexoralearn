const API = "https://nexoralearn-backend.onrender.com/api";

/* ================= NAVIGATION ================= */
function goToLogin() { window.location.href = "login.html"; }

/* ================= INFO ================= */
function showInfo() {
    alert("Welcome to NexoraLearn 🎓\n\n✔ Expert instructors\n✔ Career-focused courses\n✔ Interactive learning");
}

/* ================= LOGIN / SIGNUP TOGGLE ================= */
function showSignup() {
    document.getElementById("loginForm").style.display  = "none";
    document.getElementById("signupForm").style.display = "block";
}
function showLogin() {
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("loginForm").style.display  = "block";
}

/* ================= LOGIN ================= */
async function loginUser() {
    try {
        const email    = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const res  = await fetch(`${API}/auth/login`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        localStorage.setItem("token", data.token);
        alert("✅ Login successful!");
        window.location.href = "courses.html";
    } catch (err) { alert("❌ " + err.message); }
}

/* ================= SIGNUP ================= */
async function signupUser() {
    try {
        const name     = document.getElementById("signupName").value;
        const email    = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;
        const res  = await fetch(`${API}/auth/signup`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        alert("✅ Signup successful!");
        showLogin();
    } catch (err) { alert("❌ " + err.message); }
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

/* ================= DEMO COURSES ================= */
const demoCourses = [
    { title: "Web Development", description: "Learn HTML, CSS, JavaScript", video: "https://www.youtube.com/embed/PkZNo7MFNFg", image: "https://img.youtube.com/vi/PkZNo7MFNFg/0.jpg", price: 499 },
    { title: "Python Basics",   description: "Python for beginners",        video: "https://www.youtube.com/embed/_uQrJ0TkZlc", image: "https://img.youtube.com/vi/_uQrJ0TkZlc/0.jpg", price: 499 },
    { title: "AI Fundamentals", description: "Intro to AI",                 video: "https://www.youtube.com/embed/2ePf9rue1Ao", image: "https://img.youtube.com/vi/2ePf9rue1Ao/0.jpg", price: 499 }
];

/* ================= LOAD COURSES ================= */
async function loadCourses() {
    const grid = document.getElementById("courseGrid");
    if (!grid) return;
    grid.innerHTML = "";
    let courses = [];
    try {
        const res  = await fetch(`${API}/courses`);
        const data = await res.json();
        courses = (Array.isArray(data) && data.length) ? data : demoCourses;
    } catch { courses = demoCourses; }
    window.allCourses = courses;
    courses.forEach(function (course, index) {
        const card     = document.createElement("div");
        card.className = "course-card";
        const isBought = JSON.parse(localStorage.getItem("purchased") || "[]").includes(course.title);
        card.innerHTML = `
            <img src="${course.image}" loading="lazy">
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <button ${isBought ? "disabled" : ""}>
                ${isBought ? "✔ Purchased" : "Buy ₹" + (course.price || 499)}
            </button>`;
        card.addEventListener("click", function () { openCourse(index); });
        card.querySelector("button").addEventListener("click", function (e) {
            e.stopPropagation();
            if (!isBought) openPayment(index);
        });
        grid.appendChild(card);
    });
}

/* ================= OPEN COURSE ================= */
function openCourse(index) {
    if (!checkLogin()) return;
    const course    = window.allCourses[index];
    const purchased = JSON.parse(localStorage.getItem("purchased") || "[]");
    if (!purchased.includes(course.title)) { alert("❌ Buy course first"); return; }
    localStorage.setItem("course", JSON.stringify(course));
    window.location.href = "course.html";
}

/* ================= PROGRESS ================= */
function loadProgress() { updateProgressUI(parseInt(localStorage.getItem("progress") || 0)); }
function increaseProgress() {
    let p = parseInt(localStorage.getItem("progress") || 0);
    if (p >= 100) { alert("Already completed!"); return; }
    p = Math.min(100, p + 20);
    localStorage.setItem("progress", p);
    updateProgressUI(p);
}
function updateProgressUI(p) {
    const fill = document.getElementById("progressFill");
    const text = document.getElementById("progressText");
    if (fill) fill.style.width = p + "%";
    if (text) text.innerText   = p + "%";
}

/* ================= CERTIFICATE ================= */
function downloadCertificate() {
    if (parseInt(localStorage.getItem("progress") || 0) < 100) { alert("❌ Complete course first!"); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Certificate of Completion", 20, 40);
    doc.text("Congratulations!", 20, 60);
    doc.save("certificate.pdf");
}

/* ================= AUTO LOAD ================= */
document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("courseGrid"))  loadCourses();
    if (document.getElementById("courseVideo")) loadCoursePage();
    var inp = document.getElementById("aiInput");
    if (inp) inp.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAI(); }
    });
});

/* ================================================================
   NEXORA AI — OPENAI BACKEND VERSION
================================================================ */

const _aiHistory = [];

/* ── Toggle chat ── */
function toggleAI() {
    var box = document.getElementById("aiBox");
    if (!box) return;
    var opening = box.style.display !== "flex";
    box.style.display = opening ? "flex" : "none";

    if (opening) {
        var chat = document.getElementById("aiChat");
        if (chat && !chat.children.length)
            _bubble("bot", "👋 Hi! I'm <b>Nexora AI</b>. Ask me anything!");
    }
}

/* ── Quick ask ── */
function quickAsk(q) {
    var i = document.getElementById("aiInput");
    if (i) { i.value = q; sendAI(); }
}

/* ── Clear chat ── */
function clearChat() {
    _aiHistory.length = 0;
    var chat = document.getElementById("aiChat");
    if (chat) {
        chat.innerHTML = "";
        _bubble("bot", "🗑️ Cleared! How can I help?");
    }
}

/* ── SEND AI ── */
async function sendAI() {
    var input = document.getElementById("aiInput");
    var chat  = document.getElementById("aiChat");
    if (!input || !chat) return;

    var msg = input.value.trim();
    if (!msg) return;

    input.value = "";
    input.disabled = true;

    _bubble("user", _esc(msg));

    try {
        const res = await fetch(`${API}/ai`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: msg })
        });

        const data = await res.json();
        let reply = data.reply || "No response";

        _bubble("bot", reply
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
            .replace(/\n/g, "<br>")
        );

    } catch (err) {
        _bubble("bot", "⚠️ AI not responding.");
    }

    input.disabled = false;
    input.focus();
}

/* ── Voice ── */
function startVoice() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice not supported"); return; }
    var r = new SR();
    r.lang = "en-IN";
    r.start();
    r.onresult = function (e) {
        var i = document.getElementById("aiInput");
        if (i) { i.value = e.results[0][0].transcript; sendAI(); }
    };
}

/* ── Helpers ── */
function _bubble(role, html) {
    var chat = document.getElementById("aiChat");
    if (!chat) return;
    var d = document.createElement("div");
    d.className = role === "user" ? "user-msg" : "bot-msg";
    d.innerHTML = html;
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
}

function _esc(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}