from fastapi import FastAPI

app = FastAPI(root_path="/api")

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/data")
def data():
    return {"status": True, "result": {"a":1, "b": False}}
