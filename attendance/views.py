
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from employees.models import Employee
from .models import Attendance
from .serializers import AttendanceSerializer


def get_logged_in_employee(user):
    return Employee.objects.filter(user=user).first()


class AttendanceListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        records = Attendance.objects.select_related(
            "employee", "employee__user"
        )

        date_value = request.query_params.get("date")

        if date_value:
            try:
                parsed_date = timezone.datetime.strptime(
                    date_value, "%Y-%m-%d"
                ).date()
            except ValueError:
                return Response(
                    {"detail": "Use date format YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            records = records.filter(date=parsed_date)

        serializer = AttendanceSerializer(records, many=True)
        return Response(serializer.data)


class CheckInView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        employee = get_logged_in_employee(request.user)

        if employee is None:
            return Response(
                {
                    "detail": (
                        "No employee profile is linked to this login. "
                        "Ask an administrator to link your employee account."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = timezone.localdate()

        record, created = Attendance.objects.get_or_create(
            employee=employee,
            date=today,
        )

        if record.check_in:
            return Response(
                {"detail": "You have already checked in today."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        record.check_in = timezone.now()
        record.status = "Present"
        record.save()

        return Response(
            AttendanceSerializer(record).data,
            status=status.HTTP_200_OK,
        )


class CheckOutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        employee = get_logged_in_employee(request.user)

        if employee is None:
            return Response(
                {"detail": "No employee profile is linked to this login."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = timezone.localdate()

        try:
            record = Attendance.objects.get(
                employee=employee,
                date=today,
            )
        except Attendance.DoesNotExist:
            return Response(
                {"detail": "Please check in before checking out."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not record.check_in:
            return Response(
                {"detail": "Please check in before checking out."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if record.check_out:
            return Response(
                {"detail": "You have already checked out today."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        record.check_out = timezone.now()
        record.save()

        return Response(AttendanceSerializer(record).data)
