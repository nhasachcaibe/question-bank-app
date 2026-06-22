const studentName = localStorage.getItem("student_name");
const studentClass = localStorage.getItem("student_class");

if(!studentName || !studentClass){
  location.href = "student-login.html";
}
const params = new URLSearchParams(location.search);
const passageId = params.get("id");

let allQuestions = [];
let renderedQuestions = [];

function shuffleArray(arr) {
  return arr
    .map(item => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

async function loadQuiz() {
  const quiz = document.getElementById("quiz");

  if (!passageId) {
    quiz.innerHTML = "<div class='card'>Thiếu mã bài làm.</div>";
    return;
  }

  const pRes = await fetch(
    `${SUPABASE_URL}/rest/v1/passages?id=eq.${passageId}&select=*`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );

  const passages = await pRes.json();

  if (!passages.length) {
    quiz.innerHTML = "<div class='card'>Không tìm thấy bài.</div>";
    return;
  }

  const passage = passages[0];

  const qRes = await fetch(
    `${SUPABASE_URL}/rest/v1/questions?passage_id=eq.${passageId}&select=*`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );

  let questions = await qRes.json();

  if (!questions.length) {
    quiz.innerHTML = "<div class='card'>Bài này chưa có câu hỏi.</div>";
    return;
  }

  // Random câu hỏi
  questions = shuffleArray(questions);

  // Nếu muốn giới hạn số câu, ví dụ 20 câu, mở dòng này:
  // questions = questions.slice(0, 20);

  allQuestions = questions;

  let html = `
    <div class="card passage-box">
      <h2>${passage.title}</h2>
      <p>${passage.content}</p>
    </div>
  `;

  renderedQuestions = questions.map((q, i) => {
    const answers = [
      { key: "A", text: q.answer_a },
      { key: "B", text: q.answer_b },
      { key: "C", text: q.answer_c },
      { key: "D", text: q.answer_d }
    ];

    const shuffledAnswers = shuffleArray(answers);

    html += `
      <div class="card question-card" id="question-${i}">
        <h3>Câu ${i + 1}</h3>
        <p>${q.question}</p>

        ${shuffledAnswers.map(ans => `
          <label class="answer-line">
            <input type="radio" name="q${i}" value="${ans.key}">
            <span>${ans.text}</span>
          </label>
        `).join("")}

        <div class="feedback" id="feedback-${i}"></div>
      </div>
    `;

    return {
      ...q,
      shuffledAnswers
    };
  });

  html += `
    <button id="submitBtn" onclick="submitQuiz()" class="main-btn">
      Nộp bài
    </button>

    <div id="scoreBox"></div>
  `;

  quiz.innerHTML = html;
}

function submitQuiz() {
  let correctCount = 0;

  renderedQuestions.forEach((q, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    const feedback = document.getElementById(`feedback-${i}`);
    const card = document.getElementById(`question-${i}`);

    const correctAnswer = q.shuffledAnswers.find(a => a.key === q.correct);

    if (selected && selected.value === q.correct) {
      correctCount++;
      card.classList.add("correct-card");
      feedback.innerHTML = `
        <div class="correct-text">
          ✅ Đúng
        </div>
      `;
    } else {
      card.classList.add("wrong-card");
      feedback.innerHTML = `
        <div class="wrong-text">
          ❌ Sai
        </div>
        <div>
          <b>Đáp án đúng:</b> ${correctAnswer ? correctAnswer.text : q.correct}
        </div>
        <div>
          <b>Giải thích:</b> ${q.explanation || "Chưa có giải thích."}
        </div>
      `;
    }

    const inputs = document.querySelectorAll(`input[name="q${i}"]`);
    inputs.forEach(input => input.disabled = true);
  });

  document.getElementById("scoreBox").innerHTML = `
    <div class="card score-box">
      <h2>Kết quả</h2>
      <p>Đúng ${correctCount}/${renderedQuestions.length} câu</p>
      <p>Điểm: ${Math.round((correctCount / renderedQuestions.length) * 10 * 10) / 10}</p>
      <button onclick="location.reload()" class="main-btn">
        Làm lại
      </button>
      <button onclick="location.href='index.html'" class="main-btn secondary-btn">
        Về danh sách bài
      </button>
    </div>
  `;

  document.getElementById("submitBtn").disabled = true;
  document.getElementById("submitBtn").innerText = "Đã nộp bài";
}

loadQuiz();
