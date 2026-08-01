import os
import sys
import django
from django.core.files.base import ContentFile

sys.path.insert(0, r'c:\codes\DoubtDesk\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from Doubt.models import Faculty, Notes
from Doubt.views import _hash_pass

def seed_notes():
    print("Seeding sample faculties and notes...")

    fac_rkp, _ = Faculty.objects.get_or_create(
        ShortName="RKP",
        defaults={
            "FullName": "Dr. R. K. Patel",
            "Subject": "Computer Engineering",
            "MoNumber": "+91 9876543210",
            "Pass": _hash_pass("1234"),
        }
    )
    fac_rkp.Pass = _hash_pass("1234")
    fac_rkp.save()

    fac_amp, _ = Faculty.objects.get_or_create(
        ShortName="AMP",
        defaults={
            "FullName": "Prof. A. M. Parmar",
            "Subject": "Data Structures & Algorithms",
            "MoNumber": "+91 9876543211",
            "Pass": _hash_pass("1234"),
        }
    )
    fac_amp.Pass = _hash_pass("1234")
    fac_amp.save()

    print("Faculties ready with 4-digit password (1234)!")

if __name__ == "__main__":
    seed_notes()
