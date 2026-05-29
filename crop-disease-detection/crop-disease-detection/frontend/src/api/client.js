/**
 * Axios API client for the Flask backend.
 *
 * Configure the backend URL with an env var (Vite prefix is `VITE_`):
 *   `frontend/.env`
 *     VITE_API_BASE_URL=http://localhost:5000
 *
 * If unset, we default to `http://localhost:5000` so beginners can run both servers locally.
 */
import axios from 'axios'

const rawBase = import.meta.env.VITE_API_BASE_URL?.trim()
/** @type {string} */
export const API_BASE_URL = rawBase && rawBase.length > 0 ? rawBase : 'http://localhost:5000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  /** First TensorFlow load/predict can be slow; keep this generous while learning. */
  timeout: 120_000,
})

/**
 * @returns {Promise<{ status: string, model_ready: boolean, message: string }>}
 */
export async function fetchHealth() {
  const { data } = await api.get('/api/health')
  return data
}

/**
 * Send an image file to `/api/predict` (multipart field name must be `image`).
 * @param {File} file
 * @returns {Promise<object>}
 */
export async function predictWithImageFile(file) {
  const formData = new FormData()
  formData.append('image', file)

  // Important: do not manually set `Content-Type` for multipart data.
  // The browser must include the correct boundary parameter automatically.
  const { data } = await api.post('/api/predict', formData)

  return data
}

/**
 * Turn Axios (and other) errors into a user-friendly string for the UI.
 * @param {unknown} err
 */
export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data
    if (data && typeof data === 'object' && 'error' in data) {
      return String(data.error)
    }
    if (err.response?.status === 503) {
      return 'Model is not ready yet. Add a trained `.h5` file under backend/model/ (we will generate this in the training step).'
    }
    if (err.code === 'ECONNABORTED') {
      return 'Request timed out. If this is your first prediction, TensorFlow may still be initializing — try again.'
    }
    if (!err.response) {
      return 'Cannot reach the backend. Is Flask running on http://localhost:5000 ?'
    }
    return err.message
  }

  if (err instanceof Error) return err.message
  return fallback
}
