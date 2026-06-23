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
  classList.toggle('error', !valid);
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
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Simulate async submission
    submitBtn.disabled = true;
    const btnText = submitBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    btnText.textContent = 'Sending…';

    setTimeout(() => {
      form.style.display = 'none';
      form.hidden = false;

      // Animate success in
      form.style.opacity = '0';
      form.style.transform = 'translateY(16px)';
      form.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          form.style.opacity = '1';
          form.style.transform = 'none';
        });
      });
    }, 900);
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
