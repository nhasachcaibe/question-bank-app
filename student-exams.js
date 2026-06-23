const params = new URLSearchParams(location.search);
const grade = params.get("grade") || "";
const subject = params.get("subject") || "";

async function loadExams(){
  const box = document.getElementById("exams");

  box.innerHTML = "<div class='card'>Đang tải đề...</div>";

  const url =
    `${SUPABASE_URL}/rest/v1/exam_sets?is_public=eq.true&grade=eq.${encodeURIComponent(grade)}&subject=eq.${encodeURIComponent(subject)}&select=*&order=created_at.desc`;

  const res = await fetch(url,{
    headers:{
      apikey:SUPABASE_ANON_KEY,
      Authorization:`Bearer ${SUPABASE_ANON_KEY}`
    }
  });

  const data = await res.json();

  if(!data.length){
    box.innerHTML = "<div class='card'>Chưa có đề kiểm tra phù hợp.</div>";
    return;
  }

  box.innerHTML = data.map(item=>`
    <div class="card" style="cursor:pointer" onclick="location.href='exam.html?id=${item.id}'">
      <h2>${item.title}</h2>
      <p><b>Môn:</b> ${item.subject || ""}</p>
      <p><b>Lớp:</b> ${item.grade || ""}</p>
      <p><b>Học kỳ:</b> ${item.semester || ""}</p>
      <p><b>Loại đề:</b> ${item.exam_type || ""}</p>
      <p><b>Danh mục:</b> ${item.category || ""}</p>
      <p>${item.description || ""}</p>
      <p style="color:#2563eb">Bấm để làm đề</p>
    </div>
  `).join("");
}

loadExams();
