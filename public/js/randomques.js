
async function displaySelection() {
    const topic = document.getElementById('topic-select').value;
    const level = document.getElementById('level-select').value;

    document.getElementById('output').innerHTML = `Generating ${level} question for ${topic}...`;
    document.getElementById('question').innerHTML = 'Loading...';

    try {
        const response = await fetch(`/api/generate-question?topic=${encodeURIComponent(topic)}&level=${encodeURIComponent(level)}`);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        // Display formatted question
        let output = `
            <strong>Problem Statement:</strong><br>${data.problem_statement}<br><br>
            <strong>Input Format:</strong><br>${data.input_format}<br><br>
            <strong>Output Format:</strong><br>${data.output_format}<br><br>
            <strong>Constraints:</strong><br>${data.constraints}<br><br>
            <strong>Sample Input:</strong><br><pre>${data.sample_input}</pre><br>
            <strong>Sample Output:</strong><br><pre>${data.sample_output}</pre>
        `;

        if (data.explanation) {
            output += `<br><strong>Explanation:</strong><br>${data.explanation}`;
        }

        document.getElementById('question').innerHTML = output;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('question').innerHTML = 'Failed to generate question. Check console or try again.';
    }
}
