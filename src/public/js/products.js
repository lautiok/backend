// Obtiene el ID del carrito almacenado en sessionStorage
let cartId = sessionStorage.getItem('cartId');

// Función para crear un nuevo carrito
async function createCart() {
    try {
        // Realiza una solicitud POST al endpoint de creación de carritos
        const response = await fetch('/api/carts', { method: 'POST' });
        // Obtiene la respuesta en formato JSON
        const data = await response.json();
        // Verifica si la solicitud fue exitosa
        if (data.status === 'success') {
            // Almacena el ID del carrito en sessionStorage
            cartId = data.payload._id;
            sessionStorage.setItem('cartId', cartId);
            return cartId;
        } else {
            // Si la solicitud no fue exitosa, muestra un mensaje de error al usuario
            throw new Error(data.error);
        }
    } catch (error) {
        // En caso de error, muestra un mensaje de error al usuario
        alert(error.message || 'Error al crear el carrito');
    }
}

// Función para agregar un producto al carrito
async function addProductToCart(productId) {
    try {
        // Verifica si el ID del carrito está definido
        if (!cartId) {
            // Si no está definido, crea un nuevo carrito
            cartId = await createCart();
        }
        // Realiza una solicitud POST para agregar un producto al carrito
        const response = await fetch(`/api/carts/${cartId}/products/${productId}`, { method: 'POST' });
        const data = await response.json();
        if (data.status === 'success') {
            // Si la solicitud fue exitosa, muestra un mensaje de confirmación al usuario
            alert('Producto agregado al carrito');
        }
    } catch (error) {
        // En caso de error, muestra un mensaje de error al usuario
        alert(error.message || 'Error al agregar el producto al carrito');
    }
}

// Función para ver el carrito
async function viewCart() {
    try {
        // Verifica si el ID del carrito está definido
        if (!cartId) {
            // Si no está definido, crea un nuevo carrito
            cartId = await createCart();
        }
        // Redirige al usuario a la página de visualización del carrito
        window.location.href = `/carts/${cartId}`;
    } catch (error) {
        // En caso de error, muestra un mensaje de error al usuario
        alert(error.message || 'Error al ver el carrito');
    }
}
