import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth-config"

export const auth = () => getServerSession(authConfig)

