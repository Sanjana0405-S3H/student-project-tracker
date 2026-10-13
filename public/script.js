const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const message = document.querySelector('#message');

// Holds projects fetched from the server.
const projects = [];

let editingId = null;

// Displays feedback without interpreting it as HTML.
function showMessage(text) {
  if (message) {
    message.textContent = text;
  }
}

// Resets the form to Add mode.
function resetForm() {
  form.reset();
  editingId = null;
  saveButton.textContent = 'Save Project';
  cancelButton.hidden = true;
}

// Loads projects from the server API.
async function loadProjects() {
  showMessage('Loading projects...');
  try {
    const response = await fetch('/api/projects');
    if (!response.ok) {
      throw new Error('Failed to load projects.');
    }
    const data = await response.json();
    projects.length = 0;
    projects.push(...data);
    renderProjects();
    showMessage('');
  } catch (error) {
    showMessage('Could not connect to the server to load projects.');
  }
}

// Loads an existing project into the form for editing.
function editProject(id) {
  const project = projects.find(p => p.id === id);

  if (!project) {
    return;
  }

  editingId = project.id;
  nameInput.value = project.name;
  statusInput.value = project.status;

  saveButton.textContent = 'Save changes';
  cancelButton.hidden = false;

  showMessage('');
  nameInput.focus();
}

// Deletes a project via API after confirmation.
async function deleteProject(id) {
  const project = projects.find(p => p.id === id);

  if (!project) {
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete "${project.name}"?`
  );

  if (!confirmed) {
    return;
  }

  showMessage('Deleting project...');
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to delete project.');
    }

    if (editingId === id) {
      resetForm();
    }

    await loadProjects();
    showMessage('Project deleted successfully.');
  } catch (error) {
    showMessage(error.message || 'Could not connect to the server.');
  }
}

// Displays every project and its action buttons.
function renderProjects() {
  projectList.textContent = '';

  projects.forEach(project => {
    const listItem = document.createElement('li');

    const projectName = document.createElement('span');
    projectName.textContent = project.name;

    const projectStatus = document.createElement('span');
    projectStatus.textContent = ` - ${project.status} `;

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Edit';

    editButton.addEventListener('click', () => {
      editProject(project.id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';

    deleteButton.addEventListener('click', () => {
      deleteProject(project.id);
    });

    listItem.appendChild(projectName);
    listItem.appendChild(projectStatus);
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);

    projectList.appendChild(listItem);
  });

  if (emptyState) {
    emptyState.hidden = projects.length > 0;
  }
}

// Handles both Add (POST) and Edit (PUT) submissions.
form.addEventListener('submit', async event => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const status = statusInput.value;

  if (name === '') {
    nameInput.value = '';
    nameInput.focus();
    showMessage('Project name cannot be empty.');
    return;
  }

  const payload = { name, status };

  if (editingId !== null) {
    showMessage('Saving changes...');
    try {
      const response = await fetch(`/api/projects/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update project.');
      }

      await loadProjects();
      resetForm();
      showMessage('Project updated successfully.');
    } catch (error) {
      showMessage(error.message || 'Could not connect to the server.');
    }
  } else {
    showMessage('Saving project...');
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create project.');
      }

      await loadProjects();
      resetForm();
      showMessage('Project created successfully.');
    } catch (error) {
      showMessage(error.message || 'Could not connect to the server.');
    }
  }
});

// Cancel editing without changing records.
cancelButton.addEventListener('click', () => {
  resetForm();
  showMessage('');
});

// Initial load from the API.
loadProjects();