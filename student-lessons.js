const params = new URLSearchParams(location.search);
const grade = params.get("grade") || "";
const subject = params.get("subject") || "";

async function loadLessons(){
  const box = document.getElementById("lessons");

  box.innerHTML = "<div class='card'>Đang tải bài...</div>";

  const url =
    `${SUPABASE_URL}/rest/v1/passages?is_public=eq.true&grade=eq.${encodeURIComponent(grade)}&subject=eq.${encodeURIComponent(subject)}&select=*&order=created_at.desc`;

  const res = await fetch(url,{
    headers:{
      apikey:SUPABASE_ANON_KEY,
      Authorization:`Bearer ${SUPABASE_ANON_KEY}`
    }
  });

  const data = await res.json();

  if(!data.length){
    box.innerHTML = "<div class='card'>Chưa có bài phù hợp.</div>";
    return;
  }

  box.innerHTML = data.map(item=>`
    <div class="card" style="cursor:pointer" onclick="location.href='quiz.html?id=${item.id}'">
      <h2>${item.title}</h2>
      <p><b>Môn:</b> ${item.subject}</p>
      <p><b>Lớp:</b> ${item.grade}</p>
      <p><b>Học kỳ:</b> ${item.semester || ""}</p>
      <p><b>Chủ đề:</b> ${item.topic || ""}</p>
      <p><b>Danh mục:</b> ${item.category || ""}</p>
      <p style="color:#2563eb">Bấm để làm bài</p>
    </div>
  `).join("");
}

loadLessons();
