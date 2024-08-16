import Link from "next/link";
import Button from "./components/Button";

export default function Home() {
  return (
    <div className="flex-center flex h-screen items-center bg-blue-100">
      <div className="m-auto flex flex-col items-center justify-center">
        <h1 className="text-5xl font-black text-blue-500 mb-5">APPCHAT</h1>
        <p className="mb-10 text-black"> Created by  APPCHAT</p>
        
        <Button as={Link} href="/chat">ENTER CHAT</Button>
        
      </div>
    </div>
  )
};