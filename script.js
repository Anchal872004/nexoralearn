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
            method:"POST", headers:{"Content-Type":"application/json"},
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
            method:"POST", headers:{"Content-Type":"application/json"},
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
    { title:"Web Development", description:"Learn HTML, CSS, JavaScript", video:"https://www.youtube.com/embed/PkZNo7MFNFg", image:"https://img.youtube.com/vi/PkZNo7MFNFg/0.jpg", price:499 },
    { title:"Python Basics",   description:"Python for beginners",        video:"https://www.youtube.com/embed/_uQrJ0TkZlc", image:"https://img.youtube.com/vi/_uQrJ0TkZlc/0.jpg", price:499 },
    { title:"AI Fundamentals", description:"Intro to AI",                 video:"https://www.youtube.com/embed/2ePf9rue1Ao", image:"https://img.youtube.com/vi/2ePf9rue1Ao/0.jpg", price:499 }
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
    courses.forEach(function(course, index) {
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
        card.addEventListener("click", function() { openCourse(index); });
        card.querySelector("button").addEventListener("click", function(e) {
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
document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("courseGrid"))  loadCourses();
    if (document.getElementById("courseVideo")) loadCoursePage();
    var inp = document.getElementById("aiInput");
    if (inp) inp.addEventListener("keydown", function(e) {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAI(); }
    });
});


/* ================================================================
   NEXORA AI  — Zero API key needed, works instantly
   Smart rule engine with 100+ topics covered:
   courses, coding (HTML/CSS/JS/Python/React/Node), career,
   general knowledge, math, greetings, and more.
================================================================ */

const _aiHistory = [];  /* for follow-up context */

