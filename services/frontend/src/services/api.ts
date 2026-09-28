import type {
  Notification,
  Order,
  Payment,
  Product,
  User,
} from "../types/product";

const PRODUCT_SERVICE_URL =
  import.meta.env.VITE_PRODUCT_SERVICE_URL;

const USER_SERVICE_URL =
  import.meta.env.VITE_USER_SERVICE_URL;

const ORDER_SERVICE_URL =
  import.meta.env.VITE_ORDER_SERVICE_URL;

const PAYMENT_SERVICE_URL =
  import.meta.env.VITE_PAYMENT_SERVICE_URL;

const NOTIFICATION_SERVICE_URL =
  import.meta.env.VITE_NOTIFICATION_SERVICE_URL;

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const body = await response.json();

      if (body?.detail) {
        message =
          typeof body.detail === "string"
            ? body.detail
            : JSON.stringify(body.detail);
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return response.json();
}

/* ---------------- PRODUCTS ---------------- */

export async function getProducts(): Promise<Product[]> {
  return request<Product[]>(
    `${PRODUCT_SERVICE_URL}/products`,
  );
}

export async function getProduct(
  productId: number,
): Promise<Product> {
  return request<Product>(
    `${PRODUCT_SERVICE_URL}/products/${productId}`,
  );
}

/* ---------------- USERS ---------------- */

export async function createUser(
  name: string,
  email: string,
): Promise<User> {
  return request<User>(`${USER_SERVICE_URL}/users`, {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
    }),
  });
}

export async function getUser(
  userId: number,
): Promise<User> {
  return request<User>(
    `${USER_SERVICE_URL}/users/${userId}`,
  );
}

/* ---------------- ORDERS ---------------- */

export async function createOrder(
  userId: number,
  productId: number,
  quantity: number,
): Promise<Order> {
  return request<Order>(`${ORDER_SERVICE_URL}/orders`, {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      product_id: productId,
      quantity,
    }),
  });
}

export async function getOrders(): Promise<Order[]> {
  return request<Order[]>(
    `${ORDER_SERVICE_URL}/orders`,
  );
}

/* ---------------- PAYMENTS ---------------- */

export async function createPayment(
  orderId: number,
  paymentMethod: string,
): Promise<Payment> {
  return request<Payment>(
    `${PAYMENT_SERVICE_URL}/payments`,
    {
      method: "POST",
      body: JSON.stringify({
        order_id: orderId,
        payment_method: paymentMethod,
      }),
    },
  );
}

export async function updatePayment(
  paymentId: number,
  status: string,
): Promise<Payment> {
  return request<Payment>(
    `${PAYMENT_SERVICE_URL}/payments/${paymentId}`,
    {
      method: "PUT",
      body: JSON.stringify({
        status,
      }),
    },
  );
}

/* ---------------- NOTIFICATIONS ---------------- */

export async function getNotifications(): Promise<
  Notification[]
> {
  return request<Notification[]>(
    `${NOTIFICATION_SERVICE_URL}/notifications`,
  );
}

export async function createNotification(
  orderId: number,
  type: string,
): Promise<Notification> {
  return request<Notification>(
    `${NOTIFICATION_SERVICE_URL}/notifications`,
    {
      method: "POST",
      body: JSON.stringify({
        order_id: orderId,
        type,
      }),
    },
  );
}
