async function loadCategories(){
  const box = document.getElementById("list");

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/categories?select=*&order=type.asc,name.asc`,
    {
      headers:{
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );

  const data = await res.json();

  if(!data.length){
    box.innerHTML = "<div class='card'>Chưa có danh mục.</div>";
    return;
  }

  const typeNames = {
    subject: "Môn học",
    grade: "Lớp",
    semester: "Học kỳ",
    topic: "Chủ đề",
    category: "Danh mục bài"
  };

  box.innerHTML = `
    <div class="card">
      <h2>Danh sách danh mục</h2>
      <table class="result-table">
        <thead>
          <tr>
            <th>Loại</th>
            <th>Tên</th>
            <th>Xóa</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            <tr>
              <td>${typeNames[item.type] || item.type}</td>
              <td>${item.name}</td>
              <td>
                <button class="small-btn" onclick="deleteCategory('${item.id}')">
                  Xóa
                </button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function addCategory(){
  const type = document.getElementById("type").value;
  const name = document.getElementById("name").value.trim();
  const msg = document.getElementById("msg");

  if(!name){
    msg.innerHTML = "<p style='color:red'>Vui lòng nhập tên danh mục.</p>";
    return;
  }

  await fetch(
    `${SUPABASE_URL}/rest/v1/categories`,
    {
      method:"POST",
      headers:{
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        type:type,
        name:name
      })
    }
  );

  document.getElementById("name").value = "";
  msg.innerHTML = "<p style='color:green'>Đã thêm danh mục.</p>";
  loadCategories();
}

async function deleteCategory(id){
  if(!confirm("Bạn có chắc muốn xóa danh mục này?")) return;

  await fetch(
    `${SUPABASE_URL}/rest/v1/categories?id=eq.${id}`,
    {
      method:"DELETE",
      headers:{
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );

  loadCategories();
}

loadCategories();
