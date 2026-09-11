<template>
  <div class="auth-shell">
    <div class="auth-bg">
      <!-- Decorative gradient blobs -->
      <div class="blob blob-1" />
      <div class="blob blob-2" />
    </div>

    <div class="auth-card card">
      <!-- Logo -->
      <div class="auth-logo">
        <div class="logo-mark">
          <span>C</span>
        </div>
        <span class="logo-name">Cepat UI</span>
      </div>

      <!-- Page content (login form, etc.) -->
      <slot />
    </div>

    <p class="auth-footer">
      &copy; {{ new Date().getFullYear() }} Cepat UI. All rights reserved.
    </p>
  </div>
</template>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: var(--bg-app);
  position: relative;
  overflow: hidden;
}

.auth-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.12;
}

.blob-1 {
  width: 500px;
  height: 500px;
  background: #10b981;
  top: -100px;
  right: -100px;
}

.blob-2 {
  width: 400px;
  height: 400px;
  background: #6366f1;
  bottom: -80px;
  left: -80px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 2rem;
}

.logo-mark {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1rem;
}

.logo-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
}

.auth-footer {
  position: relative;
  z-index: 1;
  margin-top: 1.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
