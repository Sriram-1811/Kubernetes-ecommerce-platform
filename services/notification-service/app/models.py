from pydantic import BaseModel


class NotificationCreate(BaseModel):
    order_id: int
    type: str


class NotificationUpdate(BaseModel):
    status: str
