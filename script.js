const API = "http://localhost:5000/api";

/* ================= NAVIGATION ================= */
function goToLogin() {
    window.location.href = "login.html";
}

/* ================= INFO ================= */
function showInfo() {
    alert("Welcome to NexoraLearn 🎓\n\n✔ Expert instructors\n✔ Career-focused courses\n✔ Interactive learning");
}

/* ================= LOGIN / SIGNUP TOGGLE ================= */
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
            method: "POST",
            headers: {"Content-Type": "application/json"},
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
            method: "POST",
            headers: {"Content-Type": "application/json"},
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

/* ================= DEMO COURSES ================= */
const demoCourses = [
    {
        title: "Web Development",
        description: "Learn HTML, CSS, JavaScript",
        video: "https://www.youtube.com/embed/PkZNo7MFNFg",
        image: "https://img.youtube.com/vi/PkZNo7MFNFg/0.jpg"
    },
    {
        title: "Python Basics",
        description: "Python for beginners",
        video: "https://www.youtube.com/embed/_uQrJ0TkZlc",
        image: "https://img.youtube.com/vi/_uQrJ0TkZlc/0.jpg"
    },
    {
        title: "AI Fundamentals",
        description: "Intro to AI",
        video: "https://www.youtube.com/embed/2ePf9rue1Ao",
        image: "https://img.youtube.com/vi/2ePf9rue1Ao/0.jpg"
    }
];

/* ================= LOAD COURSES ================= */
async function loadCourses() {

    const grid = document.getElementById("courseGrid");
    if (!grid) return;

    grid.innerHTML = "";

    let courses = [];

    try {
        const res = await fetch(`${API}/courses`);
        const data = await res.json();

        courses = (Array.isArray(data) && data.length) ? data : demoCourses;

    } catch {
        courses = demoCourses;
    }

    window.allCourses = courses;

    courses.forEach((course, index) => {

        const card = document.createElement("div");
        card.className = "course-card";

        const isBought = JSON.parse(localStorage.getItem("purchased") || "[]")
            .includes(course.title);

        card.innerHTML = `
            <img src="${course.image}">
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <button ${isBought ? "disabled" : ""}>
                ${isBought ? "✔ Purchased" : "Buy ₹" + (course.price || 499)}
            </button>
        `;

        // open course on click
        card.addEventListener("click", () => openCourse(index));

        // button click
        card.querySelector("button").addEventListener("click", (e) => {
            e.stopPropagation();
            if (!isBought) openPayment(index);
        });

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

/* ================= PAYMENT ================= */
function openPayment(index) {

    if (!checkLogin()) return;

    const course = window.allCourses[index];

    const confirmPay = confirm(`Buy ${course.title} for ₹${course.price || 499}?`);
    if (!confirmPay) return;

    let purchased = JSON.parse(localStorage.getItem("purchased") || "[]");

    if (!purchased.includes(course.title)) {
        purchased.push(course.title);
    }

    localStorage.setItem("purchased", JSON.stringify(purchased));

    localStorage.setItem("course", JSON.stringify(course));

    alert("✅ Payment Successful");

    loadCourses();
}

/* ================= LOAD COURSE PAGE ================= */
function loadCoursePage() {

    const data = localStorage.getItem("course");
    if (!data) return;

    const course = JSON.parse(data);

    document.getElementById("courseTitle").innerText = course.title;
    document.getElementById("courseDesc").innerText = course.description;

    const iframe = document.getElementById("courseVideo");

    if (!iframe) return;

    let videoUrl = course.video;

    // fallback
    if (!videoUrl) {
        videoUrl = "https://www.youtube.com/embed/PkZNo7MFNFg";
    }

    // convert links
    if (videoUrl.includes("watch?v=")) {
        const id = videoUrl.split("watch?v=")[1].split("&")[0];
        videoUrl = `https://www.youtube.com/embed/${id}`;
    }

    if (videoUrl.includes("youtu.be/")) {
        const id = videoUrl.split("youtu.be/")[1].split("?")[0];
        videoUrl = `https://www.youtube.com/embed/${id}`;
    }

    iframe.src = videoUrl + "?autoplay=1&controls=1";

    loadProgress();
}

/* ================= PROGRESS ================= */
function loadProgress() {
    const progress = localStorage.getItem("progress") || 0;
    updateProgressUI(progress);
}

function increaseProgress() {
    let progress = parseInt(localStorage.getItem("progress") || 0);

    if (progress >= 100) {
        alert("Already completed!");
        return;
    }

    progress += 20;
    localStorage.setItem("progress", progress);

    updateProgressUI(progress);
}

function updateProgressUI(progress) {
    const fill = document.getElementById("progressFill");
    const text = document.getElementById("progressText");

    if (!fill || !text) return;

    fill.style.width = progress + "%";
    text.innerText = progress + "%";
}

/* ================= CERTIFICATE ================= */
function downloadCertificate() {

    const progress = localStorage.getItem("progress");

    if (progress < 100) {
        alert("❌ Complete course first!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Certificate of Completion", 20, 40);
    doc.text("Congratulations!", 20, 60);

    doc.save("certificate.pdf");
}

/* ================= AI ================= */
function toggleAI() {
    const box = document.getElementById("aiBox");
    if (!box) return;

    box.style.display = box.style.display === "flex" ? "none" : "flex";
}

function sendAI() {
    const input = document.getElementById("aiInput");
    const chat = document.getElementById("aiChat");

    if (!input || !chat) return;

    const msg = input.value.trim();
    if (!msg) return;

    chat.innerHTML += `<div class="user-msg">${msg}</div>`;

    let reply = "🤖 ";
    if (msg.includes("course")) reply += "We have Web, Python & AI courses.";
    else if (msg.includes("price")) reply += "All courses cost ₹499.";
    else reply += "Ask about courses.";

    chat.innerHTML += `<div class="bot-msg">${reply}</div>`;

    input.value = "";
    chat.scrollTop = chat.scrollHeight;
}

/* ================= AUTO LOAD ================= */
document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("courseGrid")) loadCourses();

    if (document.getElementById("courseVideo")) loadCoursePage();

});
