import { makeLocalApi } from './api.local.js'
import { makeSupabaseApi } from './api.supabase.js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// With Supabase keys in .env the app is a real multi-user LMS.
// Without them it runs in demo mode so you can click through everything.
export const api = url && key ? makeSupabaseApi(url, key) : makeLocalApi()
export const isDemo = api.mode === 'demo'
