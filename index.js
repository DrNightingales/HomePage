let isEditMode = false;
let currentConfig = {};

// Toggle edit mode
function toggleEditMode() {
    isEditMode = !isEditMode;
    document.body.classList.toggle('edit-mode', isEditMode);
    document.getElementById('saveBtn').style.display = isEditMode ? 'inline-block' : 'none';
    document.getElementById('toggleEditBtn').textContent = isEditMode ? 'Exit Edit Mode' : 'Edit Mode';
    renderDashboard();
}

// Update the saveConfig function to handle errors
async function saveConfig() {
    try {
        const response = await fetch('/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentConfig)
        });

        if (!response.ok) throw new Error('Save failed');
        alert('Configuration saved successfully!');
    } catch (error) {
        alert('Error saving configuration: ' + error.message);
    }
}

// Fetch and render config
async function loadConfig() {
    const response = await fetch('/config');
    currentConfig = await response.json();
    renderDashboard();
}

// Render the dashboard
function renderDashboard() {
    const container = document.getElementById('columns');
    container.innerHTML = '';

    currentConfig.columns.forEach((column, colIndex) => {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'column';

        // Add column controls
        if (isEditMode) {
            const colControls = document.createElement('div');
            colControls.innerHTML = `
                <button onclick="addSection(${colIndex})">+ Section</button>
                <button onclick="deleteColumn(${colIndex})">×</button>
            `;
            columnDiv.appendChild(colControls);
        }

        column.sections.forEach((section, secIndex) => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'section';

            // Section header with controls
            const heading = document.createElement('h2');
            if (isEditMode) {
                heading.innerHTML = `
                    <input value="${section.title}" 
                           onchange="updateSectionTitle(${colIndex}, ${secIndex}, this.value)">
                    <div class="edit-controls">
                        <button onclick="deleteSection(${colIndex}, ${secIndex})">×</button>
                    </div>
                `;
            } else {
                heading.textContent = section.title;
            }

            // Links list
            const linksList = document.createElement('ul');
            linksList.className = 'links';

            section.links.forEach((link, linkIndex) => {
                const listItem = document.createElement('li');
                if (isEditMode) {
                    listItem.innerHTML = `
            <input value="${link.name}" 
                   onchange="updateLinkName(${colIndex}, ${secIndex}, ${linkIndex}, this.value)">
            <input value="${link.url}" 
                   onchange="updateLinkUrl(${colIndex}, ${secIndex}, ${linkIndex}, this.value)">
            <input value="${link.favicon}" 
                   onchange="updateLinkFavicon(${colIndex}, ${secIndex}, ${linkIndex}, this.value)">
            <button onclick="deleteLink(${colIndex}, ${secIndex}, ${linkIndex})">×</button>
        `;
                } else {
                    const anchor = document.createElement('a');
                    anchor.href = link.url;

                    // Create favicon image
                    const favicon = document.createElement('img');
                    favicon.className = 'favicon';
                    favicon.alt = '';
                    favicon.src = link.favicon;

                    anchor.appendChild(favicon);
                    anchor.appendChild(document.createTextNode(link.name));
                    listItem.appendChild(anchor);
                }
                linksList.appendChild(listItem);
            });


            // Add link button
            if (isEditMode) {
                const addLinkBtn = document.createElement('button');
                addLinkBtn.textContent = '+ Add Link';
                addLinkBtn.onclick = () => addLink(colIndex, secIndex);
                linksList.appendChild(addLinkBtn);
            }

            sectionDiv.appendChild(heading);
            sectionDiv.appendChild(linksList);
            columnDiv.appendChild(sectionDiv);
        });

        container.appendChild(columnDiv);
    });

    // Add column button
    if (isEditMode) {
        const addColBtn = document.createElement('button');
        addColBtn.textContent = '+ Add Column';
        addColBtn.onclick = addColumn;
        container.appendChild(addColBtn);
    }
}
function updateLinkFavicon(colIndex, secIndex, linkIndex, value) {
    currentConfig.columns[colIndex].sections[secIndex].links[linkIndex].favicon = value;
}
// Data manipulation functions
function addColumn() {
    currentConfig.columns.push({ sections: [] });
    renderDashboard();
}

function deleteColumn(colIndex) {
    currentConfig.columns.splice(colIndex, 1);
    renderDashboard();
}

function addSection(colIndex) {
    currentConfig.columns[colIndex].sections.push({
        title: "New Section",
        links: []
    });
    renderDashboard();
}

function deleteSection(colIndex, secIndex) {
    currentConfig.columns[colIndex].sections.splice(secIndex, 1);
    renderDashboard();
}

function addLink(colIndex, secIndex) {
    currentConfig.columns[colIndex].sections[secIndex].links.push({
        name: "New Link",
        url: "",
        favicon: ""
    });
    renderDashboard();
}

function updateSectionTitle(colIndex, secIndex, value) {
    currentConfig.columns[colIndex].sections[secIndex].title = value;
}

function updateLinkName(colIndex, secIndex, linkIndex, value) {
    currentConfig.columns[colIndex].sections[secIndex].links[linkIndex].name = value;
}

function updateLinkUrl(colIndex, secIndex, linkIndex, value) {
    currentConfig.columns[colIndex].sections[secIndex].links[linkIndex].url = value;
}

function deleteLink(colIndex, secIndex, linkIndex) {
    currentConfig.columns[colIndex].sections[secIndex].links.splice(linkIndex, 1);
    renderDashboard();
}

// Save configuration
async function saveConfig() {
    await fetch('/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentConfig)
    });
    alert('Configuration saved!');
}

// Initialize
loadConfig();