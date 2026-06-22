const params = new URLSearchParams(location.search);
const resultId = params.get("id");

function formatDate(value){
  if(!value) return "";
  return new Date(value).toLocaleString("vi-VN");
}

function formatDuration(seconds){
  if(!seconds && seconds !== 0) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if(m <= 0) return `${s} giây`;
  return `${m} phút ${s} giây`;
}

function answerText(question, key){
  if(!question || !key) return "";
  if(key === "A") return question.answer_a;
  if(key === "B") return question.answer_b;
  if(key === "C") return question.answer_c;
  if(key === "D") return question.answer_d;
  return key;
}

async function fetchTable(url){
  const res = await fetch(url, {
    headers:{
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`
    }
  });

  const data = await res.json();

  if(!res.ok){
    console.error(data);
    throw new Error("Lỗi tải dữ liệu");
  }

  return data;
}

async function loadDetail(){
  const box = document.getElementById("detail");

  if(!resultId){
    box.innerHTML = "<div class='card'>Thiếu mã kết quả.</div>";
    return;
  }

  box.innerHTML = "<div class='card'>Đang tải chi tiết...</div>";

  try{
    const results = await fetchTable(
      `${SUPABASE_URL}/rest/v1/quiz_results?id=eq.${resultId}&select=*`
    );

    if(!results.length){
      box.innerHTML = "<div class='card'>Không tìm thấy kết quả.</div>";
      return;
    }

    const result = results[0];

    const answers = await fetchTable(
      `${SUPABASE_URL}/rest/v1/student_answers?result_id=eq.${resultId}&select=*&order=created_at.asc`
    );

    const questionIds = answers
      .map(a => a.question_id)
      .filter(Boolean);

    let questions = [];

    if(questionIds.length > 0){
      const idList = questionIds.map(id => `"${id}"`).join(",");

      questions = await fetchTable(
        `${SUPABASE_URL}/rest/v1/questions?id=in.(${idList})&select=*`
      );
    }

    const questionMap = {};
    questions.forEach(q => {
      questionMap[q.id] = q;
    });

    let html = `
      <div class="card score-box">
        <h2>${result.passage_title || "Bài làm"}</h2>

        <p><b>Học sinh:</b> ${result.student_name || ""}</p>
        <p><b>Lớp:</b> ${result.class_name || ""}</p>
        <p><b>Điểm:</b> ${result.score}</p>
        <p><b>Số câu đúng:</b> ${result.correct_count}/${result.total_questions}</p>
        <p><b>Thời gian làm:</b> ${formatDuration(result.duration_seconds)}</p>
        <p><b>Bắt đầu:</b> ${formatDate(result.start_time)}</p>
        <p><b>Nộp bài:</b> ${formatDate(result.submit_time || result.created_at)}</p>
      </div>
    `;

    if(answers.length === 0){
      html += "<div class='card'>Không có dữ liệu câu trả lời.</div>";
      box.innerHTML = html;
      return;
    }

    html += answers.map((ans, index) => {
      const q = questionMap[ans.question_id];

      const studentAnswerText = answerText(q, ans.student_answer);
      const correctAnswerText = answerText(q, ans.correct_answer);

      return `
        <div class="card ${ans.is_correct ? "correct-card" : "wrong-card"}">
          <h3>Câu ${index + 1}</h3>

          <p><b>Câu hỏi:</b> ${q ? q.question : "(Không tìm thấy câu hỏi)"}</p>

          <p>
            <b>Học sinh chọn:</b>
            ${ans.student_answer || "Chưa chọn"}
            ${studentAnswerText ? ` - ${studentAnswerText}` : ""}
          </p>

          <p>
            <b>Đáp án đúng:</b>
            ${ans.correct_answer || ""}
            ${correctAnswerText ? ` - ${correctAnswerText}` : ""}
          </p>

          <p>
            <b>Kết quả:</b>
            ${ans.is_correct ? "✅ Đúng" : "❌ Sai"}
          </p>

          ${q && q.explanation ? `
            <p><b>Giải thích:</b> ${q.explanation}</p>
          ` : ""}
        </div>
      `;
    }).join("");

    box.innerHTML = html;

  }catch(err){
    console.error(err);
    box.innerHTML = "<div class='card'>Lỗi tải chi tiết bài làm.</div>";
  }
}

loadDetail();
