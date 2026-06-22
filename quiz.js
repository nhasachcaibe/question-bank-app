const params = new URLSearchParams(location.search);
const passageId = params.get("id");

async function loadQuiz() {

  const quiz = document.getElementById("quiz");

  const pRes = await fetch(
    `${SUPABASE_URL}/rest/v1/passages?id=eq.${passageId}&select=*`,
    {
      headers:{
        apikey:SUPABASE_ANON_KEY,
        Authorization:`Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );

  const passages = await pRes.json();

  if(!passages.length){
    quiz.innerHTML="Không tìm thấy bài.";
    return;
  }

  const passage = passages[0];

  const qRes = await fetch(
    `${SUPABASE_URL}/rest/v1/questions?passage_id=eq.${passageId}&select=*`,
    {
      headers:{
        apikey:SUPABASE_ANON_KEY,
        Authorization:`Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );

  const questions = await qRes.json();

  let html = `
    <div class="card">
      <h2>${passage.title}</h2>
      <p>${passage.content}</p>
    </div>
  `;

  questions.forEach((q,i)=>{

    html += `
      <div class="card">
        <h3>Câu ${i+1}</h3>
        <p>${q.question}</p>

        <label><input type="radio" name="q${i}" value="A"> ${q.answer_a}</label><br>
        <label><input type="radio" name="q${i}" value="B"> ${q.answer_b}</label><br>
        <label><input type="radio" name="q${i}" value="C"> ${q.answer_c}</label><br>
        <label><input type="radio" name="q${i}" value="D"> ${q.answer_d}</label>
      </div>
    `;
  });

  window.allQuestions = questions;

html += `
  <button onclick="submitQuiz()">
    Nộp bài
  </button>

  <div id="scoreBox"></div>
`;

  quiz.innerHTML = html;
}

loadQuiz();

function submitQuiz(){

  let correct = 0;

  allQuestions.forEach((q,i)=>{

    const selected =
      document.querySelector(
        `input[name="q${i}"]:checked`
      );

    if(
      selected &&
      selected.value === q.correct
    ){
      correct++;
    }
  });

  document.getElementById("scoreBox").innerHTML =
    `
    <div class="card">
      <h2>Kết quả</h2>
      <p>Đúng ${correct}/${allQuestions.length} câu</p>
    </div>
    `;
}
