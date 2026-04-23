"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, CalendarDays, ShoppingBag, Settings } from "lucide-react"

const links = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/customers", label: "Clientes", icon: Users },
  { href: "/appointments", label: "Agenda", icon: CalendarDays },
  { href: "/sales/new", label: "Venda", icon: ShoppingBag },
  { href: "/settings", label: "Config", icon: Settings },
]

export function BottomNav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex">
        {links.map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href)
          return (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center py-2 gap-0.5">
              <Icon size={22} className={active ? "text-primary" : "text-gray-400"} />
              <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-gray-400"}`}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
