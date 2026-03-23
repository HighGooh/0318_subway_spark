from src.core.settings import settings
from pyspark.sql import SparkSession, Row

def conn():
    try:
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
        .getOrCreate()
        # .config("spark.executor.memory", "512m") \
        # .config("spark.jars", "D:\\IDE\\workspaces\\team\\0318_subway_spark\\backend\\mariadb-java-client-3.5.7.jar") \
        # .config("spark.executor.extraClassPath", "/opt/spark/jars/mariadb-java-client-3.5.7.jar") \
        # .config("spark.driver.extraClassPath", "/opt/spark/jars/mariadb-java-client-3.5.7.jar") \
        # .config("spark.sql.debug.maxToStringFields", "1000") \
        print("Spark Session Created Successfully!")
        return spark
    except Exception as e:
        print(f"Failed to create Spark session: {e}")
        return None