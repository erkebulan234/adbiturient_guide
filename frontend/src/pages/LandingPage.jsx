import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoMark from '../assets/navigator-logo-mark.png';

const stats = [
  { value: '94%', label: 'лучший match в демо-подборе' },
  { value: '12 мин', label: 'чтобы собрать первый профиль' },
  { value: '3 шага', label: 'анкета, тест, рекомендации' }
];

const journey = [
  {
    step: '01',
    title: 'Понять себя',
    text: 'Короткая анкета переводит интересы, предметы и навыки в понятный профиль поступления.'
  },
  {
    step: '02',
    title: 'Увидеть траектории',
    text: 'Платформа показывает не просто список вузов, а объясняет, почему направление подходит.'
  },
  {
    step: '03',
    title: 'Выбрать осознанно',
    text: 'Сравнение стоимости, грантов, требований и перспектив помогает принять решение спокойнее.'
  }
];

const stories = [
  {
    name: 'Алия',
    role: '11 класс, Алматы',
    text: 'Я впервые увидела не абстрактные “перспективные профессии”, а понятный маршрут: что сдавать, куда смотреть и почему.'
  },
  {
    name: 'Данияр',
    role: '9 класс, Кызылорда',
    text: 'Оказалось, что колледж может быть не запасным вариантом, а нормальной траекторией к инженерной профессии.'
  }
];

function RecommendationPreview() {
  return (
    <div className="hero-product-card recommendation-preview-card">
      <div className="preview-topline">
        <span>AI-подбор</span>
        <strong>94%</strong>
      </div>
      <h3>Software Engineering</h3>
      <p>Совпадает с интересом к математике, логике и созданию цифровых продуктов.</p>

      <div className="preview-match">
        <span style={{ width: '94%' }} />
      </div>

      <div className="preview-grid">
        <div><span>Город</span><strong>Алматы</strong></div>
        <div><span>Грант</span><strong>Есть</strong></div>
        <div><span>Формат</span><strong>Очное</strong></div>
        <div><span>Срок</span><strong>4 года</strong></div>
      </div>
    </div>
  );
}

