const restorePasswordForm = document.querySelector("#restorePasswordForm");

restorePasswordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = restorePasswordForm.email.value;
  try {
    const response = await fetch("/api/sessions/restore-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (data.status === "success") {
      alert(
        "Se ha enviado un enlace de restauración de contraseña a tu correo electrónico"
      );
      window.location.href = "/";
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert(error);
  }
});
