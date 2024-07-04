const loginForm = document.querySelector('#loginForm');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const user = {
        email: loginForm.email.value,
        password: loginForm.password.value
    }
    try {
        const response = await fetch('/api/sessions/login', {
            method: 'POST',
            body: JSON.stringify(user),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data.status === 'success') {
            alert('Sesión iniciada exitosamente');
            if (data.payload.role === 'admin') {
                window.location.href = '/admin/main';
            } else {
                window.location.href = '/products';
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert(error);
    }
});