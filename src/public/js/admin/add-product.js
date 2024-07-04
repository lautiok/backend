const addProductForm = document.querySelector('#addProductForm');

addProductForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const product = {
        title: addProductForm.title.value,
        description: addProductForm.description.value,
        code: addProductForm.code.value,
        price: addProductForm.price.value,
        status: addProductForm.status.value,
        stock: addProductForm.stock.value,
        category: addProductForm.category.value,
        thumbnails: addProductForm.thumbnails.value
    }
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            body: JSON.stringify(product),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data.status === 'success') {
            alert('Producto agregado exitosamente');
            window.location.href = '/admin/products';
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert(error);
    }
});