/* ── Knowledge base ── */
const _kb = [

  /* ── Greetings ── */
  { q:["hi","hello","hey","hii","helo","sup","good morning","good evening","good afternoon","howdy"],
    a:"👋 Hello! I'm Nexora AI. I can help you with courses, coding, career advice, and more. What would you like to know?" },
  { q:["how are you","how r u","how are u","you ok","you good"],
    a:"I'm doing great, thanks for asking! 😊 Ready to help you learn. What's on your mind?" },
  { q:["what is your name","who are you","who r u","your name","introduce yourself"],
    a:"I'm <b>Nexora AI</b> — the smart assistant for NexoraLearn! I can answer questions about our courses, help you with coding problems, career advice, or any general topic. 🤖" },
  { q:["bye","goodbye","see you","take care","ok thanks","okay thanks","thank you","thanks","ty"],
    a:"You're welcome! Happy learning! 🎓 Come back anytime you need help." },

  /* ── NexoraLearn courses ── */
  { q:["what courses","which courses","courses available","course list","all courses","what do you offer","what can i learn"],
    a:"📚 We offer 3 courses:<br><br>1️⃣ <b>Web Development</b> — HTML, CSS, JavaScript — ₹499<br>2️⃣ <b>Python Basics</b> — Python for beginners — ₹499<br>3️⃣ <b>AI Fundamentals</b> — Intro to Artificial Intelligence — ₹499<br><br>All courses include video lessons, progress tracking & a certificate!" },
  { q:["price","cost","how much","fees","fee","charges","₹","rupees","inr","payment","pay"],
    a:"💰 All courses are priced at <b>₹499 each</b>. We support Card, UPI (GPay, PhonePe, Paytm, BHIM), and Net Banking payments." },
  { q:["certificate","certification","get certificate","download certificate","certified"],
    a:"🏆 Yes! Complete 100% of any course and you'll unlock a <b>downloadable PDF certificate</b>. It's available on your course page after completion." },
  { q:["which course","suggest course","recommend course","what should i learn","where to start","best course","best for me","help me choose","what to learn"],
    a:"Great question! Here's a quick guide:<br><br>🌐 <b>Web Development</b> — if you want to build websites<br>🐍 <b>Python Basics</b> — if you want to code apps, scripts or data science<br>🤖 <b>AI Fundamentals</b> — if you're curious about artificial intelligence<br><br>Most beginners start with <b>Web Development</b> as it's the most visual!" },
  { q:["web development","web dev","html css","html js","frontend","website course"],
    a:"🌐 <b>Web Development Course</b> — ₹499<br>Covers HTML, CSS & JavaScript from scratch. Perfect for beginners who want to build real websites. Includes hands-on projects!" },
  { q:["python","python basics","python course","learn python","python beginner"],
    a:"🐍 <b>Python Basics Course</b> — ₹499<br>Learn Python from zero. Covers variables, loops, functions, and projects. Great for automation, data science & AI paths!" },
  { q:["ai","artificial intelligence","ai course","machine learning","ml","ai fundamentals"],
    a:"🤖 <b>AI Fundamentals Course</b> — ₹499<br>Understand how AI works, including machine learning concepts, neural networks basics, and real-world applications. No prior experience needed!" },
  { q:["login","sign in","signup","register","account","create account","forgot password"],
    a:"🔐 Click <b>Login</b> in the top navigation bar. You can sign in with your email & password, or create a new account. Use 'Forgot Password' if needed." },
  { q:["refund","money back","cancel","cancellation"],
    a:"For refund or cancellation queries, please contact our support team through the platform. We review all requests within 24–48 hours." },
  { q:["duration","how long","course length","time to complete","hours"],
    a:"⏱️ Each course is self-paced — you learn at your own speed! Most students complete a course in <b>2–4 weeks</b> with 1 hour daily." },
  { q:["progress","track progress","how to complete","mark progress","completion"],
    a:"📈 On your course page, click <b>'Mark Progress +20%'</b> after each lesson. Reach 100% to unlock your certificate!" },

  /* ── HTML ── */
  { q:["what is html","html meaning","html full form","html explain","html kya hai"],
    a:"<b>HTML</b> (HyperText Markup Language) is the standard language for creating web pages. It uses tags like &lt;h1&gt;, &lt;p&gt;, &lt;div&gt; to structure content. Every website you visit is built with HTML!" },
  { q:["html tags","basic tags","common html","html elements"],
    a:"Common HTML tags:<br><code>&lt;h1&gt;-&lt;h6&gt;</code> — Headings<br><code>&lt;p&gt;</code> — Paragraph<br><code>&lt;a&gt;</code> — Link<br><code>&lt;img&gt;</code> — Image<br><code>&lt;div&gt;</code> — Container<br><code>&lt;ul&gt;&lt;li&gt;</code> — Lists<br><code>&lt;form&gt;</code> — Form<br><code>&lt;input&gt;</code> — Input field" },
  { q:["html form","how to create form","form in html"],
    a:"HTML form example:<br><code>&lt;form&gt;<br>&nbsp;&lt;input type='text' placeholder='Name'&gt;<br>&nbsp;&lt;input type='email' placeholder='Email'&gt;<br>&nbsp;&lt;button type='submit'&gt;Submit&lt;/button&gt;<br>&lt;/form&gt;</code>" },

  /* ── CSS ── */
  { q:["what is css","css meaning","css explain","css kya hai","css full form"],
    a:"<b>CSS</b> (Cascading Style Sheets) is used to style HTML pages. It controls colors, fonts, layout, spacing, animations and more. Without CSS, websites would be plain black text!" },
  { q:["css flexbox","flexbox","flex layout","flex css"],
    a:"<b>Flexbox</b> makes layouts easy!<br><code>display: flex;</code> — enables flex<br><code>justify-content: center;</code> — horizontal align<br><code>align-items: center;</code> — vertical align<br><code>gap: 16px;</code> — spacing between items<br><code>flex-wrap: wrap;</code> — wrap to next line" },
  { q:["css grid","grid layout","grid css"],
    a:"<b>CSS Grid</b> for 2D layouts:<br><code>display: grid;<br>grid-template-columns: repeat(3, 1fr);<br>gap: 20px;</code><br>This creates a 3-column grid with equal widths and 20px gaps!" },
  { q:["responsive","mobile responsive","media query","responsive css","make responsive"],
    a:"Make your site responsive with media queries:<br><code>@media (max-width: 768px) {<br>&nbsp;.container { width: 100%; }<br>&nbsp;.grid { grid-template-columns: 1fr; }<br>}</code><br>This changes layout when screen is under 768px!" },
  { q:["css animation","animate css","keyframes","transition css"],
    a:"CSS animations:<br><code>@keyframes fadeIn {<br>&nbsp;from { opacity: 0; }<br>&nbsp;to { opacity: 1; }<br>}<br>.box { animation: fadeIn 0.5s ease; }</code><br>For simple hover effects use <code>transition: all 0.3s ease;</code>" },

  /* ── JavaScript ── */
  { q:["what is javascript","javascript explain","js kya hai","what is js","javascript meaning"],
    a:"<b>JavaScript</b> makes websites interactive! It handles button clicks, form validation, animations, API calls, and much more. It's the most popular programming language in the world! 🌐" },
  { q:["javascript array","array js","js array","array methods"],
    a:"JavaScript arrays:<br><code>let fruits = ['apple','banana','mango'];<br>fruits.push('grapes');   // add<br>fruits.pop();           // remove last<br>fruits.length;          // size = 3<br>fruits.map(f => f.toUpperCase()); // transform<br>fruits.filter(f => f.length > 5); // filter</code>" },
  { q:["fetch api","api call js","how to call api","fetch in javascript","axios"],
    a:"Fetch API example:<br><code>async function getData() {<br>&nbsp;const res = await fetch('https://api.example.com/data');<br>&nbsp;const data = await res.json();<br>&nbsp;console.log(data);<br>}<br>getData();</code>" },
  { q:["localstorage","local storage","save to browser","store data browser"],
    a:"localStorage lets you save data in the browser:<br><code>// Save<br>localStorage.setItem('name', 'Arjun');<br>// Get<br>let name = localStorage.getItem('name');<br>// Delete<br>localStorage.removeItem('name');<br>// Clear all<br>localStorage.clear();</code>" },
  { q:["event listener","addeventlistener","onclick js","button click js","dom events"],
    a:"JavaScript event listeners:<br><code>// Button click<br>document.getElementById('btn')<br>&nbsp;.addEventListener('click', function() {<br>&nbsp;&nbsp;alert('Clicked!');<br>&nbsp;});<br><br>// Enter key<br>input.addEventListener('keydown', e => {<br>&nbsp;if (e.key === 'Enter') submitForm();<br>});</code>" },
  { q:["promise","async await","asynchronous","callback js"],
    a:"<b>async/await</b> is the modern way to handle async code:<br><code>async function loadUser() {<br>&nbsp;try {<br>&nbsp;&nbsp;const res = await fetch('/api/user');<br>&nbsp;&nbsp;const user = await res.json();<br>&nbsp;&nbsp;console.log(user);<br>&nbsp;} catch(err) {<br>&nbsp;&nbsp;console.error(err);<br>&nbsp;}<br>}</code>" },

  /* ── Python ── */
  { q:["what is python","python explain","python kya hai","python language"],
    a:"<b>Python</b> is a simple, powerful programming language used for web development, data science, AI/ML, automation, and scripting. Its clean syntax makes it perfect for beginners! 🐍" },
  { q:["python list","list python","python array","list methods python"],
    a:"Python lists:<br><code>fruits = ['apple', 'banana', 'mango']<br>fruits.append('grapes')  # add<br>fruits.remove('banana')  # remove<br>fruits.sort()            # sort<br>len(fruits)              # length<br>[f.upper() for f in fruits]  # list comprehension</code>" },
  { q:["python function","def python","function python","lambda python"],
    a:"Python functions:<br><code>def greet(name):<br>&nbsp;&nbsp;return f'Hello, {name}!'<br><br>print(greet('Arjun'))  # Hello, Arjun!<br><br># Lambda (short function)<br>square = lambda x: x * x<br>print(square(5))  # 25</code>" },
  { q:["python loop","for loop python","while loop python","loop in python"],
    a:"Python loops:<br><code># For loop<br>for i in range(5):<br>&nbsp;&nbsp;print(i)  # 0 1 2 3 4<br><br># While loop<br>count = 0<br>while count < 5:<br>&nbsp;&nbsp;print(count)<br>&nbsp;&nbsp;count += 1<br><br># Loop over list<br>for fruit in fruits:<br>&nbsp;&nbsp;print(fruit)</code>" },
  { q:["python dictionary","dict python","python dict","key value python"],
    a:"Python dictionaries:<br><code>student = {<br>&nbsp;&nbsp;'name': 'Arjun',<br>&nbsp;&nbsp;'age': 20,<br>&nbsp;&nbsp;'course': 'Web Dev'<br>}<br>student['name']        # 'Arjun'<br>student['grade'] = 'A' # add key<br>student.keys()         # all keys<br>student.values()       # all values</code>" },

  /* ── React ── */
  { q:["what is react","react js","reactjs","react explain","react kya hai","react library"],
    a:"<b>React</b> is a JavaScript library by Meta for building fast, interactive UIs. It uses components and a virtual DOM. Most popular for single-page apps (SPAs)! Learn JavaScript first, then React." },
  { q:["react useState","use state","react state","useState hook"],
    a:"React useState hook:<br><code>import { useState } from 'react';<br><br>function Counter() {<br>&nbsp;const [count, setCount] = useState(0);<br>&nbsp;return (<br>&nbsp;&nbsp;&lt;button onClick={() => setCount(count + 1)}&gt;<br>&nbsp;&nbsp;&nbsp;Count: {count}<br>&nbsp;&nbsp;&lt;/button&gt;<br>&nbsp;);<br>}</code>" },
  { q:["react useEffect","use effect","useeffect hook","component did mount"],
    a:"React useEffect for side effects:<br><code>import { useEffect } from 'react';<br><br>useEffect(() => {<br>&nbsp;// runs after render<br>&nbsp;fetch('/api/data').then(r => r.json())<br>&nbsp;.then(data => setData(data));<br>}, []); // [] = run once on mount</code>" },

  /* ── Node.js ── */
  { q:["what is nodejs","node js","nodejs explain","node explain","backend js"],
    a:"<b>Node.js</b> lets you run JavaScript on the server (backend). It's used to build APIs, web servers, and real-time apps. Works great with Express.js for REST APIs!" },
  { q:["express js","expressjs","express route","rest api node","api with node"],
    a:"Express.js REST API:<br><code>const express = require('express');<br>const app = express();<br>app.use(express.json());<br><br>app.get('/api/users', (req, res) => {<br>&nbsp;res.json({ users: [] });<br>});<br><br>app.listen(3000, () => console.log('Running!'));</code>" },

  /* ── Git ── */
  { q:["what is git","git explain","git version control","github","what is github"],
    a:"<b>Git</b> is a version control system — it tracks changes in your code. <b>GitHub</b> is a website to host Git repositories online. Essential for every developer! 🛠️" },
  { q:["git commands","basic git","git init","git commit","git push","git pull"],
    a:"Essential Git commands:<br><code>git init          # start repo<br>git add .          # stage all changes<br>git commit -m 'msg' # save changes<br>git push origin main # upload to GitHub<br>git pull           # download latest<br>git clone URL      # copy a repo<br>git status         # check changes<br>git log            # view history</code>" },

  /* ── Career ── */
  { q:["career","job","get job","software job","developer job","it job","placement","career advice","career path","how to get job"],
    a:"🚀 <b>Developer Career Roadmap:</b><br><br>1. Learn <b>HTML + CSS + JavaScript</b> (3 months)<br>2. Learn a <b>framework</b> — React or Vue (2 months)<br>3. Learn <b>Git & GitHub</b> (2 weeks)<br>4. Build <b>3–5 real projects</b><br>5. Create a <b>portfolio website</b><br>6. Apply on LinkedIn, Naukri, Internshala<br><br>Starting salary for freshers: <b>₹3–6 LPA</b> 💼" },
  { q:["salary","developer salary","web developer salary","python salary","how much earn"],
    a:"💰 <b>Developer salaries in India:</b><br><br>🌐 Web Developer (fresher): ₹3–5 LPA<br>🌐 Web Developer (2–3 yrs): ₹6–12 LPA<br>🐍 Python Developer (fresher): ₹3.5–6 LPA<br>🤖 ML/AI Engineer: ₹6–15 LPA<br>🌍 Freelance (international): $20–60/hr<br><br>Skills that increase salary: React, Node.js, AWS, SQL" },
  { q:["internship","how to find internship","internship for students","free internship"],
    a:"🎯 <b>Best sites for internships:</b><br><br>• <b>Internshala</b> — most popular in India<br>• <b>LinkedIn</b> — search 'internship + your city'<br>• <b>Unstop</b> (formerly Dare2Compete)<br>• <b>LetsIntern</b><br>• <b>AngelList</b> — for startups<br><br>Tip: Apply with a GitHub link showing your projects!" },
  { q:["portfolio","how to make portfolio","portfolio website","showcase projects"],
    a:"📁 <b>Build a portfolio website with:</b><br><br>1. About section (who you are)<br>2. Skills section (HTML, CSS, JS, Python)<br>3. Projects section (with GitHub links)<br>4. Contact section (email / LinkedIn)<br><br>Deploy for free on <b>GitHub Pages</b> or <b>Netlify</b>!" },
  { q:["resume","cv","how to make resume","developer resume","resume tips"],
    a:"📄 <b>Developer Resume Tips:</b><br><br>• Keep it <b>1 page</b> (freshers)<br>• Add GitHub link with active projects<br>• List skills: Languages, Frameworks, Tools<br>• Include 2–3 projects with descriptions<br>• Add certifications (like NexoraLearn! 🏆)<br>• Use ATS-friendly format (no tables/images)" },

  /* ── General knowledge / tech ── */
  { q:["what is api","api explain","api kya hai","rest api","api meaning"],
    a:"<b>API</b> (Application Programming Interface) is how apps talk to each other. For example, when you use GPay, it calls a bank API to process your payment. REST APIs use HTTP requests (GET, POST, PUT, DELETE) to send/receive JSON data." },
  { q:["what is database","database explain","sql nosql","mongodb","mysql"],
    a:"📦 <b>Databases</b> store your app's data.<br><br><b>SQL</b> (MySQL, PostgreSQL) — structured tables, great for relational data<br><b>NoSQL</b> (MongoDB) — flexible documents, great for dynamic data<br><br>NexoraLearn uses MongoDB for user and course data!" },
  { q:["what is hosting","deploy website","how to host","netlify","vercel","github pages","render"],
    a:"🌍 <b>Free Hosting Options:</b><br><br>• <b>GitHub Pages</b> — static HTML/CSS/JS sites<br>• <b>Netlify</b> — static + serverless functions<br>• <b>Vercel</b> — best for React/Next.js<br>• <b>Render</b> — Node.js backends (like NexoraLearn!)<br>• <b>Railway</b> — easy backend deployment" },
  { q:["what is vscode","vs code","best editor","code editor","ide"],
    a:"💻 <b>VS Code</b> (Visual Studio Code) is the most popular free code editor. Recommended extensions:<br>• Prettier (auto-format)<br>• Live Server (preview HTML instantly)<br>• ESLint (catch JS errors)<br>• GitLens (Git history)<br>• Bracket Pair Colorizer" },
  { q:["what is npm","npm explain","npm install","node modules","package.json"],
    a:"<b>npm</b> (Node Package Manager) installs JavaScript libraries.<br><code>npm init -y         # create project<br>npm install express  # install package<br>npm install          # install all deps<br>npm run start        # run app<br>npm run build        # build for production</code>" },

  /* ── Math ── */
  { q:["what is 2+2","basic math","calculate","2 plus 2"],
    a:"2 + 2 = <b>4</b> 😄 For complex calculations, try using the browser console (F12) or a calculator!" },

  /* ── Motivation ── */
  { q:["i am stuck","i give up","too hard","frustrated","i can't","cant learn","difficult","struggling"],
    a:"💪 Don't give up! Every developer gets stuck — it's completely normal.<br><br>Tips when stuck:<br>1. Take a 5-min break<br>2. Google the exact error message<br>3. Break the problem into smaller steps<br>4. Check Stack Overflow<br>5. Ask here — I'll help!<br><br>You're learning, and that takes courage! 🌟" },
  { q:["motivate me","motivation","inspire me","i want to learn","i am beginner","just started","new to coding"],
    a:"🌟 Amazing that you're starting your coding journey!<br><br>Remember:<br>• Every expert was once a beginner<br>• 1 hour of practice daily beats 8 hours once a week<br>• Build real projects — that's how you actually learn<br>• The web dev industry in India is growing 30% YoY<br><br>Start with our <b>Web Development</b> course — you'll build real websites in weeks! 🚀" },
];

