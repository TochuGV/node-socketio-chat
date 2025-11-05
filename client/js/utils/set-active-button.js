const setActiveButton = (groupSelector, activeId) => {
  const activeButton = document.querySelector(activeId);
  if (!activeButton) return;
  const group = activeButton.closest(groupSelector);
  if (!group) return;
  const buttons = group.querySelectorAll('.button');
  buttons.forEach(b => b.classList.remove('active-option'));
  activeButton.classList.add('active-option');
};

export default setActiveButton;