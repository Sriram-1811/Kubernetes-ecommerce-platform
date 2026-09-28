import type { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onView: (product: Product) => void;
}

function ProductCard({
  product,
  onAddToCart,
  onView,
}: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-category">
        {product.category}
      </div>

      <div className="product-visual">
        <span>H</span>
      </div>

      <div className="product-content">
        <p className="product-category-label">
          {product.category}
        </p>

        <h3>{product.name}</h3>

        <p className="product-price">
          {product.currency} {product.price.toFixed(2)}
        </p>

        <div className="product-actions">
          <button
            type="button"
            className="secondary-button small"
            onClick={() => onView(product)}
          >
            Details
          </button>

          <button
            type="button"
            className="primary-button small"
            onClick={() => onAddToCart(product)}
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
