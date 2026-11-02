
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=4000,
        description="Question about business data",
    )


class ReportRequest(BaseModel):
    question: str = Field(
        default="Analyze the current business performance.",
        min_length=1,
        max_length=2000,
    )


class ChatResponse(BaseModel):
    answer: str


class ReportResponse(BaseModel):
    report: str
