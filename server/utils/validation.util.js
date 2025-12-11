export const VALIDATION_RULES = {
  username: {
    min: 3,
    max: 20,
    regex: /^[a-zA-Z0-9_ áéíóúñÁÉÍÓÚÑ-]+$/ // Letras, números, espacios, guiones, guiones bajos, y acentos
  },
  message: {
    min: 1,
    max: 500
  },
  audio: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/mpeg']
  }
};

export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return {
      valid: false,
      error: 'Username must be a non-empty string'
    };
  };

  const trimmed = username.trim();
  const { min, max, regex } = VALIDATION_RULES.username;

  if (trimmed.length < min) {
    return {
      valid: false,
      error: `Username too short (Min ${min} characters)`
    };
  };

  if (trimmed.length > max) {
    return {
      valid: false,
      error: `Username too long (Max ${max} characters)`
    };
  };

  if (!regex.test(trimmed)) {
    return {
      valid: false,
      error: 'Username contains invalid characters. Only letters, numbers, spaces, hyphens and underscores are allowed.'
    };
  };

  return {
    valid: true,
    value: trimmed
  };
};

export const validateMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return {
      valid: false,
      error: 'Message must be a non-empty string'
    };
  };

  const trimmed = message.trim();
  const { min, max } = VALIDATION_RULES.message;

  if (trimmed.length < min) {
    return {
      valid: false,
      error: 'Message is too short'
    };
  };

  if (trimmed.length > max) {
    return {
      valid: false,
      error: `Message is too long (Max ${max} characters)`
    };
  };

  return {
    valid: true,
    value: trimmed
  };
};

export const validateAudio = (audioBase64, audioType) => {
  if (!audioBase64 || typeof audioBase64 !== 'string') {
    return {
      valid: false,
      error: 'Audio data is invalid or missing'
    };
  };
  
  if (!audioType || typeof audioType !== 'string') {
    return {
      valid: false,
      error: 'Audio type is required'
    };
  };

  const { maxSize, allowedTypes } = VALIDATION_RULES.audio;

  if (!allowedTypes.includes(audioType)) {
    return {
      valid: false,
      error: `Audio type "${audioType}" not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  };

  const padding = (audioBase64.endsWith('==')) ? 2 : (audioBase64.endsWith('=') ? 1 : 0);
  const audioSizeBytes = (audioBase64.length * 3) / 4 - padding;

  if (audioSizeBytes > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    const actualSizeMB = (audioSizeBytes / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Audio file too large (${actualSizeMB}MB). Maximum allowed: ${maxSizeMB}MB`
    };
  };

  return {
    valid: true
  };
};