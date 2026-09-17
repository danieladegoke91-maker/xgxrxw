// ============================================
// GLOBAL RISE GRANTS — MAIN APPLICATION LOGIC
// ============================================
// Handles: application submission, tracking ID generation,
// and status lookup via Supabase.
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('applicationForm');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
});

// --------------------------------------------
// GENERATE TRACKING ID
// Format: GRG-XXXXXX (6 random digits)
// --------------------------------------------
function generateTrackingId() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `GRG-${num}`;
}

// --------------------------------------------
// HANDLE APPLICATION SUBMISSION
// --------------------------------------------
async function handleSubmit(e) {
  e.preventDefault();

  const statusBox = document.getElementById('formStatus');
  statusBox.className = 'form-status';
  statusBox.style.display = 'none';

  // Collect form data
  const formData = {
    full_name: document.getElementById('fullName').value.trim(),
    email: document.getElementById('email').value.trim(),
    country: document.getElementById('country').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    business_name: document.getElementById('businessName').value.trim(),
    program: document.getElementById('program').value,
    amount_requested: parseFloat(document.getElementById('amount').value) || 0,
    revenue_estimate: parseFloat(document.getElementById('revenue').value) || 0,
    use_of_funds: document.getElementById('useOfFunds').value.trim(),
    tracking_id: generateTrackingId(),
    status: 'pending',
    created_at: new Date().toISOString()
  };

  // Validate required fields
  if (!formData.full_name || !formData.email || !formData.country ||
      !formData.phone || !formData.business_name || !formData.program ||
      !formData.amount_requested || !formData.use_of_funds) {
    showStatus('error', '⚠️ Please fill in all required fields.');
    return;
  }

  // Check if Supabase is configured
  if (!db) {
    showStatus('error', '⚠️ Database not connected. Check js/config.js');
    return;
  }

  try {
    statusBox.style.display = 'block';
    statusBox.className = 'form-status';
    statusBox.innerText = '⏳ Submitting your application...';

    // Insert into Supabase
    const { data, error } = await db
      .from('applications')
      .insert([formData])
      .select();

    if (error) throw error;

    // Success
    showStatus(
      'success',
      `✅ Application submitted successfully!<br><br>
       Your tracking ID: <strong>${formData.tracking_id}</strong><br>
       Save this — you'll need it to check your status.`
    );

    // Reset form
    document.getElementById('applicationForm').reset();

  } catch (err) {
    console.error('Submission error:', err);
    showStatus('error', `❌ Submission failed: ${err.message || 'Unknown error'}`);
  }
}

// --------------------------------------------
// SHOW STATUS MESSAGE
// --------------------------------------------
function showStatus(type, message) {
  const box = document.getElementById('formStatus');
  box.className = `form-status ${type}`;
  box.innerHTML = message;
  box.style.display = 'block';

  // Auto-scroll to message
  box.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// --------------------------------------------
// TRACK APPLICATION BY TRACKING ID
// --------------------------------------------
async function trackApplication() {
  const input = document.getElementById('trackingInput').value.trim().toUpperCase();
  const resultBox = document.getElementById('trackStatus');

  if (!input) {
    resultBox.className = 'form-status error';
    resultBox.innerText = '⚠️ Please enter your tracking ID.';
    return;
  }

  if (!db) {
    resultBox.className = 'form-status error';
    resultBox.innerText = '⚠️ Database not connected.';
    return;
  }

  try {
    resultBox.className = 'form-status';
    resultBox.innerText = '⏳ Checking status...';

    const { data, error } = await db
      .from('applications')
      .select('tracking_id, status, business_name, created_at')
      .eq('tracking_id', input)
      .single();

    if (error || !data) {
      resultBox.className = 'form-status error';
      resultBox.innerText = `❌ No application found with ID: ${input}`;
      return;
    }

    // Determine status label
    let statusLabel = '⏳ Awaiting Audit';
    let statusColor = '#8a6d1c';

    if (data.status === 'approved') {
      statusLabel = '✅ Approved & Committed';
      statusColor = '#146841';
    } else if (data.status === 'rejected') {
      statusLabel = '❌ Not Approved';
      statusColor = '#c00';
    }

    resultBox.className = 'form-status success';
    resultBox.innerHTML = `
      <strong>Application Found</strong><br><br>
      <strong>Tracking ID:</strong> ${data.tracking_id}<br>
      <strong>Business:</strong> ${data.business_name}<br>
      <strong>Status:</strong> <span style="color:${statusColor}">${statusLabel}</span><br>
      <strong>Submitted:</strong> ${new Date(data.created_at).toLocaleDateString()}
    `;

  } catch (err) {
    console.error('Tracking error:', err);
    resultBox.className = 'form-status error';
    resultBox.innerText = `❌ Error: ${err.message}`;
  }
}