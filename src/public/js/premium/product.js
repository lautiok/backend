async function deleteProduct(id) {
  try {
    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (data.status === "success") {
      alert("Producto eliminado");
      window.location.href = "/premium/products";
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert(error);
  }
}
