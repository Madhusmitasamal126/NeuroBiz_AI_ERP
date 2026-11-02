from django.core.management.base import BaseCommand


class Command(BaseCommand):

    help = "Create analytics demo data"

    def handle(self, *args, **kwargs):

        self.stdout.write(
            self.style.SUCCESS(
                "Analytics seed command is working!"
            )
        )