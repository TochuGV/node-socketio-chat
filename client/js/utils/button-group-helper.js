import setActiveButton from "./set-active-button.js";

const initSettingsGroup = ({
  buttons,
  groupSelector = '.button-group',
  buttonIdPrefix,
  onSelect,
  getStoredValue,
  defaultValue,
}) => {
  const hasButtons = Object.values(buttons).some(btn => btn !== null && btn !== undefined);
  if (!hasButtons) return;

  const updateActiveButton = (value) => {
    setActiveButton(groupSelector, `#${buttonIdPrefix}-${value}`);
  };

  const storedValue = getStoredValue() || defaultValue;
  if (storedValue) {
    onSelect(storedValue);
    updateActiveButton(storedValue);
  };

  Object.entries(buttons).forEach(([value, button]) => {
    if (!button) return;
    button.addEventListener('click', () => {
      onSelect(value);
      updateActiveButton(value);
    });
  });
};

export default initSettingsGroup;