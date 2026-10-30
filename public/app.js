const form = document.getElementById("studentForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const departmentInput = document.getElementById("department");
const yearInput = document.getElementById("year");
const tableBody = document.getElementById("studentTable");
const tableWrap = document.getElementById("tableWrap");
const loading = document.getElementById("loading");
const emptyState = document.getElementById("emptyState");
const formMessage = document.getElementById("formMessage");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");
const searchInput = document.getElementById("searchInput");
let students = [];
let editingId = null;

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

function setMessage(message, success = false) {
  formMessage.textContent = message;
  formMessage.classList.toggle("success", success);
}

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function renderStudents() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = students.filter(student =>
    [student.name, student.email, student.department, String(student.year)]
      .some(value => String(value).toLowerCase().includes(query))
  );

  document.getElementById("totalCount").textContent = students.length;
  document.getElementById("departmentCount").textContent =
    new Set(students.map(student => student.department)).size;

  tableBody.innerHTML = filtered.map(student => `
    <tr>
      <td><div class="student-cell">
        <div class="avatar">${escapeHtml(initials(student.name))}</div>
        <div><div class="student-name">${escapeHtml(student.name)}</div>
        <div class="student-email">${escapeHtml(student.email)}</div></div>
      </div></td>
      <td><div class="dept">${escapeHtml(student.department)}</div></td>
      <td><span class="year-pill">${student.year}${student.year === 1 ? "st" : student.year === 2 ? "nd" : student.year === 3 ? "rd" : "th"} Year</span></td>
      <td><div class="actions">
        <button class="action-btn" data-action="edit" data-id="${student._id}" aria-label="Edit ${escapeHtml(student.name)}">✎ Edit</button>
        <button class="action-btn delete" data-action="delete" data-id="${student._id}" aria-label="Delete ${escapeHtml(student.name)}">×</button>
      </div></td>
    </tr>`).join("");

  loading.classList.add("hidden");
  tableWrap.classList.toggle("hidden", filtered.length === 0);
  emptyState.classList.toggle("hidden", filtered.length !== 0);
  emptyState.innerHTML = query
    ? '<div class="empty-icon">⌕</div><strong>No matching students</strong><p>Try another name, email or department.</p>'
    : '<div class="empty-icon">▤</div><strong>No student records yet</strong><p>Add your first student using the form.</p>';
  document.getElementById("listFoot").textContent =
    `Showing ${filtered.length} of ${students.length} student record${students.length === 1 ? "" : "s"} · Stored in MongoDB`;
}

async function loadStudents() {
  loading.classList.remove("hidden");
  tableWrap.classList.add("hidden");
  emptyState.classList.add("hidden");
  try {
    students = await api("/api/students");
    renderStudents();
  } catch (error) {
    loading.textContent = `${error.message} Check the server and MongoDB connection, then refresh.`;
  }
}

function resetForm() {
  form.reset();
  editingId = null;
  document.getElementById("formTitle").textContent = "Add a student";
  document.getElementById("formBadge").textContent = "NEW";
  submitButton.textContent = "＋ Add student";
  cancelButton.classList.add("hidden");
  setMessage("");
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    department: departmentInput.value,
    year: Number(yearInput.value)
  };
  submitButton.disabled = true;
  submitButton.textContent = editingId ? "Saving…" : "Adding…";
  try {
    await api(editingId ? `/api/students/${editingId}` : "/api/students", {
      method: editingId ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    const wasEditing = Boolean(editingId);
    resetForm();
    setMessage(wasEditing ? "Student updated successfully." : "Student added successfully.", true);
    await loadStudents();
  } catch (error) {
    setMessage(error.message);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = editingId ? "Save changes" : "＋ Add student";
  }
});

tableBody.addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const student = students.find(item => item._id === button.dataset.id);
  if (!student) return;

  if (button.dataset.action === "edit") {
    editingId = student._id;
    nameInput.value = student.name;
    emailInput.value = student.email;
    departmentInput.value = student.department;
    yearInput.value = student.year;
    document.getElementById("formTitle").textContent = "Edit student";
    document.getElementById("formBadge").textContent = "EDITING";
    submitButton.textContent = "Save changes";
    cancelButton.classList.remove("hidden");
    setMessage("");
    document.querySelector(".form-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (button.dataset.action === "delete") {
    if (!confirm(`Delete ${student.name}'s record? This cannot be undone.`)) return;
    try {
      await api(`/api/students/${student._id}`, { method: "DELETE" });
      if (editingId === student._id) resetForm();
      await loadStudents();
      setMessage("Student deleted successfully.", true);
    } catch (error) {
      alert(error.message);
    }
  }
});

cancelButton.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderStudents);
document.getElementById("refreshButton").addEventListener("click", loadStudents);
loadStudents();