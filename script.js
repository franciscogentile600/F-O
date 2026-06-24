// ─── Navigation scroll behavior ────────────────────────────────────────
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ─── Mobile menu ────────────────────────────────────────────────────────
const navToggle    = document.getElementById('navToggle');
const mobileMenu   = document.getElementById('mobileMenu');
const mobileClose  = document.getElementById('mobileClose');
const mobileOverlay = document.getElementById('mobileOverlay');

function openMenu() {
  mobileMenu.classList.add('open');
  mobileOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  mobileMenu.classList.remove('open');
  mobileOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

if (navToggle)     navToggle.addEventListener('click', openMenu);
if (mobileClose)   mobileClose.addEventListener('click', closeMenu);
if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);

document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// ─── Scroll reveal ──────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseFloat(el.dataset.delay || 0);
        setTimeout(() => el.classList.add('visible'), delay);
        revealObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

// Stagger sibling reveals
document.querySelectorAll('.reveal').forEach((el, index) => {
  const siblings = el.parentElement.querySelectorAll('.reveal');
  let delay = 0;
  siblings.forEach((sib, sibIndex) => {
    if (sib === el) delay = sibIndex * 80;
  });
  el.dataset.delay = delay;
  revealObserver.observe(el);
});

// ─── Form validation & submission ───────────────────────────────────────
const form        = document.getElementById('estimateForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn   = document.getElementById('submitBtn');

function validateField(id, errorId, test, msg) {
  const field = document.getElementById(id);
  const error = document.getElementById(errorId);
  if (!field || !error) return true;
  const valid = test(field.value.trim());
  error.textContent = valid ? '' : msg;
  field.classList.toggle('error', !valid);
  return valid;
}

function validateForm() {
  const nameOk = validateField('name', 'nameError',
    v => v.length >= 2, 'Please enter your full name.');
  const emailOk = validateField('email', 'emailError',
    v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Please enter a valid email address.');
  const phoneOk = validateField('phone', 'phoneError',
    v => v.replace(/\D/g, '').length >= 10, 'Please enter a valid phone number.');
  const addressOk = validateField('address', 'addressError',
    v => v.length >= 5, 'Please enter your property address.');
  const serviceOk = validateField('service', 'serviceError',
    v => v !== '', 'Please select a service.');
  return nameOk && emailOk && phoneOk && addressOk && serviceOk;
}

// Inline validation on blur
['name', 'email', 'phone', 'address', 'service'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('blur', () => {
    const errorId = id + 'Error';
    const validators = {
      name:    [v => v.length >= 2,                             'Please enter your full name.'],
      email:   [v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),    'Please enter a valid email address.'],
      phone:   [v => v.replace(/\D/g, '').length >= 10,        'Please enter a valid phone number.'],
      address: [v => v.length >= 5,                             'Please enter your property address.'],
      service: [v => v !== '',                                  'Please select a service.'],
    };
    if (validators[id]) {
      const [test, msg] = validators[id];
      validateField(id, errorId, test, msg);
    }
  });
});

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Disable button & show loading state
    submitBtn.disabled = true;
    const btnText = submitBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    btnText.textContent = 'Sending…';

    // ── Collect form values ───────────────────────────────────────────────
    const clientName    = document.getElementById('name').value.trim();
    const clientEmail   = document.getElementById('email').value.trim();
    const clientPhone   = document.getElementById('phone').value.trim();
    const clientAddress = document.getElementById('address').value.trim();
    const clientService = document.getElementById('service').value;
    const clientMessage = document.getElementById('message').value.trim();

    // ── Send form data via FormSubmit to Francisco's email ───────────────
    try {
      const response = await fetch('https://formsubmit.co/ajax/genfran600@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `New Estimate Request from ${clientName}`,
          Name: clientName,
          Email: clientEmail,
          Phone: clientPhone,
          Address: clientAddress,
          Service: clientService,
          Message: clientMessage || '(no additional details)'
        })
      });
      if (!response.ok) throw new Error('Network response was not ok');

      // ── Success: show confirmation ─────────────────────────────────────
      form.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      form.style.opacity    = '0';
      form.style.transform  = 'translateY(12px)';

      setTimeout(() => {
        form.hidden        = true;
        formSuccess.hidden = false;
        formSuccess.style.opacity   = '0';
        formSuccess.style.transform = 'translateY(12px)';
        formSuccess.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        requestAnimationFrame(() => requestAnimationFrame(() => {
          formSuccess.style.opacity   = '1';
          formSuccess.style.transform = 'none';
        }));
      }, 400);

    } catch (err) {
      // ── Error: re-enable button with friendly message ──────────────────
      console.error('EmailJS error:', err);
      btnText.textContent  = 'Failed to send. Try again.';
      submitBtn.disabled   = false;
      submitBtn.style.background = '#c0392b';
      setTimeout(() => {
        btnText.textContent        = originalText;
        submitBtn.style.background = '';
      }, 3000);
    }
  });
}

// ─── Smooth anchor scrolling with nav offset ─────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const id = anchor.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const navH = nav ? nav.offsetHeight : 72;
    const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
