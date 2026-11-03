import { NavLink } from "react-router-dom";
import "./Navbar.css";

const links = [
  { to: "/", label: "Lobotomia" },
  { to: "/neuromodulacao", label: "Neuromodulação" },
  { to: "/saude-mental", label: "Saúde mental" },
  { to: "/cerebro", label: "Cérebro 3D", end: true },
];

export default function Navbar() {
  return (
    <nav>
      {links.map(({ to, label, end }) => (
        <NavLink key={to} to={to} end={end}>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}