
const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');

// Stores projects only while the page is open.
const projects = [];

// Generates a unique ID for each new project.
function generateProjectId() {
  return crypto.randomUUID();
}

// Displays all projects in the list.
function renderProjects() {
  projectList.textContent = '';

  projects.forEach(project => {
    const listItem = document.createElement('li');

    const projectName = document.createElement('span');
    projectName.textContent = project.name;

    const projectStatus = document.createElement('span');
    projectStatus.textContent = ` - ${project.status}`;

    listItem.appendChild(projectName);
    listItem.appendChild(projectStatus);
    projectList.appendChild(listItem);
  });

  if (emptyState) {
    emptyState.hidden = projects.length > 0;
  }
}

// Handles adding a new project.
form.addEventListener('submit', event => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const status = statusInput.value;

  if (name === '') {
    nameInput.value = '';
    nameInput.focus();
    return;
  }

  const project = {
    id: generateProjectId(),
    name: name,
    status: status
  };

  projects.push(project);

  renderProjects();

  form.reset();
});
