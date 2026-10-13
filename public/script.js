
const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const message = document.querySelector('#message');

const STORAGE_KEY = 'workshop-projects-v1';

// Holds projects while the page is running.
const projects = [];

let editingId = null;

// If stored data cannot be read or is malformed,
// prevent changes from overwriting data we could not restore.
let storageBlocked = false;
let storageProblem = '';

// Displays feedback without interpreting it as HTML.
function showMessage(text) {
  if (message) {
    message.textContent = text;
  }
}

// Generates a unique ID for each new project.
function generateProjectId() {
  return crypto.randomUUID();
}

// Checks that stored records have the expected structure.
function isValidProjectArray(data) {
  return (
    Array.isArray(data) &&
    data.every(project =>
      project !== null &&
      typeof project === 'object' &&
      !Array.isArray(project) &&
      typeof project.id === 'string' &&
      project.id.length > 0 &&
      typeof project.name === 'string' &&
      project.name.trim() !== '' &&
      typeof project.status === 'string' &&
      ['Planned', 'In Progress', 'Completed'].includes(project.status)
    ) &&
    new Set(data.map(project => project.id)).size === data.length
  );
}

// Loads projects from localStorage when the page starts.
function loadProjects() {
  let storedText;

  try {
    storedText = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    storageBlocked = true;
    storageProblem =
      'Saved projects could not be read because browser storage is unavailable. No stored data was changed.';
    showMessage(storageProblem);
    return;
  }

  // No saved data means this is a new tracker.
  if (storedText === null) {
    return;
  }

  let storedProjects;

  try {
    // JSON.parse turns stored text back into JavaScript data.
    storedProjects = JSON.parse(storedText);
  } catch (error) {
    storageBlocked = true;
    storageProblem =
      'Saved project data is invalid JSON. It has been left unchanged. Fix or remove the stored data before making changes.';
    showMessage(storageProblem);
    return;
  }

  if (!isValidProjectArray(storedProjects)) {
    storageBlocked = true;
    storageProblem =
      'Saved project data has an invalid structure. It has been left unchanged. Fix or remove the stored data before making changes.';
    showMessage(storageProblem);
    return;
  }

  projects.push(...storedProjects);
}

// Saves the current projects array to localStorage.
function saveProjects() {
  if (storageBlocked) {
    showMessage(storageProblem);
    return false;
  }

  try {
    // JSON.stringify turns the array into storable text.
    const storedText = JSON.stringify(projects);
    localStorage.setItem(STORAGE_KEY, storedText);

    showMessage('Changes saved in this browser.');
    return true;
  } catch (error) {
    showMessage(
      'Changes could not be saved to browser storage. They are currently visible only in this session.'
    );
    return false;
  }
}

// Resets the form to Add mode.
function resetForm() {
  form.reset();
  editingId = null;
  saveButton.textContent = 'Save Project';
  cancelButton.hidden = true;
}

// Loads an existing project into the form.
function editProject(id) {
  if (storageBlocked) {
    showMessage(storageProblem);
    return;
  }

  const project = projects.find(project => project.id === id);

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

// Deletes a project after confirmation.
function deleteProject(id) {
  if (storageBlocked) {
    showMessage(storageProblem);
    return;
  }

  const project = projects.find(project => project.id === id);

  if (!project) {
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete "${project.name}"?`
  );

  // Cancelling leaves the collection and storage unchanged.
  if (!confirmed) {
    return;
  }

  const projectIndex = projects.findIndex(
    project => project.id === id
  );

  if (projectIndex === -1) {
    return;
  }

  projects.splice(projectIndex, 1);

  // Reset the form if the deleted project was being edited.
  if (editingId === id) {
    resetForm();
  }

  renderProjects();
  saveProjects();
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

// One submit listener handles both Add and Edit.
form.addEventListener('submit', event => {
  event.preventDefault();

  if (storageBlocked) {
    showMessage(storageProblem);
    return;
  }

  const name = nameInput.value.trim();
  const status = statusInput.value;

  if (name === '') {
    nameInput.value = '';
    nameInput.focus();
    showMessage('Project name cannot be empty.');
    return;
  }

  if (editingId !== null) {
    const project = projects.find(
      project => project.id === editingId
    );

    if (!project) {
      resetForm();
      renderProjects();
      showMessage('The project could not be found.');
      return;
    }

    // Update the existing record without changing its ID.
    project.name = name;
    project.status = status;
  } else {
    // Add a new project.
    projects.push({
      id: generateProjectId(),
      name: name,
      status: status
    });
  }

  renderProjects();
  resetForm();

  // Save only after a successful Add or Edit.
  saveProjects();
});

// Cancel editing without changing stored records.
cancelButton.addEventListener('click', () => {
  resetForm();
  showMessage('');
});

// Restore saved projects before displaying the initial list.
loadProjects();
renderProjects();
