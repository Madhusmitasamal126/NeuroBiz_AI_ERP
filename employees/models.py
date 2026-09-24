from django.db import models
from accounts.models import User

class Employee(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE)

    employee_id = models.CharField(max_length=20, unique=True)

    department = models.CharField(max_length=100)

    designation = models.CharField(max_length=100)

    salary = models.DecimalField(max_digits=10, decimal_places=2)

    joining_date = models.DateField()

    def __str__(self):
        return self.employee_id