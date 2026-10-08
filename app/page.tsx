import CraftWorld from "@/components/CraftWorld";

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">3DA · первый прототип</p>
          <h1>Оживи свою поделку</h1>
          <p className="lead">
            Пока вместо AI-модели здесь тестовый бумажный кот. Нажмите на пол —
            кот повернётся и пойдёт в выбранную точку.
          </p>
        </div>
        <div className="status-pill">Этап 1–2: 3D-мир + движение</div>
      </section>

      <section className="world-card" aria-label="Интерактивный 3D-мир">
        <CraftWorld />
      </section>

      <section className="next-step">
        <strong>Следующий шаг:</strong> добавить фотографирование поделки и
        загрузку изображения на backend.
      </section>
    </main>
  );
}
