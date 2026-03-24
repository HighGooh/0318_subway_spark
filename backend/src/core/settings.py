from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
  spark_url: str
  host_ip: str 
  properties_user: str
  properties_pw: str
  jdbc_url: str
  jdbc_url_2: str
  target_table_name: str
  mariadb_url: str

  model_config = SettingsConfigDict(
    env_file=".env",
    env_file_encoding="utf-8",
  )

settings = Settings()
