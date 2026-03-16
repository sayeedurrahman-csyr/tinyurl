const API_URL = 'localhost:3000'

document.getElementById('shortenForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collecting Data fromthe form
    const formData = {
        long_url: document.getElementById('longUrl').value.trim(),
        domain: document.getElementById('domain').value.trim(),
        alias: document.getElementById('alias').value.trim()
    };

    console.log('Sending data:', formData);

    try {
        const response = await fetch(`${API_URL}/api/shorten-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            alert('Your short link is: ' + result.short_url);
        } else {
            alert('Something went wrong. Please check your alias or connection.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error. See console for details.');
    }
});