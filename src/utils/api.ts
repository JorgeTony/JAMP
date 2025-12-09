/**
 * Utilidad para realizar peticiones HTTP con autenticación JWT
 * Centraliza la lógica de headers y manejo de tokens
 */

const API_BASE_URL = 'http://localhost:8080';

/**
 * Obtiene los headers con el token JWT del usuario autenticado
 */
export const getAuthHeaders = (): HeadersInit => {
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    return {
      'Content-Type': 'application/json',
    };
  }

  try {
    const user = JSON.parse(userStr);
    const token = user.token;

    if (!token) {
      console.warn('No se encontró token en el usuario almacenado');
      return {
        'Content-Type': 'application/json',
      };
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  } catch (error) {
    console.error('Error al parsear datos de usuario:', error);
    return {
      'Content-Type': 'application/json',
    };
  }
};

/**
 * Realiza una petición GET con autenticación
 */
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  // Si la respuesta es 401 (No autorizado), redirigir al login
  if (response.status === 401) {
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
  }

  return response;
};

/**
 * Realiza una petición GET con autenticación y retorna JSON
 */
export const getWithAuth = async <T = any>(endpoint: string): Promise<T> => {
  const response = await fetchWithAuth(endpoint, { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg =
      errorData.error ||
      errorData.message ||
      `Error ${response.status}: ${response.statusText}`;
    throw new Error(msg);
  }

  return response.json();
};
/**
 * Realiza una petición POST con autenticación
 */
export const postWithAuth = async <T = any>(endpoint: string, data: any): Promise<T> => {
  const response = await fetchWithAuth(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg =
      errorData.error ||
      errorData.message ||
      `Error ${response.status}: ${response.statusText}`;
    throw new Error(msg);
  }

  return response.json();
};

/**
 * Realiza una petición PUT con autenticación
 */
export const putWithAuth = async <T = any>(endpoint: string, data: any): Promise<T> => {
  const response = await fetchWithAuth(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg =
      errorData.error ||
      errorData.message ||
      `Error ${response.status}: ${response.statusText}`;
    throw new Error(msg);
  }

  return response.json();
};


/**
 * Realiza una petición DELETE con autenticación
 */
export const deleteWithAuth = async (endpoint: string): Promise<void> => {
  const response = await fetchWithAuth(endpoint, { method: 'DELETE' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg =
      errorData.error ||
      errorData.message ||
      `Error ${response.status}: ${response.statusText}`;
    throw new Error(msg);
  }
};

/**
 * Verifica si el usuario está autenticado
 */
export const isAuthenticated = (): boolean => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return false;

  try {
    const user = JSON.parse(userStr);
    return !!user.token;
  } catch {
    return false;
  }
};

/**
 * Obtiene el usuario actual del localStorage
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export default {
  getAuthHeaders,
  fetchWithAuth,
  getWithAuth,
  postWithAuth,
  putWithAuth,
  deleteWithAuth,
  isAuthenticated,
  getCurrentUser,
};
