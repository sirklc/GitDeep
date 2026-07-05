import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="flex-1 px-6">
      <AuthForm mode="login" />
    </main>
  );
}
