// ==================== HELPER FUNCTIONS ====================
function $(id) { return document.getElementById(id); }

function showMessage(type, message) {
  const el = $('formMessage');
  if (!el) return;
  
  el.className = 'mb-6 rounded-2xl border px-4 py-3 text-sm whitespace-pre-line';
  el.classList.remove('hidden');
  
  if (type === 'success') {
    el.classList.add('border-emerald-200', 'bg-emerald-50', 'text-emerald-900');
  } else if (type === 'info') {
    el.classList.add('border-amber-200', 'bg-amber-50', 'text-amber-900');
  } else {
    el.classList.add('border-rose-200', 'bg-rose-50', 'text-rose-900');
  }
  
  el.textContent = message;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearMessage() {
  const el = $('formMessage');
  if (!el) return;
  el.textContent = '';
  el.classList.add('hidden');
}

async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };
  
  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
    return null;
  }
  
  return response;
}

// ==================== DATA LOADING ====================
async function loadResources() {
  try {
    const response = await fetchWithAuth('/api/resources');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    const resources = Array.isArray(data.data) ? data.data : [];
    
    const select = $('resourceId');
    select.innerHTML = '<option value="">Select a resource</option>';
    
    resources.forEach(resource => {
      const option = document.createElement('option');
      option.value = resource.id;
      option.textContent = `${resource.name} (ID: ${resource.id})`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('Failed to load resources:', err);
  }
}

async function loadReservations() {
  try {
    const response = await fetchWithAuth('/api/reservations');
    if (!response) return;
    
    if (!response.ok) {
      $('reservationsList').innerHTML = '<div class="text-center text-gray-500 py-8">Failed to load reservations</div>';
      return;
    }
    
    const data = await response.json();
    const reservations = Array.isArray(data.data) ? data.data : [];
    
    if (reservations.length === 0) {
      $('reservationsList').innerHTML = '<div class="text-center text-gray-500 py-8">No reservations found</div>';
      return;
    }
    
    $('reservationsList').innerHTML = reservations.map(res => `
      <div class="reservation-item border border-black/10 rounded-2xl p-4 hover:bg-gray-50 cursor-pointer transition" data-reservation='${JSON.stringify(res)}'>
        <div class="flex justify-between items-start">
          <div>
            <div class="font-semibold">Reservation #${res.id}</div>
            <div class="text-sm text-gray-600 mt-1">Resource ID: ${res.resourceId}</div>
            <div class="text-sm text-gray-600">User ID: ${res.userId}</div>
            <div class="text-sm text-gray-600">${new Date(res.startTime).toLocaleString()} - ${new Date(res.endTime).toLocaleString()}</div>
            ${res.note ? `<div class="text-sm text-gray-500 mt-1">"${res.note}"</div>` : ''}
          </div>
          <span class="px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(res.status)}">${res.status}</span>
        </div>
      </div>
    `).join('');
    
    document.querySelectorAll('.reservation-item').forEach(item => {
      item.addEventListener('click', () => {
        const reservation = JSON.parse(item.dataset.reservation);
        fillFormForEdit(reservation);
      });
    });
    
  } catch (err) {
    console.error('Failed to load reservations:', err);
    $('reservationsList').innerHTML = '<div class="text-center text-gray-500 py-8">Error loading reservations</div>';
  }
}

function getStatusBadgeClass(status) {
  switch(status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// ==================== FORM HANDLING ====================
function getFormData() {
  return {
    id: $('reservationId')?.value || '',
    resourceId: parseInt($('resourceId')?.value) || 0,
    userId: parseInt($('userId')?.value) || 0,
    startTime: $('startTime')?.value ? new Date($('startTime').value).toISOString() : '',
    endTime: $('endTime')?.value ? new Date($('endTime').value).toISOString() : '',
    note: $('note')?.value || '',
    status: $('status')?.value || 'active'
  };
}

function validateForm(data) {
  if (!data.resourceId) return 'Please select a resource';
  if (!data.userId) return 'Please select a user';
  if (!data.startTime) return 'Start time is required';
  if (!data.endTime) return 'End time is required';
  if (new Date(data.startTime) >= new Date(data.endTime)) {
    return 'End time must be after start time';
  }
  return null;
}

function clearForm() {
  $('reservationId').value = '';
  $('resourceId').value = '';
  $('userId').value = '1';
  $('startTime').value = '';
  $('endTime').value = '';
  $('note').value = '';
  $('status').value = 'active';
  
  // Show create mode buttons, hide edit mode buttons
  $('createModeButtons').classList.remove('hidden');
  $('editModeButtons').classList.add('hidden');
  $('formTitle').textContent = 'Create New Reservation';
  
  clearMessage();
}

function fillFormForEdit(reservation) {
  $('reservationId').value = reservation.id;
  $('resourceId').value = reservation.resourceId;
  $('userId').value = reservation.userId;
  
  // Format dates for datetime-local input
  if (reservation.startTime) {
    const startDate = new Date(reservation.startTime);
    $('startTime').value = startDate.toISOString().slice(0, 16);
  }
  if (reservation.endTime) {
    const endDate = new Date(reservation.endTime);
    $('endTime').value = endDate.toISOString().slice(0, 16);
  }
  
  $('note').value = reservation.note || '';
  $('status').value = reservation.status || 'active';
  
  // Show edit mode buttons, hide create mode buttons
  $('createModeButtons').classList.add('hidden');
  $('editModeButtons').classList.remove('hidden');
  $('formTitle').textContent = 'Edit Reservation';
  
  clearMessage();
}

// ==================== API OPERATIONS ====================
async function createReservation(data) {
  const response = await fetchWithAuth('/api/reservations', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (!response) return false;
  
  if (response.status === 201) {
    showMessage('success', `✅ Reservation created successfully!`);
    clearForm();
    await loadReservations();
    return true;
  } else {
    const error = await response.json().catch(() => ({}));
    showMessage('error', error.message || 'Failed to create reservation');
    return false;
  }
}

async function updateReservation(id, data) {
  const response = await fetchWithAuth(`/api/reservations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  
  if (!response) return false;
  
  if (response.ok) {
    showMessage('success', `✅ Reservation updated successfully!`);
    clearForm();
    await loadReservations();
    return true;
  } else {
    const error = await response.json().catch(() => ({}));
    showMessage('error', error.message || 'Failed to update reservation');
    return false;
  }
}

async function deleteReservation(id) {
  if (!confirm('Are you sure you want to delete this reservation?')) return false;
  
  const response = await fetchWithAuth(`/api/reservations/${id}`, {
    method: 'DELETE'
  });
  
  if (!response) return false;
  
  if (response.status === 204 || response.ok) {
    showMessage('success', `✅ Reservation deleted successfully!`);
    clearForm();
    await loadReservations();
    return true;
  } else {
    const error = await response.json().catch(() => ({}));
    showMessage('error', error.message || 'Failed to delete reservation');
    return false;
  }
}

// ==================== EVENT HANDLERS ====================
async function handleSubmit(e) {
  e.preventDefault();
  
  // Determine which button was clicked
  const submitter = e.submitter;
  const action = submitter?.value || 'create';
  
  const data = getFormData();
  
  // Validate
  const validationError = validateForm(data);
  if (validationError) {
    showMessage('error', validationError);
    return;
  }
  
  // Remove id from data for create
  const { id, ...createData } = data;
  
  if (action === 'create') {
    await createReservation(createData);
  } else if (action === 'update') {
    if (!data.id) {
      showMessage('error', 'Missing reservation ID');
      return;
    }
    await updateReservation(data.id, createData);
  }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }
  
  // Load dropdown data
  await Promise.all([
    loadResources(),
    loadReservations()
  ]);
  
  // Setup form submission
  $('reservationForm').addEventListener('submit', handleSubmit);
  
  // Setup buttons
  $('clearBtn').addEventListener('click', clearForm);
  
  $('deleteBtn').addEventListener('click', async () => {
    const id = $('reservationId').value;
    if (!id) {
      showMessage('error', 'No reservation selected');
      return;
    }
    await deleteReservation(id);
  });
  
  $('cancelEditBtn').addEventListener('click', clearForm);
  
  $('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
  });
});