function OnboardingPreview() {
  return (
    <div className="hero-product-card onboarding-preview-card">
      <div className="mini-window-header">
        <span />
        <span />
        <span />
      </div>
      <p className="kicker">Профиль</p>
      <h3>Что вам ближе?</h3>

      <div className="choice-stack">
        <div className="choice-row active"><span /> Проектировать цифровые сервисы</div>
        <div className="choice-row"><span /> Работать с людьми и командами</div>
        <div className="choice-row"><span /> Исследовать данные и системы</div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  function handlePointerMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    setPointer({ x: Number(x.toFixed(3)), y: Number(y.toFixed(3)) });
  }

  return (
    <main
      className="cinematic-landing"
      style={{ '--mx': pointer.x, '--my': pointer.y }}
      onPointerMove={handlePointerMove}
    >
      <header className="landing-nav">
        <Link to="/" className="brand landing-brand">
          <span className="brand-mark has-logo" aria-hidden="true">
            <img className="brand-logo" src={logoMark} alt="" />
          </span>
          <span className="brand-text">
            <strong>Навигатор</strong>
            <small>AI для поступления</small>
          </span>
        </Link>

        <nav className="landing-nav-links" aria-label="Навигация по странице">
          <a href="#how">Как работает</a>
          <a href="#preview">Рекомендации</a>
          <a href="#stories">Истории</a>
        </nav>

        <div className="landing-auth-actions">
          <Link className="premium-login-button" to="/login">Войти</Link>
          <Link className="premium-cta-button" to="/register">Начать путь</Link>
        </div>
      </header>

      <section className="cinematic-hero">
        <div className="hero-orbit hero-orbit-one" />
        <div className="hero-orbit hero-orbit-two" />

        <div className="hero-copy reveal-up">
          <span className="hero-pill">AI-помощник для абитуриента</span>
          <h1>Будущее поступления начинается с ясного выбора</h1>
          <p className="hero-lead">
            Навигатор превращает интересы, предметы и цели в понятный маршрут: подходящие профессии, программы, колледжи и университеты Казахстана.
          </p>

          <div className="hero-actions">
            <Link className="premium-cta-button large" to="/register">Начать путь</Link>
            <Link className="premium-login-button large" to="/login">Войти в профиль</Link>
          </div>

          <div className="hero-proof">
            <span>Без случайных советов</span>
            <span>С объяснимым match-score</span>
            <span>Для 9 и 11 класса</span>
          </div>
        </div>

        <div className="hero-stage" aria-label="Превью продукта">
          <div className="floating-label label-one">career map</div>
          <div className="floating-label label-two">grant ready</div>
          <OnboardingPreview />
          <RecommendationPreview />
          <div className="student-collage-card hero-product-card">
            <div className="portrait-grid">
              <span>IT</span>
              <span>Med</span>
              <span>Design</span>
              <span>Eng</span>
            </div>
            <p>Коллаж интересов становится структурой выбора.</p>
          </div>
        </div>
      </section>

      <section className="cinematic-stats reveal-up">
        {stats.map(item => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <section className="story-section" id="how">
        <div className="section-copy reveal-up">
          <p className="kicker">Storytelling через продукт</p>
          <h2>Не каталог. Личный маршрут поступления.</h2>
          <p>
            Большинство абитуриентов начинают с тревоги и случайных списков. Навигатор меняет порядок: сначала понимает человека, затем показывает варианты и объясняет каждый выбор.
          </p>
        </div>

        <div className="journey-board">
          {journey.map((item, index) => (
            <article className="journey-card reveal-up" style={{ '--delay': `${index * 90}ms` }} key={item.step}>
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="immersive-preview" id="preview">
        <div className="preview-copy reveal-up">
          <p className="kicker">Recommendation intelligence</p>
          <h2>Рекомендация должна объяснять себя</h2>
          <p>
            Пользователь видит, почему программа появилась в списке: совпадение с навыками, предметами, карьерной целью, городом и условиями поступления.
          </p>
          <Link className="premium-cta-button" to="/register">Получить свой подбор</Link>
        </div>

        <div className="recommendation-showcase reveal-up">
          <div className="showcase-card main">
            <div className="preview-topline">
              <span>Лучшее совпадение</span>
              <strong>94%</strong>
            </div>
            <h3>Информационные системы</h3>
            <p>Подходит из-за интереса к технологиям, математике и аналитическим задачам.</p>
            <div className="preview-match"><span style={{ width: '94%' }} /></div>
          </div>

          <div className="showcase-card">
            <span className="small-status done">Грант</span>
            <h3>Компьютерная инженерия</h3>
            <p>Сильное совпадение по предметам и навыкам.</p>
          </div>

          <div className="showcase-card muted">
            <span className="small-status">Альтернатива</span>
            <h3>Data Analytics</h3>
            <p>Подойдет, если хочется больше анализа и исследований.</p>
          </div>
        </div>
      </section>

      <section className="stories-section" id="stories">
        <div className="section-copy reveal-up">
          <p className="kicker">Эмоциональная связь</p>
          <h2>Выбор становится спокойнее, когда он объясним</h2>
        </div>

        <div className="stories-grid">
          {stories.map((story, index) => (
            <article className="story-card reveal-up" style={{ '--delay': `${index * 100}ms` }} key={story.name}>
              <p>{story.text}</p>
              <div>
                <strong>{story.name}</strong>
                <span>{story.role}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="final-cta reveal-up">
        <p className="kicker">Начните с первого шага</p>
        <h2>Соберите профиль и увидьте, какие траектории уже рядом</h2>
        <div className="hero-actions">
          <Link className="premium-cta-button large" to="/register">Начать путь</Link>
          <Link className="premium-login-button large" to="/login">Войти</Link>
        </div>
      </section>

      <footer className="landing-footer">
        <span>Навигатор абитуриента</span>
        <span>AI-помощник для выбора образования в Казахстане.</span>
      </footer>
    </main>
  );
}
