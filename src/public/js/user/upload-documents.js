const uploadDocumentsForm = document.querySelector("#uploadDocumentsForm");

uploadDocumentsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const userId = uploadDocumentsForm.userId.value;
  const formData = new FormData();
  formData.append("profile", uploadDocumentsForm.profile.files[0]);
  formData.append("id", uploadDocumentsForm.id.files[0]);
  formData.append("adress", uploadDocumentsForm.adress.files[0]);
  formData.append("account", uploadDocumentsForm.account.files[0]);
  try {
    const response = await fetch(`/api/users/${userId}/documents`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (data.status === "success") {
      alert("Documentos subidos exitosamente");
      window.location.href = "/profile";
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert(error);
  }
});
