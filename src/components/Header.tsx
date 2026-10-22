import { Link, NavLink } from "react-router";
import logo from "../assets/NBAFANtasticLogo.png";

const NAV_ITEMS = [
  { to: "/players", label: "Jogadores" },
  { to: "/teams", label: "Franquias" },
  { to: "/historical-players", label: "Lendas Históricas" },
  { to: "/records", label: "Recordes" },
];

export function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-2 py-1 flex flex-wrap items-center justify-around gap-4">
        <Link to="/" className="flex items-center gap-3 group hover:opacity-60 transition-opacity">
          <img src={logo} alt="NBA FANtastic Logo" className="w-4/5" />
        </Link>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `font-medium transition-colors hover:text-orange-600
              ${isActive ? "text-orange-600 font-bold border-b-2" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </header>
  );
}
