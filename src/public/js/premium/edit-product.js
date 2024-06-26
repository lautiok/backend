const editProductForm = document.querySelector("#editProductForm");

editProductForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const productId = editProductForm.productId.value;
  const product = {
    title: editProductForm.title.value,
    description: editProductForm.description.value,
    code: editProductForm.code.value,
    price: editProductForm.price.value,
    status: editProductForm.status.value,
    stock: editProductForm.stock.value,
    category: editProductForm.category.value,
    thumbnails: editProductForm.thumbnails.value,
    owner: editProductForm.owner.value,
  };
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(product),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (data.status === "success") {
      alert("Producto editado");
      window.location.href = "/premium/products";
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert(error);
  }
});
