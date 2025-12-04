import { startChatSession } from "../flow-manager.js";

const GUEST_INTERNAL_KEY = 'GUEST_USER';

const handleLoginGoogle = () => {
  window.location.href = '/auth/google';
};

const handleLoginGithub = () => {
  window.location.href = '/auth/github';
};

const handleLoginUsername = (e) => {
  e.preventDefault();
  const usernameInput = document.getElementById('login-username');
  const username = usernameInput.value.trim();
  if (username.length >= 3 && username.length <= 20) startChatSession(username);
  console.warn('Username must be between 3 and 20 characters long');
};

const handleLoginGuest = (e) => {
  e.preventDefault();
  startChatSession(GUEST_INTERNAL_KEY);
};

export const initAuthManager = () => {
  const googleButton = document.getElementById('login-google');
  const githubButton = document.getElementById('login-github');
  const usernameButton = document.querySelector('.login-username-button');
  const loginForm = document.getElementById('login-form');
  const guestButton = document.getElementById('login-guest');

  if (googleButton) googleButton.addEventListener('click', handleLoginGoogle);
  if (githubButton) githubButton.addEventListener('click', handleLoginGithub);
  if (loginForm) loginForm.addEventListener('submit', handleLoginUsername);
  if (usernameButton) usernameButton.addEventListener('click', handleLoginUsername);
  if (guestButton) guestButton.addEventListener('click', handleLoginGuest);
};