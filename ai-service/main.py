from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from review import router as review_router

app = FastAPI(title="Code Review AI Service")

# allow requests from our node backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(review_router)


@app.get("/")
def health_check():
    return {"status": "AI service is running"}
