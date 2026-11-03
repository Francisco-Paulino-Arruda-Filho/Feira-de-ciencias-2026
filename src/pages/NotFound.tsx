import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <article className="not-found-page">
      <div className="not-found-content">
        <span className="eyebrow">ERRO DE NAVEGAÇÃO</span>

        <div className="not-found-code">
          <span>4</span>
          <div className="not-found-orbit">
            <div className="not-found-orbit-core" />
          </div>
          <span>4</span>
        </div>

        <h1>Página não encontrada</h1>

        <p>
          Parece que essa região ainda não foi mapeada.
          A página que você está procurando pode ter sido removida,
          renomeada ou não está disponível.
        </p>

        <Link to="/" className="not-found-button">
          <span>←</span>
          Voltar ao início
        </Link>
      </div>

      <span className="not-found-decoration decoration-one" />
      <span className="not-found-decoration decoration-two" />
    </article>
  );
}