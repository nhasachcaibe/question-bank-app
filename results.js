let allResults = [];

function formatDate(value){
  if(!value) return "";
  const d = new Date(value);
  return d.toLocaleString("vi-VN");
}

function formatDuration(seconds){
  if(!seconds && seconds !== 0) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if(m <= 0) return `${s} giây`;
  return `${m} phút ${s} giây`;
}

function logoutAdmin(){
  localStorage.removeItem("admin_logged_in");
  location.href = "login.html";
}

async function loadResults(){
  const resultsBox = document.getElementById("results");
  const summaryBox = document.getElementById("summary");

  resultsBox.innerHTML = "<div class='card'>Đang tải kết quả...</div>";

  try{
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/quiz_results?select=*&order=created_at.desc`,
      {
        headers:{
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );

    const data = await res.json();
    allResults = Array.isArray(data) ? data : [];

    renderFilters();
    renderResults();

  }catch(err){
    console.error(err);
    summaryBox.innerHTML = "";
    resultsBox.innerHTML = "<div class='card'>Lỗi tải kết quả.</div>";
  }
}

function renderFilters(){
  const classSelect = document.getElementById("filterClass");
  const passageSelect = document.getElementById("filterPassage");

  const oldClass = classSelect.value;
  const oldPassage = passageSelect.value;

  const classes = [...new Set(allResults.map(x => x.class_name).filter(Boolean))];
  const passages = [...new Set(allResults.map(x => x.passage_title).filter(Boolean))];

  classSelect.innerHTML = `<option value="">Tất cả lớp</option>` +
    classes.map(cls => `<option value="${cls}">${cls}</option>`).join("");

  passageSelect.innerHTML = `<option value="">Tất cả bài</option>` +
    passages.map(p => `<option value="${p}">${p}</option>`).join("");

  classSelect.value = oldClass;
  passageSelect.value = oldPassage;
}

function getFilteredResults(){
  const cls = document.getElementById("filterClass").value;
  const passage = document.getElementById("filterPassage").value;
  const search = document.getElementById("searchName").value.trim().toLowerCase();

  return allResults.filter(row => {
    const okClass = !cls || row.class_name === cls;
    const okPassage = !passage || row.passage_title === passage;
    const okSearch = !search || (row.student_name || "").toLowerCase().includes(search);

    return okClass && okPassage && okSearch;
  });
}

function renderResults(){
  const resultsBox = document.getElementById("results");
  const summaryBox = document.getElementById("summary");

  const rows = getFilteredResults();

  if(rows.length === 0){
    summaryBox.innerHTML = "";
    resultsBox.innerHTML = "<div class='card'>Chưa có kết quả phù hợp.</div>";
    return;
  }

  const avgScore =
    Math.round(
      rows.reduce((s,x) => s + Number(x.score || 0), 0) / rows.length * 10
    ) / 10;

  const maxScore = Math.max(...rows.map(x => Number(x.score || 0)));

  summaryBox.innerHTML = `
    <div class="card">
      <h2>Tổng quan</h2>
      <p><b>Số lượt làm:</b> ${rows.length}</p>
      <p><b>Điểm trung bình:</b> ${avgScore}</p>
      <p><b>Điểm cao nhất:</b> ${maxScore}</p>
    </div>
  `;

  resultsBox.innerHTML = `
    <div class="card">
      <h2>Danh sách kết quả</h2>

      <div style="overflow-x:auto">
        <table class="result-table">
          <thead>
            <tr>
              <th>Học sinh</th>
              <th>Lớp</th>
              <th>Bài</th>
              <th>Điểm</th>
              <th>Đúng</th>
              <th>Thời gian</th>
              <th>Ngày nộp</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                <td>${row.student_name || ""}</td>
                <td>${row.class_name || ""}</td>
                <td>${row.passage_title || ""}</td>
                <td><b>${row.score ?? ""}</b></td>
                <td>${row.correct_count}/${row.total_questions}</td>
                <td>${formatDuration(row.duration_seconds)}</td>
                <td>${formatDate(row.submit_time || row.created_at)}</td>
                <td>
                  <button onclick="viewDetail('${row.id}')" class="small-btn">
                    Xem
                  </button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function viewDetail(resultId){
  location.href = `result-detail.html?id=${resultId}`;
}

loadResults();
