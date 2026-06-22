const studentName = localStorage.getItem("student_name");
const studentClass = localStorage.getItem("student_class");

if(!studentName || !studentClass){
  location.href = "student-login.html";
}

const params = new URLSearchParams(location.search);
const passageId = params.get("id");

let allQuestions = [];
let renderedQuestions = [];
let currentPassage = null;
let startTime = new Date();

function shuffleArray(arr) {
  return arr
    .map(item => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

async function getStudentId(){
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/students?name=eq.${encodeURIComponent(studentName)}&class_name=eq.${encodeURIComponent(studentClass)}&select=*`,
    {
      headers:{
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );

  const data = await res.json();

  if(data.length > 0){
    return data[0].id;
  }

  const addRes = await fetch(
    `${SUPABASE_URL}/rest/v1/students`,
    {
      method:"POST",
      headers:{
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type":"application/json",
        Prefer:"return=representation"
      },
      body:JSON.stringify({
        name: studentName,
        class_name: studentClass
      })
    }
  );

  const addData = await addRes.json();
  return addData[0].id;
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

  currentPassage = passages[0];

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

  questions = shuffleArray(questions);
  allQuestions = questions;

  let html = `
    <div class="card passage-box">
      <div><b>Học sinh:</b> ${studentName} - <b>Lớp:</b> ${studentClass}</div>
      <hr>
      <h2>${currentPassage.title}</h2>
      <p>${currentPassage.content}</p>
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

async function saveResultToSupabase(correctCount, totalQuestions, score, answerRows){
  const studentId = await getStudentId();

  const submitTime = new Date();
  const durationSeconds = Math.round((submitTime - startTime) / 1000);

  const resultRes = await fetch(
    `${SUPABASE_URL}/rest/v1/quiz_results`,
    {
      method:"POST",
      headers:{
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type":"application/json",
        Prefer:"return=representation"
      },
      body:JSON.stringify({
        student_id: studentId,
        student_name: studentName,
        class_name: studentClass,
        passage_id: passageId,
        passage_title: currentPassage ? currentPassage.title : "",
        score: score,
        correct_count: correctCount,
        total_questions: totalQuestions,
        start_time: startTime.toISOString(),
        submit_time: submitTime.toISOString(),
        duration_seconds: durationSeconds
      })
    }
  );

  const resultData = await resultRes.json();

  if(!resultRes.ok){
    console.error(resultData);
    return;
  }

  const resultId = resultData[0].id;

  const answersToSave = answerRows.map(row => ({
    result_id: resultId,
    question_id: row.question_id,
    student_answer: row.student_answer,
    correct_answer: row.correct_answer,
    is_correct: row.is_correct
  }));

  await fetch(
    `${SUPABASE_URL}/rest/v1/student_answers`,
    {
      method:"POST",
      headers:{
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify(answersToSave)
    }
  );
}

async function submitQuiz() {
  let correctCount = 0;
  const answerRows = [];

  renderedQuestions.forEach((q, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    const feedback = document.getElementById(`feedback-${i}`);
    const card = document.getElementById(`question-${i}`);

    const correctAnswer = q.shuffledAnswers.find(a => a.key === q.correct);
    const isCorrect = selected && selected.value === q.correct;

    if (isCorrect) {
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

    answerRows.push({
      question_id: q.id,
      student_answer: selected ? selected.value : "",
      correct_answer: q.correct,
      is_correct: !!isCorrect
    });

    const inputs = document.querySelectorAll(`input[name="q${i}"]`);
    inputs.forEach(input => input.disabled = true);
  });

  const totalQuestions = renderedQuestions.length;
  const score = Math.round((correctCount / totalQuestions) * 10 * 10) / 10;

  document.getElementById("scoreBox").innerHTML = `
    <div class="card score-box">
      <h2>Kết quả</h2>
      <p>Đúng ${correctCount}/${totalQuestions} câu</p>
      <p>Điểm: ${score}</p>
      <p>Đang lưu kết quả...</p>
    </div>
  `;

  document.getElementById("submitBtn").disabled = true;
  document.getElementById("submitBtn").innerText = "Đã nộp bài";

  await saveResultToSupabase(
    correctCount,
    totalQuestions,
    score,
    answerRows
  );

  document.getElementById("scoreBox").innerHTML = `
    <div class="card score-box">
      <h2>Kết quả</h2>
      <p>Đúng ${correctCount}/${totalQuestions} câu</p>
      <p>Điểm: ${score}</p>
      <p>Đã lưu kết quả.</p>

      <button onclick="location.reload()" class="main-btn">
        Làm lại
      </button>

      <button onclick="location.href='index.html'" class="main-btn secondary-btn">
        Về danh sách bài
      </button>
    </div>
  `;
}

loadQuiz();
