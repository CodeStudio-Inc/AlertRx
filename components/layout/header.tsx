import { MobileSidebar } from "./sidebar";
import type { UserRole } from "@/lib/types";

interface HeaderProps {
  role: UserRole;
  userName: string;
  userEmail?: string;
  pageTitle?: string;
}

export function Header({ role, userName, userEmail, pageTitle }: HeaderProps) {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <MobileSidebar role={role} userName={userName} userEmail={userEmail} />
        {pageTitle && (
          <h1 className="text-lg font-semibold text-foreground hidden sm:block">
            {pageTitle}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="hidden sm:inline">{userName}</span>
        <span className="capitalize text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
          {role}
        </span>
      </div>
    </header>
  );
}
