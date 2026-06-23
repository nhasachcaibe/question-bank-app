async function supabaseFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      ...(options.headers || {})
    }
  });

  const text = await res.text();

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  if (!res.ok) {
    console.error("Supabase error:", res.status, data);
    throw new Error(
      typeof data === "string"
        ? data
        : (data.message || JSON.stringify(data))
    );
  }

  return data;
}

async function loadCategories() {
  const box = document.getElementById("list");

  box.innerHTML = "<div class='card'>Đang tải danh mục...</div>";

  try {
    const data = await supabaseFetch(
      `${SUPABASE_URL}/rest/v1/categories?select=*&order=type.asc,name.asc`
    );

    console.log("Categories:", data);

    if (!data || data.length === 0) {
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
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            ${data.map(item => `
              <tr>
                <td>${typeNames[item.type] || item.type}</td>
                <td>${item.name || ""}</td>
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

  } catch (err) {
    box.innerHTML = `
      <div class="card">
        <b style="color:red">Lỗi tải danh mục:</b>
        <pre>${err.message}</pre>
      </div>
    `;
  }
}

async function addCategory() {
  const type = document.getElementById("type").value;
  const name = document.getElementById("name").value.trim();
  const msg = document.getElementById("msg");

  msg.innerHTML = "";

  if (!name) {
    msg.innerHTML = "<p style='color:red'>Vui lòng nhập tên danh mục.</p>";
    return;
  }

  try {
    await supabaseFetch(
      `${SUPABASE_URL}/rest/v1/categories`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify({
          type: type,
          name: name
        })
      }
    );

    document.getElementById("name").value = "";
    msg.innerHTML = "<p style='color:green'>Đã thêm danh mục.</p>";

    loadCategories();

  } catch (err) {
    msg.innerHTML = `
      <p style='color:red'>
        Lỗi lưu danh mục: ${err.message}
      </p>
    `;
  }
}

async function deleteCategory(id) {
  if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;

  try {
    await supabaseFetch(
      `${SUPABASE_URL}/rest/v1/categories?id=eq.${id}`,
      {
        method: "DELETE"
      }
    );

    loadCategories();

  } catch (err) {
    alert("Lỗi xóa danh mục: " + err.message);
  }
}

loadCategories();
