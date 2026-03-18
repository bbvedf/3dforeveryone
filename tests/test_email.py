import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from jinja2 import Template
from app.email_service import (
    send_welcome_email,
    send_order_confirmation_email,
    send_shipment_notification_email,
    WELCOME_EMAIL_TEMPLATE,
    ORDER_CONFIRMATION_TEMPLATE,
    SHIPMENT_NOTIFICATION_TEMPLATE,
)


class MockFastMail:
    """Mock de FastMail para tests sin enviar emails reales."""

    def __init__(self):
        self.sent_messages = []

    async def send_message(self, message):
        self.sent_messages.append(message)


@pytest.fixture
def mock_fastmail():
    """Fixture que provee un mock de FastMail."""
    with patch("app.email_service.fastmail", new_callable=AsyncMock) as mock:
        yield mock


@pytest.fixture
def sample_user_data():
    return {
        "email": "test@example.com",
        "user_name": "Juan Pérez",
        "created_at": "2024-01-15",
    }


@pytest.fixture
def sample_order_data():
    return {
        "email": "test@example.com",
        "user_name": "Juan Pérez",
        "order_id": 12345,
        "items": [
            {
                "product_name": "Producto A",
                "quantity": 2,
                "unit_price": 10.00,
                "total": 20.00,
            },
            {
                "product_name": "Producto B",
                "quantity": 1,
                "unit_price": 15.50,
                "total": 15.50,
            },
        ],
        "total_amount": 35.50,
        "shipping_address": "Calle Falsa 123, Madrid, 28001",
        "order_date": "2024-01-15",
        "status": "PENDIENTE",
    }


@pytest.fixture
def sample_shipment_data():
    return {
        "email": "test@example.com",
        "user_name": "Juan Pérez",
        "order_id": 12345,
        "shipping_address": "Calle Falsa 123, Madrid, 28001",
        "total_amount": 35.50,
        "shipment_date": "2024-01-16",
        "tracking_number": "ES123456789XX",
    }


class TestWelcomeEmail:
    """Tests para el email de bienvenida."""

    @pytest.mark.asyncio
    async def test_send_welcome_email_calls_fastmail(
        self, mock_fastmail, sample_user_data
    ):
        await send_welcome_email(
            email=sample_user_data["email"],
            user_name=sample_user_data["user_name"],
            created_at=sample_user_data["created_at"],
        )
        mock_fastmail.send_message.assert_called_once()

    @pytest.mark.asyncio
    async def test_welcome_email_has_correct_subject(
        self, mock_fastmail, sample_user_data
    ):
        await send_welcome_email(
            email=sample_user_data["email"],
            user_name=sample_user_data["user_name"],
            created_at=sample_user_data["created_at"],
        )
        call_args = mock_fastmail.send_message.call_args
        message = call_args[0][0]
        assert message.subject == "¡Bienvenido a 3D For Everyone!"
        assert message.recipients == [sample_user_data["email"]]

    @pytest.mark.asyncio
    async def test_welcome_email_contains_user_data(
        self, mock_fastmail, sample_user_data
    ):
        await send_welcome_email(
            email=sample_user_data["email"],
            user_name=sample_user_data["user_name"],
            created_at=sample_user_data["created_at"],
        )
        call_args = mock_fastmail.send_message.call_args
        message = call_args[0][0]
        assert sample_user_data["user_name"] in message.body
        assert sample_user_data["email"] in message.body
        assert sample_user_data["created_at"] in message.body

    @pytest.mark.asyncio
    async def test_welcome_email_is_html_type(self, mock_fastmail, sample_user_data):
        await send_welcome_email(
            email=sample_user_data["email"],
            user_name=sample_user_data["user_name"],
            created_at=sample_user_data["created_at"],
        )
        call_args = mock_fastmail.send_message.call_args
        message = call_args[0][0]
        assert message.subtype.value == "html"


