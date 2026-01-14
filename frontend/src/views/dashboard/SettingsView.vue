<template>
  <div class="settings-view">
    <h1 class="page-title">⚙️ Settings</h1>

    <div class="settings-container">
      <div class="settings-group">
        <h3>Profile</h3>
        <div class="form-group">
          <label>Display Name</label>
          <input v-model="username" class="input-field" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input :value="userStore.user.email" disabled class="input-field disabled" />
        </div>
        <button class="btn btn-save" @click="saveProfile">Save Changes</button>
      </div>

      <div class="settings-group">
        <h3>Preferences</h3>
        <div class="toggle-row">
          <span>Dark Mode</span>
          <div class="toggle-switch active"></div>
        </div>
        <div class="toggle-row">
          <span>Email Notifications</span>
          <div class="toggle-switch"></div>
        </div>
      </div>

      <div class="settings-group danger">
        <h3>Danger Zone</h3>
        <button class="btn btn-danger" @click="userStore.logout()">Log Out</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
const username = ref(userStore.user.username);

const saveProfile = async () => {
  // Логика сохранения через userStore.updateProfile
  await userStore.updateProfile(username.value, userStore.user.avatar);
  alert('Profile updated!');
};
</script>

<style scoped>
.page-title { font-size: 2rem; margin-bottom: 2rem; }
.settings-container { max-width: 600px; }
.settings-group { background: rgba(255,255,255,0.03); padding: 1.5rem; border-radius: 16px; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.05); }
.settings-group h3 { margin-top: 0; color: #8b92a8; margin-bottom: 1.5rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: #d1d5db; }
.input-field { width: 100%; padding: 10px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 8px; }
.input-field.disabled { opacity: 0.5; cursor: not-allowed; }
.btn { padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; }
.btn-save { background: #10b981; color: white; }
.btn-danger { background: rgba(239,68,68,0.2); color: #ef4444; border: 1px solid #ef4444; width: 100%; }
.toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.toggle-switch { width: 40px; height: 20px; background: #333; border-radius: 20px; position: relative; }
.toggle-switch.active { background: #667eea; }
.toggle-switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background: white; border-radius: 50%; transition: 0.3s; }
.toggle-switch.active::after { left: 22px; }
</style>
