from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",  # ignorar vars del .env que no están aquí (ej: POSTGRES_*)
    )

    database_url: str = "postgresql://3dforeveryone_user:password@localhost:5432/3dforeveryone_db"
    api_title: str = "Tienda 3D API"
    api_version: str = "1.0.0"
    api_description: str = "API para gestionar tienda de productos impresos en 3D"
    secret_key: str = "cambia-esta-clave-en-produccion"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    
    # --- Stripe ---
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    
    # --- PayPal ---
    paypal_client_id: str = ""
    paypal_client_secret: str = ""
    paypal_mode: str = "sandbox" # sandbox o live

settings = Settings()