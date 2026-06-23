async function loadLessons(){
  const box = document.getElementById("lessons");

  const grade = document.getElementById("filterGrade").value.trim();
  const status = document.getElementById("filterStatus").value;
  const category = document.getElementById("filterCategory").value.trim().toLowerCase();

  box.innerHTML = "<div class='card'>Đang tải...</div>";

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/passages?select=*&order=created_at.desc`,
    {
      headers:{
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );

  let data = await res.json();

  if(grade){
    data = data.filter(x => String(x.grade || "") === grade);
  }

  if(status){
    data = data.filter(x => x.status === status);
  }

  if(category){
    data = data.filter(x => String(x.category || "").toLowerCase().includes(category));
  }

  if(data.length === 0){
    box.innerHTML = "<div class='card'>Chưa có bài phù hợp.</div>";
    return;
  }

  box.innerHTML = data.map(item => `
    <div class="card">
      <h2>${item.title || "Không tiêu đề"}</h2>

      <p><b>Môn:</b> ${item.subject || ""}</p>
      <p><b>Lớp:</b> ${item.grade || ""}</p>
      <p><b>Học kỳ:</b> ${item.semester || ""}</p>
      <p><b>Chủ đề:</b> ${item.topic || ""}</p>
      <p><b>Danh mục:</b> ${item.category || ""}</p>
      <p><b>Trạng thái:</b> ${item.is_public ? "Đã public" : "Chưa public"}</p>

      <button class="main-btn" onclick="location.href='lesson-edit.html?id=${item.id}'">
        Sửa bài
      </button>

      ${
        item.is_public
        ? `<button class="main-btn secondary-btn" onclick="unpublishLesson('${item.id}')">Ẩn bài</button>`
        : `<button class="main-btn" onclick="publishLesson('${item.id}')">Public</button>`
      }
    </div>
  `).join("");
}

async function publishLesson(id){
  await updateLessonStatus(id, true, "public");
}

async function unpublishLesson(id){
  await updateLessonStatus(id, false, "draft");
}

async function updateLessonStatus(id, isPublic, status){
  await fetch(
    `${SUPABASE_URL}/rest/v1/passages?id=eq.${id}`,
    {
      method:"PATCH",
      headers:{
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        is_public:isPublic,
        status:status,
        updated_at:new Date().toISOString()
      })
    }
  );

  loadLessons();
}

loadLessons();
