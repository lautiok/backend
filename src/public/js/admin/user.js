async function changeUserRole(userId) {
    try {
        const response = await fetch(`/api/users/premium/${userId}`, { method: 'PUT' });
        const data = await response.json();
        if (data.status === 'success') {
            alert('Rol de usuario cambiado exitosamente');
            window.location.reload();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert(error);
    }
}

async function deleteUser(id) {
    try {
        const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.status === 'success') {
            alert('Usuario eliminado exitosamente');
            window.location.href = '/admin/users';
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert(error);
    }
}