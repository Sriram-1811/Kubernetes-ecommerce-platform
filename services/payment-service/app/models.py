from pydantic import BaseModel


class PaymentCreate(BaseModel):
    order_id: int
    payment_method: str


class PaymentUpdate(BaseModel):
    status: str
