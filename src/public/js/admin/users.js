async function deleteUsers() {
    try {
        const response = await fetch('/api/users', { method: 'DELETE' });
        const data = await response.json();
        if (data.status === 'success') {
            if (data.payload.length === 0) {
                alert('No hay usuarios inactivos para eliminar');
                return;
            } else {
                alert('Usuarios eliminados');
                window.location.reload();
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert(error);
    }
}