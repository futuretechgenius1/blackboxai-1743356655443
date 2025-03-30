// Constants
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = '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';

// DOM Elements
const form = document.getElementById('nameGeneratorForm');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const results = document.getElementById('results');
const namesList = document.getElementById('namesList');

// Helper Functions
function showLoading() {
    loadingSpinner.classList.remove('hidden');
    results.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

function showError(message) {
    errorMessage.classList.remove('hidden');
    errorText.textContent = message;
    errorMessage.classList.add('error-shake');
    setTimeout(() => errorMessage.classList.remove('error-shake'), 500);
}

function formatNameCard(suggestion) {
    return `
        <div class="name-card bg-white p-6 rounded-lg shadow-md border border-purple-100 hover:border-purple-300 transition-all">
            <h3 class="text-2xl font-bold text-purple-800 mb-2">${suggestion.name}</h3>
            <p class="name-meaning mb-3">${suggestion.meaning}</p>
            <p class="name-origin mb-2">
                <span class="font-medium">Origin:</span> ${suggestion.origin}
            </p>
            ${suggestion.pronunciation ? `
                <p class="mb-2">
                    <span class="font-medium">Pronunciation:</span>
                    <span class="name-pronunciation">${suggestion.pronunciation}</span>
                </p>
            ` : ''}
            ${suggestion.similarNames ? `
                <p class="similar-names">
                    <span class="font-medium">Similar Names:</span> ${suggestion.similarNames.join(', ')}
                </p>
            ` : ''}
        </div>
    `;
}

function displayResults(suggestions) {
    results.classList.remove('hidden');
    namesList.innerHTML = suggestions.map(formatNameCard).join('');
}

// Construct the prompt for the API
function constructPrompt(formData) {
    let prompt = `Please generate 5 unique baby names with the following criteria:\n`;
    prompt += `- Gender: ${formData.gender}\n`;
    prompt += `- Origin/Culture: ${formData.origin}\n`;
    prompt += `- Meaning/Theme: ${formData.meaning}\n`;
    prompt += `- Name Length: ${formData.length}\n`;
    
    if (formData.parentName1 || formData.parentName2) {
        prompt += `- Parent Names: ${formData.parentName1} and ${formData.parentName2}\n`;
    }
    
    if (formData.numerology) {
        prompt += `- Lucky Number: ${formData.numerology}\n`;
    }
    
    prompt += `- Style: ${formData.style}\n\n`;
    prompt += `For each name, provide the following details:
    - Name
    - Meaning
    - Origin
    - Pronunciation (if needed)
    - Similar Names (2-3 suggestions)
    
    Please format each name suggestion as a JSON object.`;
    
    return prompt;
}

// API call function
async function getBotResponse(message) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: message }],
                model: 'gemma2-9b-it'
            })
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to generate names. Please try again.');
    }
}

// Parse API response
function parseResponse(response) {
    try {
        // First try to parse the entire response as JSON
        try {
            return JSON.parse(response);
        } catch (e) {
            // If that fails, try to extract JSON objects from the text
            const jsonObjects = response.match(/\{[^{}]*\}/g);
            if (jsonObjects) {
                return jsonObjects.map(obj => JSON.parse(obj));
            }
        }
        throw new Error('Invalid response format');
    } catch (error) {
        console.error('Parse error:', error);
        throw new Error('Failed to process the generated names.');
    }
}

// Form submission handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
        gender: form.gender.value,
        origin: form.origin.value,
        meaning: form.meaning.value,
        length: form.length.value,
        parentName1: form.parentName1.value,
        parentName2: form.parentName2.value,
        numerology: form.numerology.value,
        style: form.style.value
    };
    
    // Validate required fields
    const requiredFields = ['gender', 'origin', 'meaning', 'length', 'style'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
        showError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
        return;
    }
    
    try {
        showLoading();
        
        // Construct prompt and get response
        const prompt = constructPrompt(formData);
        const response = await getBotResponse(prompt);
        const suggestions = parseResponse(response);
        
        // Display results
        displayResults(suggestions);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
});

// Add reset functionality
form.addEventListener('reset', () => {
    results.classList.add('hidden');
    errorMessage.classList.add('hidden');
});

// Initialize any tooltips or other UI enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add any initialization code here
});