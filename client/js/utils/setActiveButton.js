export default function setActiveButton(groupSelector, activeId){
  // Locate the target button first
  const activeButton = document.querySelector(activeId);
  if (!activeButton) return; // nothing to do

  // Find the nearest group container that contains this button
  const group = activeButton.closest(groupSelector);
  if (!group) return; // target isn't inside a recognized group; skip

  // Remove active class only inside this group
  const buttons = group.querySelectorAll('.button');
  buttons.forEach(b => b.classList.remove('active-option'));

  // Mark the target button active
  activeButton.classList.add('active-option');
};
