export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="flex min-h-screen flex-1 flex-col">{children}</div>;
}
