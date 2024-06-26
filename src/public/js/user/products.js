async function logout() {
  try {
    const response = await fetch("/api/sessions/logout", { method: "POST" });
    const data = await response.json();
    if (data.status === "success") {
      alert("Sesión cerrada");
      window.location.href = "/login";
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert(error);
  }
}
