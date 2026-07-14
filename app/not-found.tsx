import Link from 'next/link';
export default function NotFound() {
  return <div className="text-center p-8"><h1>404</h1><Link href="/">Home</Link></div>;
}