class TestOrderConfirmationEmail:
    """Tests para el email de confirmación de pedido."""

    @pytest.mark.asyncio
    async def test_send_order_confirmation_calls_fastmail(
        self, mock_fastmail, sample_order_data
    ):
        await send_order_confirmation_email(
            email=sample_order_data["email"],
            user_name=sample_order_data["user_name"],
            order_id=sample_order_data["order_id"],
            items=sample_order_data["items"],
            total_amount=sample_order_data["total_amount"],
            shipping_address=sample_order_data["shipping_address"],
            order_date=sample_order_data["order_date"],
            status=sample_order_data["status"],
        )
        mock_fastmail.send_message.assert_called_once()

    @pytest.mark.asyncio
    async def test_order_confirmation_has_correct_subject(
        self, mock_fastmail, sample_order_data
    ):
        await send_order_confirmation_email(
            email=sample_order_data["email"],
            user_name=sample_order_data["user_name"],
            order_id=sample_order_data["order_id"],
            items=sample_order_data["items"],
            total_amount=sample_order_data["total_amount"],
            shipping_address=sample_order_data["shipping_address"],
            order_date=sample_order_data["order_date"],
            status=sample_order_data["status"],
        )
        call_args = mock_fastmail.send_message.call_args
        message = call_args[0][0]
        assert f"#{sample_order_data['order_id']}" in message.subject

    @pytest.mark.asyncio
    async def test_order_confirmation_contains_items(
        self, mock_fastmail, sample_order_data
    ):
        await send_order_confirmation_email(
            email=sample_order_data["email"],
            user_name=sample_order_data["user_name"],
            order_id=sample_order_data["order_id"],
            items=sample_order_data["items"],
            total_amount=sample_order_data["total_amount"],
            shipping_address=sample_order_data["shipping_address"],
            order_date=sample_order_data["order_date"],
            status=sample_order_data["status"],
        )
        call_args = mock_fastmail.send_message.call_args
        message = call_args[0][0]
        for item in sample_order_data["items"]:
            assert item["product_name"] in message.body

    @pytest.mark.asyncio
    async def test_order_confirmation_contains_shipping_address(
        self, mock_fastmail, sample_order_data
    ):
        await send_order_confirmation_email(
            email=sample_order_data["email"],
            user_name=sample_order_data["user_name"],
            order_id=sample_order_data["order_id"],
            items=sample_order_data["items"],
            total_amount=sample_order_data["total_amount"],
            shipping_address=sample_order_data["shipping_address"],
            order_date=sample_order_data["order_date"],
            status=sample_order_data["status"],
        )
        call_args = mock_fastmail.send_message.call_args
        message = call_args[0][0]
        assert sample_order_data["shipping_address"] in message.body

    @pytest.mark.asyncio
    async def test_order_confirmation_has_correct_recipients(
        self, mock_fastmail, sample_order_data
    ):
        await send_order_confirmation_email(
            email=sample_order_data["email"],
            user_name=sample_order_data["user_name"],
            order_id=sample_order_data["order_id"],
            items=sample_order_data["items"],
            total_amount=sample_order_data["total_amount"],
            shipping_address=sample_order_data["shipping_address"],
            order_date=sample_order_data["order_date"],
            status=sample_order_data["status"],
        )
        call_args = mock_fastmail.send_message.call_args
        message = call_args[0][0]
        assert message.recipients == [sample_order_data["email"]]


