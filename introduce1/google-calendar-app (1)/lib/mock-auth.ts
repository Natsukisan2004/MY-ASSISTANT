export interface User {
  id: string
  name: string
  email: string
  image: string
}

export const mockUsers: User[] = [
  {
    id: "1",
    name: "张三",
    email: "zhangsan@gmail.com",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "李四",
    email: "lisi@gmail.com",
    image: "/placeholder.svg?height=40&width=40",
  },
]

export class MockAuthService {
  private static currentUser: User | null = null

  static async signIn(): Promise<User> {
    // Simulate Google OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return a random mock user
    const user = mockUsers[Math.floor(Math.random() * mockUsers.length)]
    this.currentUser = user

    // Store in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("mockUser", JSON.stringify(user))
    }

    return user
  }

  static async signOut(): Promise<void> {
    this.currentUser = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("mockUser")
    }
  }

  static getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mockUser")
      if (stored) {
        this.currentUser = JSON.parse(stored)
        return this.currentUser
      }
    }

    return null
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }
}
