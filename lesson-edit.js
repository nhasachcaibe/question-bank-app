const params = new URLSearchParams(location.search);
const lessonId = params.get("id");

async function loadLesson(){
  const box = document.getElementById("editor");

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/passages?id=eq.${lessonId}&select=*`,
    {
      headers:{
        apikey: SUPABASE_ANON_KEY,
        Authorization:`Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );

  const data = await res.json();

  if(!data.length){
    box.innerHTML = "<div class='card'>Không tìm thấy bài.</div>";
    return;
  }

  const item = data[0];

  box.innerHTML = `
    <div class="card">
      <label>Tiêu đề</label>
      <input id="title" value="${item.title || ""}" style="width:100%;padding:10px">

      <br><br>

      <label>Nội dung đoạn văn</label>
      <textarea id="content" style="width:100%;height:220px">${item.content || ""}</textarea>

      <br><br>

      <label>Môn</label>
      <input id="subject" value="${item.subject || ""}" style="width:100%;padding:10px">

      <br><br>

      <label>Lớp</label>
      <input id="grade" value="${item.grade || ""}" style="width:100%;padding:10px">

      <br><br>

      <label>Học kỳ</label>
      <input id="semester" value="${item.semester || ""}" style="width:100%;padding:10px" placeholder="Học kỳ 1 / Học kỳ 2">

      <br><br>

      <label>Chủ đề</label>
      <input id="topic" value="${item.topic || ""}" style="width:100%;padding:10px" placeholder="Ví dụ: Thơ hiện đại">

      <br><br>

      <label>Danh mục</label>
      <input id="category" value="${item.category || ""}" style="width:100%;padding:10px" placeholder="Đọc hiểu, Nghị luận xã hội, Nghị luận văn học">

      <br><br>

      <button class="main-btn" onclick="saveLesson(false)">Lưu nháp</button>
      <button class="main-btn" onclick="saveLesson(true)">Lưu và Public</button>
      <button class="main-btn secondary-btn" onclick="location.href='lessons.html'">Quay lại</button>

      <div id="msg"></div>
    </div>
  `;
}

async function saveLesson(publicNow){
  const body = {
    title:document.getElementById("title").value.trim(),
    content:document.getElementById("content").value.trim(),
    subject:document.getElementById("subject").value.trim(),
    grade:document.getElementById("grade").value.trim(),
    semester:document.getElementById("semester").value.trim(),
    topic:document.getElementById("topic").value.trim(),
    category:document.getElementById("category").value.trim(),
    is_public:publicNow,
    status:publicNow ? "public" : "draft",
    updated_at:new Date().toISOString()
  };

  await fetch(
    `${SUPABASE_URL}/rest/v1/passages?id=eq.${lessonId}`,
    {
      method:"PATCH",
      headers:{
        apikey:SUPABASE_ANON_KEY,
        Authorization:`Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify(body)
    }
  );

  document.getElementById("msg").innerHTML =
    "<p style='color:green'>Đã lưu bài.</p>";
}

loadLesson();
