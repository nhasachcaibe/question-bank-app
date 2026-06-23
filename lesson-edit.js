const params = new URLSearchParams(location.search);
const lessonId = params.get("id");

let allCategories = [];

async function fetchData(url){
  const res = await fetch(url, {
    headers:{
      apikey: SUPABASE_ANON_KEY,
      Authorization:`Bearer ${SUPABASE_ANON_KEY}`
    }
  });

  const data = await res.json();

  if(!res.ok){
    console.error(data);
    throw new Error("Lỗi tải dữ liệu");
  }

  return data;
}

function getOptions(type, selectedValue){
  const items = allCategories.filter(x => x.type === type);

  let html = `<option value="">-- Chọn --</option>`;

  html += items.map(item => `
    <option value="${item.name}" ${item.name === selectedValue ? "selected" : ""}>
      ${item.name}
    </option>
  `).join("");

  if(selectedValue && !items.some(x => x.name === selectedValue)){
    html += `<option value="${selectedValue}" selected>${selectedValue}</option>`;
  }

  return html;
}

async function loadLesson(){
  const box = document.getElementById("editor");

  if(!lessonId){
    box.innerHTML = "<div class='card'>Thiếu mã bài.</div>";
    return;
  }

  box.innerHTML = "<div class='card'>Đang tải bài...</div>";

  try{
    allCategories = await fetchData(
      `${SUPABASE_URL}/rest/v1/categories?select=*&order=type.asc,name.asc`
    );

    const data = await fetchData(
      `${SUPABASE_URL}/rest/v1/passages?id=eq.${lessonId}&select=*`
    );

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
        <select id="subject" style="width:100%;padding:10px">
          ${getOptions("subject", item.subject || "")}
        </select>

        <br><br>

        <label>Lớp</label>
        <select id="grade" style="width:100%;padding:10px">
          ${getOptions("grade", item.grade || "")}
        </select>

        <br><br>

        <label>Học kỳ</label>
        <select id="semester" style="width:100%;padding:10px">
          ${getOptions("semester", item.semester || "")}
        </select>

        <br><br>

        <label>Chủ đề</label>
        <select id="topic" style="width:100%;padding:10px">
          ${getOptions("topic", item.topic || "")}
        </select>

        <br><br>

        <label>Danh mục</label>
        <select id="category" style="width:100%;padding:10px">
          ${getOptions("category", item.category || "")}
        </select>

        <br><br>

        <button class="main-btn" onclick="saveLesson(false)">Lưu nháp</button>
        <button class="main-btn" onclick="saveLesson(true)">Lưu và Public</button>
        <button class="main-btn secondary-btn" onclick="location.href='admin-layout.html?page=lessons.html'">Quay lại</button>

        <div id="msg"></div>
      </div>
    `;

  }catch(err){
    console.error(err);
    box.innerHTML = "<div class='card'>Lỗi tải bài hoặc danh mục.</div>";
  }
}

async function saveLesson(publicNow){
  const body = {
    title:document.getElementById("title").value.trim(),
    content:document.getElementById("content").value.trim(),
    subject:document.getElementById("subject").value,
    grade:document.getElementById("grade").value,
    semester:document.getElementById("semester").value,
    topic:document.getElementById("topic").value,
    category:document.getElementById("category").value,
    is_public:publicNow,
    status:publicNow ? "public" : "draft",
    updated_at:new Date().toISOString()
  };

  const res = await fetch(
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

  if(!res.ok){
    const err = await res.text();
    document.getElementById("msg").innerHTML =
      `<p style='color:red'>Lỗi lưu bài: ${err}</p>`;
    return;
  }

  document.getElementById("msg").innerHTML =
    publicNow
      ? "<p style='color:green'>Đã lưu và Public bài.</p>"
      : "<p style='color:green'>Đã lưu nháp.</p>";
}

loadLesson();
