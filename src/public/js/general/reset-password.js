const resetPasswordForm = document.querySelector('#resetPasswordForm');

resetPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = resetPasswordForm.token.value;
    const password = resetPasswordForm.password.value;
    try {
        const response = await fetch('/api/sessions/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, password }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data.status === 'error') {
            alert(data.message);
        } else {
            alert(data.message);
            window.location.href = '/login';
        }
    } catch (error) {
        alert(error);
    }
});