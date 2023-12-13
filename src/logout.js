async function logout() {
    try {
        const response = await fetch('http://localhost:3000/api/logout', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 200) {
            console.log('Logout successful');
            window.location.href = 'loginpage.html'; 

        } else {
            console.error('Failed to logout:', response.status);
        }
    } catch (error) {
        console.error('Error during logout:', error);
    }
}