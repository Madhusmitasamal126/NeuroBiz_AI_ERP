
from rest_framework import serializers
from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    employee_id = serializers.SerializerMethodField()
    check_in_display = serializers.SerializerMethodField()
    check_out_display = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = [
            "id",
            "employee",
            "employee_id",
            "employee_name",
            "date",
            "check_in",
            "check_out",
            "check_in_display",
            "check_out_display",
            "status",
        ]
        read_only_fields = fields

    def get_employee_name(self, obj):
        user = obj.employee.user
        if user:
            return user.get_full_name() or user.get_username()
        return str(obj.employee)

    def get_employee_id(self, obj):
        return obj.employee.employee_id

    def get_check_in_display(self, obj):
        if obj.check_in:
            return obj.check_in.strftime("%I:%M %p")
        return "--"

    def get_check_out_display(self, obj):
        if obj.check_out:
            return obj.check_out.strftime("%I:%M %p")
        return "--"
