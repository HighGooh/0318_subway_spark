from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
  spark_url: str = "spark://192.168.0.204:7077"
  host_ip: str = "192.168.0.204"
  # file_dir: str

  model_config = SettingsConfigDict(
    env_file=".env",
    env_file_encoding="utf-8",
  )

settings = Settings()
