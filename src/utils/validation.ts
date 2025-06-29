export const validatePhone = (phone: string): boolean => {
  return /^\d{8}$/.test(phone);
};

export const validateCI = (ci: string): boolean => {
  const ciRegex = /^\d{7,8}(sc|lp|bn|tj|or|ch|cb|pt|pn)$/i;
  return ciRegex.test(ci);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        // Simulate location for demo purposes
        resolve({
          latitude: -17.7833,
          longitude: -63.1821
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
};