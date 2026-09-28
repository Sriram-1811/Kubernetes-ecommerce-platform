import type { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-image">
        <span>{product.category}</span>
      </div>

      <div className="product-info">
        <p className="product-category">
          {product.category}
        </p>

        <h3>{product.name}</h3>

        <div className="product-bottom">
          <p className="product-price">
            {product.currency} {product.price.toFixed(2)}
          </p>

          <button type="button" className="add-button">
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
