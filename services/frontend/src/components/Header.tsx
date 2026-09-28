interface HeaderProps {
  cartCount: number;
  userName: string;
  onCartClick: () => void;
  onProfileClick: () => void;
}

function Header({
  cartCount,
  userName,
  onCartClick,
  onProfileClick,
}: HeaderProps) {
  return (
    <header className="site-header">
      <div className="brand">
        <div className="brand-mark">H</div>

        <div>
          <strong>HUNGER STORE</strong>
          <span>Hungry for Fashion. Hungry for Tech.</span>
        </div>
      </div>

      <nav>
        <a href="#featured">Shop</a>

        <button
          type="button"
          onClick={onProfileClick}
          className="nav-button"
        >
          {userName || "Account"}
        </button>

        <button
          type="button"
          onClick={onCartClick}
          className="cart-button"
        >
          Cart
          <span>{cartCount}</span>
        </button>
      </nav>
    </header>
  );
}

export default Header;
