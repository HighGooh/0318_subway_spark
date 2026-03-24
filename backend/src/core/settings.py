from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
  spark_url: str
  file_dir: str
  host_ip: str 
  jdbc_url: str = "jdbc:mariadb://192.168.0.204:3306/metro_db"
  target_table_name: str = "seoul_metro"

  model_config = SettingsConfigDict(
    env_file=".env",
    env_file_encoding="utf-8",
  )

settings = Settings()
