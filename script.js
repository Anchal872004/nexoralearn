const API = "https://nexoralearn-backend.onrender.com/api";

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

    loadCoursesFastS();
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

// 🚀 CACHE COURSES (NO RELOAD ON SCROLL)
let cachedCourses = null;

async function loadCoursesFast() {

    const grid = document.getElementById("courseGrid");
    if (!grid) return;

    // use cache if exists
    if (cachedCourses) {
        renderCourses(cachedCourses);
        return;
    }

    try {
        const res = await fetch(`${API}/courses`);
        const data = await res.json();

        cachedCourses = (Array.isArray(data) && data.length) ? data : demoCourses;

    } catch {
        cachedCourses = demoCourses;
    }

    renderCourses(cachedCourses);
}

// separate render function
function renderCourses(courses) {

    const grid = document.getElementById("courseGrid");
    grid.innerHTML = "";

    window.allCourses = courses;

    courses.forEach((course, index) => {

        const card = document.createElement("div");
        card.className = "course-card";

        const isBought = JSON.parse(localStorage.getItem("purchased") || "[]")
            .includes(course.title);

        card.innerHTML = `
            <img src="${course.image}" loading="lazy">
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <button ${isBought ? "disabled" : ""}>
                ${isBought ? "✔ Purchased" : "Buy ₹" + (course.price || 499)}
            </button>
        `;

        card.addEventListener("click", () => openCourse(index));

        card.querySelector("button").addEventListener("click", (e) => {
            e.stopPropagation();
            if (!isBought) openPayment(index);
        });

        grid.appendChild(card);
    });
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

// 🚀 CACHE COURSES (NO RELOAD ON SCROLL)
cachedCourses = null;

async function loadCoursesFast() {

    const grid = document.getElementById("courseGrid");
    if (!grid) return;

    // use cache if exists
    if (cachedCourses) {
        renderCourses(cachedCourses);
        return;
    }

    try {
        const res = await fetch(`${API}/courses`);
        const data = await res.json();

        cachedCourses = (Array.isArray(data) && data.length) ? data : demoCourses;

    } catch {
        cachedCourses = demoCourses;
    }

    renderCourses(cachedCourses);
}

// separate render function
function renderCourses(courses) {

    const grid = document.getElementById("courseGrid");
    grid.innerHTML = "";

    window.allCourses = courses;

    courses.forEach((course, index) => {

        const card = document.createElement("div");
        card.className = "course-card";

        const isBought = JSON.parse(localStorage.getItem("purchased") || "[]")
            .includes(course.title);

        card.innerHTML = `
            <img src="${course.image}" loading="lazy">
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <button ${isBought ? "disabled" : ""}>
                ${isBought ? "✔ Purchased" : "Buy ₹" + (course.price || 499)}
            </button>
        `;

        card.addEventListener("click", () => openCourse(index));

        card.querySelector("button").addEventListener("click", (e) => {
            e.stopPropagation();
            if (!isBought) openPayment(index);
        });

        grid.appendChild(card);
    });
}

/* payment.js — NexoraLearn | Depends on: script.js */
(function () {

  let _idx = -1, _upiApp = '', _bank = '';

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    var ov = document.getElementById('payOverlay');
    if (!ov) return;

    // Close
    document.getElementById('closePayBtn').addEventListener('click', close);
    document.getElementById('sucCloseBtn').addEventListener('click', close);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });

    // Tabs
    document.querySelectorAll('.pay-tab').forEach(function (b) {
      b.addEventListener('click', function () { switchTab(b.dataset.tab, b); });
    });

    // UPI apps
    document.querySelectorAll('.upi-app').forEach(function (el) {
      el.addEventListener('click', function () {
        document.querySelectorAll('.upi-app').forEach(function (a) { a.classList.remove('sel'); });
        el.classList.add('sel');
        _upiApp = el.dataset.app;
      });
    });

    // Banks
    document.querySelectorAll('.bank-opt').forEach(function (el) {
      el.addEventListener('click', function () {
        document.querySelectorAll('.bank-opt').forEach(function (b) { b.classList.remove('sel'); });
        el.classList.add('sel');
        _bank = el.dataset.bank;
        document.getElementById('pSelBank').value = _bank;
      });
    });

    // Pay buttons
    ['cardPayBtn','upiPayBtn','nbPayBtn'].forEach(function (id) {
      var b = document.getElementById(id);
      if (b) b.addEventListener('click', function () { pay(b.dataset.method); });
    });

    // Card preview
    var n = document.getElementById('pcNum'),
        nm = document.getElementById('pcName'),
        ex = document.getElementById('pcExp');
    if (n)  n.addEventListener('input',  function () { fmtNum(n); });
    if (nm) nm.addEventListener('input', function () { document.getElementById('mcName').textContent = nm.value.toUpperCase() || 'FULL NAME'; });
    if (ex) ex.addEventListener('input', function () { fmtExp(ex); });

    // Hamburger
    var ham = document.getElementById('hamburger'), nav = document.getElementById('navLinks');
    if (ham && nav) {
      ham.addEventListener('click', function () { ham.classList.toggle('open'); nav.classList.toggle('open'); });
      nav.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { ham.classList.remove('open'); nav.classList.remove('open'); });
      });
    }
  });

  /* ── Open / Close ── */
  function open(index) {
    if (!checkLogin()) return;
    _idx = index; _upiApp = ''; _bank = '';
    var c = window.allCourses[index], p = '₹' + (c.price || 499);
    document.getElementById('payCourseName').textContent  = c.title;
    document.getElementById('payCoursePrice').textContent = p;
    var ca = document.getElementById('cardAmt'), ua = document.getElementById('upiAmt');
    if (ca) ca.textContent = p;
    if (ua) ua.textContent = p;
    reset();
    document.getElementById('payFormArea').style.display = '';
    document.getElementById('paySuccess').classList.remove('show');
    switchTab('card', document.querySelector('.pay-tab[data-tab="card"]'));
    document.getElementById('payOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    document.getElementById('payOverlay').classList.remove('open');
    document.body.style.overflow = '';
    if (typeof loadCourses === 'function') loadCourses();
  }

  /* ── Tab switch ── */
  function switchTab(name, btn) {
    document.querySelectorAll('.pay-tab').forEach(function (t) { t.classList.remove('active'); });
    document.querySelectorAll('.pay-panel').forEach(function (p) { p.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    var panel = document.getElementById('ppanel-' + name);
    if (panel) panel.classList.add('active');
  }

  /* ── Formatters ── */
  function fmtNum(el) {
    var r = el.value.replace(/\D/g,'').substring(0,16);
    el.value = r.replace(/(.{4})/g,'$1  ').trim();
    document.getElementById('mcNum').textContent = (r+'················').substring(0,16).replace(/(.{4})/g,'$1 ').trim();
  }
  function fmtExp(el) {
    var r = el.value.replace(/\D/g,'').substring(0,4);
    if (r.length >= 3) r = r.substring(0,2) + ' / ' + r.substring(2);
    el.value = r;
    document.getElementById('mcExp').textContent = r || 'MM/YY';
  }

  /* ── Validation ── */
  function err(id, show) {
    var e = document.getElementById('e-'+id), i = document.getElementById(id);
    if (e) e.classList.toggle('show', show);
    if (i) i.classList.toggle('err',  show);
    return show;
  }
  function vCard() {
    var ok = true,
        n  = document.getElementById('pcNum').value.replace(/\s/g,''),
        ex = document.getElementById('pcExp').value.replace(/\s/g,'').replace('/','');
    if (!/^\d{16}$/.test(n))                                     ok = !err('pcNum',  true); else err('pcNum',  false);
    if (!document.getElementById('pcName').value.trim())         ok = !err('pcName', true); else err('pcName', false);
    if (!/^\d{4}$/.test(ex))                                     ok = !err('pcExp',  true); else err('pcExp',  false);
    if (!/^\d{3}$/.test(document.getElementById('pcCvv').value)) ok = !err('pcCvv',  true); else err('pcCvv',  false);
    return ok;
  }
  function vUpi()  { var v = _upiApp || /^[\w.\-]+@[\w]+$/.test(document.getElementById('pupiId').value.trim()); err('pupiId',  !v); return !!v; }
  function vNb()   { err('pSelBank', !_bank); return !!_bank; }

  function reset() {
    ['pcNum','pcName','pcExp','pcCvv','pupiId','pSelBank'].forEach(function (id) {
      var el = document.getElementById(id); if (el) { el.value = ''; el.classList.remove('err'); }
    });
    document.querySelectorAll('.pf-err').forEach(function (e) { e.classList.remove('show'); });
    document.querySelectorAll('.upi-app,.bank-opt').forEach(function (e) { e.classList.remove('sel'); });
    document.getElementById('mcNum').textContent  = '•••• •••• •••• ••••';
    document.getElementById('mcName').textContent = 'FULL NAME';
    document.getElementById('mcExp').textContent  = 'MM/YY';
    _upiApp = ''; _bank = '';
  }

  /* ── Process payment ── */
  async function pay(method) {
    var valid = method==='card' ? vCard() : method==='upi' ? vUpi() : vNb();
    if (!valid) return;

    var map = { card:['cardPayBtn','cardSpin','cardBtnTxt'], upi:['upiPayBtn','upiSpin','upiBtnTxt'], nb:['nbPayBtn','nbSpin','nbBtnTxt'] };
    var [bId, sId, tId] = map[method];
    var btn = document.getElementById(bId), spin = document.getElementById(sId), txt = document.getElementById(tId);

    btn.disabled = true; spin.style.display = 'block'; txt.style.opacity = '0.5';

    /* Swap setTimeout with real fetch('/api/payment', {...}) for production */
    await new Promise(function (resolve) {
      setTimeout(function () {
        console.log('[MongoDB] Inserted:', { method, amount: window.allCourses[_idx].price||499, status:'SUCCESS', createdAt: new Date().toISOString() });
        resolve();
      }, 1800);
    });

    var txn = 'TXN_' + Math.random().toString(36).substr(2,10).toUpperCase();
    var c   = window.allCourses[_idx];
    var bought = JSON.parse(localStorage.getItem('purchased') || '[]');
    if (!bought.includes(c.title)) bought.push(c.title);
    localStorage.setItem('purchased', JSON.stringify(bought));
    localStorage.setItem('course', JSON.stringify(c));

    btn.disabled = false; spin.style.display = 'none'; txt.style.opacity = '1';
    document.getElementById('payFormArea').style.display = 'none';
    document.getElementById('sucMsg').textContent = c.title + ' is now unlocked!';
    document.getElementById('sucTxn').textContent = 'TXN ID: ' + txn;
    document.getElementById('paySuccess').classList.add('show');
  }

  window.openPayment   = open;
  window.closePayModal = close;

})();

/* course-page.js — NexoraLearn | Depends on: script.js, jspdf CDN */
(function () {

  document.addEventListener('DOMContentLoaded', function () {
    // Hamburger
    var ham = document.getElementById('hamburger'), nav = document.getElementById('navLinks');
    if (ham && nav) {
      ham.addEventListener('click', function () { ham.classList.toggle('open'); nav.classList.toggle('open'); });
      nav.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { ham.classList.remove('open'); nav.classList.remove('open'); });
      });
    }
    render();
  });

  /* ── Locked screen helper ── */
  function locked(icon, title, msg, href, label) {
    return '<div class="locked-msg"><div class="lock-icon">'+icon+'</div><h2>'+title+'</h2><p>'+msg+'</p><a href="'+href+'">'+label+'</a></div>';
  }

  /* ── Render ── */
  function render() {
    var el = document.getElementById('coursePageContent'); if (!el) return;

    if (!localStorage.getItem('token'))
      return (el.innerHTML = locked('🔐','Login Required','Please log in first.','login.html','Login'));

    var raw = localStorage.getItem('course');
    if (!raw)
      return (el.innerHTML = locked('📚','No Course Selected','Pick a course first.','courses.html','Browse Courses'));

    var course = JSON.parse(raw);
    if (!JSON.parse(localStorage.getItem('purchased')||'[]').includes(course.title))
      return (el.innerHTML = locked('🔒','Course Locked','Purchase <b>'+course.title+'</b> to unlock.','courses.html','Go to Courses'));

    // Build embed URL
    var url = course.video || 'https://www.youtube.com/embed/PkZNo7MFNFg';
    if (url.includes('watch?v='))  url = 'https://www.youtube.com/embed/' + url.split('watch?v=')[1].split('&')[0];
    if (url.includes('youtu.be/')) url = 'https://www.youtube.com/embed/' + url.split('youtu.be/')[1].split('?')[0];

    el.innerHTML =
      '<div class="course-page-wrap">' +
        '<div class="course-main">' +
          '<div class="video-wrap"><iframe id="courseVideo" src="'+url+'?autoplay=1&controls=1" frameborder="0" allowfullscreen allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"></iframe></div>' +
          '<div class="course-meta"><h1>'+course.title+'</h1><p>'+course.description+'</p></div>' +
          '<div class="progress-wrap"><h3>📈 Your Progress</h3>' +
            '<div class="prog-bar"><div class="prog-fill" id="progressFill"></div></div>' +
            '<div class="prog-row"><span class="prog-pct" id="progressText">0%</span>' +
            '<button class="prog-btn" id="progBtn">Mark Progress +20%</button></div>' +
          '</div>' +
        '</div>' +
        '<div class="course-sidebar">' +
          '<div class="notes-box"><h3>📝 My Notes</h3>' +
            '<textarea id="notesArea" placeholder="Write notes here..."></textarea>' +
            '<button id="saveNotesBtn">Save Notes</button></div>' +
          '<div class="cert-box"><div class="cert-icon">🏆</div><h3>Certificate of Completion</h3>' +
            '<p>Complete 100% to unlock your certificate.</p>' +
            '<button class="cert-btn" id="certBtn" disabled>Download Certificate</button></div>' +
        '</div>' +
      '</div>';

    // Wire events
    document.getElementById('progBtn').addEventListener('click', addProgress);
    document.getElementById('saveNotesBtn').addEventListener('click', saveNotes);
    document.getElementById('certBtn').addEventListener('click', getCert);

    updateUI(parseInt(localStorage.getItem('progress') || 0));
    var na = document.getElementById('notesArea');
    if (na) na.value = localStorage.getItem('courseNotes') || '';
  }

  /* ── Progress ── */
  function addProgress() {
    var p = parseInt(localStorage.getItem('progress') || 0);
    if (p >= 100) { alert('🎉 Already completed!'); return; }
    p = Math.min(100, p + 20);
    localStorage.setItem('progress', p);
    updateUI(p);
  }

  function updateUI(p) {
    var f = document.getElementById('progressFill'),
        t = document.getElementById('progressText'),
        c = document.getElementById('certBtn');
    if (f) f.style.width  = p + '%';
    if (t) t.textContent  = p + '%';
    if (c) c.disabled     = p < 100;
  }

  /* ── Notes ── */
  function saveNotes() {
    var el = document.getElementById('notesArea');
    if (el) { localStorage.setItem('courseNotes', el.value); alert('✅ Notes saved!'); }
  }

  /* ── Certificate ── */
  function getCert() {
    if (parseInt(localStorage.getItem('progress')||0) < 100) { alert('❌ Complete the course first!'); return; }
    if (!window.jspdf) { alert('PDF library not loaded.'); return; }

    var course = JSON.parse(localStorage.getItem('course') || '{}');
    var doc    = new window.jspdf.jsPDF({ orientation: 'landscape' });

    doc.setFillColor(13,13,13);   doc.rect(0,0,297,210,'F');
    doc.setDrawColor(255,60,47);  doc.setLineWidth(3); doc.rect(10,10,277,190);
    doc.setDrawColor(200,40,30);  doc.setLineWidth(1); doc.rect(15,15,267,180);

    doc.setTextColor(255,60,47);  doc.setFontSize(30); doc.setFont('helvetica','bold');
    doc.text('NexoraLearn', 148.5, 48, {align:'center'});

    doc.setTextColor(255,255,255); doc.setFontSize(18);
    doc.text('Certificate of Completion', 148.5, 66, {align:'center'});

    doc.setDrawColor(255,60,47); doc.setLineWidth(0.5); doc.line(50,72,247,72);

    doc.setFontSize(12); doc.setTextColor(170,170,170); doc.setFont('helvetica','normal');
    doc.text('This certifies successful completion of', 148.5, 85, {align:'center'});

    doc.setFontSize(24); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
    doc.text(course.title || 'Course', 148.5, 105, {align:'center'});

    doc.setFontSize(11); doc.setTextColor(170,170,170); doc.setFont('helvetica','normal');
    doc.text('Issued: ' + new Date().toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'}), 148.5, 125, {align:'center'});

    doc.setDrawColor(255,60,47); doc.line(50,170,247,170);
    doc.setTextColor(255,60,47); doc.setFontSize(10);
    doc.text('nexoralearn.com', 148.5, 182, {align:'center'});

    doc.save('NexoraLearn_' + (course.title||'Certificate').replace(/\s+/g,'_') + '.pdf');
  }

})();