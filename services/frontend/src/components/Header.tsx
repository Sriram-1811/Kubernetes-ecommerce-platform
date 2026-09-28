function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a href="/" className="brand">
          HUNGER STORE
        </a>

        <nav className="main-nav">
          <a href="#fashion">Fashion</a>
          <a href="#technology">Tech</a>
          <a href="#featured">New Arrivals</a>
        </nav>

        <button type="button" className="cart-button">
          Cart <span>0</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
