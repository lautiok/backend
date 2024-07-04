async function deleteProduct(id) {
    try {
        const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.status === 'success') {
            alert('Producto eliminado exitosamente');
            window.location.href = '/admin/products';
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert(error);
    }
}