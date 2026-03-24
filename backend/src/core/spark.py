from src.core.settings import settings
from pyspark.sql import SparkSession

def conn():
    try:
        print("Existing session stopped.")
        spark = SparkSession.builder \
        .appName("mySparkApp") \
        .master(settings.spark_url) \
        .config("spark.driver.host", settings.host_ip) \
        .config("spark.driver.bindAddress", "0.0.0.0") \
        .config("spark.driver.port", "10000") \
        .config("spark.blockManager.port", "10001") \
        .config("spark.executor.port", "10002") \
        .config("spark.network.timeout", "800s") \
        .config("spark.rpc.askTimeout", "300s") \
        .config("spark.tcp.retries", "16") \
        .config("spark.cores.max", "2") \
        .config("spark.rpc.message.maxSize", "512") \
        .config("spark.driver.maxResultSize", "2g") \
        .config("spark.shuffle.io.maxRetries", "10") \
        .config("spark.shuffle.io.retryWait", "15s") \
        .config("spark.jars.packages", "org.mariadb.jdbc:mariadb-java-client:3.5.7") \
        .config("spark.driver.memory", "4g") \
        .getOrCreate()
        print("Spark Session Created Successfully!")
        return spark
    except Exception as e:
        print(f"Failed to create Spark session: {e}")
        return None

connection_properties = {
            "user":settings.properties_user,
            "password":settings.properties_pw,
            "driver": "org.mariadb.jdbc.Driver",
            "char.encoding": "utf-8",
            "characterEncoding": "UTF-8",
            "useUnicode": "true",
            "sessionVariables": "sql_mode='ANSI_QUOTES'"
        }    