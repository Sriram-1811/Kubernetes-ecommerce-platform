import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types/product";

const featuredProducts: Product[] = [
  {
    id: 1,
    name: "HungerTech Smartwatch Pro",
    category: "Electronics",
    price: 149.99,
    currency: "USD",
  },
  {
    id: 2,
    name: "HungerTech Wireless Headphones",
    category: "Electronics",
    price: 89.99,
    currency: "USD",
  },
  {
    id: 3,
    name: "Hunger Fashion Classic Jacket",
    category: "Fashion",
    price: 79.99,
    currency: "USD",
  },
  {
    id: 4,
    name: "HungerTech Mechanical Keyboard",
    category: "Electronics",
    price: 119.99,
    currency: "USD",
  },
];

function Home() {
  return (
    <>
      <Header />

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="hero-label">WELCOME TO HUNGER STORE</p>

            <h1>
              Hungry for Fashion.
              <br />
              <span>Hungry for Tech.</span>
            </h1>

            <p className="hero-description">
              One store for the things you wear,
              the things you use, and the things you want.
            </p>

            <div className="hero-actions">
              <button type="button" className="primary-button">
                Shop Fashion
              </button>

              <button type="button" className="secondary-button">
                Explore Tech
              </button>
            </div>
          </div>
        </section>

        <section className="category-section">
          <div className="section-heading">
            <div>
              <p className="section-label">EXPLORE</p>
              <h2>Find what you're hungry for.</h2>
            </div>
          </div>

          <div className="category-grid">
            <article className="category-card fashion-card" id="fashion">
              <div>
                <p>01</p>
                <h3>Fashion</h3>
                <span>Clothing & lifestyle</span>
              </div>

              <button type="button">Shop now →</button>
            </article>

            <article
              className="category-card technology-card"
              id="technology"
            >
              <div>
                <p>02</p>
                <h3>Technology</h3>
                <span>Gadgets & electronics</span>
              </div>

              <button type="button">Explore →</button>
            </article>
          </div>
        </section>

        <section className="featured-section" id="featured">
          <div className="section-heading">
            <div>
              <p className="section-label">FEATURED</p>
              <h2>Popular right now.</h2>
            </div>

            <button type="button" className="text-button">
              View all →
            </button>
          </div>

          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <strong>HUNGER STORE</strong>
          <p>Hungry for Fashion. Hungry for Tech.</p>
        </div>

        <span>© 2026 Hunger Store</span>
      </footer>
    </>
  );
}

export default Home;
