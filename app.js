async function loadPassages() {
  const app = document.getElementById("app");

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/passages?select=*`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );

    const data = await res.json();

    if (!Array.isArray(data)) {
      app.innerHTML = "<div class='card'>Không đọc được dữ liệu.</div>";
      return;
    }

    if (data.length === 0) {
      app.innerHTML =
        "<div class='card'>Chưa có bài đọc hiểu nào trong Supabase.</div>";
      return;
    }

  app.innerHTML = data.map(item => `
  <div class="card"
       style="cursor:pointer"
       onclick="location.href='quiz.html?id=${item.id}'">
        <h3>${item.title || "(Không tiêu đề)"}</h3>
        <div>Môn: ${item.subject || ""}</div>
        <div>Lớp: ${item.grade || ""}</div>
      </div>
    `).join("");

  } catch (err) {
    console.error(err);
    app.innerHTML =
      "<div class='card'>Lỗi kết nối Supabase.</div>";
  }
}

document.addEventListener("DOMContentLoaded", loadPassages);
