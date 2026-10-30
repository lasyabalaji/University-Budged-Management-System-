export interface AuthUser {
  user_id:    number
  username:   string
  role:       'finance' | 'admin' | 'dean' | 'registrar' | 'student'
  student_id: number | null
  staff_id:   number | null
}

const KEY = 'ubms_user'

export const authStore = {
  get: (): AuthUser | null => {
    if (typeof window === 'undefined') return null
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  },
  set: (user: AuthUser) => sessionStorage.setItem(KEY, JSON.stringify(user)),
  clear: () => sessionStorage.removeItem(KEY),
}
