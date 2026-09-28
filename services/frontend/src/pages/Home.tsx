import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";

import {
  createNotification,
  createOrder,
  createPayment,
  createUser,
  getNotifications,
  getProducts,
  updatePayment,
} from "../services/api";

import type {
  CartItem,
  Notification,
  Payment,
  Product,
  User,
  Order,
} from "../types/product";

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [category, setCategory] = useState<
    "ALL" | "Fashion" | "Tech"
  >("ALL");

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);

  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [user, setUser] = useState<User | null>(null);

  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);

  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts();

        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load products.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (category === "ALL") {
      return products;
    }

    if (category === "Fashion") {
      return products.filter(
        (product) =>
          product.category.toLowerCase() === "fashion",
      );
    }

    return products.filter((product) => {
      const value = product.category.toLowerCase();

      return (
        value === "electronics" ||
        value === "gaming" ||
        value === "tech" ||
        value === "technology"
      );
    });
  }, [products, category]);

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0,
  );

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find(
        (item) => item.product.id === product.id,
      );

      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...current,
        {
          product,
          quantity: 1,
        },
      ];
    });

    setMessage(`${product.name} added to cart.`);
  }

  function increaseQuantity(productId: number) {
    setCart((current) =>
      current.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  }

  function decreaseQuantity(productId: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(productId: number) {
    setCart((current) =>
      current.filter(
        (item) => item.product.id !== productId,
      ),
    );
  }

  async function saveCustomer() {
    if (!name.trim() || !email.trim()) {
      setMessage("Please enter your name and email.");
      return;
    }

    try {
      setProcessing(true);
      setMessage("");

      const createdUser = await createUser(
        name.trim(),
        email.trim(),
      );

      setUser(createdUser);
      setShowProfile(false);

      setMessage(
        `Welcome ${createdUser.name}! Your customer profile is ready.`,
      );
    } catch (err) {
      console.error(err);
      setMessage(
        err instanceof Error
          ? err.message
          : "Unable to create customer.",
      );
    } finally {
      setProcessing(false);
    }
  }

  async function checkout() {
    if (!user) {
      setShowCart(false);
      setShowProfile(true);
      setMessage(
        "Please create your customer profile before checkout.",
      );
      return;
    }

    if (cart.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    try {
      setProcessing(true);
      setMessage("");

      /*
       * Current Order Service accepts one product per order.
       * Therefore we create one order for each cart line.
       */
      const createdOrders: Order[] = [];

      for (const item of cart) {
        const createdOrder = await createOrder(
          user.id,
          item.product.id,
          item.quantity,
        );

        createdOrders.push(createdOrder);
      }

      /*
       * For this portfolio project we use the first
       * created order as the checkout/payment reference.
       */
      const createdOrder = createdOrders[0];

      setOrder(createdOrder);

      const createdPayment = await createPayment(
        createdOrder.id,
        "CARD",
      );

      setPayment(createdPayment);

      /*
       * This is a mock successful payment flow.
       * We are not connecting a real payment gateway.
       */
      const successfulPayment = await updatePayment(
        createdPayment.id,
        "SUCCESS",
      );

      setPayment(successfulPayment);

      const notification = await createNotification(
        createdOrder.id,
        "PAYMENT_SUCCESS",
      );

      setNotifications((current) => [
        notification,
        ...current,
      ]);

      setCart([]);
      setShowCart(false);
      setShowCheckout(false);

      setMessage(
        `Order #${createdOrder.id} completed successfully.`,
      );
    } catch (err) {
      console.error(err);

      setMessage(
        err instanceof Error
          ? err.message
          : "Checkout failed.",
      );
    } finally {
      setProcessing(false);
    }
  }

  async function loadNotifications() {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <Header
        cartCount={cartCount}
        userName={user?.name || ""}
        onCartClick={() => setShowCart(true)}
        onProfileClick={() => setShowProfile(true)}
      />

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="hero-label">
              WELCOME TO HUNGER STORE
            </p>

            <h1>
              Hungry for Fashion.
              <br />
              <span>Hungry for Tech.</span>
            </h1>

            <p className="hero-description">
              One store for what you wear, what you use,
              and what you want.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  setCategory("Fashion");

                  document
                    .getElementById("featured")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >
                Shop Fashion
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setCategory("Tech");

                  document
                    .getElementById("featured")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >
                Shop Tech
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
            <article className="category-card fashion-card">
              <div>
                <p>01</p>
                <h3>Fashion</h3>
                <span>Clothing & lifestyle</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCategory("Fashion");

                  document
                    .getElementById("featured")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >
                Shop Fashion →
              </button>
            </article>

            <article className="category-card technology-card">
              <div>
                <p>02</p>
                <h3>Technology</h3>
                <span>Gadgets & electronics</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCategory("Tech");

                  document
                    .getElementById("featured")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >
                Shop Tech →
              </button>
            </article>
          </div>
        </section>

        <section
          className="featured-section"
          id="featured"
        >
          <div className="section-heading">
            <div>
              <p className="section-label">
                SHOPPING
              </p>

              <h2>
                {category === "ALL"
                  ? "Popular right now."
                  : `${category} collection.`}
              </h2>
            </div>

            <div className="filter-buttons">
              <button
                type="button"
                className={
                  category === "ALL"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setCategory("ALL")}
              >
                All
              </button>

              <button
                type="button"
                className={
                  category === "Fashion"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setCategory("Fashion")}
              >
                Fashion
              </button>

              <button
                type="button"
                className={
                  category === "Tech"
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() => setCategory("Tech")}
              >
                Tech
              </button>
            </div>
          </div>

          {loading && (
            <div className="status-box">
              Loading products...
            </div>
          )}

          {error && (
            <div className="status-box error-box">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            filteredProducts.length === 0 && (
              <div className="status-box">
                No products found in this category.
              </div>
            )}

          {!loading && !error && (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onView={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </section>

        {message && (
          <div className="toast">
            {message}
          </div>
        )}

        <section className="account-section">
          <div>
            <p className="section-label">YOUR STORE</p>
            <h2>
              {user
                ? `Welcome, ${user.name}.`
                : "Ready to check out?"}
            </h2>

            <p>
              Create a customer profile, shop your
              favourites, and complete an order.
            </p>
          </div>

          <div className="account-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setShowProfile(true);
                loadNotifications();
              }}
            >
              {user ? "View profile" : "Create profile"}
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={() => setShowCart(true)}
            >
              Open cart ({cartCount})
            </button>
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

      {/* PRODUCT DETAILS */}

      {selectedProduct && (
        <div className="modal-backdrop">
          <div className="modal">
            <button
              type="button"
              className="modal-close"
              onClick={() => setSelectedProduct(null)}
            >
              ×
            </button>

            <p className="section-label">
              {selectedProduct.category}
            </p>

            <h2>{selectedProduct.name}</h2>

            <p className="modal-price">
              {selectedProduct.currency}{" "}
              {selectedProduct.price.toFixed(2)}
            </p>

            <p>
              A Hunger Store product from our{" "}
              {selectedProduct.category.toLowerCase()} collection.
            </p>

            <button
              type="button"
              className="primary-button full"
              onClick={() => {
                addToCart(selectedProduct);
                setSelectedProduct(null);
              }}
            >
              Add to cart
            </button>
          </div>
        </div>
      )}

      {/* PROFILE */}

      {showProfile && (
        <div className="modal-backdrop">
          <div className="modal">
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowProfile(false)}
            >
              ×
            </button>

            <p className="section-label">
              CUSTOMER PROFILE
            </p>

            {user ? (
              <>
                <h2>{user.name}</h2>

                <p>{user.email}</p>

                <p className="profile-id">
                  Customer ID: #{user.id}
                </p>

                {notifications.length > 0 && (
                  <div className="notifications">
                    <h3>Notifications</h3>

                    {notifications.map(
                      (notification) => (
                        <div
                          className="notification"
                          key={notification.id}
                        >
                          <strong>
                            {notification.type}
                          </strong>

                          <span>
                            Status:{" "}
                            {notification.status}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <h2>Create your profile.</h2>

                <label>
                  Name
                  <input
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Your name"
                  />
                </label>

                <label>
                  Email
                  <input
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    type="email"
                  />
                </label>

                <button
                  type="button"
                  className="primary-button full"
                  disabled={processing}
                  onClick={saveCustomer}
                >
                  {processing
                    ? "Creating..."
                    : "Create profile"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* CART */}

      {showCart && (
        <div className="modal-backdrop">
          <div className="modal cart-modal">
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowCart(false)}
            >
              ×
            </button>

            <p className="section-label">YOUR CART</p>

            <h2>Your Hunger Basket</h2>

            {cart.length === 0 ? (
              <div className="empty-cart">
                Your cart is empty.
              </div>
            ) : (
              <>
                <div className="cart-list">
                  {cart.map((item) => (
                    <div
                      className="cart-item"
                      key={item.product.id}
                    >
                      <div>
                        <strong>
                          {item.product.name}
                        </strong>

                        <span>
                          {item.product.currency}{" "}
                          {item.product.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="quantity-controls">
                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(
                              item.product.id,
                            )
                          }
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(
                              item.product.id,
                            )
                          }
                        >
                          +
                        </button>

                        <button
                          type="button"
                          className="remove-button"
                          onClick={() =>
                            removeFromCart(
                              item.product.id,
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-total">
                  <span>Total</span>

                  <strong>
                    USD {cartTotal.toFixed(2)}
                  </strong>
                </div>

                <button
                  type="button"
                  className="primary-button full"
                  onClick={() => {
                    setShowCart(false);
                    setShowCheckout(true);
                  }}
                >
                  Continue to checkout
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT */}

      {showCheckout && (
        <div className="modal-backdrop">
          <div className="modal">
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowCheckout(false)}
            >
              ×
            </button>

            <p className="section-label">
              CHECKOUT
            </p>

            <h2>Complete your order.</h2>

            {!user ? (
              <>
                <p>
                  You need a customer profile before
                  placing an order.
                </p>

                <button
                  type="button"
                  className="primary-button full"
                  onClick={() => {
                    setShowCheckout(false);
                    setShowProfile(true);
                  }}
                >
                  Create profile
                </button>
              </>
            ) : (
              <>
                <div className="checkout-summary">
                  <p>
                    Customer: <strong>{user.name}</strong>
                  </p>

                  <p>
                    Email: <strong>{user.email}</strong>
                  </p>

                  <p>
                    Items: <strong>{cartCount}</strong>
                  </p>

                  <p>
                    Total:{" "}
                    <strong>
                      USD {cartTotal.toFixed(2)}
                    </strong>
                  </p>
                </div>

                <p className="payment-note">
                  Payment method: Card
                </p>

                <button
                  type="button"
                  className="primary-button full"
                  disabled={processing}
                  onClick={checkout}
                >
                  {processing
                    ? "Processing order..."
                    : "Place order & pay"}
                </button>
              </>
            )}

            {order && payment && (
              <div className="success-box">
                <strong>
                  Order #{order.id} completed
                </strong>

                <span>
                  Payment #{payment.id}:{" "}
                  {payment.status}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
