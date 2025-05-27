// js/results.js

document.addEventListener('DOMContentLoaded', () => {
    // Only run results-specific code if we are on the results page
    // and the necessary filter elements exist.
    const classSelect = document.getElementById('class-select');
    if (window.location.pathname.includes('results.html') && classSelect) {
        initializeResultsPage();
    }
});

let resultsDataStore = null; // Renamed to avoid conflict if 'resultsData' is too generic

async function fetchResultsData() {
    if (resultsDataStore) return resultsDataStore; // Return cached data
    try {
        const response = await fetch('data/results.json'); // Path relative to HTML file
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} fetching results.json`);
        }
        resultsDataStore = await response.json();
        return resultsDataStore;
    } catch (error) {
        console.error("Could not fetch results data:", error);
        const resultsTableContainer = document.getElementById('results-table-container');
        if (resultsTableContainer) {
             resultsTableContainer.innerHTML = '<p class="placeholder-text error-text">Failed to load results data. Please try again later.</p>';
        }
        return null; // Return null or an empty object on error
    }
}

async function initializeResultsPage() {
    const classSelect = document.getElementById('class-select');
    const testSelect = document.getElementById('test-select');
    const viewResultsBtn = document.getElementById('view-results-btn');
    const resultsTableContainer = document.getElementById('results-table-container');

    // This check is somewhat redundant due to DOMContentLoaded check, but good for robustness
    if (!classSelect || !testSelect || !viewResultsBtn || !resultsTableContainer) {
        console.error("One or more results page elements are missing from the DOM for initialization.");
        return;
    }
    
    resultsTableContainer.innerHTML = '<p class="placeholder-text">Loading result options...</p>';
    const data = await fetchResultsData(); // Use the new function name

    if (!data) {
        resultsTableContainer.innerHTML = '<p class="placeholder-text error-text">Could not load result categories. Please check data source.</p>';
        // Disable selects and button if data load failed
        classSelect.disabled = true;
        testSelect.disabled = true;
        viewResultsBtn.disabled = true;
        return;
    }
    resultsTableContainer.innerHTML = '<p class="placeholder-text">Please select a class and test to view results.</p>';

    const classes = Object.keys(data);
    if (classes.length === 0) {
        classSelect.innerHTML = '<option value="">No classes available</option>';
        classSelect.disabled = true;
        testSelect.disabled = true;
        viewResultsBtn.disabled = true;
        return;
    }

    classSelect.innerHTML = '<option value="">-- Select Class --</option>'; // Reset before populating
    classes.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        // Format class name for display e.g. class1 -> Class 1
        option.textContent = className.replace(/([A-Za-z]+)([0-9]+)/, (match, p1, p2) => `${p1.charAt(0).toUpperCase() + p1.slice(1)} ${p2}`);
        classSelect.appendChild(option);
    });

    classSelect.addEventListener('change', () => {
        const selectedClass = classSelect.value;
        testSelect.innerHTML = '<option value="">-- Select Test --</option>'; // Reset test select
        testSelect.disabled = true;
        viewResultsBtn.disabled = true;
        resultsTableContainer.innerHTML = '<p class="placeholder-text">Please select a test to view results.</p>';

        if (selectedClass && data[selectedClass]) {
            const tests = Object.keys(data[selectedClass]);
            if (tests.length === 0) {
                testSelect.innerHTML = '<option value="">No tests available for this class</option>';
                return; // Keep test select disabled
            }
            tests.forEach(testName => {
                const option = document.createElement('option');
                option.value = testName;
                // Format test name e.g. test1 -> Test 1
                option.textContent = testName.replace(/([A-Za-z]+)([0-9]+)/, (match, p1, p2) => `${p1.charAt(0).toUpperCase() + p1.slice(1)} ${p2}`);
                testSelect.appendChild(option);
            });
            testSelect.disabled = false;
        }
    });

    testSelect.addEventListener('change', () => {
        viewResultsBtn.disabled = !testSelect.value; // Enable button if a test is selected
         if(testSelect.value){
            resultsTableContainer.innerHTML = '<p class="placeholder-text">Click "View Results" to load data.</p>';
        } else {
            resultsTableContainer.innerHTML = '<p class="placeholder-text">Please select a test to view results.</p>';
        }
    });

    viewResultsBtn.addEventListener('click', () => {
        const selectedClass = classSelect.value;
        const selectedTest = testSelect.value;

        if (selectedClass && selectedTest && data[selectedClass] && data[selectedClass][selectedTest]) {
            resultsTableContainer.innerHTML = '<p class="loading-text">Loading results...</p>';
            // Simulate a small delay for loading perception if needed, then render
            // Using a timeout is optional, direct call is also fine
            setTimeout(() => {
                 renderResultsTable(data[selectedClass][selectedTest], resultsTableContainer);
            }, 100); // Reduced delay
        } else {
            resultsTableContainer.innerHTML = '<p class="placeholder-text error-text">No results found for the selected criteria. Please try different options.</p>';
        }
    });
}

function renderResultsTable(studentResults, container) {
    if (!studentResults || studentResults.length === 0) {
        container.innerHTML = '<p class="placeholder-text">No results available for this selection.</p>';
        return;
    }

    // Determine table headers dynamically from the first student object
    const headers = Object.keys(studentResults[0]);

    let tableHTML = '<table class="results-table">';
    tableHTML += '<thead><tr>';
    headers.forEach(header => {
        let thClass = '';
        // Add space before capital letters for display & capitalize first letter
        let headerText = header.replace(/([A-Z](?=[a-z]))|([A-Z]+(?=[A-Z][a-z]|\b))/g, ' $1$2').trim(); 
        headerText = headerText.charAt(0).toUpperCase() + headerText.slice(1); 

        if (header.toLowerCase() === 'rank') thClass = 'rank-col';
        if (header.toLowerCase() === 'percentage') thClass = 'percentage-col';
        if (header.toLowerCase() === 'name') thClass = 'name-col'; // Assuming 'Name' might need special styling
        tableHTML += `<th class="${thClass}">${headerText}</th>`;
    });
    tableHTML += '</tr></thead>';

    tableHTML += '<tbody>';
    studentResults.forEach(student => {
        tableHTML += '<tr>';
        headers.forEach(header => {
            let tdClass = '';
            let headerTextForDataLabel = header.replace(/([A-Z](?=[a-z]))|([A-Z]+(?=[A-Z][a-z]|\b))/g, ' $1$2').trim();
            headerTextForDataLabel = headerTextForDataLabel.charAt(0).toUpperCase() + headerTextForDataLabel.slice(1);

            if (header.toLowerCase() === 'rank') tdClass = 'rank-col';
            if (header.toLowerCase() === 'percentage') tdClass = 'percentage-col';
            if (header.toLowerCase() === 'name') tdClass = 'name-col';
            tableHTML += `<td data-label="${headerTextForDataLabel}" class="${tdClass}">${student[header] !== null && student[header] !== undefined ? student[header] : '-'}</td>`;
        });
        tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';

    container.innerHTML = tableHTML;
}