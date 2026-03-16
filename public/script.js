const API_URL = 'http://localhost:3000'

document.getElementById('shortenForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collecting Data fromthe form
    const formData = {
        long_url: document.getElementById('longUrl').value.trim(),
        domain: document.getElementById('domain').value.trim(),
        alias: document.getElementById('alias').value.trim()
    };

    try {
        const response = await fetch(`${API_URL}/api/shorten-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        if (response.ok) {
            displayMessage(`Success! Your link: <a href="${result.short_url}" target="_blank">${result.short_url}</a>`, 'success');
        } else {
            // alert('Something went wrong. Please check your alias or connection.');
            displayMessage(`Error: ${result.message || 'Validation failed.'}`, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error. See console for details.');
    }
});

function displayMessage(htmlContent, type) {
    messageBox.innerHTML = htmlContent;
    messageBox.classList.add(type); // adds 'success' or 'error' class
    messageBox.style.display = 'block';
}