import { SignUp } from "@clerk/nextjs"


export default function SignUpPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-blue-500">
        <SignUp />
    </div>
  )
}
