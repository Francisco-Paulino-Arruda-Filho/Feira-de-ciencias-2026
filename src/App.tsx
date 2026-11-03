import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Lobotomia from "./pages/Lobotomia";
import Neuromodulacao from "./pages/Neuromodulacao";
import NotFound from "./pages/NotFound";
import SaudeMental from "./pages/saudeMental";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Lobotomia />} />
        <Route path="/neuromodulacao" element={<Neuromodulacao />} />
        <Route path="/saude-mental" element={<SaudeMental />} />
        <Route path="/cerebro" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}