class TestShipmentNotificationEmail:
    """Tests para el email de notificación de envío."""

    @pytest.mark.asyncio
    async def test_send_shipment_notification_calls_fastmail(
        self, mock_fastmail, sample_shipment_data
    ):
        await send_shipment_notification_email(
            email=sample_shipment_data["email"],
            user_name=sample_shipment_data["user_name"],
            order_id=sample_shipment_data["order_id"],
            shipping_address=sample_shipment_data["shipping_address"],
            total_amount=sample_shipment_data["total_amount"],
            shipment_date=sample_shipment_data["shipment_date"],
            tracking_number=sample_shipment_data["tracking_number"],
        )
        mock_fastmail.send_message.assert_called_once()

    @pytest.mark.asyncio
    async def test_shipment_notification_has_correct_subject(
        self, mock_fastmail, sample_shipment_data
    ):
        await send_shipment_notification_email(
            email=sample_shipment_data["email"],
            user_name=sample_shipment_data["user_name"],
            order_id=sample_shipment_data["order_id"],
            shipping_address=sample_shipment_data["shipping_address"],
            total_amount=sample_shipment_data["total_amount"],
            shipment_date=sample_shipment_data["shipment_date"],
            tracking_number=sample_shipment_data["tracking_number"],
        )
        call_args = mock_fastmail.send_message.call_args
        message = call_args[0][0]
        assert f"#{sample_shipment_data['order_id']}" in message.subject

    @pytest.mark.asyncio
    async def test_shipment_notification_contains_tracking_number(
        self, mock_fastmail, sample_shipment_data
    ):
        await send_shipment_notification_email(
            email=sample_shipment_data["email"],
            user_name=sample_shipment_data["user_name"],
            order_id=sample_shipment_data["order_id"],
            shipping_address=sample_shipment_data["shipping_address"],
            total_amount=sample_shipment_data["total_amount"],
            shipment_date=sample_shipment_data["shipment_date"],
            tracking_number=sample_shipment_data["tracking_number"],
        )
        call_args = mock_fastmail.send_message.call_args
        message = call_args[0][0]
        assert sample_shipment_data["tracking_number"] in message.body

    @pytest.mark.asyncio
    async def test_shipment_notification_without_tracking_number(
        self, mock_fastmail, sample_shipment_data
    ):
        await send_shipment_notification_email(
            email=sample_shipment_data["email"],
            user_name=sample_shipment_data["user_name"],
            order_id=sample_shipment_data["order_id"],
            shipping_address=sample_shipment_data["shipping_address"],
            total_amount=sample_shipment_data["total_amount"],
            shipment_date=sample_shipment_data["shipment_date"],
            tracking_number=None,
        )
        call_args = mock_fastmail.send_message.call_args
        message = call_args[0][0]
        assert mock_fastmail.send_message.called
        assert message.recipients == [sample_shipment_data["email"]]

    @pytest.mark.asyncio
    async def test_shipment_notification_has_correct_recipients(
        self, mock_fastmail, sample_shipment_data
    ):
        await send_shipment_notification_email(
            email=sample_shipment_data["email"],
            user_name=sample_shipment_data["user_name"],
            order_id=sample_shipment_data["order_id"],
            shipping_address=sample_shipment_data["shipping_address"],
            total_amount=sample_shipment_data["total_amount"],
            shipment_date=sample_shipment_data["shipment_date"],
            tracking_number=sample_shipment_data["tracking_number"],
        )
        call_args = mock_fastmail.send_message.call_args
        message = call_args[0][0]
        assert message.recipients == [sample_shipment_data["email"]]


class TestEmailTemplates:
    """Tests para verificar que las plantillas existen y son válidas."""

    def test_welcome_template_is_valid_html(self):
        template = Template(WELCOME_EMAIL_TEMPLATE)
        rendered = template.render(
            user_name="Test User",
            email="test@example.com",
            created_at="2024-01-15",
        )
        assert "<!DOCTYPE html>" in rendered
        assert "3D For Everyone" in rendered
        assert "Test User" in rendered

    def test_order_confirmation_template_is_valid_html(self):
        template = Template(ORDER_CONFIRMATION_TEMPLATE)
        rendered = template.render(
            user_name="Test User",
            order_id=12345,
            items=[
                {
                    "product_name": "Test",
                    "quantity": 1,
                    "unit_price": 10.00,
                    "total": 10.00,
                }
            ],
            total_amount=10.00,
            shipping_address="Test Address",
            order_date="2024-01-15",
            status="PENDIENTE",
        )
        assert "<!DOCTYPE html>" in rendered
        assert "Test User" in rendered
        assert "Test Address" in rendered

    def test_shipment_notification_template_is_valid_html(self):
        template = Template(SHIPMENT_NOTIFICATION_TEMPLATE)
        rendered = template.render(
            user_name="Test User",
            order_id=12345,
            shipping_address="Test Address",
            total_amount=10.00,
            shipment_date="2024-01-15",
            tracking_number="TRACK123",
        )
        assert "<!DOCTYPE html>" in rendered
        assert "Test User" in rendered
        assert "TRACK123" in rendered

    def test_shipment_template_handles_missing_tracking(self):
        template = Template(SHIPMENT_NOTIFICATION_TEMPLATE)
        rendered = template.render(
            user_name="Test User",
            order_id=12345,
            shipping_address="Test Address",
            total_amount=10.00,
            shipment_date="2024-01-15",
            tracking_number=None,
        )
        assert "<!DOCTYPE html>" in rendered
        assert "Test User" in rendered