/* ── Open / close ── */
function toggleAI() {
    const box = document.getElementById("aiBox");
    if (!box) return;
    const opening = box.style.display !== "flex";
    box.style.display = opening ? "flex" : "none";
    if (opening) {
        const chat = document.getElementById("aiChat");
        if (chat && !chat.children.length)
            _bubble("bot", "👋 Hi! I'm <b>Nexora AI</b>. Ask me about courses, coding (HTML, CSS, JS, Python, React), career tips, or anything else!");
        setTimeout(function() { var i = document.getElementById("aiInput"); if (i) i.focus(); }, 80);
    }
}

/* ── Quick chips ── */
function quickAsk(q) {
    var i = document.getElementById("aiInput");
    if (i) { i.value = q; sendAI(); }
}

/* ── Clear chat ── */
function clearChat() {
    _aiHistory.length = 0;
    var chat = document.getElementById("aiChat");
    if (chat) { chat.innerHTML = ""; _bubble("bot", "🗑️ Cleared! Ask me anything."); }
}

/* ── Main AI brain — matches user message to knowledge base ── */
function _getReply(msg) {
    var lower = msg.toLowerCase().trim();

    /* Remove punctuation for better matching */
    var clean = lower.replace(/[?!.,]/g, "");

    /* Search knowledge base */
    for (var i = 0; i < _kb.length; i++) {
        var entry = _kb[i];
        for (var j = 0; j < entry.q.length; j++) {
            if (clean.includes(entry.q[j])) {
                return entry.a;
            }
        }
    }

    /* Follow-up context: if last bot msg had a topic, try to continue */
    if (_aiHistory.length >= 2) {
        var lastUser = (_aiHistory[_aiHistory.length - 2] || {}).text || "";
        if (lastUser && (clean === "yes" || clean === "ok" || clean === "sure" || clean === "tell me more")) {
            return "Sure! Could you be more specific about what you'd like to know? For example, ask me about a specific course, a coding concept, or a career topic. 😊";
        }
    }

    /* Smart fallback based on keywords */
    if (clean.match(/how|what|why|when|where|who|explain|define|tell me|teach/)) {
        return "That's a great question! I'm still learning about that topic. Try asking me about:<br>• Our courses (Web Dev, Python, AI)<br>• Coding (HTML, CSS, JS, Python, React)<br>• Career tips & salary info<br>• Git, APIs, databases, hosting 😊";
    }

    /* Generic fallback */
    var fallbacks = [
        "Hmm, I'm not sure about that yet! Try asking me about our courses, HTML, CSS, JavaScript, Python, React, career tips, or Git. 😊",
        "I don't have that info right now, but I can help with coding questions, course info, or career advice. What would you like to know?",
        "Good question! That's outside my current knowledge. Ask me about web development, Python, AI courses, or how to get a developer job! 🚀",
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

/* ── Send message ── */
function sendAI() {
    var input = document.getElementById("aiInput");
    var chat  = document.getElementById("aiChat");
    if (!input || !chat) return;

    var msg = input.value.trim();
    if (!msg) return;

    input.value = "";
    _bubble("user", _esc(msg));

    /* Save to history for context */
    _aiHistory.push({ role: "user", text: msg });
    if (_aiHistory.length > 10) _aiHistory.shift(); /* keep last 10 */

    /* Simulate typing delay (feels natural) */
    var tid = "t" + Date.now();
    var dot = document.createElement("div");
    dot.className = "bot-msg typing-indicator";
    dot.id = tid;
    dot.innerHTML = "<span></span><span></span><span></span>";
    chat.appendChild(dot);
    chat.scrollTop = chat.scrollHeight;

    /* Small delay so typing indicator shows */
    setTimeout(function() {
        var reply = _getReply(msg);
        _aiHistory.push({ role: "bot", text: reply });
        var el = document.getElementById(tid);
        if (el) el.remove();
        _bubble("bot", reply);
    }, 600 + Math.random() * 400); /* 600–1000ms feels human */
}

/* ── Voice input ── */
function startVoice() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice input not supported in this browser. Try Chrome!"); return; }
    var r = new SR(); r.lang = "en-IN"; r.start();
    r.onresult = function(e) {
        var i = document.getElementById("aiInput");
        if (i) { i.value = e.results[0][0].transcript; sendAI(); }
    };
    r.onerror = function() { alert("Voice failed. Please try again."); };
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
function _esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }