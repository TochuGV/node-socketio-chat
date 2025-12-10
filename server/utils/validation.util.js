export const LIMITS = {
  MESSAGE_MIN_LENGTH: 1,
  MESSAGE_MAX_LENGTH: 500,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  AUDIO_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  AUDIO_MAX_DURATION: 300, // 5 Minutos
  ALLOWED_AUDIO_TYPES: ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/mpeg']
};

export const validateMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return {
      valid: false,
      error: 'Message must be a non-empty string'
    };
  };

  const trimmed = message.trim();

  if (trimmed.length < LIMITS.MESSAGE_MIN_LENGTH) {
    return {
      valid: false,
      error: 'Message is too short'
    };
  };

  if (trimmed.length > LIMITS.MESSAGE_MAX_LENGTH) {
    return {
      valid: false,
      error: `Message is too long (Max ${LIMITS.MESSAGE_MAX_LENGTH} characters)`
    };
  };

  return {
    valid: true,
    value: trimmed
  };
};

export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return {
      valid: false,
      error: 'Username must be a non-empty string'
    };
  };

  const trimmed = username.trim();

  if (trimmed.length < LIMITS.USERNAME_MIN_LENGTH) {
    return {
      valid: false,
      error: `Username too short (Min ${LIMITS.USERNAME_MIN_LENGTH} characters)`
    };
  };

  if (trimmed.length > LIMITS.USERNAME_MAX_LENGTH) {
    return {
      valid: false,
      error: `Username too long (Max ${LIMITS.USERNAME_MAX_LENGTH} characters)`
    };
  };

  const validUsernameRegex = /^[a-zA-Z0-9_ áéíóúñÁÉÍÓÚÑ-]+$/; // Letras, números, espacios, guiones, guiones bajos, y acentos
  if (!validUsernameRegex.test(trimmed)) {
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

  if (!LIMITS.ALLOWED_AUDIO_TYPES.includes(audioType)) {
    return {
      valid: false,
      error: `Audio type "${audioType}" not allowed. Allowed types: ${LIMITS.ALLOWED_AUDIO_TYPES.join(', ')}`
    };
  };

  const audioSizeBytes = (audioBase64.length * 3) / 4;

  if (audioSizeBytes > LIMITS.AUDIO_MAX_SIZE) {
    const maxSizeMB = (LIMITS.AUDIO_MAX_SIZE / (1024 * 1024)).toFixed(1);
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