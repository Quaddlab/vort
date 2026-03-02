import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/deposit", label: "Deposit" },
  { href: "/dashboard/portfolio", label: "Portfolio" },
  { href: "/dashboard/market", label: "Market" },
  { href: "/dashboard/protocol", label: "Protocol" },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 cursor-pointer"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[#0a0a0c] border-r border-[#1a1a24] z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-[#1a1a24]">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              V
            </div>
            <span className="text-white font-semibold tracking-tight">
              Vort
            </span>
          </Link>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-indigo-600/10 text-indigo-400"
                    : "text-slate-400 hover:bg-[#111118] hover:text-slate-200"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
