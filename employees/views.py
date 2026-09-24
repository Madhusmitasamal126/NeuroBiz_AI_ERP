from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse

from .models import Employee
from .serializers import EmployeeSerializer

class EmployeeViewSet(viewsets.ModelViewSet):

    queryset = Employee.objects.all()

    serializer_class = EmployeeSerializer

    permission_classes = [IsAuthenticated]
def home(request):
    return JsonResponse({
        "message": "NeuroBiz AI ERP Backend Running",
        "status": "success"
    })