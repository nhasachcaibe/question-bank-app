function loginAdmin(){
  const pass = document.getElementById("adminPass").value.trim();

  // Đổi mật khẩu này theo ý bạn
  const ADMIN_PASSWORD = "123456";

  if(pass === ADMIN_PASSWORD){
    localStorage.setItem("admin_logged_in", "yes");
    location.href = "admin-layout.html";
  }else{
    document.getElementById("msg").innerHTML =
      "<p style='color:red'>Sai mật khẩu admin.</p>";
  }
}
