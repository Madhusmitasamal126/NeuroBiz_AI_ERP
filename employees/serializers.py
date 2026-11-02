
from rest_framework import serializers
from .models import Employee, Department


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = [
            "id",
            "name",
            "location",
        ]


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(
        source="department.name",
        read_only=True,
        allow_null=True,
        default=None,
    )

    class Meta:
        model = Employee
        fields = [
            "id",
            "employee_id",
            "user",
            "department",
            "department_name",
            "designation",
            "salary",
            "joining_date",
        ]
