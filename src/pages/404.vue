<template>
  <div class="notfound-page">
    <p class="notfound-code">404</p>
    <h1 class="notfound-title">Page not found</h1>
    <p class="notfound-desc">The page you're looking for doesn't exist or was moved.</p>
    <router-link to="/dashboard" class="btn-primary">Go to Dashboard</router-link>
  </div>
</template>

<style scoped>
.notfound-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 2rem;
  background: var(--bg-app);
}

.notfound-code {
  font-size: 6rem;
  font-weight: 800;
  color: var(--border-color);
  margin: 0;
  line-height: 1;
}

.notfound-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0.5rem 0 0.5rem;
}

.notfound-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 1.5rem;
}

.btn-primary {
  padding: 0.625rem 1.5rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: opacity 0.15s;
}

.btn-primary:hover { opacity: 0.9; }
</style>
