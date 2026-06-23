const studentName = localStorage.getItem("student_name");
const studentClass = localStorage.getItem("student_class");

if(!studentName || !studentClass){
  location.href = "student-login.html";
}

document.getElementById("studentInfo").innerHTML =
  `<b>Học sinh:</b> ${studentName} - <b>Lớp:</b> ${studentClass}`;

async function loadCategories(){
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/categories?select=*&order=type.asc,name.asc`,
    {
      headers:{
        apikey:SUPABASE_ANON_KEY,
        Authorization:`Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );

  const data = await res.json();

  fillSelect("grade", data.filter(x=>x.type==="grade"));
  fillSelect("subject", data.filter(x=>x.type==="subject"));
}

function fillSelect(id, items){
  const el = document.getElementById(id);
  el.innerHTML = items.map(x=>`
    <option value="${x.name}">${x.name}</option>
  `).join("");
}

function goNext(){
  const grade = document.getElementById("grade").value;
  const subject = document.getElementById("subject").value;
  const mode = document.getElementById("mode").value;

  if(mode === "lessons"){
    location.href =
      `student-lessons.html?grade=${encodeURIComponent(grade)}&subject=${encodeURIComponent(subject)}`;
  }else{
    location.href =
      `student-exams.html?grade=${encodeURIComponent(grade)}&subject=${encodeURIComponent(subject)}`;
  }
}

function changeStudent(){
  localStorage.removeItem("student_name");
  localStorage.removeItem("student_class");
  localStorage.removeItem("student_id");
  location.href = "student-login.html";
}

loadCategories();
