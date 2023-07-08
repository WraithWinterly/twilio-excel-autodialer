import Link from "next/link";

export default function Header() {
  return (
    <div className="fixed left-0 right-0 top-0 flex h-12 items-center bg-purple-950/50 px-6 shadow-lg backdrop-blur-md">
      <Link href="/">
        <h4 className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 bg-clip-text text-2xl font-extrabold text-transparent transition-colors duration-300 hover:from-purple-800 hover:via-purple-700 hover:to-purple-500">
          DialFusion
        </h4>
      </Link>
    </div>
  );
}
