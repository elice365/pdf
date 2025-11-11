import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" asChild className="hover:bg-surface">
        <Link href="/login">로그인</Link>
      </Button>
      <Button
        asChild
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Link href="/register">무료 가입</Link>
      </Button>
    </div>
  );
}
