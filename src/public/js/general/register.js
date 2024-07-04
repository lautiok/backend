const registerForm = document.querySelector('#registerForm');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const user = {
        first_name: registerForm.firstName.value,
        last_name: registerForm.lastName.value,
        email: registerForm.email.value,
        age: registerForm.age.value,
        password: registerForm.password.value
    }
    try {
        const response = await fetch('/api/sessions/register', {
            method: 'POST',
            body: JSON.stringify(user),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data.status === 'success') {
            alert('Usuario registrado exitosamente');
            window.location.href = '/login';
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert(error);
    }
});