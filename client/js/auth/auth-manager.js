import { startChatSession } from "../flow-manager.js";

const GUEST_INTERNAL_KEY = 'GUEST_USER';

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
  const loginForm = document.getElementById('login-form');
  const guestButton = document.getElementById('login-guest');
  const usernameButton = document.querySelector('.login-username-button');

  if (loginForm) loginForm.addEventListener('submit', handleLoginUsername);
  if (usernameButton) usernameButton.addEventListener('click', handleLoginUsername);
  if (guestButton) guestButton.addEventListener('click', handleLoginGuest);
};